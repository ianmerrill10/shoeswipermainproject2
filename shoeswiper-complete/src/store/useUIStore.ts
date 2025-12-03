import { create } from 'zustand';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UIState {
  // State
  isMusicPanelOpen: boolean;
  isShoePanelOpen: boolean;
  isNotificationsPanelOpen: boolean;
  activeShoeId: string | null;
  notifications: Notification[];

  // Actions
  openMusicPanel: () => void;
  closeMusicPanel: () => void;
  openShoePanel: (shoeId: string) => void;
  closeShoePanel: () => void;
  openNotificationsPanel: () => void;
  closeNotificationsPanel: () => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Initial State
  isMusicPanelOpen: false,
  isShoePanelOpen: false,
  isNotificationsPanelOpen: false,
  activeShoeId: null,
  notifications: [],

  // Actions
  openMusicPanel: () =>
    set({ isMusicPanelOpen: true }),

  closeMusicPanel: () =>
    set({ isMusicPanelOpen: false }),

  openShoePanel: (shoeId) =>
    set({
      isShoePanelOpen: true,
      activeShoeId: shoeId,
    }),

  closeShoePanel: () =>
    set({
      isShoePanelOpen: false,
      activeShoeId: null,
    }),

  openNotificationsPanel: () =>
    set({ isNotificationsPanelOpen: true }),

  closeNotificationsPanel: () =>
    set({ isNotificationsPanelOpen: false }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          ...notification,
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        },
      ],
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
