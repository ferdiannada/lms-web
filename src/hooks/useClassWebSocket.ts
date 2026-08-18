import React, { useEffect, useCallback } from 'react';
import { ForumPost, User } from '../types';
import { getToken, getWsUrl } from '../services';
import { useInAppNotifications } from './useInAppNotifications';
import {
  handleWsPostCreated,
  handleWsPostUpdated,
  handleWsPostDeleted,
  handleWsCommentAdded,
  handleWsCommentUpdated,
  handleWsCommentDeleted,
} from '../utils/forumEventReducers';

interface UseClassWebSocketProps {
  classId?: string;
  user: User | null;
  setPosts: React.Dispatch<React.SetStateAction<ForumPost[]>>;
}

export function useClassWebSocket({ classId, user, setPosts }: UseClassWebSocketProps) {
  const { toasts, pushNotification, dismissToast } = useInAppNotifications();

  useEffect(() => {
    if (!classId) return;
    const token = getToken();
    if (!token) return;

    const wsUrl = getWsUrl(`/classes/${classId}/forum/ws`);
    let ws: WebSocket | null = null;
    let reconnectTimer: any = null;
    let isUnmounted = false;

    const scheduleReconnect = (delayMs: number = 3000) => {
      if (isUnmounted || reconnectTimer) return;
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connectWS();
      }, delayMs);
    };

    const connectWS = () => {
      if (isUnmounted) return;
      if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
        return;
      }

      try {
        ws = new WebSocket(wsUrl, ['pedia-token', token]);

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const eventType = data.type;
            const payload = data.data;

            if (eventType === 'post') {
              setPosts((prev) => handleWsPostCreated(prev, payload));
            } else if (eventType === 'post_updated') {
              setPosts((prev) => handleWsPostUpdated(prev, payload));
            } else if (eventType === 'post_deleted') {
              setPosts((prev) => handleWsPostDeleted(prev, payload));
            } else if (eventType === 'comment') {
              setPosts((prev) => handleWsCommentAdded(prev, payload));

              // Trigger interactive notification toast if comment is from another user
              if (payload.user_id && payload.user_id !== user?.id) {
                pushNotification({
                  title: payload.parent_id
                    ? `${payload.user_name} membalas komentar`
                    : `${payload.user_name} mengirim komentar baru`,
                  body: payload.content,
                  userName: payload.user_name,
                  userRole: payload.user_role,
                  avatarUrl: payload.user_avatar,
                  postId: payload.post_id,
                });
              }
            } else if (eventType === 'comment_updated') {
              setPosts((prev) => handleWsCommentUpdated(prev, payload));
            } else if (eventType === 'comment_deleted') {
              setPosts((prev) => handleWsCommentDeleted(prev, payload));
            }
          } catch (e) {
            console.error('Error handling WebSocket message:', e);
          }
        };

        ws.onerror = () => {
          ws?.close();
        };

        ws.onclose = () => {
          if (!isUnmounted) {
            scheduleReconnect(3000);
          }
        };
      } catch (err) {
        if (!isUnmounted) {
          scheduleReconnect(5000);
        }
      }
    };

    connectWS();

    return () => {
      isUnmounted = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) {
        ws.onclose = null;
        ws.onerror = null;
        ws.onmessage = null;
        if (ws.readyState === WebSocket.CONNECTING) {
          ws.onopen = () => ws?.close();
        } else if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      }
    };
  }, [classId, user?.id, setPosts, pushNotification]);

  return { toasts, dismissToast };
}
