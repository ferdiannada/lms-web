import { useState, useEffect, useCallback } from 'react';
import { AppNotification } from '../types';
import { api } from '../services';

export function useNotifications(userExists: boolean, pollIntervalMs: number = 45000) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await api.getUnreadNotificationCount();
      setUnreadCount(count);
    } catch {
      // ignore
    }
  }, []);

  const loadNotifications = useCallback(async (page: number = 1, limit: number = 20) => {
    setIsLoading(true);
    try {
      const list = await api.getNotifications(page, limit);
      setNotifications(list);
      const unread = list.filter((n) => !n.read_at).length;
      setUnreadCount(unread);
      return list;
    } catch (err) {
      console.error('Failed to load notifications:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  useEffect(() => {
    if (!userExists) return;
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, pollIntervalMs);
    return () => clearInterval(interval);
  }, [userExists, pollIntervalMs, loadUnreadCount]);

  return {
    notifications,
    unreadCount,
    isLoading,
    loadUnreadCount,
    loadNotifications,
    markAllAsRead,
    markAsRead,
    setNotifications,
    setUnreadCount,
  };
}
