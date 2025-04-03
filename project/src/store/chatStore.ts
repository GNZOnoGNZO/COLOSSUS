import { create } from 'zustand';

interface ChatMessage {
  type: 'log' | 'emoji';
  content: string;
  timestamp: number;
}

interface ChatState {
  messages: ChatMessage[];
  addLogMessage: (message: string) => void;
  addEmojiMessage: (emoji: string) => void;
  clearMessages: () => void;
  resetStore: () => void;
}

const initialState = {
  messages: [],
};

export const useChatStore = create<ChatState>((set) => ({
  ...initialState,
  addLogMessage: (message) => set((state) => ({
    messages: [...state.messages, {
      type: 'log',
      content: message,
      timestamp: Date.now(),
    }],
  })),
  addEmojiMessage: (emoji) => set((state) => ({
    messages: [...state.messages, {
      type: 'emoji',
      content: emoji,
      timestamp: Date.now(),
    }],
  })),
  clearMessages: () => set({ messages: [] }),
  resetStore: () => set(initialState),
}));