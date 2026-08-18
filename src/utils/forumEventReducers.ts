import { ForumPost, ForumComment } from '../types';
import { normalizeForumPost, normalizeForumComment } from '../services/forum.service';

export const handleWsPostCreated = (prevPosts: ForumPost[], payload: any): ForumPost[] => {
  const newPost = normalizeForumPost(payload);
  if (prevPosts.some((p) => p.id === newPost.id)) return prevPosts;
  return [newPost, ...prevPosts];
};

export const handleWsPostUpdated = (prevPosts: ForumPost[], payload: any): ForumPost[] => {
  const updatedPost = normalizeForumPost(payload);
  return prevPosts.map((p) => (p.id === updatedPost.id ? { ...p, ...updatedPost, comments: p.comments } : p));
};

export const handleWsPostDeleted = (prevPosts: ForumPost[], payload: any): ForumPost[] => {
  const deletedId = typeof payload === 'string' ? payload : payload?.id;
  if (!deletedId) return prevPosts;
  return prevPosts.filter((p) => p.id !== deletedId);
};

export const handleWsCommentAdded = (prevPosts: ForumPost[], payload: any): ForumPost[] => {
  const newComment = normalizeForumComment(payload);
  return prevPosts.map((post) => {
    if (post.id !== newComment.post_id) return post;
    const existingComments = post.comments || [];
    if (existingComments.some((c) => c.id === newComment.id)) return post;
    return {
      ...post,
      comments_count: (post.comments_count || 0) + 1,
      comments: [...existingComments, newComment],
    };
  });
};

export const handleWsCommentUpdated = (prevPosts: ForumPost[], payload: any): ForumPost[] => {
  const updatedComment = normalizeForumComment(payload);
  return prevPosts.map((post) => {
    if (post.id !== updatedComment.post_id) return post;
    return {
      ...post,
      comments: (post.comments || []).map((c) => (c.id === updatedComment.id ? updatedComment : c)),
    };
  });
};

export const handleWsCommentDeleted = (prevPosts: ForumPost[], payload: any): ForumPost[] => {
  const commentId = payload?.id;
  const postId = payload?.post_id;
  if (!commentId) return prevPosts;
  return prevPosts.map((post) => {
    if (postId && post.id !== postId) return post;
    const filtered = (post.comments || []).filter((c) => c.id !== commentId);
    if (filtered.length === (post.comments || []).length) return post; // no change
    return {
      ...post,
      comments_count: Math.max(0, (post.comments_count || 1) - 1),
      comments: filtered,
    };
  });
};
