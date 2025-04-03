import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { useCardStore } from './cardStore';
import { useGoldStore } from './goldStore';

interface UserProfile {
  id: string;
  username: string;
  gold: number;
  experience: number;
  wins: number;
  losses: number;
  favorite_cards: string[];
  isGuest?: boolean;
}

interface AuthState {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  loadProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
  loginAsGuest: () => void;
}

export const useAuthStore = create(
  persist<AuthState>(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      loadProfile: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            const { data: profile, error } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', user.id)
              .single();

            if (error) {
              console.error('Error loading profile:', error);
              return;
            }

            if (profile) {
              set({ user: profile });
              
              // Sync gold with gold store
              const goldStore = useGoldStore.getState();
              goldStore.updateOutGameGold(profile.gold - goldStore.outGameGold);
              
              // Check and give welcome pack if needed
              const cardStore = useCardStore.getState();
              if (!cardStore.hasReceivedWelcomePack) {
                cardStore.giveWelcomePack();
                goldStore.updateOutGameGold(300); // Give 300 welcome gold
              }
            }
          }
        } catch (error) {
          console.error('Error in loadProfile:', error);
        }
      },
      updateProfile: async (updates) => {
        const { user } = get();
        if (!user) return;

        if (user.isGuest) {
          set({ user: { ...user, ...updates } });
          return;
        }

        try {
          const { data: updatedProfile, error } = await supabase
            .from('user_profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();

          if (error) {
            console.error('Error updating profile:', error);
            return;
          }

          if (updatedProfile) {
            set({ user: updatedProfile });
            
            // Sync gold with gold store if it was updated
            if (updates.gold !== undefined) {
              const goldStore = useGoldStore.getState();
              goldStore.updateOutGameGold(updatedProfile.gold - goldStore.outGameGold);
            }
          }
        } catch (error) {
          console.error('Error in updateProfile:', error);
        }
      },
      signOut: async () => {
        try {
          const { user } = get();
          if (!user?.isGuest) {
            const { error } = await supabase.auth.signOut();
            if (error) {
              console.error('Error signing out:', error);
              return;
            }
          }
          set({ user: null });
          
          // Reset gold store
          const goldStore = useGoldStore.getState();
          goldStore.resetInGameGold();
          goldStore.updateOutGameGold(-goldStore.outGameGold);
        } catch (error) {
          console.error('Error in signOut:', error);
        }
      },
      loginAsGuest: () => {
        const guestProfile: UserProfile = {
          id: `guest-${Date.now()}`,
          username: `Guest${Math.floor(Math.random() * 10000)}`,
          gold: 0,
          experience: 0,
          wins: 0,
          losses: 0,
          favorite_cards: [],
          isGuest: true
        };
        set({ user: guestProfile });
        
        // Give welcome pack to guest
        const cardStore = useCardStore.getState();
        if (!cardStore.hasReceivedWelcomePack) {
          cardStore.giveWelcomePack();
          const goldStore = useGoldStore.getState();
          goldStore.updateOutGameGold(300); // Give 300 welcome gold
        }
      },
    }),
    {
      name: 'colossus-auth',
    }
  )
);

// Set up auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    useAuthStore.getState().setUser(null);
    // Reset gold store
    const goldStore = useGoldStore.getState();
    goldStore.resetInGameGold();
    goldStore.updateOutGameGold(-goldStore.outGameGold);
  } else if (session?.user) {
    useAuthStore.getState().loadProfile();
  }
});