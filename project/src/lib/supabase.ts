import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Please click the "Connect to Supabase" button to set up your database connection');
}

// Add retry logic for failed connections
const maxRetries = 3;
const retryDelay = 1000; // 1 second

const customFetch = async (url: string, options: RequestInit): Promise<Response> => {
  let lastError: Error | undefined;
  
  // Add security headers
  const secureHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; connect-src 'self' https://*.supabase.co wss://*.supabase.co; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;",
  };
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          ...secureHeaders,
        },
      });
      
      // Check if the response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${i + 1} failed, retrying in ${retryDelay * (i + 1)}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
    }
  }
  
  throw lastError || new Error('Failed to fetch after multiple retries');
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'colossus-auth-token',
    storage: {
      getItem: (key) => {
        try {
          const item = localStorage.getItem(key);
          return item ? JSON.parse(item) : null;
        } catch {
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch {
          console.warn('Failed to save auth state to localStorage');
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key);
        } catch {
          console.warn('Failed to remove auth state from localStorage');
        }
      },
    },
  },
  global: {
    fetch: customFetch,
    headers: {
      'X-Client-Info': 'colossus-game',
    },
  },
});

// Add connection health check
export const checkConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('user_profiles').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
};

// Add rate limiting check
export const checkRateLimit = async (): Promise<boolean> => {
  try {
    const response = await customFetch(`${supabaseUrl}/rate-limit-check`, {
      method: 'HEAD',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
};