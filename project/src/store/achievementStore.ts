import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Achievement {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
}

interface PlayerProgress {
  level: number;
  xp: number;
  achievements: Achievement[];
  cardPacks: number;
}

interface AchievementState extends PlayerProgress {
  addXP: (amount: number) => void;
  completeAchievement: (id: string) => void;
  addCardPack: () => void;
  useCardPack: () => void;
}

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-win',
    title: 'First Victory',
    description: 'Win your first game',
    xpReward: 100,
    completed: false,
  },
  {
    id: 'gold-hoarder',
    title: 'Gold Hoarder',
    description: 'Accumulate 1000 gold in a single game',
    xpReward: 150,
    completed: false,
  },
  // Add more achievements here
];

const XP_PER_LEVEL = 1000;

export const useAchievementStore = create(
  persist<AchievementState>(
    (set) => ({
      level: 1,
      xp: 0,
      achievements: INITIAL_ACHIEVEMENTS,
      cardPacks: 0,
      addXP: (amount) => set((state) => {
        const newXP = state.xp + amount;
        const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;
        const cardPacksToAdd = newLevel - state.level;
        
        return {
          xp: newXP,
          level: newLevel,
          cardPacks: state.cardPacks + cardPacksToAdd,
        };
      }),
      completeAchievement: (id) => set((state) => {
        const achievement = state.achievements.find(a => a.id === id);
        if (achievement && !achievement.completed) {
          achievement.completed = true;
          const newXP = state.xp + achievement.xpReward;
          const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;
          return {
            achievements: state.achievements,
            xp: newXP,
            level: newLevel,
          };
        }
        return state;
      }),
      addCardPack: () => set((state) => ({ cardPacks: state.cardPacks + 1 })),
      useCardPack: () => set((state) => ({ cardPacks: state.cardPacks - 1 })),
    }),
    {
      name: 'colossus-progress',
    }
  )
);