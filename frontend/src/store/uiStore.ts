import { create } from 'zustand';
import type { ChatMessage } from '../types/chat';

interface UIState {
  isChatOpen: boolean;
  isSidebarCollapsed: boolean;
  messages: ChatMessage[];
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  toggleSidebar: () => void;
  appendMessage: (msg: ChatMessage) => void;
  clearMessages: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isChatOpen: false,
  isSidebarCollapsed: false,
  messages: [],
  openChat: () => set({ isChatOpen: true }),
  closeChat: () => set({ isChatOpen: false }),
  toggleChat: () => set((s) => ({ isChatOpen: !s.isChatOpen })),
  toggleSidebar: () => set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),
  appendMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  clearMessages: () => set({ messages: [] }),
}));
