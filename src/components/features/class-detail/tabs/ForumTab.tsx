import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, MessageSquare, X } from 'lucide-react';
import { ForumPost, User } from '../../../../types';
import { api } from '../../../../services/api';
import { ForumPostComposer } from '../../forum/ForumPostComposer';
import { ForumPostCard } from '../../forum/ForumPostCard';
import { useClassWebSocket } from '../../../../hooks/useClassWebSocket';

interface ForumTabProps {
  classId: string;
  user: User | null;
  isTeacher: boolean;
}

export const ForumTab: React.FC<ForumTabProps> = ({ classId, user, isTeacher }) => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllPosts, setShowAllPosts] = useState(false);
  const POST_LIMIT = 5;

  // WebSocket Live Updates & Toasts
  const { toasts, dismissToast } = useClassWebSocket({
    classId,
    user,
    setPosts,
  });

  const fetchPosts = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    try {
      const data = await api.getForumPosts(classId, { signal });
      if (!signal?.aborted) setPosts(data);
    } catch (err: any) {
      if (err.name !== 'AbortError') console.error('Failed to load forum posts:', err);
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    const controller = new AbortController();
    fetchPosts(controller.signal);
    return () => controller.abort();
  }, [fetchPosts]);

  // Handlers
  const handleCreatePost = async (content: string) => {
    const newPost = await api.createForumPost(classId, content);
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleSaveEditPost = async (postId: string, text: string) => {
    const updated = await api.updateForumPost(postId, text);
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, ...updated, comments: p.comments } : p))
    );
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Hapus kiriman diskusi ini?')) return;
    await api.deleteForumPost(postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleToggleReaction = async (postId: string, type: 'like' | 'fire') => {
    const emoji = type === 'like' ? '👍' : '🔥';
    
    // Optimistic update
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const updatedReactions = post.reactions.map((r) => {
          if (r.emoji === emoji) {
            const isReacted = r.user_reacted;
            return {
              ...r,
              user_reacted: !isReacted,
              count: Math.max(0, r.count + (isReacted ? -1 : 1)),
            };
          }
          return r;
        });
        if (!updatedReactions.some((r) => r.emoji === emoji)) {
          updatedReactions.push({ emoji, count: 1, user_reacted: true });
        }
        return { ...post, reactions: updatedReactions };
      })
    );

    try {
      await api.toggleReaction('post', postId, emoji, classId);
    } catch (err) {
      console.error('Failed to toggle reaction:', err);
      api.getForumPosts(classId).then(setPosts).catch(console.error);
    }
  };

  const handleAddComment = async (postId: string, content: string, parentId?: string) => {
    const newComment = await api.addComment(postId, content, parentId);
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const existing = post.comments || [];
        return {
          ...post,
          comments_count: (post.comments_count || 0) + 1,
          comments: [...existing, newComment],
        };
      })
    );
  };

  const handleSaveEditComment = async (postId: string, commentId: string, text: string) => {
    const updated = await api.updateComment(postId, commentId, text);
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        return {
          ...post,
          comments: (post.comments || []).map((c) => (c.id === commentId ? updated : c)),
        };
      })
    );
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!confirm('Hapus komentar ini?')) return;
    await api.deleteComment(postId, commentId);
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        return {
          ...post,
          comments_count: Math.max(0, (post.comments_count || 1) - 1),
          comments: (post.comments || []).filter((c) => c.id !== commentId),
        };
      })
    );
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-3">
        <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold">Memuat diskusi forum...</p>
      </div>
    );
  }

  const displayedPosts = showAllPosts || posts.length <= POST_LIMIT
    ? posts
    : posts.slice(0, POST_LIMIT);

  return (
    <div className="space-y-6 relative">
      {/* Floating In-App Comment Notifications */}
      <div className="fixed top-20 right-4 sm:right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-white border border-slate-200 rounded-2xl p-4 shadow-xl backdrop-blur-xl animate-in slide-in-from-top-4 fade-in flex items-start gap-3 relative group"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center border border-indigo-100 shrink-0 text-xs">
              {toast.userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-bold text-xs text-slate-900 truncate">{toast.userName}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                      toast.userRole === 'guru'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}
                  >
                    {toast.userRole}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">{toast.timestamp}</span>
              </div>
              <p className="text-[11px] font-semibold text-indigo-700 mt-0.5">{toast.title}</p>
              <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed whitespace-pre-wrap">
                {toast.body}
              </p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100 shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <ForumPostComposer onSubmit={handleCreatePost} />

      {posts.length === 0 ? (
        <div className="bg-m3-surface p-10 text-center text-m3-on-surface-variant rounded-[2rem] border border-m3-outline-variant/30 shadow-m3-elevation-1 font-medium">
          Belum ada kiriman diskusi di ruang kelas ini. Jadilah yang pertama mengirim pesan!
        </div>
      ) : (
        <div className="space-y-4">
          {displayedPosts.map((post) => (
            <ForumPostCard
              key={post.id}
              post={post}
              user={user}
              isTeacher={isTeacher}
              onSaveEditPost={handleSaveEditPost}
              onDeletePost={handleDeletePost}
              onToggleReaction={handleToggleReaction}
              onAddComment={handleAddComment}
              onSaveEditComment={handleSaveEditComment}
              onDeleteComment={handleDeleteComment}
            />
          ))}

          {/* Toggle Show All Posts Button */}
          {posts.length > POST_LIMIT && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setShowAllPosts(!showAllPosts)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-m3-surface hover:bg-m3-surface-container border border-m3-outline-variant/50 text-xs font-bold text-m3-on-surface hover:text-m3-primary shadow-m3-elevation-1 hover:shadow-m3-elevation-2 transition-all duration-300 active:scale-95 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-m3-primary" />
                {showAllPosts ? (
                  <>
                    <span>Tampilkan Lebih Ringkas (5 Teratas)</span>
                    <ChevronUp className="w-4 h-4 text-m3-on-surface-variant" />
                  </>
                ) : (
                  <>
                    <span>Lihat Semua Diskusi Kelas ({posts.length} Postingan)</span>
                    <ChevronDown className="w-4 h-4 text-m3-on-surface-variant" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
