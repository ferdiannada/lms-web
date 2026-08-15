import React, { useState } from 'react';
import {
  CornerDownRight,
  Pencil,
  Trash2,
  X,
  Check,
  ChevronDown,
  ChevronUp,
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
  onSetReply: (postId: string, comment: ForumComment | null) => void;
  onSaveEditComment: (postId: string, commentId: string, text: string) => Promise<void>;
  onDeleteComment: (postId: string, commentId: string) => Promise<void>;
}

export const ForumCommentTree: React.FC<ForumCommentTreeProps> = ({
  postId,
  comments,
  user,
  isTeacher,
  onSetReply,
  onSaveEditComment,
  onDeleteComment,
}) => {
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [isSavingComment, setIsSavingComment] = useState(false);
  const [collapsedThreads, setCollapsedThreads] = useState<Record<string, boolean>>({});

  const commentNodes = buildCommentTree(comments);
  if (commentNodes.length === 0) return null;

  const toggleThread = (commentId: string) => {
    setCollapsedThreads((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
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
      {commentNodes.map((node) => {
        const comment = node.comment;
        const isCommentAuthor = user?.id === comment.user_id;
        const canManageComment = isCommentAuthor || isTeacher;
        const isEditingThisComment = editingCommentId === comment.id;
        const hasReplies = node.replies.length > 0;
        const isCollapsed = !!collapsedThreads[comment.id];

        return (
          <div key={comment.id} className="space-y-2">
            {/* Root Comment Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 group">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{comment.user_name}</span>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                      comment.user_role === 'guru'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}
                  >
                    {comment.user_role}
                  </span>
                </div>

                <div className="flex items-center gap-2">
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
                        className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                      >
                        <CornerDownRight className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Balas</span>
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
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>
              )}
            </div>

            {/* Replies Section */}
            {hasReplies && (
              <div className="ml-3 sm:ml-6 space-y-2">
                <button
                  type="button"
                  onClick={() => toggleThread(comment.id)}
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors py-0.5 px-2 rounded-lg hover:bg-indigo-50 cursor-pointer"
                >
                  {isCollapsed ? (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      Lihat {node.replies.length} Balasan
                    </>
                  ) : (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      Sembunyikan Balasan ({node.replies.length})
                    </>
                  )}
                </button>

                {!isCollapsed && (
                  <div className="space-y-2 border-l-2 border-indigo-200 pl-3 sm:pl-4">
                    {node.replies.map((reply) => {
                      const isReplyAuthor = user?.id === reply.user_id;
                      const canManageReply = isReplyAuthor || isTeacher;
                      const isEditingThisReply = editingCommentId === reply.id;

                      return (
                        <div
                          key={reply.id}
                          className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5 group"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{reply.user_name}</span>
                              <span
                                className={`text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                                  reply.user_role === 'guru'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                }`}
                              >
                                {reply.user_role}
                              </span>
                              <span className="text-[10px] text-indigo-600 font-medium hidden sm:flex items-center gap-0.5">
                                <CornerDownRight className="w-2.5 h-2.5" /> membalas
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
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
                            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                              {reply.content}
                            </p>
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
