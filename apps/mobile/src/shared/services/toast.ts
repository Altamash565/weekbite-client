import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastData {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastState {
  currentToast: ToastData | null;
  show: (message: string, type?: ToastType, duration?: number) => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  currentToast: null,
  show: (message, type = 'success', duration = 2500) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    set({ currentToast: { id, message, type, duration } });
  },
  hide: () => set({ currentToast: null }),
}));

export const toast = {
  show: (message: string, type: ToastType = 'success', duration?: number) =>
    useToastStore.getState().show(message, type, duration),
  success: (message: string, _subMessage?: string, duration?: number) =>
    useToastStore.getState().show(message, 'success', duration),
  error: (message: string, _subMessage?: string, duration?: number) =>
    useToastStore.getState().show(message, 'error', duration),
  info: (message: string, _subMessage?: string, duration?: number) =>
    // Show checkmark for completed info actions as requested by user
    useToastStore.getState().show(message, 'success', duration),
  warning: (message: string, _subMessage?: string, duration?: number) =>
    useToastStore.getState().show(message, 'warning', duration),
  hide: () => useToastStore.getState().hide(),
};
