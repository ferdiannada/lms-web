import React, { useState } from 'react';
import {
  Pin,
  Pencil,
  Trash2,
  ThumbsUp,
  Flame,
  Send,
  CornerDownRight,
  X,
  Check,
} from 'lucide-react';
import { ForumPost, ForumComment, User } from '../../../types';
import { ForumCommentTree } from './ForumCommentTree';

interface ForumPostCardProps {
  post: ForumPost;
  user: User | null;
  isTeacher: boolean;
  onSaveEditPost: (postId: string, text: string) => Promise<void>;
  onDeletePost: (postId: string) => Promise<void>;
  onToggleReaction: (postId: string, type: 'like' | 'fire') => Promise<void>;
  onAddComment: (postId: string, content: string, parentId?: string) => Promise<void>;
  onSaveEditComment: (postId: string, commentId: string, text: string) => Promise<void>;
  onDeleteComment: (postId: string, commentId: string) => Promise<void>;
}

export const ForumPostCard: React.FC<ForumPostCardProps> = ({
  post,
  user,
  isTeacher,
  onSaveEditPost,
  onDeletePost,
  onToggleReaction,
  onAddComment,
  onSaveEditComment,
  onDeleteComment,
}) => {
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostText, setEditPostText] = useState(post.content);
  const [isSavingPost, setIsSavingPost] = useState(false);

  const [commentInput, setCommentInput] = useState('');
  const [replyTarget, setReplyTarget] = useState<{ commentId: string; authorName: string } | null>(
    null
  );
  const [isAddingComment, setIsAddingComment] = useState(false);

  const handleStartEditPost = () => {
    setIsEditingPost(true);
    setEditPostText(post.content);
  };

  const handleCancelEditPost = () => {
    setIsEditingPost(false);
    setEditPostText(post.content);
  };

  const handleSavePost = async () => {
    if (!editPostText.trim() || isSavingPost) return;
    setIsSavingPost(true);
    try {
      await onSaveEditPost(post.id, editPostText.trim());
      setIsEditingPost(false);
    } finally {
      setIsSavingPost(false);
    }
  };

  const handleSetReply = (_postId: string, comment: ForumComment | null) => {
    if (comment) {
      setReplyTarget({ commentId: comment.id, authorName: comment.user_name });
    } else {
      setReplyTarget(null);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentInput.trim() || isAddingComment) return;
    setIsAddingComment(true);
    try {
      await onAddComment(post.id, commentInput.trim(), replyTarget?.commentId);
      setCommentInput('');
      setReplyTarget(null);
    } finally {
      setIsAddingComment(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
      {/* Post Author Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center border border-indigo-100 shrink-0">
            {post.user_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900">{post.user_name}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  post.user_role === 'guru'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                }`}
              >
                {post.user_role}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              {new Date(post.created_at).toLocaleString('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {post.is_pinned && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              <Pin className="w-3 h-3 text-amber-600" /> Disematkan
            </span>
          )}

          {(user?.id === post.user_id || isTeacher) && !isEditingPost && (
            <div className="flex items-center gap-1">
              {user?.id === post.user_id && (
                <button
                  onClick={handleStartEditPost}
                  title="Edit Postingan"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => onDeletePost(post.id)}
                title="Hapus Postingan"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Content or Inline Edit */}
      {isEditingPost ? (
        <div className="space-y-3 p-3 rounded-2xl bg-slate-50 border border-indigo-200">
          <textarea
            value={editPostText}
            onChange={(e) => setEditPostText(e.target.value)}
            rows={3}
            className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 resize-none shadow-2xs"
            placeholder="Tulis editan postingan..."
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleCancelEditPost}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" /> Batal
            </button>
            <button
              type="button"
              onClick={handleSavePost}
              disabled={isSavingPost || !editPostText.trim()}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#1e1b4b] hover:bg-slate-900 text-white shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" /> {isSavingPost ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>
      )}

      {/* Reactions & Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <button
          onClick={() => onToggleReaction(post.id, 'like')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
        >
          <ThumbsUp className="w-3.5 h-3.5 text-indigo-600" />
          <span>Suka</span>
        </button>
        <button
          onClick={() => onToggleReaction(post.id, 'fire')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
        >
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>Semangat</span>
        </button>
      </div>

      {/* Comments Section */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <ForumCommentTree
          postId={post.id}
          comments={post.comments || []}
          user={user}
          isTeacher={isTeacher}
          onSetReply={handleSetReply}
          onSaveEditComment={onSaveEditComment}
          onDeleteComment={onDeleteComment}
        />

        {/* Add Comment / Reply Field */}
        <div className="space-y-1.5 pt-2">
          {replyTarget && (
            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-800 animate-in fade-in">
              <span className="flex items-center gap-1.5 font-medium">
                <CornerDownRight className="w-3.5 h-3.5 text-indigo-600" />
                Membalas <strong className="text-slate-900">@{replyTarget.authorName}</strong>
              </span>
              <button
                type="button"
                onClick={() => setReplyTarget(null)}
                className="p-1 hover:bg-indigo-100 rounded-lg text-indigo-600 hover:text-slate-900 transition-colors cursor-pointer"
                title="Batal membalas"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmitComment();
              }}
              placeholder={replyTarget ? `Balas @${replyTarget.authorName}...` : 'Tulis komentar balasan...'}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white shadow-2xs transition"
            />
            <button
              type="button"
              onClick={handleSubmitComment}
              disabled={!commentInput.trim() || isAddingComment}
              className="p-2.5 bg-[#1e1b4b] hover:bg-slate-900 text-white rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-40"
              title="Kirim Komentar"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
