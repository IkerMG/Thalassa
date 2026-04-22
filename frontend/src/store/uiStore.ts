import { create } from 'zustand';

interface UIState {
  isChatOpen: boolean;
  isSidebarCollapsed: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isChatOpen: false,
  isSidebarCollapsed: false,
  openChat: () => set({ isChatOpen: true }),
  closeChat: () => set({ isChatOpen: false }),
  toggleChat: () => set((s) => ({ isChatOpen: !s.isChatOpen })),
  toggleSidebar: () => set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),
}));
