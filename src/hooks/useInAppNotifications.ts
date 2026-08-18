import { useState, useCallback, useRef, useEffect } from 'react';
import { useAudioNotification } from './useAudioNotification';

export interface InAppNotificationToast {
  id: string;
  title: string;
  body: string;
  userName: string;
  userRole?: string;
  avatarUrl?: string;
  timestamp: string;
  postId?: string;
}

export function useInAppNotifications() {
  const [toasts, setToasts] = useState<InAppNotificationToast[]>([]);
  const { playNotificationChime } = useAudioNotification();
  const toastTimersRef = useRef<any[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushNotification = useCallback((toast: Omit<InAppNotificationToast, 'id' | 'timestamp'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const timestamp = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    
    const toastItem: InAppNotificationToast = {
      ...toast,
      id,
      timestamp,
    };

    playNotificationChime();
    
    // Add to toasts list (keep max 3)
    setToasts((prev) => [toastItem, ...prev.slice(0, 2)]);

    // Auto dismiss after 6s
    const timerId = setTimeout(() => {
      dismissToast(id);
    }, 6000);
    toastTimersRef.current.push(timerId);

    // Browser Notification if tab is hidden
    if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`💬 ${toastItem.title}`, {
          body: toastItem.body,
          icon: '/logo_smk_new.png',
        });
      } catch (e) {
        console.error('Failed to show browser notification', e);
      }
    }
  }, [playNotificationChime, dismissToast]);

  useEffect(() => {
    return () => {
      // Cleanup timers on unmount
      toastTimersRef.current.forEach(clearTimeout);
      toastTimersRef.current = [];
    };
  }, []);

  return { toasts, pushNotification, dismissToast };
}
