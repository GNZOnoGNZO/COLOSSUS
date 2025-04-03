import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';

interface GoldState {
  inGameGold: number;
  outGameGold: number;
  updateInGameGold: (amount: number) => void;
  updateOutGameGold: (amount: number) => void;
  transferToOutGame: (amount: number) => void;
  transferToInGame: (amount: number) => void;
  resetInGameGold: () => void;
  initializeGameGold: () => void;
  syncWithAuthStore: () => void;
  resetStore: () => void;
}

const initialState = {
  inGameGold: 0,
  outGameGold: 0,
};

export const useGoldStore = create(
  persist<GoldState>(
    (set, get) => ({
      ...initialState,
      updateInGameGold: (amount) => {
        set((state) => {
          const newAmount = Math.max(0, state.inGameGold + amount);
          return { inGameGold: newAmount };
        });
      },
      updateOutGameGold: (amount) => {
        set((state) => {
          const newAmount = Math.max(0, state.outGameGold + amount);
          // Sync with auth store
          const authStore = useAuthStore.getState();
          if (authStore.user) {
            authStore.updateProfile({ gold: newAmount });
          }
          return { outGameGold: newAmount };
        });
      },
      transferToOutGame: (amount) => {
        set((state) => {
          const transferAmount = Math.min(amount, state.inGameGold);
          const newInGameGold = state.inGameGold - transferAmount;
          const newOutGameGold = state.outGameGold + transferAmount;
          
          // Sync with auth store
          const authStore = useAuthStore.getState();
          if (authStore.user) {
            authStore.updateProfile({ gold: newOutGameGold });
          }
          
          return {
            inGameGold: newInGameGold,
            outGameGold: newOutGameGold,
          };
        });
      },
      transferToInGame: (amount) => {
        set((state) => {
          const maxTransfer = Math.min(amount, 100 - state.inGameGold);
          if (maxTransfer <= 0 || maxTransfer > state.outGameGold) return state;
          
          const newInGameGold = state.inGameGold + maxTransfer;
          const newOutGameGold = state.outGameGold - maxTransfer;
          
          // Sync with auth store
          const authStore = useAuthStore.getState();
          if (authStore.user) {
            authStore.updateProfile({ gold: newOutGameGold });
          }
          
          return {
            inGameGold: newInGameGold,
            outGameGold: newOutGameGold,
          };
        });
      },
      resetInGameGold: () => {
        set({ inGameGold: 0 });
      },
      initializeGameGold: () => {
        set((state) => {
          const transferAmount = Math.min(50, state.outGameGold);
          const newInGameGold = transferAmount;
          const newOutGameGold = state.outGameGold - transferAmount;
          
          // Sync with auth store
          const authStore = useAuthStore.getState();
          if (authStore.user) {
            authStore.updateProfile({ gold: newOutGameGold });
          }
          
          return {
            inGameGold: newInGameGold,
            outGameGold: newOutGameGold,
          };
        });
      },
      syncWithAuthStore: () => {
        const authStore = useAuthStore.getState();
        if (authStore.user) {
          set({ outGameGold: authStore.user.gold });
        }
      },
      resetStore: () => set(initialState),
    }),
    {
      name: 'colossus-gold',
    }
  )
);