import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ClassRoom, Material, Assignment, Quiz, ForumPost, ClassMember, Submission } from '../types';
import {
  MessageSquare,
  BookOpen,
  FileText,
  HelpCircle,
  Users,
  Plus,
  Send,
  Upload,
  Download,
  CheckCircle,
  Clock,
  ThumbsUp,
  Flame,
  Award,
  Pin,
  ExternalLink,
  Trash2,
  CheckCircle2,
  FileCheck,
  Calendar
} from 'lucide-react';
import { Modal } from '../components/Modal';

export const ClassDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [classDetail, setClassDetail] = useState<ClassRoom | null>(null);
  const [activeTab, setActiveTab] = useState<'forum' | 'materi' | 'tugas' | 'kuis' | 'anggota'>('forum');
  const [isLoading, setIsLoading] = useState(true);

  // Tab Data States
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [members, setMembers] = useState<ClassMember[]>([]);

  // Forum Composer State
  const [newPostContent, setNewPostContent] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [isPosting, setIsPosting] = useState(false);

  // Modals
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmissionsListOpen, setIsSubmissionsListOpen] = useState(false);
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);

  const [selectedAsg, setSelectedAsg] = useState<Assignment | null>(null);
  const [currentSubmissions, setCurrentSubmissions] = useState<Submission[]>([]);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);

  // Form Inputs for Material Modal
  const [matTitle, setMatTitle] = useState('');
  const [matDesc, setMatDesc] = useState('');
  const [matFile, setMatFile] = useState<File | null>(null);
  const [isUploadingMat, setIsUploadingMat] = useState(false);

  // Form Inputs for Assignment Modal
  const [asgTitle, setAsgTitle] = useState('');
  const [asgInstructions, setAsgInstructions] = useState('');
  const [asgDueDate, setAsgDueDate] = useState('');
  const [asgMaxScore, setAsgMaxScore] = useState(100);
  const [asgFile, setAsgFile] = useState<File | null>(null);
  const [isUploadingAsg, setIsUploadingAsg] = useState(false);

  // Form Inputs for Submission Modal
  const [subNotes, setSubNotes] = useState('');
  const [subFile, setSubFile] = useState<File | null>(null);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  // Form Inputs for Grading Modal
  const [gradeScore, setGradeScore] = useState<number>(100);
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [isSavingGrade, setIsSavingGrade] = useState(false);

  // Form Inputs for Quiz Creation Modal
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDesc, setQuizDesc] = useState('');
  const [quizDuration, setQuizDuration] = useState(30);
  const [quizQuestions, setQuizQuestions] = useState([
    {
      question_text: '',
      points: 20,
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_option: 'A',
    },
  ]);
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    loadClassDetail();
    loadTabData();
  }, [id, activeTab]);

  const loadClassDetail = async () => {
    if (!id) return;
    try {
      const cls = await api.getClassDetail(id);
      setClassDetail(cls);
    } catch (err) {
      console.error('Failed to load class detail:', err);
    }
  };

  const loadTabData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      if (activeTab === 'forum') {
        const data = await api.getForumPosts(id);
        setPosts(data);
      } else if (activeTab === 'materi') {
        const data = await api.getMaterials(id);
        setMaterials(data);
      } else if (activeTab === 'tugas') {
        const data = await api.getAssignments(id);
        setAssignments(data);
      } else if (activeTab === 'kuis') {
        const data = await api.getQuizzes(id);
        setQuizzes(data);
      } else if (activeTab === 'anggota') {
        const data = await api.getClassMembers(id);
        setMembers(data);
      }
    } catch (err) {
      console.error('Failed to load tab data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !id || isPosting) return;
    setIsPosting(true);
    try {
      await api.createForumPost(id, newPostContent.trim());
      setNewPostContent('');
      await loadTabData();
    } catch (err: any) {
      alert(err.message || 'Gagal mengirim postingan forum');
    } finally {
      setIsPosting(false);
    }
  };

  const handleAddComment = async (postId: string, parentId?: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;
    try {
      await api.addComment(postId, text.trim(), parentId);
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
      await loadTabData();
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan komentar');
    }
  };

  const handleToggleReaction = async (postId: string, emoji: string) => {
    if (!id) return;
    try {
      await api.toggleReaction('post', postId, emoji, id);
      await loadTabData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsUploadingMat(true);
    setErrorMsg(null);
    try {
      let fileUrl = '';
      if (matFile) {
        const uploadRes = await api.uploadFile(matFile);
        fileUrl = uploadRes.file_url;
      }
      await api.createMaterial(id, {
        title: matTitle,
        description: matDesc,
        type: fileUrl ? 'pdf' : 'manual',
        file_url: fileUrl,
      });
      setIsMaterialModalOpen(false);
      setMatTitle('');
      setMatDesc('');
      setMatFile(null);
      await loadTabData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menambahkan materi');
    } finally {
      setIsUploadingMat(false);
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm('Yakin ingin menghapus materi ini?')) return;
    try {
      await api.deleteMaterial(materialId);
      await loadTabData();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus materi');
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsUploadingAsg(true);
    setErrorMsg(null);
    try {
      let fileUrl = '';
      if (asgFile) {
        const uploadRes = await api.uploadFile(asgFile);
        fileUrl = uploadRes.file_url;
      }
      await api.createAssignment(id, {
        title: asgTitle,
        instructions: asgInstructions,
        file_url: fileUrl,
        due_date: asgDueDate ? new Date(asgDueDate).toISOString() : new Date(Date.now() + 86400000 * 7).toISOString(),
        max_score: Number(asgMaxScore) || 100,
      });
      setIsAssignmentModalOpen(false);
      setAsgTitle('');
      setAsgInstructions('');
      setAsgDueDate('');
      setAsgFile(null);
      await loadTabData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal membuat tugas');
    } finally {
      setIsUploadingAsg(false);
    }
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsg) return;
    setIsSubmittingTask(true);
    setErrorMsg(null);
    try {
      let fileUrl = '';
      if (subFile) {
        const uploadRes = await api.uploadFile(subFile);
        fileUrl = uploadRes.file_url;
      }
      await api.submitAssignment(selectedAsg.id, {
        answer_text: subNotes,
        file_url: fileUrl,
      });
      setIsSubmitModalOpen(false);
      setSubNotes('');
      setSubFile(null);
      await loadTabData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengumpulkan tugas');
    } finally {
      setIsSubmittingTask(false);
    }
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
    setGradeScore(sub.score ?? 100);
    setGradeFeedback(sub.feedback || '');
    setIsGradingModalOpen(true);
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub || !selectedAsg) return;
    setIsSavingGrade(true);
    try {
      await api.gradeSubmission(selectedSub.id, Number(gradeScore), gradeFeedback);
      setIsGradingModalOpen(false);
      const updatedSubs = await api.getSubmissions(selectedAsg.id);
      setCurrentSubmissions(updatedSubs);
      await loadTabData();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan nilai');
    } finally {
      setIsSavingGrade(false);
    }
  };

  const handleAddQuestionField = () => {
    setQuizQuestions((prev) => [
      ...prev,
      {
        question_text: '',
        points: 20,
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 'A',
      },
    ]);
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsCreatingQuiz(true);
    setErrorMsg(null);
    try {
      await api.createQuiz(id, {
        title: quizTitle,
        description: quizDesc,
        duration_minutes: Number(quizDuration) || 30,
        questions: quizQuestions,
      });
      setIsQuizModalOpen(false);
      setQuizTitle('');
      setQuizDesc('');
      setQuizQuestions([
        {
          question_text: '',
          points: 20,
          option_a: '',
          option_b: '',
          option_c: '',
          option_d: '',
          correct_option: 'A',
        },
      ]);
      await loadTabData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal membuat kuis');
    } finally {
      setIsCreatingQuiz(false);
    }
  };

  if (!classDetail) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p>Memuat detail kelas...</p>
      </div>
    );
  }

  const isTeacher = user?.role === 'guru' || user?.role === 'admin';

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Banner */}
      <div className={`p-8 rounded-3xl bg-gradient-to-r ${classDetail.banner_color || 'from-indigo-600 to-violet-800'} text-white shadow-2xl space-y-3 relative overflow-hidden`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-wider bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
            {classDetail.rombel} • Kode: {classDetail.code}
          </span>
          <span className="text-xs font-semibold text-indigo-200">
            Pengajar: {classDetail.teacher_name}
          </span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight">{classDetail.name}</h1>
        <p className="text-indigo-100 text-sm max-w-2xl">{classDetail.description || 'Ruang kelas pembelajaran interaktif SMK Al-Azhar.'}</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('forum')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'forum' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Forum Diskusi
        </button>

        <button
          onClick={() => setActiveTab('materi')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'materi' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Modul & Materi ({materials.length})
        </button>

        <button
          onClick={() => setActiveTab('tugas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'tugas' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" /> Tugas & Evaluasi ({assignments.length})
        </button>

        <button
          onClick={() => setActiveTab('kuis')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'kuis' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <HelpCircle className="w-4 h-4" /> Ujian & Kuis ({quizzes.length})
        </button>

        <button
          onClick={() => setActiveTab('anggota')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'anggota' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Users className="w-4 h-4" /> Anggota Kelas ({members.length})
        </button>
      </div>

      {/* TAB 1: FORUM DISKUSI */}
      {activeTab === 'forum' && (
        <div className="space-y-6">
          {/* Post Composer */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
            <form onSubmit={handleCreatePost} className="space-y-3">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Tulis pengumuman, pertanyaan, atau bagikan informasi ke forum kelas..."
                rows={3}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newPostContent.trim() || isPosting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isPosting ? 'Mengirim...' : 'Kirim Postingan'}
                </button>
              </div>
            </form>
          </div>

          {/* Posts List */}
          {posts.length === 0 ? (
            <div className="glass-panel p-8 text-center text-slate-400 rounded-3xl border border-slate-800">
              Belum ada kiriman diskusi di ruang kelas ini. Jadilah yang pertama mengirim pesan!
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                  {/* Post Author Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center border border-indigo-500/30">
                        {post.user_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-100">{post.user_name}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            post.user_role === 'guru' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}>
                            {post.user_role}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {new Date(post.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>
                    </div>

                    {post.is_pinned && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                        <Pin className="w-3 h-3" /> Disematkan
                      </span>
                    )}
                  </div>

                  {/* Post Content */}
                  <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                  {/* Reactions & Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => handleToggleReaction(post.id, 'like')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 border border-slate-800 transition-colors cursor-pointer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Suka</span>
                    </button>
                    <button
                      onClick={() => handleToggleReaction(post.id, 'fire')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 border border-slate-800 transition-colors cursor-pointer"
                    >
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>Semangat</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  <div className="space-y-3 pt-3 border-t border-slate-800/60">
                    {post.comments && post.comments.map((comment) => (
                      <div key={comment.id} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/60 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-200">{comment.user_name}</span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(comment.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{comment.content}</p>
                      </div>
                    ))}

                    {/* Add Comment Field */}
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddComment(post.id);
                        }}
                        placeholder="Balas diskusi..."
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MATERI & MODUL */}
      {activeTab === 'materi' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              Bahan Ajar & Modul Pembelajaran
            </h2>
            {isTeacher && (
              <button
                onClick={() => {
                  setErrorMsg(null);
                  setIsMaterialModalOpen(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Unggah Modul Baru
              </button>
            )}
          </div>

          {materials.length === 0 ? (
            <div className="glass-panel p-8 text-center text-slate-400 rounded-3xl border border-slate-800">
              Belum ada materi pembelajaran yang diunggah untuk kelas ini.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {materials.map((mat) => (
                <div key={mat.id} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                        {mat.type === 'pdf' ? 'Dokumen PDF' : 'Materi Interaktif'}
                      </span>
                      {isTeacher && (
                        <button
                          onClick={() => handleDeleteMaterial(mat.id)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white">{mat.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-3">{mat.description || 'Tidak ada catatan tambahan.'}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      {new Date(mat.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>

                    {mat.file_url && (
                      <a
                        href={mat.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white font-bold text-xs transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> Buka Modul
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TUGAS & PENUGASAN */}
      {activeTab === 'tugas' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              Daftar Tugas & Evaluasi Siswa
            </h2>
            {isTeacher && (
              <button
                onClick={() => {
                  setErrorMsg(null);
                  setIsAssignmentModalOpen(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Buat Tugas Baru
              </button>
            )}
          </div>

          {assignments.length === 0 ? (
            <div className="glass-panel p-8 text-center text-slate-400 rounded-3xl border border-slate-800">
              Belum ada tugas yang diberikan di kelas ini.
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.map((asg) => (
                <div key={asg.id} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{asg.title}</h3>
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          Maks {asg.max_score} Poin
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 whitespace-pre-wrap">{asg.instructions || asg.description}</p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>Tenggat: {new Date(asg.due_date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                  </div>

                  {/* Actions for Teacher / Student */}
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    {asg.file_url ? (
                      <a
                        href={asg.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                      >
                        <Download className="w-3.5 h-3.5" /> Lampiran Soal
                      </a>
                    ) : <div></div>}

                    <div className="flex items-center gap-3">
                      {isTeacher ? (
                        <button
                          onClick={() => handleOpenSubmissionsList(asg)}
                          className="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <FileCheck className="w-4 h-4" /> Periksa Jawaban ({asg.submission_count || 0})
                        </button>
                      ) : (
                        <div>
                          {asg.is_submitted ? (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                                <CheckCircle2 className="w-4 h-4" /> Sudah Dikumpulkan
                              </span>
                              {asg.score != null && (
                                <span className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-300 bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-500/30">
                                  Nilai: {asg.score} / {asg.max_score}
                                </span>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedAsg(asg);
                                setErrorMsg(null);
                                setIsSubmitModalOpen(true);
                              }}
                              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-colors cursor-pointer"
                            >
                              <Upload className="w-3.5 h-3.5" /> Kumpulkan Tugas
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: KUIS & UJIAN */}
      {activeTab === 'kuis' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-400" />
              Kuis Interaktif & Ujian Semester
            </h2>
            {isTeacher && (
              <button
                onClick={() => {
                  setErrorMsg(null);
                  setIsQuizModalOpen(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Buat Kuis Baru
              </button>
            )}
          </div>

          {quizzes.length === 0 ? (
            <div className="glass-panel p-8 text-center text-slate-400 rounded-3xl border border-slate-800">
              Belum ada ujian online yang dibuat di kelas ini.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quizzes.map((qz) => (
                <div key={qz.id} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                        Durasi: {qz.duration_minutes} Menit
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">{qz.questions_count || 0} Butir Soal</span>
                    </div>
                    <h3 className="text-base font-bold text-white">{qz.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{qz.description || 'Ujian evaluasi materi.'}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    {qz.is_completed ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4" /> Selesai (Nilai: {qz.score ?? '-'})
                      </span>
                    ) : (
                      <Link
                        to={`/quiz/${qz.id}`}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-colors"
                      >
                        {isTeacher ? 'Lihat Lembar Ujian' : 'Mulai Ujian Online'}
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: ANGGOTA KELAS */}
      {activeTab === 'anggota' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Daftar Guru & Siswa Terdaftar
          </h2>

          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/80 text-xs uppercase font-bold text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-4">Nama Lengkap</th>
                    <th className="p-4">Peran</th>
                    <th className="p-4">NISN / NIP</th>
                    <th className="p-4">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4 font-bold text-white flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-300 font-bold flex items-center justify-center text-xs">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{m.name}</span>
                      </td>
                      <td className="p-4">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          m.role === 'guru' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-indigo-500/20 text-indigo-300'
                        }`}>
                          {m.role === 'guru' ? 'Guru Pengajar' : 'Siswa'}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-mono text-slate-400">{m.nip_nik_nisn || m.nisn || '-'}</td>
                      <td className="p-4 text-xs text-slate-400">{m.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE MATERIAL */}
      <Modal isOpen={isMaterialModalOpen} onClose={() => setIsMaterialModalOpen(false)} title="Unggah Modul / Materi Baru">
        <form onSubmit={handleCreateMaterial} className="space-y-4">
          {errorMsg && <div className="p-3 bg-rose-500/10 text-rose-300 text-xs rounded-xl border border-rose-500/30">{errorMsg}</div>}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase">Judul Materi</label>
            <input
              type="text"
              value={matTitle}
              onChange={(e) => setMatTitle(e.target.value)}
              required
              placeholder="Contoh: Modul 1 - React Components & Hooks"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase">Deskripsi Ringkas</label>
            <textarea
              value={matDesc}
              onChange={(e) => setMatDesc(e.target.value)}
              rows={3}
              placeholder="Petunjuk membaca materi..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase">File Lampiran (PDF / Dokumen)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.zip,.png,.jpg"
              onChange={(e) => setMatFile(e.target.files?.[0] || null)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={isUploadingMat}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {isUploadingMat ? 'Mengunggah ke Storage...' : 'Simpan & Publikasikan Modul'}
          </button>
        </form>
      </Modal>

      {/* MODAL 2: CREATE ASSIGNMENT */}
      <Modal isOpen={isAssignmentModalOpen} onClose={() => setIsAssignmentModalOpen(false)} title="Buat Penugasan Baru">
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          {errorMsg && <div className="p-3 bg-rose-500/10 text-rose-300 text-xs rounded-xl border border-rose-500/30">{errorMsg}</div>}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase">Judul Tugas</label>
            <input
              type="text"
              value={asgTitle}
              onChange={(e) => setAsgTitle(e.target.value)}
              required
              placeholder="Contoh: Tugas 1 - Pembuatan Layout LMS Web"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase">Tenggat Waktu</label>
              <input
                type="datetime-local"
                value={asgDueDate}
                onChange={(e) => setAsgDueDate(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase">Skor Maksimal</label>
              <input
                type="number"
                value={asgMaxScore}
                onChange={(e) => setAsgMaxScore(Number(e.target.value))}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase">Instruksi Pengerjaan</label>
            <textarea
              value={asgInstructions}
              onChange={(e) => setAsgInstructions(e.target.value)}
              rows={4}
              placeholder="Kriteria penilaian dan format pengumpulan tugas..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase">File Soal / Template (Opsional)</label>
            <input
              type="file"
              onChange={(e) => setAsgFile(e.target.files?.[0] || null)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={isUploadingAsg}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {isUploadingAsg ? 'Memproses Penugasan...' : 'Terbitkan Tugas ke Siswa'}
          </button>
        </form>
      </Modal>

      {/* MODAL 3: SUBMIT ASSIGNMENT (STUDENT) */}
      <Modal isOpen={isSubmitModalOpen} onClose={() => setIsSubmitModalOpen(false)} title={`Kumpulkan Tugas: ${selectedAsg?.title}`}>
        <form onSubmit={handleSubmitAssignment} className="space-y-4">
          {errorMsg && <div className="p-3 bg-rose-500/10 text-rose-300 text-xs rounded-xl border border-rose-500/30">{errorMsg}</div>}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase">Catatan / Jawaban Teks Siswa</label>
            <textarea
              value={subNotes}
              onChange={(e) => setSubNotes(e.target.value)}
              rows={3}
              placeholder="Tuliskan link repository GitHub atau keterangan pengerjaan..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase">File Hasil Tugas (ZIP / PDF / Gambar)</label>
            <input
              type="file"
              onChange={(e) => setSubFile(e.target.files?.[0] || null)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmittingTask}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSubmittingTask ? 'Mengirim Jawaban...' : 'Kirim Tugas Sekarang'}
          </button>
        </form>
      </Modal>

      {/* MODAL 4: SUBMISSIONS LIST (TEACHER) */}
      <Modal isOpen={isSubmissionsListOpen} onClose={() => setIsSubmissionsListOpen(false)} title={`Daftar Jawaban Siswa: ${selectedAsg?.title}`}>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {currentSubmissions.length === 0 ? (
            <div className="p-6 text-center text-slate-400">Belum ada siswa yang mengumpulkan tugas ini.</div>
          ) : (
            <div className="space-y-3">
              {currentSubmissions.map((sub) => (
                <div key={sub.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{sub.student_name}</h4>
                      <span className="text-[11px] text-slate-500">
                        Diserahkan: {new Date(sub.submitted_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {sub.score != null ? (
                        <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
                          Nilai: {sub.score}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
                          Belum Dinilai
                        </span>
                      )}

                      <button
                        onClick={() => handleOpenGradingModal(sub)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
                      >
                        Beri Nilai
                      </button>
                    </div>
                  </div>

                  {sub.notes && <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl">{sub.notes}</p>}

                  {sub.file_url && (
                    <a
                      href={sub.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      <Download className="w-3.5 h-3.5" /> Unduh Berkas Siswa ({sub.file_name})
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* MODAL 5: GRADE SUBMISSION (TEACHER) */}
      <Modal isOpen={isGradingModalOpen} onClose={() => setIsGradingModalOpen(false)} title={`Penilaian: ${selectedSub?.student_name}`}>
        <form onSubmit={handleSaveGrade} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase">Nilai Angka (0 - {selectedAsg?.max_score || 100})</label>
            <input
              type="number"
              min="0"
              max={selectedAsg?.max_score || 100}
              value={gradeScore}
              onChange={(e) => setGradeScore(Number(e.target.value))}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase">Catatan / Umpan Balik Guru</label>
            <textarea
              value={gradeFeedback}
              onChange={(e) => setGradeFeedback(e.target.value)}
              rows={3}
              placeholder="Kerja bagus! Perhatikan kerapian kodingan..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSavingGrade}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSavingGrade ? 'Menyimpan...' : 'Simpan Nilai Siswa'}
          </button>
        </form>
      </Modal>

      {/* MODAL 6: CREATE QUIZ (TEACHER) */}
      <Modal isOpen={isQuizModalOpen} onClose={() => setIsQuizModalOpen(false)} title="Buat Ujian Online / Kuis Baru">
        <form onSubmit={handleCreateQuiz} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {errorMsg && <div className="p-3 bg-rose-500/10 text-rose-300 text-xs rounded-xl border border-rose-500/30">{errorMsg}</div>}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase">Judul Kuis / Ujian</label>
            <input
              type="text"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              required
              placeholder="Contoh: Ujian Tengah Semester Pemrograman Web"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase">Durasi (Menit)</label>
              <input
                type="number"
                min="5"
                value={quizDuration}
                onChange={(e) => setQuizDuration(Number(e.target.value))}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase">Deskripsi</label>
              <input
                type="text"
                value={quizDesc}
                onChange={(e) => setQuizDesc(e.target.value)}
                placeholder="Petunjuk umum ujian..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Questions Builder */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-indigo-400">Daftar Soal Pilihan Ganda</span>
              <button
                type="button"
                onClick={handleAddQuestionField}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
              >
                + Tambah Soal
              </button>
            </div>

            {quizQuestions.map((q, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-300">Nomor {idx + 1}</span>
                <input
                  type="text"
                  value={q.question_text}
                  onChange={(e) => {
                    const next = [...quizQuestions];
                    next[idx].question_text = e.target.value;
                    setQuizQuestions(next);
                  }}
                  required
                  placeholder={`Pertanyaan soal nomor ${idx + 1}...`}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:border-indigo-500"
                />

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={q.option_a}
                    onChange={(e) => {
                      const next = [...quizQuestions];
                      next[idx].option_a = e.target.value;
                      setQuizQuestions(next);
                    }}
                    required
                    placeholder="Pilihan A"
                    className="bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-100"
                  />
                  <input
                    type="text"
                    value={q.option_b}
                    onChange={(e) => {
                      const next = [...quizQuestions];
                      next[idx].option_b = e.target.value;
                      setQuizQuestions(next);
                    }}
                    required
                    placeholder="Pilihan B"
                    className="bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-100"
                  />
                  <input
                    type="text"
                    value={q.option_c}
                    onChange={(e) => {
                      const next = [...quizQuestions];
                      next[idx].option_c = e.target.value;
                      setQuizQuestions(next);
                    }}
                    required
                    placeholder="Pilihan C"
                    className="bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-100"
                  />
                  <input
                    type="text"
                    value={q.option_d}
                    onChange={(e) => {
                      const next = [...quizQuestions];
                      next[idx].option_d = e.target.value;
                      setQuizQuestions(next);
                    }}
                    required
                    placeholder="Pilihan D"
                    className="bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-100"
                  />
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-400 font-semibold">Kunci Jawaban Benar:</span>
                  {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                    <label key={opt} className="flex items-center gap-1 cursor-pointer text-slate-200">
                      <input
                        type="radio"
                        name={`correct_${idx}`}
                        value={opt}
                        checked={q.correct_option === opt}
                        onChange={() => {
                          const next = [...quizQuestions];
                          next[idx].correct_option = opt;
                          setQuizQuestions(next);
                        }}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={isCreatingQuiz}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {isCreatingQuiz ? 'Menerbitkan Ujian...' : 'Terbitkan Kuis ke Siswa'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
