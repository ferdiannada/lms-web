import React, { useState } from 'react';
import {
  CornerDownRight,
  Pencil,
  Trash2,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';
import { ForumComment, User } from '../../../types';

export interface CommentTreeNode {
  comment: ForumComment;
  replies: ForumComment[];
}

export function buildCommentTree(flatComments?: ForumComment[]): CommentTreeNode[] {
  if (!flatComments || flatComments.length === 0) return [];
  const rootNodes: CommentTreeNode[] = [];
  const commentMap = new Map<string, CommentTreeNode>();

  flatComments.forEach((c) => {
    commentMap.set(c.id, { comment: c, replies: [] });
  });

  flatComments.forEach((c) => {
    const node = commentMap.get(c.id)!;
    if (c.parent_id && commentMap.has(c.parent_id)) {
      commentMap.get(c.parent_id)!.replies.push(c);
    } else {
      rootNodes.push(node);
    }
  });

  return rootNodes;
}

interface ForumCommentTreeProps {
  postId: string;
  comments: ForumComment[];
  user: User | null;
  isTeacher: boolean;
  showAll?: boolean;
  onSetReply: (postId: string, comment: ForumComment | null) => void;
  onSaveEditComment: (postId: string, commentId: string, text: string) => Promise<void>;
  onDeleteComment: (postId: string, commentId: string) => Promise<void>;
}

export const ForumCommentTree: React.FC<ForumCommentTreeProps> = ({
  postId,
  comments,
  user,
  isTeacher,
  showAll = true,
  onSetReply,
  onSaveEditComment,
  onDeleteComment,
}) => {
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [isSavingComment, setIsSavingComment] = useState(false);
  const [collapsedThreads, setCollapsedThreads] = useState<Record<string, boolean>>({});
  const [expandedTextIds, setExpandedTextIds] = useState<Record<string, boolean>>({});

  const allCommentNodes = buildCommentTree(comments);
  if (allCommentNodes.length === 0) return null;

  // Truncate visible root comments unless showAll is true
  const displayedNodes = showAll ? allCommentNodes : allCommentNodes.slice(0, 2);

  const toggleThread = (commentId: string) => {
    setCollapsedThreads((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const toggleExpandText = (id: string) => {
    setExpandedTextIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleStartEdit = (comment: ForumComment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditCommentText('');
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editCommentText.trim() || isSavingComment) return;
    setIsSavingComment(true);
    try {
      await onSaveEditComment(postId, commentId, editCommentText.trim());
      setEditingCommentId(null);
      setEditCommentText('');
    } finally {
      setIsSavingComment(false);
    }
  };

  return (
    <div className="space-y-3">
      {displayedNodes.map((node) => {
        const comment = node.comment;
        const isCommentAuthor = user?.id === comment.user_id;
        const canManageComment = isCommentAuthor || isTeacher;
        const isEditingThisComment = editingCommentId === comment.id;
        const hasReplies = node.replies.length > 0;
        const isCollapsed = !!collapsedThreads[comment.id];
        const isTextExpanded = !!expandedTextIds[comment.id];
        const isCommentLong = comment.content.length > 180 || comment.content.split('\n').length > 3;
        const isTeacherRole = comment.user_role === 'guru' || comment.user_role === 'admin';

        return (
          <div key={comment.id} className="space-y-2.5">
            {/* Root Comment Bubble */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 hover:bg-slate-50 border border-slate-200/90 shadow-2xs space-y-2 group transition-all">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-xl font-bold flex items-center justify-center text-[11px] shrink-0 text-white ${
                      isTeacherRole
                        ? 'bg-gradient-to-tr from-emerald-600 to-teal-600'
                        : 'bg-gradient-to-tr from-[#1e1b4b] to-indigo-600'
                    }`}
                  >
                    {comment.user_name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`truncate font-bold ${
                        isCommentAuthor ? 'text-indigo-900 font-extrabold' : 'text-slate-900'
                      }`}
                    >
                      {isCommentAuthor ? 'Anda' : comment.user_name}
                    </span>
                    <span
                      className={`text-[9px] px-2 py-0.2 rounded-full font-semibold uppercase flex items-center gap-0.5 ${
                        isTeacherRole
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}
                    >
                      {isTeacherRole ? (
                        <>
                          <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" /> Guru
                        </>
                      ) : (
                        <>
                          <GraduationCap className="w-2.5 h-2.5 text-indigo-600" /> Siswa
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-slate-400">
                    {new Date(comment.created_at).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  {!isEditingThisComment && (
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => onSetReply(postId, comment)}
                        title="Balas Komentar"
                        className="px-2 py-1 rounded-lg text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 font-semibold transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                      >
                        <CornerDownRight className="w-3.5 h-3.5" />
                        <span>Balas</span>
                      </button>

                      {isCommentAuthor && (
                        <button
                          type="button"
                          onClick={() => handleStartEdit(comment)}
                          title="Edit Komentar"
                          className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canManageComment && (
                        <button
                          type="button"
                          onClick={() => onDeleteComment(postId, comment.id)}
                          title="Hapus Komentar"
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {isEditingThisComment ? (
                <div className="space-y-2 pt-1">
                  <textarea
                    value={editCommentText}
                    onChange={(e) => setEditCommentText(e.target.value)}
                    rows={2}
                    className="w-full bg-white border border-indigo-400 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none shadow-2xs"
                    placeholder="Tulis editan komentar..."
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(comment.id)}
                      disabled={isSavingComment || !editCommentText.trim()}
                      className="px-3 py-1 rounded-lg text-[11px] font-bold bg-[#1e1b4b] hover:bg-slate-900 text-white shadow transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
                    >
                      <Check className="w-3 h-3" /> {isSavingComment ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <p
                    className={`text-xs text-slate-700 leading-relaxed whitespace-pre-wrap ${
                      !isTextExpanded && isCommentLong ? 'line-clamp-2' : ''
                    }`}
                  >
                    {comment.content}
                  </p>
                  {isCommentLong && (
                    <button
                      type="button"
                      onClick={() => toggleExpandText(comment.id)}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                    >
                      {isTextExpanded ? 'Sembunyikan' : 'Baca Selengkapnya'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Nested Replies Section with Connector Bar */}
            {hasReplies && (
              <div className="ml-3 sm:ml-6 space-y-2">
                <button
                  type="button"
                  onClick={() => toggleThread(comment.id)}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors py-1 px-2.5 rounded-xl hover:bg-indigo-50 cursor-pointer"
                >
                  {isCollapsed ? (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      Lihat {node.replies.length} Balasan Diskusi
                    </>
                  ) : (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      Sembunyikan Balasan ({node.replies.length})
                    </>
                  )}
                </button>

                {!isCollapsed && (
                  <div className="space-y-2 border-l-2 border-indigo-200/80 pl-3 sm:pl-4">
                    {node.replies.map((reply) => {
                      const isReplyAuthor = user?.id === reply.user_id;
                      const canManageReply = isReplyAuthor || isTeacher;
                      const isEditingThisReply = editingCommentId === reply.id;
                      const isReplyExpanded = !!expandedTextIds[reply.id];
                      const isReplyLong = reply.content.length > 150 || reply.content.split('\n').length > 3;
                      const isReplyTeacher = reply.user_role === 'guru' || reply.user_role === 'admin';

                      return (
                        <div
                          key={reply.id}
                          className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5 group hover:border-slate-300 transition-all"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`w-6 h-6 rounded-lg font-bold flex items-center justify-center text-[10px] shrink-0 text-white ${
                                  isReplyTeacher
                                    ? 'bg-gradient-to-tr from-emerald-600 to-teal-600'
                                    : 'bg-gradient-to-tr from-[#1e1b4b] to-indigo-600'
                                }`}
                              >
                                {reply.user_name.charAt(0).toUpperCase()}
                              </div>

                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={`truncate font-bold ${
                                    isReplyAuthor ? 'text-indigo-900 font-extrabold' : 'text-slate-900'
                                  }`}
                                >
                                  {isReplyAuthor ? 'Anda' : reply.user_name}
                                </span>
                                <span
                                  className={`text-[8px] px-1.5 py-0.2 rounded-full font-semibold uppercase ${
                                    isReplyTeacher
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                  }`}
                                >
                                  {reply.user_role}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] text-slate-400">
                                {new Date(reply.created_at).toLocaleTimeString('id-ID', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>

                              {!isEditingThisReply && (
                                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={() => onSetReply(postId, reply)}
                                    title="Balas Komentar Ini"
                                    className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                                  >
                                    <CornerDownRight className="w-3.5 h-3.5" />
                                  </button>

                                  {isReplyAuthor && (
                                    <button
                                      type="button"
                                      onClick={() => handleStartEdit(reply)}
                                      title="Edit Balasan"
                                      className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  {canManageReply && (
                                    <button
                                      type="button"
                                      onClick={() => onDeleteComment(postId, reply.id)}
                                      title="Hapus Balasan"
                                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {isEditingThisReply ? (
                            <div className="space-y-2 pt-1">
                              <textarea
                                value={editCommentText}
                                onChange={(e) => setEditCommentText(e.target.value)}
                                rows={2}
                                className="w-full bg-white border border-indigo-400 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none shadow-2xs"
                                placeholder="Tulis editan balasan..."
                              />
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={handleCancelEdit}
                                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <X className="w-3 h-3" /> Batal
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(reply.id)}
                                  disabled={isSavingComment || !editCommentText.trim()}
                                  className="px-3 py-1 rounded-lg text-[11px] font-bold bg-[#1e1b4b] hover:bg-slate-900 text-white shadow transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
                                >
                                  <Check className="w-3 h-3" /> {isSavingComment ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <p
                                className={`text-xs text-slate-700 leading-relaxed whitespace-pre-wrap ${
                                  !isReplyExpanded && isReplyLong ? 'line-clamp-2' : ''
                                }`}
                              >
                                {reply.content}
                              </p>
                              {isReplyLong && (
                                <button
                                  type="button"
                                  onClick={() => toggleExpandText(reply.id)}
                                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                                >
                                  {isReplyExpanded ? 'Sembunyikan' : 'Baca Selengkapnya'}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
