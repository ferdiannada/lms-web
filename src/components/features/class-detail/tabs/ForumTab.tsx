import React from 'react';
import { ForumPost, ForumComment, User } from '../../../../types';
import { ForumPostComposer } from '../../forum/ForumPostComposer';
import { ForumPostCard } from '../../forum/ForumPostCard';

interface ForumTabProps {
  posts: ForumPost[];
  user: User | null;
  isTeacher: boolean;
  onCreatePost: (content: string) => Promise<void>;
  onSaveEditPost: (postId: string, text: string) => Promise<void>;
  onDeletePost: (postId: string) => Promise<void>;
  onToggleReaction: (postId: string, type: 'like' | 'fire') => Promise<void>;
  onAddComment: (postId: string, content: string, parentId?: string) => Promise<void>;
  onSaveEditComment: (postId: string, commentId: string, text: string) => Promise<void>;
  onDeleteComment: (postId: string, commentId: string) => Promise<void>;
}

export const ForumTab: React.FC<ForumTabProps> = ({
  posts,
  user,
  isTeacher,
  onCreatePost,
  onSaveEditPost,
  onDeletePost,
  onToggleReaction,
  onAddComment,
  onSaveEditComment,
  onDeleteComment,
}) => {
  return (
    <div className="space-y-6">
      <ForumPostComposer onSubmit={onCreatePost} />

      {posts.length === 0 ? (
        <div className="bg-white p-8 text-center text-slate-500 rounded-3xl border border-slate-200 shadow-xs">
          Belum ada kiriman diskusi di ruang kelas ini. Jadilah yang pertama mengirim pesan!
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <ForumPostCard
              key={post.id}
              post={post}
              user={user}
              isTeacher={isTeacher}
              onSaveEditPost={onSaveEditPost}
              onDeletePost={onDeletePost}
              onToggleReaction={onToggleReaction}
              onAddComment={onAddComment}
              onSaveEditComment={onSaveEditComment}
              onDeleteComment={onDeleteComment}
            />
          ))}
        </div>
      )}
    </div>
  );
};
