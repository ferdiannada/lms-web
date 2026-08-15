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
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Share2,
  Sparkles,
  ShieldCheck,
  GraduationCap,
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

  // Post Content Expansion State
  const [isExpandedPost, setIsExpandedPost] = useState(false);
  const isLongContent = post.content.length > 250 || post.content.split('\n').length > 4;

  // Comments Visibility State
  const totalComments = post.comments?.length || 0;
  const [showAllComments, setShowAllComments] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(true);

  // Copy Feedback
  const [copiedLink, setCopiedLink] = useState(false);

  const [commentInput, setCommentInput] = useState('');
  const [replyTarget, setReplyTarget] = useState<{ commentId: string; authorName: string } | null>(
    null
  );
  const [isAddingComment, setIsAddingComment] = useState(false);

  // Compute reaction states & counts
  const likeReaction = post.reactions?.find((r) => r.emoji === 'like' || r.emoji === '👍');
  const fireReaction = post.reactions?.find((r) => r.emoji === 'fire' || r.emoji === '🔥');

  const likeCount = likeReaction?.count || 0;
  const fireCount = fireReaction?.count || 0;

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
      setShowAllComments(true);
      setIsCommentsOpen(true);
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
      setShowAllComments(true);
      setIsCommentsOpen(true);
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const isPostAuthor = user?.id === post.user_id;
  const isPostTeacher = post.user_role === 'guru' || post.user_role === 'admin';

  return (
    <div
      className={`bg-white p-5 sm:p-7 rounded-3xl border transition-all duration-200 shadow-xs space-y-4 hover:shadow-md ${
        post.is_pinned ? 'border-amber-200/80 bg-gradient-to-b from-amber-50/20 to-white' : 'border-slate-200'
      }`}
    >
      {/* Pinned Post Pill */}
      {post.is_pinned && (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold w-fit shadow-2xs">
          <Pin className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
          <span>Pengumuman Penting Disematkan</span>
        </div>
      )}

      {/* Header: Author & Date */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-11 h-11 rounded-2xl font-black flex items-center justify-center text-sm shrink-0 shadow-xs ${
              isPostTeacher
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white'
                : 'bg-gradient-to-tr from-[#1e1b4b] to-indigo-600 text-white'
            }`}
          >
            {post.user_name.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-sm text-slate-900 truncate">
                {isPostAuthor ? 'Anda' : post.user_name}
              </span>
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase flex items-center gap-1 ${
                  isPostTeacher
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                }`}
              >
                {isPostTeacher ? (
                  <>
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Guru
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-3 h-3 text-indigo-600" /> Siswa
                  </>
                )}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mt-0.5">
              {new Date(post.created_at).toLocaleString('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          </div>
        </div>

        {/* Action Buttons (Edit/Delete) */}
        {(isPostAuthor || isTeacher) && !isEditingPost && (
          <div className="flex items-center gap-1 shrink-0">
            {isPostAuthor && (
              <button
                type="button"
                onClick={handleStartEditPost}
                title="Edit Postingan"
                className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onDeletePost(post.id)}
              title="Hapus Postingan"
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Post Content or Inline Edit */}
      {isEditingPost ? (
        <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-indigo-200">
          <textarea
            value={editPostText}
            onChange={(e) => setEditPostText(e.target.value)}
            rows={3}
            className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 resize-none shadow-2xs"
            placeholder="Tulis editan postingan..."
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleCancelEditPost}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
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
        <div className="space-y-2">
          <p
            className={`text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap ${
              !isExpandedPost && isLongContent ? 'line-clamp-3' : ''
            }`}
          >
            {post.content}
          </p>

          {isLongContent && (
            <button
              type="button"
              onClick={() => setIsExpandedPost(!isExpandedPost)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors cursor-pointer py-0.5"
            >
              {isExpandedPost ? (
                <>
                  <span>Sembunyikan Sebagian</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>Baca Selengkapnya</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Interactive Action Toolbar (Reactions & Comments Toggle) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          {/* Suka Reaction Button */}
          <button
            type="button"
            onClick={() => onToggleReaction(post.id, 'like')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-xs font-bold text-slate-700 border border-slate-200 hover:border-indigo-200 transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <ThumbsUp className="w-3.5 h-3.5 text-indigo-600" />
            <span>Suka</span>
            {likeCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800 text-[10px]">
                {likeCount}
              </span>
            )}
          </button>

          {/* Semangat Reaction Button */}
          <button
            type="button"
            onClick={() => onToggleReaction(post.id, 'fire')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-amber-50 hover:text-amber-800 text-xs font-bold text-slate-700 border border-slate-200 hover:border-amber-200 transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Semangat</span>
            {fireCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 text-[10px]">
                {fireCount}
              </span>
            )}
          </button>

          {/* Share/Copy link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 transition text-xs cursor-pointer shadow-2xs"
            title="Salin Link Diskusi"
          >
            {copiedLink ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
            <span className="text-[11px] hidden sm:inline">{copiedLink ? 'Tersalin' : 'Bagikan'}</span>
          </button>
        </div>

        {/* Comment Count & Drawer Trigger */}
        <button
          type="button"
          onClick={() => setIsCommentsOpen(!isCommentsOpen)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 py-1 px-2 rounded-xl transition cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
          <span>{totalComments} Komentar</span>
          {totalComments > 0 && (
            isCommentsOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>
      </div>

      {/* Collapsible Comments Section */}
      {isCommentsOpen && (
        <div className="space-y-3 pt-3 border-t border-slate-100 animate-in fade-in">
          {totalComments > 0 && (
            <ForumCommentTree
              postId={post.id}
              comments={post.comments || []}
              user={user}
              isTeacher={isTeacher}
              showAll={showAllComments}
              onSetReply={handleSetReply}
              onSaveEditComment={onSaveEditComment}
              onDeleteComment={onDeleteComment}
            />
          )}

          {/* Toggle Show All Comments Button */}
          {totalComments > 2 && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAllComments(!showAllComments)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 py-1 px-3 rounded-xl bg-indigo-50/50 hover:bg-indigo-50 transition-colors cursor-pointer"
              >
                {showAllComments ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" />
                    <span>Ciutkan Komentar (Tampilkan 2 Teratas)</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" />
                    <span>Lihat Semua {totalComments} Komentar</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Inline Comment Composer */}
          <div className="space-y-2 pt-2">
            {replyTarget && (
              <div className="flex items-center justify-between px-3.5 py-1.5 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-800 animate-in fade-in">
                <span className="flex items-center gap-1.5 font-medium">
                  <CornerDownRight className="w-3.5 h-3.5 text-indigo-600" />
                  Membalas komentar{' '}
                  <strong className="text-slate-900">
                    {replyTarget.authorName === user?.name ? 'Anda sendiri' : `@${replyTarget.authorName}`}
                  </strong>
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
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0 border border-slate-200">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmitComment();
                }}
                placeholder={replyTarget ? `Balas @${replyTarget.authorName}...` : 'Tulis komentar atau tanggapan Anda...'}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white shadow-2xs transition"
              />
              <button
                type="button"
                onClick={handleSubmitComment}
                disabled={!commentInput.trim() || isAddingComment}
                className="px-4 py-2.5 bg-[#1e1b4b] hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
                title="Kirim Komentar"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kirim</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
