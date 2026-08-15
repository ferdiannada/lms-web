import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { ForumPost, User } from '../../../../types';
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
  const [showAllPosts, setShowAllPosts] = useState(false);
  const POST_LIMIT = 5;

  const displayedPosts = showAllPosts || posts.length <= POST_LIMIT
    ? posts
    : posts.slice(0, POST_LIMIT);

  return (
    <div className="space-y-6">
      <ForumPostComposer onSubmit={onCreatePost} />

      {posts.length === 0 ? (
        <div className="bg-white p-8 text-center text-slate-500 rounded-3xl border border-slate-200 shadow-xs">
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
              onSaveEditPost={onSaveEditPost}
              onDeletePost={onDeletePost}
              onToggleReaction={onToggleReaction}
              onAddComment={onAddComment}
              onSaveEditComment={onSaveEditComment}
              onDeleteComment={onDeleteComment}
            />
          ))}

          {/* Toggle Show All Posts Button */}
          {posts.length > POST_LIMIT && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setShowAllPosts(!showAllPosts)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 shadow-xs transition-all cursor-pointer hover:border-indigo-200"
              >
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                {showAllPosts ? (
                  <>
                    <span>Tampilkan Lebih Ringkas (5 Teratas)</span>
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  </>
                ) : (
                  <>
                    <span>Lihat Semua Diskusi Kelas ({posts.length} Postingan)</span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
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
