import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import arcjet, { shield, detectBot } from 'npm:@arcjet/node';

const arcjetKey = Deno.env.get('ARCJET_KEY');

if (!arcjetKey) {
  throw new Error('Missing Arcjet API key');
}

// Initialize Arcjet
const aj = arcjet({
  key: arcjetKey,
  rules: [
    shield({
      mode: "LIVE",
    }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),
  ],
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Run Arcjet protection
    const arcjetResponse = await aj.protect({ request: req });

    // If Arcjet blocks the request, return its response
    if (!arcjetResponse.ok) {
      return new Response(JSON.stringify({ error: 'Request blocked by security rules' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Handle the actual request here
    const response = new Response(JSON.stringify({ message: 'API endpoint working' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

    return response;
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});