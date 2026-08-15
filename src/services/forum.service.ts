import { ForumPost, ForumComment } from '../types';
import { request } from './client';

export function normalizeForumComment(raw: any): ForumComment {
  if (!raw) return {} as ForumComment;
  const user = raw.user || {};
  return {
    id: raw.id,
    post_id: raw.post_id,
    user_id: raw.user_id || user.id || raw.author_id || '',
    user_name: user.name || raw.user_name || raw.author_name || 'Pengguna',
    user_role: user.role || raw.user_role || 'siswa',
    user_avatar: user.avatar_url || raw.user_avatar || '',
    content: raw.content || '',
    parent_id: raw.parent_id || null,
    replies: Array.isArray(raw.replies) ? raw.replies.map(normalizeForumComment) : [],
    reply_count: raw.reply_count || 0,
    created_at: raw.created_at || new Date().toISOString(),
    updated_at: raw.updated_at,
  };
}

export function normalizeForumPost(raw: any): ForumPost {
  if (!raw) return {} as ForumPost;
  const user = raw.user || {};
  const rawComments = Array.isArray(raw.comments) ? raw.comments : [];
  return {
    id: raw.id,
    class_id: raw.class_id,
    user_id: raw.user_id || user.id || raw.author_id || '',
    user_name: user.name || raw.user_name || raw.author_name || 'Pengguna',
    user_role: user.role || raw.user_role || 'siswa',
    user_avatar: user.avatar_url || raw.user_avatar || '',
    title: raw.title || '',
    content: raw.content || '',
    is_pinned: raw.pinned ?? raw.is_pinned ?? false,
    pinned: raw.pinned ?? raw.is_pinned ?? false,
    reactions: raw.reactions || [
      { emoji: '👍', count: 0, user_reacted: false },
      { emoji: '🔥', count: 0, user_reacted: false },
    ],
    comments_count: raw.comment_count ?? raw.comments_count ?? rawComments.length,
    comments: rawComments.map(normalizeForumComment),
    created_at: raw.created_at || new Date().toISOString(),
    updated_at: raw.updated_at,
  };
}

export const forumService = {
  async getForumPosts(classId: string, options?: RequestInit): Promise<ForumPost[]> {
    const raw = await request<any[]>(`/classes/${classId}/forum`, options);
    if (!Array.isArray(raw)) return [];

    const posts = await Promise.all(
      raw.map(async (rawPost) => {
        const post = normalizeForumPost(rawPost);
        if (rawPost.comments && Array.isArray(rawPost.comments) && rawPost.comments.length > 0) {
          return post;
        }
        try {
          const res = await request<any>(`/forum/posts/${post.id}/comments?limit=100`, options);
          const list = Array.isArray(res)
            ? res
            : (res?.items && Array.isArray(res.items) ? res.items : []);
          post.comments = list.map(normalizeForumComment);
        } catch {
          post.comments = [];
        }
        return post;
      })
    );

    return posts;
  },

  async createForumPost(classId: string, content: string, title?: string): Promise<ForumPost> {
    const raw = await request<any>(`/classes/${classId}/forum`, {
      method: 'POST',
      body: JSON.stringify({ content, title }),
    });
    return normalizeForumPost(raw);
  },

  async updateForumPost(postId: string, content: string): Promise<ForumPost> {
    const raw = await request<any>(`/forum/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
    return normalizeForumPost(raw);
  },

  async deleteForumPost(postId: string): Promise<void> {
    await request(`/forum/posts/${postId}`, { method: 'DELETE' });
  },

  async togglePinPost(postId: string): Promise<any> {
    return await request(`/forum/posts/${postId}/pin`, { method: 'POST' });
  },

  async getComments(postId: string, options?: RequestInit): Promise<ForumComment[]> {
    const raw = await request<any>(`/forum/posts/${postId}/comments?limit=100`, options);
    const list = Array.isArray(raw)
      ? raw
      : (raw?.items && Array.isArray(raw.items) ? raw.items : []);
    return list.map(normalizeForumComment);
  },

  async addComment(postId: string, content: string, parentId?: string): Promise<ForumComment> {
    const raw = await request<any>(`/forum/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parent_id: parentId }),
    });
    return normalizeForumComment(raw);
  },

  async updateComment(postId: string, commentId: string, content: string): Promise<ForumComment> {
    try {
      const raw = await request<any>(`/forum/posts/${postId}/comments/${commentId}`, {
        method: 'PUT',
        body: JSON.stringify({ content }),
      });
      return normalizeForumComment(raw);
    } catch {
      const raw = await request<any>(`/forum/comments/${commentId}`, {
        method: 'PUT',
        body: JSON.stringify({ content }),
      });
      return normalizeForumComment(raw);
    }
  },

  async deleteComment(postId: string, commentId: string): Promise<void> {
    try {
      await request(`/forum/posts/${postId}/comments/${commentId}`, { method: 'DELETE' });
    } catch {
      await request(`/forum/comments/${commentId}`, { method: 'DELETE' });
    }
  },

  async toggleReaction(targetType: 'post' | 'comment', targetId: string, emoji: string, classId?: string): Promise<any> {
    return await request('/reactions', {
      method: 'POST',
      body: JSON.stringify({
        target_type: targetType,
        target_id: targetId,
        emoji,
        class_id: classId,
      }),
    });
  },
};
