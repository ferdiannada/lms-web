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
      className={`bg-m3-surface p-5 sm:p-7 rounded-[1.5rem] border transition-all duration-200 shadow-m3-elevation-1 space-y-4 hover:shadow-m3-elevation-2 ${
        post.is_pinned ? 'border-m3-tertiary/50 bg-m3-tertiary-container/10' : 'border-m3-outline-variant/30'
      }`}
    >
      {/* Pinned Post Pill */}
      {post.is_pinned && (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-m3-tertiary-container text-m3-on-tertiary-container text-[11px] font-bold w-fit shadow-sm">
          <Pin className="w-3.5 h-3.5" />
          <span>Pengumuman Penting Disematkan</span>
        </div>
      )}

      {/* Header: Author & Date */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-4 min-w-0">
          <div
            className={`w-12 h-12 rounded-[1rem] font-black flex items-center justify-center text-sm shrink-0 shadow-sm ${
              isPostTeacher
                ? 'bg-m3-secondary-container text-m3-on-secondary-container'
                : 'bg-m3-primary-container text-m3-on-primary-container'
            }`}
          >
            {post.user_name.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-sm text-m3-on-surface truncate">
                {isPostAuthor ? 'Anda' : post.user_name}
              </span>
              <span
                className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase flex items-center gap-1 ${
                  isPostTeacher
                    ? 'bg-m3-secondary-container text-m3-on-secondary-container'
                    : 'bg-m3-primary-container text-m3-on-primary-container'
                }`}
              >
                {isPostTeacher ? (
                  <>
                    <ShieldCheck className="w-3 h-3" /> Guru
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-3 h-3" /> Siswa
                  </>
                )}
              </span>
            </div>

            <p className="text-[11px] text-m3-on-surface-variant font-medium mt-1">
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
                className="p-2 rounded-xl text-m3-on-surface-variant hover:text-m3-primary hover:bg-m3-surface-container transition-colors cursor-pointer active:scale-95"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onDeletePost(post.id)}
              title="Hapus Postingan"
              className="p-2 rounded-xl text-m3-on-surface-variant hover:text-m3-error hover:bg-m3-error-container transition-colors cursor-pointer active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Post Content or Inline Edit */}
      {isEditingPost ? (
        <div className="space-y-3 p-4 rounded-[1.25rem] bg-m3-surface-container-highest border border-m3-outline-variant/50">
          <textarea
            value={editPostText}
            onChange={(e) => setEditPostText(e.target.value)}
            rows={3}
            className="w-full bg-m3-surface border-2 border-transparent rounded-xl p-3 text-sm text-m3-on-surface placeholder-m3-on-surface-variant focus:outline-none focus:border-m3-primary resize-none transition-all shadow-sm"
            placeholder="Tulis editan postingan..."
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleCancelEditPost}
              className="px-4 py-2 rounded-full text-xs font-bold text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-variant transition-colors cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <X className="w-3.5 h-3.5" /> Batal
            </button>
            <button
              type="button"
              onClick={handleSavePost}
              disabled={isSavingPost || !editPostText.trim()}
              className="px-5 py-2 rounded-full text-xs font-bold bg-m3-primary hover:bg-m3-primary/90 text-m3-on-primary shadow-m3-elevation-1 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 active:scale-95"
            >
              <Check className="w-3.5 h-3.5" /> {isSavingPost ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p
            className={`text-sm text-m3-on-surface leading-relaxed whitespace-pre-wrap ${
              !isExpandedPost && isLongContent ? 'line-clamp-3' : ''
            }`}
          >
            {post.content}
          </p>

          {isLongContent && (
            <button
              type="button"
              onClick={() => setIsExpandedPost(!isExpandedPost)}
              className="text-xs font-bold text-m3-primary hover:text-m3-primary/80 flex items-center gap-1 transition-colors cursor-pointer py-1"
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
      <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-m3-outline-variant/30">
        <div className="flex items-center gap-2">
          {/* Suka Reaction Button */}
          <button
            type="button"
            onClick={() => onToggleReaction(post.id, 'like')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-m3-surface-container hover:bg-m3-secondary-container hover:text-m3-on-secondary-container text-xs font-bold text-m3-on-surface-variant transition-all cursor-pointer shadow-sm active:scale-95 border border-m3-outline-variant/20"
          >
            <ThumbsUp className="w-4 h-4 text-m3-primary" />
            <span>Suka</span>
            {likeCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-m3-primary-container text-m3-on-primary-container text-[10px]">
                {likeCount}
              </span>
            )}
          </button>

          {/* Semangat Reaction Button */}
          <button
            type="button"
            onClick={() => onToggleReaction(post.id, 'fire')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-m3-surface-container hover:bg-m3-tertiary-container hover:text-m3-on-tertiary-container text-xs font-bold text-m3-on-surface-variant transition-all cursor-pointer shadow-sm active:scale-95 border border-m3-outline-variant/20"
          >
            <Flame className="w-4 h-4 text-m3-tertiary" />
            <span>Semangat</span>
            {fireCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-m3-tertiary-container text-m3-on-tertiary-container text-[10px]">
                {fireCount}
              </span>
            )}
          </button>

          {/* Share/Copy link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-m3-surface-container hover:bg-m3-surface-variant text-m3-on-surface-variant hover:text-m3-on-surface transition-all text-xs font-medium cursor-pointer shadow-sm active:scale-95 border border-m3-outline-variant/20"
            title="Salin Link Diskusi"
          >
            {copiedLink ? (
              <Check className="w-4 h-4 text-m3-primary" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
            <span className="text-[11px] hidden sm:inline">{copiedLink ? 'Tersalin' : 'Bagikan'}</span>
          </button>
        </div>

        {/* Comment Count & Drawer Trigger */}
        <button
          type="button"
          onClick={() => setIsCommentsOpen(!isCommentsOpen)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-m3-on-surface-variant hover:text-m3-primary hover:bg-m3-surface-container py-2 px-3 rounded-full transition-all cursor-pointer active:scale-95"
        >
          <MessageSquare className="w-4 h-4 text-m3-primary" />
          <span>{totalComments} Komentar</span>
          {totalComments > 0 && (
            isCommentsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Collapsible Comments Section */}
      {isCommentsOpen && (
        <div className="space-y-4 pt-4 border-t border-m3-outline-variant/30 animate-in fade-in">
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
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAllComments(!showAllComments)}
                className="text-xs font-bold text-m3-primary hover:text-m3-primary/80 flex items-center gap-1.5 py-1.5 px-4 rounded-full bg-m3-primary-container/50 hover:bg-m3-primary-container transition-colors cursor-pointer active:scale-95"
              >
                {showAllComments ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    <span>Ciutkan Komentar (Tampilkan 2 Teratas)</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    <span>Lihat Semua {totalComments} Komentar</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Inline Comment Composer */}
          <div className="space-y-3 pt-3">
            {replyTarget && (
              <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-m3-secondary-container text-xs text-m3-on-secondary-container animate-in fade-in">
                <span className="flex items-center gap-2 font-medium">
                  <CornerDownRight className="w-4 h-4" />
                  Membalas komentar{' '}
                  <strong className="font-bold">
                    {replyTarget.authorName === user?.name ? 'Anda sendiri' : `@${replyTarget.authorName}`}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => setReplyTarget(null)}
                  className="p-1 hover:bg-m3-secondary/20 rounded-full text-m3-on-secondary-container transition-colors cursor-pointer"
                  title="Batal membalas"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[0.8rem] bg-m3-surface-variant text-m3-on-surface-variant font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
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
                className="flex-1 bg-m3-surface-container-highest border border-m3-outline-variant/30 rounded-full px-5 py-3 text-xs sm:text-sm text-m3-on-surface placeholder-m3-on-surface-variant focus:outline-none focus:border-m3-primary focus:bg-m3-surface shadow-sm transition-all"
              />
              <button
                type="button"
                onClick={handleSubmitComment}
                disabled={!commentInput.trim() || isAddingComment}
                className="px-5 py-3 bg-m3-primary hover:bg-m3-primary/90 text-m3-on-primary font-bold text-xs rounded-full shadow-m3-elevation-1 hover:shadow-m3-elevation-2 transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5 active:scale-95 shrink-0"
                title="Kirim Komentar"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Kirim</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
