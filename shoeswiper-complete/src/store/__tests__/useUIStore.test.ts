import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '../useUIStore';

describe('useUIStore', () => {
  beforeEach(() => {
    // Reset the store state before each test
    useUIStore.setState({
      isMusicPanelOpen: false,
      isShoePanelOpen: false,
      isNotificationsPanelOpen: false,
      activeShoeId: null,
      notifications: [],
    });
  });

  describe('Initial State', () => {
    it('should have music panel closed initially', () => {
      const { isMusicPanelOpen } = useUIStore.getState();
      expect(isMusicPanelOpen).toBe(false);
    });

    it('should have shoe panel closed initially', () => {
      const { isShoePanelOpen } = useUIStore.getState();
      expect(isShoePanelOpen).toBe(false);
    });

    it('should have notifications panel closed initially', () => {
      const { isNotificationsPanelOpen } = useUIStore.getState();
      expect(isNotificationsPanelOpen).toBe(false);
    });

    it('should have null activeShoeId initially', () => {
      const { activeShoeId } = useUIStore.getState();
      expect(activeShoeId).toBeNull();
    });

    it('should have empty notifications initially', () => {
      const { notifications } = useUIStore.getState();
      expect(notifications).toEqual([]);
    });
  });

  describe('Music Panel', () => {
    it('should open music panel', () => {
      useUIStore.getState().openMusicPanel();

      const { isMusicPanelOpen } = useUIStore.getState();
      expect(isMusicPanelOpen).toBe(true);
    });

    it('should close music panel', () => {
      useUIStore.getState().openMusicPanel();
      expect(useUIStore.getState().isMusicPanelOpen).toBe(true);

      useUIStore.getState().closeMusicPanel();

      const { isMusicPanelOpen } = useUIStore.getState();
      expect(isMusicPanelOpen).toBe(false);
    });
  });

  describe('Shoe Panel', () => {
    it('should open shoe panel with shoeId', () => {
      useUIStore.getState().openShoePanel('shoe-123');

      const { isShoePanelOpen, activeShoeId } = useUIStore.getState();
      expect(isShoePanelOpen).toBe(true);
      expect(activeShoeId).toBe('shoe-123');
    });

    it('should close shoe panel and clear activeShoeId', () => {
      useUIStore.getState().openShoePanel('shoe-123');
      expect(useUIStore.getState().isShoePanelOpen).toBe(true);
      expect(useUIStore.getState().activeShoeId).toBe('shoe-123');

      useUIStore.getState().closeShoePanel();

      const { isShoePanelOpen, activeShoeId } = useUIStore.getState();
      expect(isShoePanelOpen).toBe(false);
      expect(activeShoeId).toBeNull();
    });

    it('should update activeShoeId when opening with different shoe', () => {
      useUIStore.getState().openShoePanel('shoe-1');
      expect(useUIStore.getState().activeShoeId).toBe('shoe-1');

      useUIStore.getState().openShoePanel('shoe-2');

      const { activeShoeId } = useUIStore.getState();
      expect(activeShoeId).toBe('shoe-2');
    });
  });

  describe('Notifications Panel', () => {
    it('should open notifications panel', () => {
      useUIStore.getState().openNotificationsPanel();

      const { isNotificationsPanelOpen } = useUIStore.getState();
      expect(isNotificationsPanelOpen).toBe(true);
    });

    it('should close notifications panel', () => {
      useUIStore.getState().openNotificationsPanel();
      expect(useUIStore.getState().isNotificationsPanelOpen).toBe(true);

      useUIStore.getState().closeNotificationsPanel();

      const { isNotificationsPanelOpen } = useUIStore.getState();
      expect(isNotificationsPanelOpen).toBe(false);
    });
  });

  describe('Notifications Management', () => {
    it('should add a notification', () => {
      useUIStore.getState().addNotification({
        message: 'Test notification',
        type: 'success',
      });

      const { notifications } = useUIStore.getState();
      expect(notifications).toHaveLength(1);
      expect(notifications[0].message).toBe('Test notification');
      expect(notifications[0].type).toBe('success');
      expect(notifications[0].id).toBeDefined();
    });

    it('should add multiple notifications', () => {
      useUIStore.getState().addNotification({
        message: 'First notification',
        type: 'success',
      });
      useUIStore.getState().addNotification({
        message: 'Second notification',
        type: 'error',
      });
      useUIStore.getState().addNotification({
        message: 'Third notification',
        type: 'info',
      });

      const { notifications } = useUIStore.getState();
      expect(notifications).toHaveLength(3);
      expect(notifications[0].message).toBe('First notification');
      expect(notifications[1].message).toBe('Second notification');
      expect(notifications[2].message).toBe('Third notification');
    });

    it('should generate unique ids for notifications', () => {
      useUIStore.getState().addNotification({
        message: 'First',
        type: 'success',
      });
      useUIStore.getState().addNotification({
        message: 'Second',
        type: 'success',
      });

      const { notifications } = useUIStore.getState();
      expect(notifications[0].id).not.toBe(notifications[1].id);
    });

    it('should remove a notification by id', () => {
      useUIStore.getState().addNotification({
        message: 'To be removed',
        type: 'info',
      });
      useUIStore.getState().addNotification({
        message: 'To stay',
        type: 'info',
      });

      const { notifications: beforeRemove } = useUIStore.getState();
      expect(beforeRemove).toHaveLength(2);

      const idToRemove = beforeRemove[0].id;
      useUIStore.getState().removeNotification(idToRemove);

      const { notifications: afterRemove } = useUIStore.getState();
      expect(afterRemove).toHaveLength(1);
      expect(afterRemove[0].message).toBe('To stay');
    });

    it('should handle removing non-existent notification', () => {
      useUIStore.getState().addNotification({
        message: 'Test',
        type: 'success',
      });

      useUIStore.getState().removeNotification('non-existent-id');

      const { notifications } = useUIStore.getState();
      expect(notifications).toHaveLength(1);
    });

    it('should support all notification types', () => {
      useUIStore.getState().addNotification({
        message: 'Success message',
        type: 'success',
      });
      useUIStore.getState().addNotification({
        message: 'Error message',
        type: 'error',
      });
      useUIStore.getState().addNotification({
        message: 'Info message',
        type: 'info',
      });

      const { notifications } = useUIStore.getState();
      expect(notifications[0].type).toBe('success');
      expect(notifications[1].type).toBe('error');
      expect(notifications[2].type).toBe('info');
    });
  });

  describe('Multiple Panels', () => {
    it('should allow multiple panels to be open simultaneously', () => {
      useUIStore.getState().openMusicPanel();
      useUIStore.getState().openShoePanel('shoe-1');
      useUIStore.getState().openNotificationsPanel();

      const state = useUIStore.getState();
      expect(state.isMusicPanelOpen).toBe(true);
      expect(state.isShoePanelOpen).toBe(true);
      expect(state.isNotificationsPanelOpen).toBe(true);
    });

    it('should close panels independently', () => {
      useUIStore.getState().openMusicPanel();
      useUIStore.getState().openShoePanel('shoe-1');
      useUIStore.getState().openNotificationsPanel();

      useUIStore.getState().closeMusicPanel();

      const state = useUIStore.getState();
      expect(state.isMusicPanelOpen).toBe(false);
      expect(state.isShoePanelOpen).toBe(true);
      expect(state.isNotificationsPanelOpen).toBe(true);
    });
  });

  describe('Notification Id Format', () => {
    it('should have notification id starting with notif-', () => {
      useUIStore.getState().addNotification({
        message: 'Test',
        type: 'success',
      });

      const { notifications } = useUIStore.getState();
      expect(notifications[0].id).toMatch(/^notif-/);
    });
  });
});
