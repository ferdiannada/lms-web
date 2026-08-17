import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services';
import {
  ClassRoom,
  ForumPost,
  ForumComment,
  Material,
  Assignment,
  Quiz,
  ClassMember,
  Submission,
} from '../types';
import { useClassWebSocket } from '../hooks/useClassWebSocket';
import { ClassHeroBanner } from '../components/features/class-detail/ClassHeroBanner';
import { ClassTabsNav, ClassTabType } from '../components/features/class-detail/ClassTabsNav';
import { ForumTab } from '../components/features/class-detail/tabs/ForumTab';
import { MaterialsTab } from '../components/features/class-detail/tabs/MaterialsTab';
import { AssignmentsTab } from '../components/features/class-detail/tabs/AssignmentsTab';
import { QuizzesTab } from '../components/features/class-detail/tabs/QuizzesTab';
import { MembersTab } from '../components/features/class-detail/tabs/MembersTab';
import { MaterialUploadModal } from '../components/features/materials/MaterialUploadModal';
import { AssignmentCreateModal } from '../components/features/assignments/AssignmentCreateModal';
import { AssignmentSubmitModal } from '../components/features/assignments/AssignmentSubmitModal';
import { SubmissionsListModal } from '../components/features/assignments/SubmissionsListModal';
import { GradingModal } from '../components/features/assignments/GradingModal';
import { QuizCreateModal } from '../components/features/quizzes/QuizCreateModal';
import { DeleteClassModal } from '../components/features/classes/DeleteClassModal';
import { X } from 'lucide-react';

export const ClassDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isTeacher = user?.role === 'guru' || user?.role === 'admin';

  const [classDetail, setClassDetail] = useState<ClassRoom | null>(null);
  const [activeTab, setActiveTab] = useState<ClassTabType>('forum');
  const [isLoading, setIsLoading] = useState(true);

  // Tab Data States
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [members, setMembers] = useState<ClassMember[]>([]);

  // Modals
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmissionsListOpen, setIsSubmissionsListOpen] = useState(false);
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedAsg, setSelectedAsg] = useState<Assignment | null>(null);
  const [currentSubmissions, setCurrentSubmissions] = useState<Submission[]>([]);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);

  // WebSocket Live Updates & Toasts
  const { toasts, dismissToast } = useClassWebSocket({
    classId: id,
    user,
    setPosts,
  });

  const loadTabData = useCallback(
    async (signal?: AbortSignal) => {
      if (!id) return;
      try {
        const [postsData, matsData, asgsData, quizData, memsData] = await Promise.all([
          api.getForumPosts(id, { signal }),
          api.getMaterials(id, { signal }),
          api.getAssignments(id, { signal }),
          api.getQuizzes(id, { signal }),
          api.getClassMembers(id, { signal }),
        ]);

        if (signal?.aborted) return;
        setPosts(postsData);
        setMaterials(matsData);
        setAssignments(asgsData);
        setQuizzes(quizData);
        setMembers(memsData);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Failed to load class tab data:', err);
        }
      }
    },
    [id]
  );

  const loadClassDetail = useCallback(async () => {
    if (!id) return;
    try {
      const cls = await api.getClassDetail(id);
      setClassDetail(cls);
    } catch {
      navigate('/classes');
    }
  }, [id, navigate]);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);

    Promise.all([loadClassDetail(), loadTabData(controller.signal)]).finally(() => {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    });

    return () => {
      controller.abort();
    };
  }, [loadClassDetail, loadTabData]);

  // Forum Actions
  const handleCreatePost = async (content: string) => {
    if (!id) return;
    const newPost = await api.createForumPost(id, content);
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
    if (!id) return;
    const emoji = type === 'like' ? '👍' : '🔥';
    await api.toggleReaction('post', postId, emoji, id);
    await loadTabData();
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

  // Material Actions
  const handleDeleteMaterial = async (matId: string) => {
    if (!confirm('Yakin ingin menghapus materi ini?')) return;
    await api.deleteMaterial(matId);
    setMaterials((prev) => prev.filter((m) => m.id !== matId));
  };

  // Assignment Actions
  const handleDeleteAssignment = async (asgId: string) => {
    if (!confirm('Yakin ingin menghapus tugas ini?')) return;
    await api.deleteAssignment(asgId);
    setAssignments((prev) => prev.filter((a) => a.id !== asgId));
  };

  const handleOpenSubmissionsList = async (asg: Assignment) => {
    setSelectedAsg(asg);
    try {
      const subs = await api.getSubmissions(asg.id);
      setCurrentSubmissions(subs);
      setIsSubmissionsListOpen(true);
    } catch (err: any) {
      alert(err.message || 'Gagal memuat jawaban siswa');
    }
  };

  const handleOpenGradingModal = (sub: Submission) => {
    setSelectedSub(sub);
    setIsGradingModalOpen(true);
  };

  // Quiz Actions
  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Yakin ingin menghapus kuis ini?')) return;
    await api.deleteQuiz(quizId);
    setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
  };

  const handleConfirmDeleteClass = async (classId: string) => {
    await api.deleteClass(classId);
    navigate('/classes');
  };

  if (isLoading || !classDetail) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-3 animate-in fade-in">
        <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold">Memuat ruang kelas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in relative pb-12">
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

      {/* Header Banner */}
      <ClassHeroBanner
        classDetail={classDetail}
        isTeacher={isTeacher}
        onDeleteClick={() => setIsDeleteModalOpen(true)}
      />

      {/* Navigation Tabs */}
      <ClassTabsNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={{
          materials: materials.length,
          assignments: assignments.length,
          quizzes: quizzes.length,
          members: members.length,
        }}
      />

      {/* Tab Contents */}
      <div key={activeTab} className="animate-m3-enter">
        {activeTab === 'forum' && (
          <ForumTab
            posts={posts}
            user={user}
            isTeacher={isTeacher}
            onCreatePost={handleCreatePost}
            onSaveEditPost={handleSaveEditPost}
            onDeletePost={handleDeletePost}
            onToggleReaction={handleToggleReaction}
            onAddComment={handleAddComment}
            onSaveEditComment={handleSaveEditComment}
            onDeleteComment={handleDeleteComment}
          />
        )}

        {activeTab === 'materi' && (
          <MaterialsTab
            materials={materials}
            isTeacher={isTeacher}
            onOpenUploadModal={() => setIsMaterialModalOpen(true)}
            onDeleteMaterial={handleDeleteMaterial}
          />
        )}

        {activeTab === 'tugas' && (
          <AssignmentsTab
            assignments={assignments}
            isTeacher={isTeacher}
            onOpenCreateModal={() => setIsAssignmentModalOpen(true)}
            onOpenSubmitModal={(asg) => {
              setSelectedAsg(asg);
              setIsSubmitModalOpen(true);
            }}
            onOpenSubmissionsList={handleOpenSubmissionsList}
            onDeleteAssignment={handleDeleteAssignment}
          />
        )}

        {activeTab === 'kuis' && (
          <QuizzesTab
            quizzes={quizzes}
            isTeacher={isTeacher}
            onOpenCreateModal={() => setIsQuizModalOpen(true)}
            onDeleteQuiz={handleDeleteQuiz}
          />
        )}

        {activeTab === 'anggota' && <MembersTab members={members} />}
      </div>

      {/* Shared Modals */}
      <MaterialUploadModal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        defaultClassId={id}
        onSuccess={(newMat) => {
          setMaterials((prev) => [newMat, ...prev]);
        }}
      />

      <AssignmentCreateModal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        defaultClassId={id}
        onSuccess={(newAsg) => {
          setAssignments((prev) => [newAsg, ...prev]);
        }}
      />

      <AssignmentSubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        assignment={selectedAsg}
        onSuccess={(sub) => {
          setAssignments((prev) =>
            prev.map((a) =>
              a.id === selectedAsg?.id ? { ...a, is_submitted: true, submission: sub } : a
            )
          );
        }}
      />

      <SubmissionsListModal
        isOpen={isSubmissionsListOpen}
        onClose={() => setIsSubmissionsListOpen(false)}
        assignment={selectedAsg}
        submissions={currentSubmissions}
        onOpenGrading={handleOpenGradingModal}
      />

      <GradingModal
        isOpen={isGradingModalOpen}
        onClose={() => setIsGradingModalOpen(false)}
        submission={selectedSub}
        maxScore={selectedAsg?.max_score || 100}
        onSuccess={(subId, score, feedback) => {
          setCurrentSubmissions((prev) =>
            prev.map((s) => (s.id === subId ? { ...s, score, feedback, status: 'graded' } : s))
          );
          setAssignments((prev) =>
            prev.map((a) => {
              if (a.id === selectedAsg?.id && a.submission?.id === subId) {
                return {
                  ...a,
                  score,
                  submission: { ...a.submission, score, feedback, status: 'graded' },
                };
              }
              return a;
            })
          );
        }}
      />

      <QuizCreateModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        defaultClassId={id}
        onSuccess={(newQuiz) => {
          setQuizzes((prev) => [newQuiz, ...prev]);
        }}
      />

      <DeleteClassModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        classDetail={classDetail}
        onConfirmDelete={handleConfirmDeleteClass}
      />
    </div>
  );
};
