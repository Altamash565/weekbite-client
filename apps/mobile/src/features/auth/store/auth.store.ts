import { create } from 'zustand';

interface AuthUiState {
  activeScreen: 'sign-in' | 'sign-up';
  setActiveScreen: (screen: 'sign-in' | 'sign-up') => void;
}

export const useAuthStore = create<AuthUiState>((set) => ({
  activeScreen: 'sign-in',
  setActiveScreen: (screen) => set({ activeScreen: screen }),
}));

