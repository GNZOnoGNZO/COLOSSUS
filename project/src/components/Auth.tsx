import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, User, AlertCircle, Trash2, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import { useCardStore } from '../store/cardStore';
import { useGoldStore } from '../store/goldStore';
import { useChatStore } from '../store/chatStore';

interface AuthProps {
  onAuthSuccess: () => void;
}

export function Auth({ onAuthSuccess }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { loginAsGuest, user, signOut } = useAuthStore();
  const cardStore = useCardStore();
  const goldStore = useGoldStore();
  const chatStore = useChatStore();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              username,
            }
          }
        });

        if (signUpError) {
          if (signUpError.message.includes('Failed to fetch')) {
            throw new Error('Unable to connect to authentication service. Please check your internet connection and try again.');
          }
          throw signUpError;
        }

        if (signUpData.user) {
          // Create user profile
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert([
              {
                id: signUpData.user.id,
                username,
                gold: 0,
                experience: 0,
                wins: 0,
                losses: 0,
                favorite_cards: [],
              }
            ]);

          if (profileError) {
            if (profileError.message.includes('Failed to fetch')) {
              throw new Error('Unable to create user profile. Please check your internet connection and try again.');
            }
            throw profileError;
          }
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          if (signInError.message.includes('Failed to fetch')) {
            throw new Error('Unable to connect to authentication service. Please check your internet connection and try again.');
          }
          throw signInError;
        }
      }

      onAuthSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during authentication. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = () => {
    loginAsGuest();
    onAuthSuccess();
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      setError(null);

      if (user?.isGuest) {
        // For guest users, just reset local data
        cardStore.resetStore();
        goldStore.resetStore();
        chatStore.resetStore();
        await signOut();
      } else {
        // For registered users, delete account from database
        const { error: profileError } = await supabase
          .from('user_profiles')
          .delete()
          .eq('id', user?.id);

        if (profileError) throw profileError;

        const { error: deleteError } = await supabase.auth.admin.deleteUser(user?.id || '');
        if (deleteError) throw deleteError;

        // Reset all stores
        cardStore.resetStore();
        goldStore.resetStore();
        chatStore.resetStore();

        await signOut();
      }

      // Reset form
      setEmail('');
      setPassword('');
      setUsername('');
      setIsSignUp(false);
      setShowDeleteConfirm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  const handleResetGuest = () => {
    if (!user?.isGuest) return;

    cardStore.resetStore();
    goldStore.resetStore();
    chatStore.resetStore();
    signOut();
    loginAsGuest();
    onAuthSuccess();
  };

  return (
    <div className="min-h-screen bg-medieval-light dark:bg-medieval-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-medieval-primary rounded-lg shadow-xl p-8">
        <h2 className="text-2xl font-medieval text-medieval-primary dark:text-medieval-light mb-6 text-center">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-medieval-primary dark:text-medieval-light mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medieval-secondary" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-medieval-secondary rounded-lg focus:ring-2 focus:ring-medieval-accent focus:border-transparent"
                required
              />
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-medieval-primary dark:text-medieval-light mb-1">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medieval-secondary" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-medieval-secondary rounded-lg focus:ring-2 focus:ring-medieval-accent focus:border-transparent"
                  required
                  minLength={3}
                  maxLength={20}
                  pattern="[a-zA-Z0-9_-]+"
                  title="Username can only contain letters, numbers, underscores, and hyphens"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-medieval-primary dark:text-medieval-light mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medieval-secondary" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-medieval-secondary rounded-lg focus:ring-2 focus:ring-medieval-accent focus:border-transparent"
                required
                minLength={6}
                pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$"
                title="Password must be at least 6 characters long and contain at least one letter and one number"
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-medieval-accent hover:bg-medieval-primary text-medieval-dark hover:text-medieval-light py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </motion.button>
        </form>

        <div className="mt-4 flex flex-col items-center space-y-4">
          <motion.button
            onClick={handleGuestAccess}
            className="w-full bg-medieval-secondary hover:bg-medieval-primary text-medieval-light py-2 px-4 rounded-lg transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Play as Guest
          </motion.button>

          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-medieval-primary dark:text-medieval-light hover:text-medieval-accent"
          >
            {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
          </button>

          {user && (
            <div className="flex gap-2 w-full">
              {user.isGuest ? (
                <motion.button
                  onClick={handleResetGuest}
                  className="flex-1 flex items-center justify-center gap-2 text-yellow-500 hover:text-yellow-600 bg-yellow-500/10 hover:bg-yellow-500/20 py-2 px-4 rounded-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset Guest Data
                </motion.button>
              ) : (
                <motion.button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex-1 flex items-center justify-center gap-2 text-red-500 hover:text-red-600 bg-red-500/10 hover:bg-red-500/20 py-2 px-4 rounded-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </motion.button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-medieval-dark p-6 rounded-lg max-w-md w-full"
          >
            <h3 className="text-xl font-medieval text-red-500 mb-4">Delete Account?</h3>
            <p className="text-medieval-light mb-6">
              This action cannot be undone. All your progress, cards, and gold will be permanently deleted.
            </p>
            <div className="flex gap-4">
              <motion.button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete Account'}
              </motion.button>
              <motion.button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-medieval-light/10 text-medieval-light hover:bg-medieval-light/20 py-2 rounded-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}