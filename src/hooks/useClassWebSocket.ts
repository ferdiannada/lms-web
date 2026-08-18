import React, { useEffect, useState, useCallback, useRef } from 'react';
import { ForumPost, ForumComment, User } from '../types';
import { getToken, getWsUrl } from '../services';
import { normalizeForumPost, normalizeForumComment } from '../services/forum.service';
import { useAudioNotification } from './useAudioNotification';

export interface InAppNotificationToast {
  id: string;
  title: string;
  body: string;
  userName: string;
  userRole?: string;
  avatarUrl?: string;
  timestamp: string;
  postId: string;
}

interface UseClassWebSocketProps {
  classId?: string;
  user: User | null;
  setPosts: React.Dispatch<React.SetStateAction<ForumPost[]>>;
}

export function useClassWebSocket({ classId, user, setPosts }: UseClassWebSocketProps) {
  const [toasts, setToasts] = useState<InAppNotificationToast[]>([]);
  const { playNotificationChime } = useAudioNotification();
  const toastTimersRef = useRef<any[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

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
              const newPost = normalizeForumPost(payload);
              setPosts((prev) => {
                if (prev.some((p) => p.id === newPost.id)) return prev;
                return [newPost, ...prev];
              });
            } else if (eventType === 'post_updated') {
              const updatedPost = normalizeForumPost(payload);
              setPosts((prev) =>
                prev.map((p) => (p.id === updatedPost.id ? { ...p, ...updatedPost, comments: p.comments } : p))
              );
            } else if (eventType === 'post_deleted') {
              const deletedId = typeof payload === 'string' ? payload : payload?.id;
              if (deletedId) {
                setPosts((prev) => prev.filter((p) => p.id !== deletedId));
              }
            } else if (eventType === 'comment') {
              const newComment = normalizeForumComment(payload);
              setPosts((prev) =>
                prev.map((post) => {
                  if (post.id !== newComment.post_id) return post;
                  const existingComments = post.comments || [];
                  if (existingComments.some((c) => c.id === newComment.id)) return post;
                  return {
                    ...post,
                    comments_count: (post.comments_count || 0) + 1,
                    comments: [...existingComments, newComment],
                  };
                })
              );

              // Trigger interactive notification toast if comment is from another user
              if (newComment.user_id && newComment.user_id !== user?.id) {
                playNotificationChime();
                const toastItem: InAppNotificationToast = {
                  id: `toast-${Date.now()}-${Math.random()}`,
                  title: newComment.parent_id
                    ? `${newComment.user_name} membalas komentar`
                    : `${newComment.user_name} mengirim komentar baru`,
                  body: newComment.content,
                  userName: newComment.user_name,
                  userRole: newComment.user_role,
                  avatarUrl: newComment.user_avatar,
                  timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                  postId: newComment.post_id,
                };

                setToasts((prev) => [toastItem, ...prev.slice(0, 3)]);

                // Auto dismiss after 6s with tracking
                const timerId = setTimeout(() => {
                  if (!isUnmounted) {
                    setToasts((prev) => prev.filter((t) => t.id !== toastItem.id));
                  }
                }, 6000);
                toastTimersRef.current.push(timerId);

                // Browser notification if tab is inactive
                if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
                  try {
                    new Notification(`💬 ${toastItem.title}`, {
                      body: toastItem.body,
                      icon: '/logo_smk_new.png',
                    });
                  } catch {}
                }
              }
            } else if (eventType === 'comment_updated') {
              const updatedComment = normalizeForumComment(payload);
              setPosts((prev) =>
                prev.map((post) => {
                  if (post.id !== updatedComment.post_id) return post;
                  return {
                    ...post,
                    comments: (post.comments || []).map((c) =>
                      c.id === updatedComment.id ? updatedComment : c
                    ),
                  };
                })
              );
            } else if (eventType === 'comment_deleted') {
              const commentId = payload?.id;
              const postId = payload?.post_id;
              if (commentId) {
                setPosts((prev) =>
                  prev.map((post) => {
                    if (postId && post.id !== postId) return post;
                    const filtered = (post.comments || []).filter((c) => c.id !== commentId);
                    return {
                      ...post,
                      comments_count: Math.max(0, (post.comments_count || 1) - 1),
                      comments: filtered,
                    };
                  })
                );
              }
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
      toastTimersRef.current.forEach(clearTimeout);
      toastTimersRef.current = [];
    };
  }, [classId, user?.id, setPosts, playNotificationChime]);

  return { toasts, dismissToast, setToasts };
}
