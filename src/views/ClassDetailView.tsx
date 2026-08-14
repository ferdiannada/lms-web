import { useEffect, useState } from '@lynx-js/react';
import { classService } from '../services/classService';
import type {
  ClassModel,
  MaterialModel,
  AssignmentModel,
  QuizModel,
  ForumPost,
  ForumComment,
  User,
} from '../types';

interface ClassDetailViewProps {
  classId: string;
  user: User;
  onBack: () => void;
}

export function ClassDetailView({
  classId,
  user,
  onBack,
}: ClassDetailViewProps) {
  const [classDetail, setClassDetail] = useState<ClassModel | null>(null);
  const [activeTab, setActiveTab] = useState<
    'forum' | 'materi' | 'tugas' | 'kuis' | 'nilai'
  >('forum');

  // Data lists
  const [materials, setMaterials] = useState<MaterialModel[]>([]);
  const [assignments, setAssignments] = useState<AssignmentModel[]>([]);
  const [quizzes, setQuizzes] = useState<QuizModel[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [gradebook, setGradebook] = useState<any>(null);

  // Creation Modals for Teachers
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [showAddAssignmentModal, setShowAddAssignmentModal] = useState(false);
  const [showAddQuizModal, setShowAddQuizModal] = useState(false);

  // New Material State
  const [matTitle, setMatTitle] = useState('');
  const [matDesc, setMatDesc] = useState('');
  const [matFileUrl, setMatFileUrl] = useState('');

  // New Assignment State
  const [assTitle, setAssTitle] = useState('');
  const [assDesc, setAssDesc] = useState('');
  const [assDueDate, setAssDueDate] = useState('');

  // Student Assignment Submission Modal
  const [selectedAssForSubmit, setSelectedAssForSubmit] =
    useState<AssignmentModel | null>(null);
  const [subContent, setSubContent] = useState('');
  const [subFileUrl, setSubFileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Teacher Assignment Grading Modal
  const [selectedAssForGrading, setSelectedAssForGrading] =
    useState<AssignmentModel | null>(null);
  const [submissionsList, setSubmissionsList] = useState<any[]>([]);
  const [gradingScore, setGradingScore] = useState<number>(100);
  const [gradingFeedback, setGradingFeedback] = useState('');

  // Student Quiz Runner Modal State
  const [activeQuiz, setActiveQuiz] = useState<QuizModel | null>(null);
  const [quizAttemptId, setQuizAttemptId] = useState<string | null>(null);
  const [quizTimeRemaining, setQuizTimeRemaining] = useState<number>(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});

  // Forum Comments State
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<
    string | null
  >(null);
  const [commentsMap, setCommentsMap] = useState<
    Record<string, ForumComment[]>
  >({});
  const [commentInput, setCommentInput] = useState('');
  const [newPostContent, setNewPostContent] = useState('');

  const loadClassData = async () => {
    try {
      const cls = await classService.getClassDetail(classId);
      setClassDetail(cls);

      const [mats, ass, qz, pst] = await Promise.all([
        classService.getMaterials(classId).catch(() => []),
        classService.getAssignments(classId).catch(() => []),
        classService.getQuizzes(classId).catch(() => []),
        classService.getForumPosts(classId).catch(() => []),
      ]);

      setMaterials(mats);
      setAssignments(ass);
      setQuizzes(qz);
      setPosts(pst);

      if (user.role === 'guru' || user.role === 'admin') {
        const gb = await classService.getGradebook(classId).catch(() => null);
        setGradebook(gb);
      }
    } catch (err) {
      console.error('Failed to load class detail', err);
    }
  };

  useEffect(() => {
    loadClassData();
  }, [classId]);

  // Quiz Timer Countdown Effect
  useEffect(() => {
    if (!quizAttemptId || quizTimeRemaining <= 0) return;
    const timer = setInterval(() => {
      setQuizTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [quizAttemptId, quizTimeRemaining]);

  // Forum Actions
  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    try {
      const created = await classService.createForumPost(
        classId,
        newPostContent,
      );
      setPosts([created, ...posts]);
      setNewPostContent('');
    } catch (err: any) {
      alert(err.message || 'Gagal membuat postingan');
    }
  };

  const handlePinPost = async (postId: string) => {
    try {
      await classService.pinPost(postId);
      const updated = await classService.getForumPosts(classId);
      setPosts(updated);
    } catch (err: any) {
      alert(err.message || 'Gagal menyematkan postingan');
    }
  };

  const handleToggleReaction = async (postId: string, emoji: string) => {
    try {
      await classService.toggleReaction('post', postId, emoji);
      const updated = await classService.getForumPosts(classId);
      setPosts(updated);
    } catch {
      // Ignore
    }
  };

  const handleToggleComments = async (postId: string) => {
    if (expandedCommentsPostId === postId) {
      setExpandedCommentsPostId(null);
      return;
    }
    setExpandedCommentsPostId(postId);
    try {
      const cmts = await classService.getForumComments(postId);
      setCommentsMap((prev) => ({ ...prev, [postId]: cmts }));
    } catch {
      // Ignore
    }
  };

  const handleSendComment = async (postId: string) => {
    if (!commentInput.trim()) return;
    try {
      const created = await classService.createForumComment(
        postId,
        commentInput,
      );
      setCommentsMap((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), created],
      }));
      setCommentInput('');
    } catch (err: any) {
      alert(err.message || 'Gagal mengirim komentar');
    }
  };

  // Material Creation
  const handleCreateMaterial = async () => {
    if (!matTitle.trim()) return;
    try {
      await classService.createMaterial(classId, matTitle, matDesc, matFileUrl);
      setShowAddMaterialModal(false);
      setMatTitle('');
      setMatDesc('');
      setMatFileUrl('');
      const updated = await classService.getMaterials(classId);
      setMaterials(updated);
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan materi');
    }
  };

  // Assignment Actions
  const handleCreateAssignment = async () => {
    if (!assTitle.trim()) return;
    try {
      await classService.createAssignment(
        classId,
        assTitle,
        assDesc,
        assDueDate || '2026-12-31',
      );
      setShowAddAssignmentModal(false);
      setAssTitle('');
      setAssDesc('');
      setAssDueDate('');
      const updated = await classService.getAssignments(classId);
      setAssignments(updated);
    } catch (err: any) {
      alert(err.message || 'Gagal membuat tugas');
    }
  };

  const handleSubmitAssignment = async () => {
    if (!selectedAssForSubmit || !subContent.trim()) return;
    try {
      setSubmitting(true);
      await classService.submitAssignment(
        selectedAssForSubmit.id,
        subContent,
        subFileUrl,
      );
      alert('Tugas berhasil dikirim!');
      setSelectedAssForSubmit(null);
      setSubContent('');
      setSubFileUrl('');
    } catch (err: any) {
      alert(err.message || 'Gagal mengirim tugas');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenGradingModal = async (assignment: AssignmentModel) => {
    setSelectedAssForGrading(assignment);
    try {
      const subs = await classService.getSubmissions(assignment.id);
      setSubmissionsList(subs || []);
    } catch {
      setSubmissionsList([]);
    }
  };

  const handleSaveGrade = async (submissionId: string) => {
    try {
      await classService.gradeSubmission(
        submissionId,
        gradingScore,
        gradingFeedback,
      );
      alert('Nilai berhasil disimpan!');
      if (selectedAssForGrading) {
        const subs = await classService.getSubmissions(
          selectedAssForGrading.id,
        );
        setSubmissionsList(subs || []);
      }
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan nilai');
    }
  };

  // Quiz Runner Actions
  const handleStartQuiz = async (quiz: QuizModel) => {
    try {
      const attempt = await classService.startQuiz(quiz.id);
      setActiveQuiz(quiz);
      setQuizAttemptId(attempt.id || attempt.attempt_id || 'attempt-1');
      setQuizTimeRemaining((quiz.durationMinutes || 15) * 60);
      setQuizAnswers({});
    } catch (err: any) {
      alert(err.message || 'Gagal memulai kuis');
    }
  };

  const handleSelectQuizAnswer = async (qId: string, option: string) => {
    setQuizAnswers((prev) => ({ ...prev, [qId]: option }));
    if (quizAttemptId) {
      try {
        await classService.saveQuizAnswer(quizAttemptId, qId, option);
      } catch {
        // Ignore background auto-save failures
      }
    }
  };

  const handleFinishQuiz = async () => {
    if (!activeQuiz || !quizAttemptId) return;
    try {
      await classService.submitQuiz(activeQuiz.id, quizAttemptId);
      alert('Kuis berhasil dikirim! Nilai Anda telah tercatat.');
      setActiveQuiz(null);
      setQuizAttemptId(null);
    } catch (err: any) {
      alert(err.message || 'Gagal menyelesaikan kuis');
    }
  };

  return (
    <view className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <view className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <view className="flex items-center gap-4">
          <view
            className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-extrabold cursor-pointer hover:bg-slate-200 transition-colors shrink-0"
            bindtap={onBack}
          >
            <text>⬅</text>
          </view>
          <view className="space-y-1">
            <view className="flex items-center gap-2">
              <text className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                {classDetail?.name || 'Detail Kelas'}
              </text>
              {classDetail?.code && (
                <view className="bg-blue-50 text-blue-700 text-xs font-mono font-bold px-2.5 py-0.5 rounded-md border border-blue-200/80">
                  <text>Kode: {classDetail.code}</text>
                </view>
              )}
            </view>
            <text className="text-xs text-slate-500 font-medium">
              Pengajar: {classDetail?.teacherName || 'Guru'} • Rombel:{' '}
              {classDetail?.rombelName || 'Umum'}
            </text>
          </view>
        </view>

        {/* Tab Navigation */}
        <view className="flex items-center gap-1.5 overflow-x-auto bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
          <view
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-all whitespace-nowrap ${
              activeTab === 'forum'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            bindtap={() => setActiveTab('forum')}
          >
            <text>💬 Forum</text>
          </view>
          <view
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-all whitespace-nowrap ${
              activeTab === 'materi'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            bindtap={() => setActiveTab('materi')}
          >
            <text>📚 Materi ({materials.length})</text>
          </view>
          <view
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-all whitespace-nowrap ${
              activeTab === 'tugas'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            bindtap={() => setActiveTab('tugas')}
          >
            <text>📝 Tugas ({assignments.length})</text>
          </view>
          <view
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-all whitespace-nowrap ${
              activeTab === 'kuis'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            bindtap={() => setActiveTab('kuis')}
          >
            <text>⏱️ Kuis ({quizzes.length})</text>
          </view>
          {(user.role === 'guru' || user.role === 'admin') && (
            <view
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-all whitespace-nowrap ${
                activeTab === 'nilai'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              bindtap={() => setActiveTab('nilai')}
            >
              <text>📊 Buku Nilai</text>
            </view>
          )}
        </view>
      </view>

      {/* TAB 1: FORUM DISKUSI */}
      {activeTab === 'forum' && (
        <view className="space-y-4">
          {/* Post Composer */}
          <view className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
            <text className="text-sm font-extrabold text-slate-800 block">
              💬 Tulis Pengumuman atau Diskusi
            </text>
            <textarea
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all min-h-20"
              placeholder="Apa yang ingin Anda bagikan dengan kelas hari ini? (Gunakan @nama untuk mention)"
              bindinput={(e: any) => setNewPostContent(e.detail.value)}
              value={newPostContent}
            />
            <view className="flex justify-end">
              <view
                className="px-5 py-2 rounded-xl bg-blue-600 text-white font-extrabold text-xs cursor-pointer shadow-md shadow-blue-500/20 hover:bg-blue-700"
                bindtap={handleCreatePost}
              >
                <text>Kirim Post ➔</text>
              </view>
            </view>
          </view>

          {/* Forum Posts Feed */}
          {posts.length === 0 ? (
            <view className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-400">
              <text className="text-sm font-medium">
                Belum ada postingan diskusi di kelas ini.
              </text>
            </view>
          ) : (
            posts.map((post) => (
              <view
                key={post.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3 relative"
              >
                {post.isPinned && (
                  <view className="absolute top-4 right-4 bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-200">
                    <text>📌 Disematkan Guru</text>
                  </view>
                )}

                <view className="flex items-center justify-between">
                  <view className="flex items-center gap-3">
                    <view className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                      <text>{(post.authorName || 'U')[0]?.toUpperCase()}</text>
                    </view>
                    <view className="flex flex-col">
                      <text className="font-extrabold text-sm text-slate-900">
                        {post.authorName}
                      </text>
                      <text className="text-[10px] font-semibold text-slate-400">
                        {post.createdAt}
                      </text>
                    </view>
                  </view>

                  {user.role === 'guru' && !post.isPinned && (
                    <view
                      className="text-xs text-slate-400 hover:text-amber-600 font-bold cursor-pointer"
                      bindtap={() => handlePinPost(post.id)}
                    >
                      <text>📌 Sematkan</text>
                    </view>
                  )}
                </view>

                <text className="text-sm text-slate-700 leading-relaxed block">
                  {post.content}
                </text>

                {/* Reaction Bar */}
                <view className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  {['👍', '❤️', '🔥', '💡'].map((emoji) => (
                    <view
                      key={emoji}
                      className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
                      bindtap={() => handleToggleReaction(post.id, emoji)}
                    >
                      <text>{emoji}</text>
                    </view>
                  ))}

                  <view
                    className="ml-auto text-xs font-bold text-blue-600 cursor-pointer hover:underline"
                    bindtap={() => handleToggleComments(post.id)}
                  >
                    <text>
                      💬 Komentar ({commentsMap[post.id]?.length || 0})
                    </text>
                  </view>
                </view>

                {/* Comments Section */}
                {expandedCommentsPostId === post.id && (
                  <view className="pt-3 space-y-3 bg-slate-50 rounded-xl p-3 border border-slate-200/60">
                    <view className="space-y-2 max-h-60 overflow-y-auto">
                      {(commentsMap[post.id] || []).map((cmt) => (
                        <view
                          key={cmt.id}
                          className="bg-white p-2.5 rounded-lg border border-slate-200/70 space-y-1"
                        >
                          <view className="flex items-center justify-between">
                            <text className="font-bold text-xs text-slate-800">
                              {cmt.authorName}
                            </text>
                            <text className="text-[10px] text-slate-400">
                              {cmt.createdAt}
                            </text>
                          </view>
                          <text className="text-xs text-slate-600 block">
                            {cmt.content}
                          </text>
                        </view>
                      ))}
                    </view>

                    <view className="flex gap-2">
                      <input
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 outline-none"
                        placeholder="Tulis balasan..."
                        bindinput={(e: any) => setCommentInput(e.detail.value)}
                        value={commentInput}
                      />
                      <view
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs cursor-pointer shadow-xs"
                        bindtap={() => handleSendComment(post.id)}
                      >
                        <text>Kirim</text>
                      </view>
                    </view>
                  </view>
                )}
              </view>
            ))
          )}
        </view>
      )}

      {/* TAB 2: MATERI PELAJARAN */}
      {activeTab === 'materi' && (
        <view className="space-y-4">
          {user.role === 'guru' && (
            <view className="flex justify-end">
              <view
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-extrabold text-xs cursor-pointer shadow-md shadow-blue-500/20"
                bindtap={() => setShowAddMaterialModal(true)}
              >
                <text>➕ Tambah Materi</text>
              </view>
            </view>
          )}

          <view className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {materials.length === 0 ? (
              <view className="col-span-full bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-400">
                <text className="text-sm font-medium">
                  Belum ada materi pelajaran yang diunggah.
                </text>
              </view>
            ) : (
              materials.map((m) => (
                <view
                  key={m.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <view className="space-y-2">
                    <view className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base">
                      <text>📄</text>
                    </view>
                    <text className="font-extrabold text-base text-slate-900 block">
                      {m.title}
                    </text>
                    <text className="text-xs text-slate-500 block leading-relaxed">
                      {m.description}
                    </text>
                  </view>

                  {m.fileUrl && (
                    <view className="pt-2 border-t border-slate-100">
                      <a
                        href={m.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
                      >
                        <text>📥 Unduh File Lampiran</text>
                      </a>
                    </view>
                  )}
                </view>
              ))
            )}
          </view>
        </view>
      )}

      {/* TAB 3: TUGAS */}
      {activeTab === 'tugas' && (
        <view className="space-y-4">
          {user.role === 'guru' && (
            <view className="flex justify-end">
              <view
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-extrabold text-xs cursor-pointer shadow-md shadow-blue-500/20"
                bindtap={() => setShowAddAssignmentModal(true)}
              >
                <text>➕ Buat Tugas Baru</text>
              </view>
            </view>
          )}

          <view className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignments.length === 0 ? (
              <view className="col-span-full bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-400">
                <text className="text-sm font-medium">
                  Belum ada tugas di kelas ini.
                </text>
              </view>
            ) : (
              assignments.map((a) => (
                <view
                  key={a.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <view className="space-y-2">
                    <view className="flex items-center justify-between">
                      <view className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-base">
                        <text>📝</text>
                      </view>
                      <view className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200">
                        <text>Tenggat: {a.dueDate}</text>
                      </view>
                    </view>
                    <text className="font-extrabold text-base text-slate-900 block">
                      {a.title}
                    </text>
                    <text className="text-xs text-slate-500 block leading-relaxed">
                      {a.description}
                    </text>
                  </view>

                  <view className="pt-3 border-t border-slate-100 flex items-center justify-end">
                    {user.role === 'siswa' ? (
                      <view
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer shadow-xs hover:bg-blue-700"
                        bindtap={() => setSelectedAssForSubmit(a)}
                      >
                        <text>📤 Kirim Tugas</text>
                      </view>
                    ) : (
                      <view
                        className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer hover:bg-slate-200"
                        bindtap={() => handleOpenGradingModal(a)}
                      >
                        <text>📋 Periksa Hasil Siswa</text>
                      </view>
                    )}
                  </view>
                </view>
              ))
            )}
          </view>
        </view>
      )}

      {/* TAB 4: KUIS INTERAKTIF */}
      {activeTab === 'kuis' && (
        <view className="space-y-4">
          {user.role === 'guru' && (
            <view className="flex justify-end">
              <view
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-extrabold text-xs cursor-pointer shadow-md shadow-blue-500/20"
                bindtap={() => setShowAddQuizModal(true)}
              >
                <text>➕ Buat Kuis Baru</text>
              </view>
            </view>
          )}

          <view className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.length === 0 ? (
              <view className="col-span-full bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-400">
                <text className="text-sm font-medium">
                  Belum ada kuis interaktif yang tersedia.
                </text>
              </view>
            ) : (
              quizzes.map((q) => (
                <view
                  key={q.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <view className="space-y-2">
                    <view className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-base">
                      <text>⏱️</text>
                    </view>
                    <text className="font-extrabold text-base text-slate-900 block">
                      {q.title}
                    </text>
                    <text className="text-xs text-slate-500 block leading-relaxed">
                      {q.description}
                    </text>
                    <text className="text-xs font-semibold text-amber-700 block">
                      Durasi: {q.durationMinutes} Menit
                    </text>
                  </view>

                  <view className="pt-3 border-t border-slate-100 flex items-center justify-end">
                    {user.role === 'siswa' ? (
                      <view
                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs cursor-pointer shadow-xs hover:bg-emerald-700"
                        bindtap={() => handleStartQuiz(q)}
                      >
                        <text>▶️ Mulai Kuis</text>
                      </view>
                    ) : (
                      <view className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold">
                        <text>Hasil Evaluasi</text>
                      </view>
                    )}
                  </view>
                </view>
              ))
            )}
          </view>
        </view>
      )}

      {/* TAB 5: BUKU NILAI KELAS (Guru/Admin) */}
      {activeTab === 'nilai' &&
        (user.role === 'guru' || user.role === 'admin') && (
          <view className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <text className="text-base font-extrabold text-slate-900 block">
              📊 Buku Nilai Kelas
            </text>

            {!gradebook ||
            !gradebook.students ||
            gradebook.students.length === 0 ? (
              <view className="p-8 text-center text-slate-400">
                <text className="text-sm">
                  Belum ada data nilai terpublikasi di kelas ini.
                </text>
              </view>
            ) : (
              <view className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase font-bold bg-slate-50">
                      <th className="p-3">Nama Siswa</th>
                      <th className="p-3">NISN</th>
                      <th className="p-3 text-center">Tugas Selesai</th>
                      <th className="p-3 text-center">Rata-rata Nilai</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {gradebook.students.map((st: any) => (
                      <tr key={st.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-800">
                          {st.name}
                        </td>
                        <td className="p-3 text-slate-500">{st.nisn || '-'}</td>
                        <td className="p-3 text-center">
                          {st.completedCount || 0}
                        </td>
                        <td className="p-3 text-center font-extrabold text-emerald-600">
                          {st.avgScore || 0} / 100
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </view>
            )}
          </view>
        )}

      {/* STUDENT SUBMIT ASSIGNMENT MODAL */}
      {selectedAssForSubmit && (
        <view className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <view className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <view className="flex items-center justify-between">
              <text className="text-lg font-extrabold text-slate-900">
                📤 Kirim Tugas: {selectedAssForSubmit.title}
              </text>
              <view
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold cursor-pointer hover:bg-slate-200"
                bindtap={() => setSelectedAssForSubmit(null)}
              >
                <text>✕</text>
              </view>
            </view>

            <view className="space-y-1.5">
              <text className="text-xs font-bold text-slate-700">
                Teks Jawaban / Laporan
              </text>
              <textarea
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 outline-none focus:border-blue-500 min-h-28"
                placeholder="Tuliskan lembar jawaban atau penjelasan tugas Anda..."
                bindinput={(e: any) => setSubContent(e.detail.value)}
                value={subContent}
              />
            </view>

            <view className="space-y-1.5">
              <text className="text-xs font-bold text-slate-700">
                Link File Lampiran (Optional)
              </text>
              <input
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500"
                type="text"
                placeholder="https://drive.google.com/file/d/..."
                bindinput={(e: any) => setSubFileUrl(e.detail.value)}
                value={subFileUrl}
              />
            </view>

            <view className="flex items-center justify-end gap-3 pt-2">
              <view
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs cursor-pointer hover:bg-slate-100"
                bindtap={() => setSelectedAssForSubmit(null)}
              >
                <text>Batal</text>
              </view>
              <view
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-extrabold text-xs cursor-pointer shadow-md shadow-blue-500/20 hover:bg-blue-700"
                bindtap={handleSubmitAssignment}
              >
                <text>
                  {submitting ? 'Sending...' : 'Kirim Tugas Sekarang'}
                </text>
              </view>
            </view>
          </view>
        </view>
      )}

      {/* TEACHER ASSIGNMENT GRADING MODAL */}
      {selectedAssForGrading && (
        <view className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <view className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <view className="flex items-center justify-between border-b border-slate-100 pb-3">
              <text className="text-lg font-extrabold text-slate-900">
                📋 Penilaian Tugas: {selectedAssForGrading.title}
              </text>
              <view
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold cursor-pointer hover:bg-slate-200"
                bindtap={() => setSelectedAssForGrading(null)}
              >
                <text>✕</text>
              </view>
            </view>

            {submissionsList.length === 0 ? (
              <view className="p-8 text-center text-slate-400">
                <text className="text-xs font-semibold">
                  Belum ada siswa yang mengumpulkan tugas ini.
                </text>
              </view>
            ) : (
              <view className="space-y-4">
                {submissionsList.map((sub: any) => (
                  <view
                    key={sub.id}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3"
                  >
                    <view className="flex items-center justify-between">
                      <text className="font-extrabold text-sm text-slate-900">
                        {sub.studentName || 'Siswa'}
                      </text>
                      <text className="text-[10px] text-slate-400 font-semibold">
                        {sub.createdAt}
                      </text>
                    </view>
                    <text className="text-xs text-slate-700 leading-relaxed block bg-white p-3 rounded-lg border border-slate-200/60">
                      {sub.content}
                    </text>

                    <view className="flex flex-col md:flex-row md:items-center gap-2 pt-1">
                      <input
                        className="w-24 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-bold"
                        type="number"
                        placeholder="Score 0-100"
                        bindinput={(e: any) =>
                          setGradingScore(Number(e.detail.value))
                        }
                      />
                      <input
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                        type="text"
                        placeholder="Catatan / Feedback Guru..."
                        bindinput={(e: any) =>
                          setGradingFeedback(e.detail.value)
                        }
                      />
                      <view
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs cursor-pointer shadow-xs hover:bg-emerald-700"
                        bindtap={() => handleSaveGrade(sub.id)}
                      >
                        <text>Simpan Nilai</text>
                      </view>
                    </view>
                  </view>
                ))}
              </view>
            )}
          </view>
        </view>
      )}

      {/* QUIZ RUNNER INTERFACE (STUDENT) */}
      {activeQuiz && (
        <view className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <view className="bg-white rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <view className="flex items-center justify-between border-b border-slate-200 pb-4">
              <view>
                <text className="text-lg font-extrabold text-slate-900 block">
                  {activeQuiz.title}
                </text>
                <text className="text-xs text-slate-500">
                  Pengerjaan Kuis Interaktif Real-time
                </text>
              </view>
              <view className="bg-amber-100 text-amber-800 border border-amber-300 px-4 py-2 rounded-2xl text-xs font-mono font-extrabold">
                <text>
                  ⏱️ Sisa Waktu: {Math.floor(quizTimeRemaining / 60)}:
                  {String(quizTimeRemaining % 60).padStart(2, '0')}
                </text>
              </view>
            </view>

            {/* Quiz Question Mock / Runner */}
            <view className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <text className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
                Soal #1 (Pilihan Ganda)
              </text>
              <text className="text-sm font-bold text-slate-800 block">
                Manakah berikut ini yang merupakan keunggulan utama dari
                arsitektur framework Lynx JS pada pengembang aplikasi
                cross-platform?
              </text>

              <view className="space-y-2 pt-2">
                {[
                  'A. Dual-thread architecture (Main Thread & Background Thread) untuk performa rendering tinggi.',
                  'B. Penggunaan DOM browser standar secara langsung tanpa kompilasi.',
                  'C. Keharusan menulis ulang seluruh kode UI secara spesifik per sistem operasi.',
                  'D. Kompatibilitas terbatas hanya untuk sistem operasi desktop.',
                ].map((opt, idx) => (
                  <view
                    key={idx}
                    className={`p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      quizAnswers['q1'] === opt
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                    }`}
                    bindtap={() => handleSelectQuizAnswer('q1', opt)}
                  >
                    <text>{opt}</text>
                  </view>
                ))}
              </view>
            </view>

            <view className="flex items-center justify-between pt-2">
              <view className="text-xs font-bold text-slate-500">
                <text>
                  Terjawab: {Object.keys(quizAnswers).length} / 1 Soal
                </text>
              </view>

              <view
                className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-extrabold text-xs cursor-pointer shadow-lg shadow-emerald-500/20 hover:bg-emerald-700"
                bindtap={handleFinishQuiz}
              >
                <text>🏁 Selesaikan Kuis</text>
              </view>
            </view>
          </view>
        </view>
      )}

      {/* CREATE MATERIAL MODAL */}
      {showAddMaterialModal && (
        <view className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <view className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-4">
            <view className="flex items-center justify-between">
              <text className="text-lg font-extrabold text-slate-900">
                ➕ Tambah Materi Pelajaran
              </text>
              <view
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold cursor-pointer hover:bg-slate-200"
                bindtap={() => setShowAddMaterialModal(false)}
              >
                <text>✕</text>
              </view>
            </view>

            <view className="space-y-1.5">
              <text className="text-xs font-bold text-slate-700">
                Judul Materi
              </text>
              <input
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500 font-bold"
                type="text"
                placeholder="Judul Materi..."
                bindinput={(e: any) => setMatTitle(e.detail.value)}
              />
            </view>

            <view className="space-y-1.5">
              <text className="text-xs font-bold text-slate-700">
                Deskripsi / Rangkuman
              </text>
              <textarea
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:border-blue-500 min-h-20"
                placeholder="Penjelasan ringkas materi..."
                bindinput={(e: any) => setMatDesc(e.detail.value)}
              />
            </view>

            <view className="space-y-1.5">
              <text className="text-xs font-bold text-slate-700">
                Link File Materi (Optional)
              </text>
              <input
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500"
                type="text"
                placeholder="https://..."
                bindinput={(e: any) => setMatFileUrl(e.detail.value)}
              />
            </view>

            <view className="flex items-center justify-end gap-3 pt-2">
              <view
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs cursor-pointer hover:bg-slate-100"
                bindtap={() => setShowAddMaterialModal(false)}
              >
                <text>Batal</text>
              </view>
              <view
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-extrabold text-xs cursor-pointer shadow-md shadow-blue-500/20 hover:bg-blue-700"
                bindtap={handleCreateMaterial}
              >
                <text>Simpan Materi</text>
              </view>
            </view>
          </view>
        </view>
      )}

      {/* CREATE ASSIGNMENT MODAL */}
      {showAddAssignmentModal && (
        <view className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <view className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-4">
            <view className="flex items-center justify-between">
              <text className="text-lg font-extrabold text-slate-900">
                ➕ Buat Tugas Baru
              </text>
              <view
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold cursor-pointer hover:bg-slate-200"
                bindtap={() => setShowAddAssignmentModal(false)}
              >
                <text>✕</text>
              </view>
            </view>

            <view className="space-y-1.5">
              <text className="text-xs font-bold text-slate-700">
                Judul Tugas
              </text>
              <input
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500 font-bold"
                type="text"
                placeholder="Judul Tugas..."
                bindinput={(e: any) => setAssTitle(e.detail.value)}
              />
            </view>

            <view className="space-y-1.5">
              <text className="text-xs font-bold text-slate-700">
                Instruksi Tugas
              </text>
              <textarea
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:border-blue-500 min-h-20"
                placeholder="Petunjuk pengerjaan..."
                bindinput={(e: any) => setAssDesc(e.detail.value)}
              />
            </view>

            <view className="space-y-1.5">
              <text className="text-xs font-bold text-slate-700">
                Tanggal Tenggat (YYYY-MM-DD)
              </text>
              <input
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500 font-mono"
                type="text"
                placeholder="2026-12-31"
                bindinput={(e: any) => setAssDueDate(e.detail.value)}
              />
            </view>

            <view className="flex items-center justify-end gap-3 pt-2">
              <view
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs cursor-pointer hover:bg-slate-100"
                bindtap={() => setShowAddAssignmentModal(false)}
              >
                <text>Batal</text>
              </view>
              <view
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-extrabold text-xs cursor-pointer shadow-md shadow-blue-500/20 hover:bg-blue-700"
                bindtap={handleCreateAssignment}
              >
                <text>Buat Tugas</text>
              </view>
            </view>
          </view>
        </view>
      )}
    </view>
  );
}
