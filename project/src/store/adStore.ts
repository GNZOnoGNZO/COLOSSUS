import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdState {
  adsWatchedToday: number;
  lastAdDate: string;
  watchAd: () => boolean;
  resetDailyAds: () => void;
}

export const useAdStore = create(
  persist<AdState>(
    (set, get) => ({
      adsWatchedToday: 0,
      lastAdDate: new Date().toDateString(),
      watchAd: () => {
        const currentDate = new Date().toDateString();
        const { adsWatchedToday, lastAdDate } = get();

        // Reset if it's a new day
        if (currentDate !== lastAdDate) {
          set({ adsWatchedToday: 0, lastAdDate: currentDate });
        }

        // Check if max ads reached
        if (adsWatchedToday >= 5) {
          return false;
        }

        set(state => ({ adsWatchedToday: state.adsWatchedToday + 1 }));
        return true;
      },
      resetDailyAds: () => {
        set({ 
          adsWatchedToday: 0,
          lastAdDate: new Date().toDateString()
        });
      }
    }),
    {
      name: 'colossus-ads'
    }
  )
);