import { AppNotification } from '../types';
import { request } from './client';

export const notificationService = {
  async getNotifications(page: number = 1, limit: number = 20): Promise<AppNotification[]> {
    try {
      const raw = await request<any>(`/notifications?page=${page}&limit=${limit}`);
      if (Array.isArray(raw)) return raw;
      if (raw && Array.isArray(raw.notifications)) return raw.notifications;
      if (raw && Array.isArray(raw.data)) return raw.data;
      return [];
    } catch (err) {
      console.warn('[API] Failed to fetch notifications:', err);
      return [];
    }
  },

  async getUnreadNotificationCount(): Promise<number> {
    try {
      const res = await request<any>('/notifications/unread-count');
      if (typeof res === 'number') return res;
      if (res && typeof res.count === 'number') return res.count;
      if (res && typeof res.unread_count === 'number') return res.unread_count;
      return 0;
    } catch {
      return 0;
    }
  },

  async markNotificationRead(id: string): Promise<void> {
    try {
      await request(`/notifications/${id}/read`, { method: 'POST' });
    } catch (err) {
      console.warn(`[API] Failed to mark notification ${id} as read:`, err);
    }
  },

  async markAllNotificationsRead(): Promise<void> {
    try {
      await request('/notifications/read-all', { method: 'POST' });
    } catch (err) {
      console.warn('[API] Failed to mark all notifications as read:', err);
    }
  },
};
