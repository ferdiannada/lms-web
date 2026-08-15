import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, getToken, getWsUrl, normalizeForumPost, normalizeForumComment } from '../services/api';
import { ClassRoom, Material, Assignment, Quiz, ForumPost, ForumComment, ClassMember, Submission } from '../types';
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
  Calendar,
  Pencil,
  Check,
  X,
  CornerDownRight,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Reply
} from 'lucide-react';
import { Modal } from '../components/Modal';

interface CommentTreeNode {
  comment: ForumComment;
  replies: ForumComment[];
}

interface InAppNotificationToast {
  id: string;
  title: string;
  body: string;
  userName: string;
  userRole: string;
  avatarUrl?: string;
  timestamp: string;
  postId: string;
}

function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // A5
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {}
}

function buildCommentTree(flatComments?: ForumComment[]): CommentTreeNode[] {
  if (!flatComments || flatComments.length === 0) return [];
  const rootNodes: CommentTreeNode[] = [];
  const commentMap = new Map<string, CommentTreeNode>();

  // 1. Create nodes for all comments
  flatComments.forEach((c) => {
    commentMap.set(c.id, { comment: c, replies: [] });
  });

  // 2. Link replies to their parent (or root if parent not in list)
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

export const ClassDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isTeacher = user?.role === 'guru' || user?.role === 'admin';

  const [classDetail, setClassDetail] = useState<ClassRoom | null>(null);
  const [activeTab, setActiveTab] = useState<'forum' | 'materi' | 'tugas' | 'kuis' | 'anggota'>('forum');
  const [isLoading, setIsLoading] = useState(true);

  // Tab Data States
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [members, setMembers] = useState<ClassMember[]>([]);

  // Forum Composer, Reply & Edit State
  const [newPostContent, setNewPostContent] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [replyTo, setReplyTo] = useState<Record<string, { commentId: string; authorName: string } | null>>({});
  const [collapsedThreads, setCollapsedThreads] = useState<Record<string, boolean>>({});
  const [isPosting, setIsPosting] = useState(false);

  // Real-time Notification Toasts
  const [toasts, setToasts] = useState<InAppNotificationToast[]>([]);

  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [isSavingComment, setIsSavingComment] = useState(false);

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editPostText, setEditPostText] = useState('');
  const [isSavingPost, setIsSavingPost] = useState(false);

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

    const controller = new AbortController();
    loadTabData(controller.signal);

    return () => {
      controller.abort();
    };
  }, [id, activeTab]);

  // Real-time WebSocket connection for Forum
  useEffect(() => {
    if (!id) return;
    const token = getToken();
    if (!token) return;

    const wsUrl = getWsUrl(`/classes/${id}/forum/ws`);
    let ws: WebSocket | null = null;
    let reconnectTimer: any = null;
    let isUnmounted = false;

    const connectWS = () => {
      if (isUnmounted) return;
      try {
        ws = new WebSocket(wsUrl, ['pedia-token', token]);

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const eventType = data.type;
            const payload = data.data;

            if (eventType === 'post') {
              const newPost = normalizeForumPost(payload);
              setPosts((prev) => {
                if (prev.some((p) => p.id === newPost.id)) return prev;
                return [newPost, ...prev];
              });
            } else if (eventType === 'post_updated') {
              const updatedPost = normalizeForumPost(payload);
              setPosts((prev) =>
                prev.map((p) => (p.id === updatedPost.id ? { ...p, ...updatedPost, comments: p.comments } : p))
              );
            } else if (eventType === 'post_deleted') {
              const deletedId = typeof payload === 'string' ? payload : payload?.id;
              if (deletedId) {
                setPosts((prev) => prev.filter((p) => p.id !== deletedId));
              }
            } else if (eventType === 'comment') {
              const newComment = normalizeForumComment(payload);
              setPosts((prev) =>
                prev.map((post) => {
                  if (post.id !== newComment.post_id) return post;
                  const existingComments = post.comments || [];
                  if (existingComments.some((c) => c.id === newComment.id)) return post;
                  return {
                    ...post,
                    comments_count: (post.comments_count || 0) + 1,
                    comments: [...existingComments, newComment],
                  };
                })
              );

              // Trigger interactive notification toast if comment is from another user
              if (newComment.user_id && newComment.user_id !== user?.id) {
                playNotificationChime();
                const toastItem: InAppNotificationToast = {
                  id: `toast-${Date.now()}-${Math.random()}`,
                  title: newComment.parent_id
                    ? `${newComment.user_name} membalas komentar`
                    : `${newComment.user_name} mengirim komentar baru`,
                  body: newComment.content,
                  userName: newComment.user_name,
                  userRole: newComment.user_role,
                  avatarUrl: newComment.user_avatar,
                  timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                  postId: newComment.post_id,
                };

                setToasts((prev) => [toastItem, ...prev.slice(0, 3)]);

                // Auto dismiss after 6s
                setTimeout(() => {
                  setToasts((prev) => prev.filter((t) => t.id !== toastItem.id));
                }, 6000);

                // Browser notification if tab is inactive
                if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
                  try {
                    new Notification(`💬 ${toastItem.title}`, {
                      body: toastItem.body,
                      icon: '/logo_smk_new.png',
                    });
                  } catch {}
                }
              }
            } else if (eventType === 'comment_updated') {
              const updatedComment = normalizeForumComment(payload);
              setPosts((prev) =>
                prev.map((post) => {
                  if (post.id !== updatedComment.post_id) return post;
                  return {
                    ...post,
                    comments: (post.comments || []).map((c) =>
                      c.id === updatedComment.id ? updatedComment : c
                    ),
                  };
                })
              );
            } else if (eventType === 'comment_deleted') {
              const commentId = payload?.id;
              const postId = payload?.post_id;
              if (commentId) {
                setPosts((prev) =>
                  prev.map((post) => {
                    if (postId && post.id !== postId) return post;
                    const filtered = (post.comments || []).filter((c) => c.id !== commentId);
                    return {
                      ...post,
                      comments_count: Math.max(0, (post.comments_count || 1) - 1),
                      comments: filtered,
                    };
                  })
                );
              }
            }
          } catch (e) {
            console.error('Error handling WebSocket message:', e);
          }
        };

        ws.onerror = () => {
          ws?.close();
        };

        ws.onclose = () => {
          if (!isUnmounted) {
            reconnectTimer = setTimeout(connectWS, 3000);
          }
        };
      } catch (err) {
        if (!isUnmounted) {
          reconnectTimer = setTimeout(connectWS, 5000);
        }
      }
    };

    connectWS();

    return () => {
      isUnmounted = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) ws.close();
    };
  }, [id]);

  const loadClassDetail = async () => {
    if (!id) return;
    try {
      const cls = await api.getClassDetail(id);
      setClassDetail(cls);
    } catch (err) {
      console.error('Failed to load class detail:', err);
    }
  };

  const loadTabData = async (signal?: AbortSignal) => {
    if (!id) return;
    setIsLoading(true);
    try {
      if (activeTab === 'forum') {
        const data = await api.getForumPosts(id, { signal });
        setPosts(data);
      } else if (activeTab === 'materi') {
        const data = await api.getMaterials(id, { signal });
        setMaterials(data);
      } else if (activeTab === 'tugas') {
        const data = await api.getAssignments(id, { signal });
        setAssignments(data);
      } else if (activeTab === 'kuis') {
        const data = await api.getQuizzes(id, { signal });
        setQuizzes(data);
      } else if (activeTab === 'anggota') {
        const data = await api.getClassMembers(id, { signal });
        setMembers(data);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Failed to load tab data:', err);
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
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

  const handleAddComment = async (postId: string, explicitParentId?: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;
    const parentId = explicitParentId || replyTo[postId]?.commentId;
    try {
      await api.addComment(postId, text.trim(), parentId);
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
      setReplyTo((prev) => ({ ...prev, [postId]: null }));
      await loadTabData();
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan komentar');
    }
  };

  const handleSetReply = (postId: string, comment: ForumComment | null) => {
    if (!comment) {
      setReplyTo((prev) => ({ ...prev, [postId]: null }));
    } else {
      setReplyTo((prev) => ({
        ...prev,
        [postId]: { commentId: comment.id, authorName: comment.user_name },
      }));
    }
  };

  const toggleThread = (commentId: string) => {
    setCollapsedThreads((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleStartEditComment = (comment: ForumComment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.content);
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditCommentText('');
  };

  const handleSaveEditComment = async (postId: string, commentId: string) => {
    if (!editCommentText.trim() || isSavingComment) return;
    setIsSavingComment(true);
    try {
      await api.updateComment(postId, commentId, editCommentText.trim());
      setEditingCommentId(null);
      setEditCommentText('');
      await loadTabData();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah komentar');
    } finally {
      setIsSavingComment(false);
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!confirm('Yakin ingin menghapus komentar ini?')) return;
    try {
      await api.deleteComment(postId, commentId);
      await loadTabData();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus komentar');
    }
  };

  const handleStartEditPost = (post: ForumPost) => {
    setEditingPostId(post.id);
    setEditPostText(post.content);
  };

  const handleCancelEditPost = () => {
    setEditingPostId(null);
    setEditPostText('');
  };

  const handleSaveEditPost = async (postId: string) => {
    if (!editPostText.trim() || isSavingPost) return;
    setIsSavingPost(true);
    try {
      await api.updateForumPost(postId, editPostText.trim());
      setEditingPostId(null);
      setEditPostText('');
      await loadTabData();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah postingan forum');
    } finally {
      setIsSavingPost(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Yakin ingin menghapus postingan forum ini beserta seluruh diskusinya?')) return;
    try {
      await api.deleteForumPost(postId);
      await loadTabData();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus postingan forum');
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
      <div className="p-12 text-center text-slate-500">
        <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p>Memuat detail kelas...</p>
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
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                    toast.userRole === 'guru' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  }`}>
                    {toast.userRole}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">{toast.timestamp}</span>
              </div>
              <p className="text-[11px] font-semibold text-indigo-700 mt-0.5">{toast.title}</p>
              <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed whitespace-pre-wrap">{toast.body}</p>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100 shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Header Banner */}
      <div className="p-8 lg:p-9 rounded-[2rem] bg-gradient-to-r from-[#6b46c1] via-[#5b21b6] to-[#1e1b4b] text-white shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center justify-between relative z-10">
          <span className="text-xs font-mono font-black uppercase tracking-widest bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/25">
            {classDetail.rombel} • Kode: {classDetail.code}
          </span>
          <span className="text-xs font-bold text-indigo-100 bg-white/10 px-3 py-1 rounded-full border border-white/15">
            Pengajar: {classDetail.teacher_name}
          </span>
        </div>

        <div className="space-y-1.5 relative z-10">
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight">{classDetail.name}</h1>
          <p className="text-indigo-100/90 text-sm max-w-2xl leading-relaxed">{classDetail.description || 'Ruang kelas pembelajaran interaktif SMK Al-Azhar.'}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('forum')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shrink-0 ${
            activeTab === 'forum' ? 'bg-[#1e1b4b] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Forum Diskusi
        </button>

        <button
          onClick={() => setActiveTab('materi')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shrink-0 ${
            activeTab === 'materi' ? 'bg-[#1e1b4b] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Modul & Materi ({materials.length})
        </button>

        <button
          onClick={() => setActiveTab('tugas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shrink-0 ${
            activeTab === 'tugas' ? 'bg-[#1e1b4b] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" /> Tugas & Evaluasi ({assignments.length})
        </button>

        <button
          onClick={() => setActiveTab('kuis')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shrink-0 ${
            activeTab === 'kuis' ? 'bg-[#1e1b4b] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <HelpCircle className="w-4 h-4" /> Ujian & Kuis ({quizzes.length})
        </button>

        <button
          onClick={() => setActiveTab('anggota')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shrink-0 ${
            activeTab === 'anggota' ? 'bg-[#1e1b4b] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" /> Anggota Kelas ({members.length})
        </button>
      </div>

      {/* TAB 1: FORUM DISKUSI */}
      {activeTab === 'forum' && (
        <div className="space-y-6">
          {/* Post Composer */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <form onSubmit={handleCreatePost} className="space-y-3">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Tulis pengumuman, pertanyaan, atau bagikan informasi ke forum kelas..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white resize-none shadow-2xs"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newPostContent.trim() || isPosting}
                  className="px-5 py-2.5 bg-[#1e1b4b] hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-indigo-100 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isPosting ? 'Mengirim...' : 'Kirim Postingan'}
                </button>
              </div>
            </form>
          </div>

          {/* Posts List */}
          {posts.length === 0 ? (
            <div className="bg-white p-8 text-center text-slate-500 rounded-3xl border border-slate-200 shadow-sm">
              Belum ada kiriman diskusi di ruang kelas ini. Jadilah yang pertama mengirim pesan!
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  {/* Post Author Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center border border-indigo-100">
                        {post.user_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{post.user_name}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            post.user_role === 'guru' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}>
                            {post.user_role}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {new Date(post.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {post.is_pinned && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                          <Pin className="w-3 h-3 text-amber-600" /> Disematkan
                        </span>
                      )}

                      {/* Post Edit & Delete Controls */}
                      {(user?.id === post.user_id || isTeacher) && editingPostId !== post.id && (
                        <div className="flex items-center gap-1">
                          {user?.id === post.user_id && (
                            <button
                              onClick={() => handleStartEditPost(post)}
                              title="Edit Postingan"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeletePost(post.id)}
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
                  {editingPostId === post.id ? (
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
                          onClick={() => handleSaveEditPost(post.id)}
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
                      onClick={() => handleToggleReaction(post.id, 'like')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Suka</span>
                    </button>
                    <button
                      onClick={() => handleToggleReaction(post.id, 'fire')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      <span>Semangat</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    {(() => {
                      const commentNodes = buildCommentTree(post.comments);
                      if (commentNodes.length === 0) return null;

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
                                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                                        comment.user_role === 'guru' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                      }`}>
                                        {comment.user_role}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] text-slate-400">
                                        {new Date(comment.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                      </span>

                                      {/* Comment Actions */}
                                      {!isEditingThisComment && (
                                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                          <button
                                            type="button"
                                            onClick={() => handleSetReply(post.id, comment)}
                                            title="Balas Komentar"
                                            className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                                          >
                                            <CornerDownRight className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">Balas</span>
                                          </button>

                                          {isCommentAuthor && (
                                            <button
                                              type="button"
                                              onClick={() => handleStartEditComment(comment)}
                                              title="Edit Komentar"
                                              className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                                            >
                                              <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                          )}
                                          {canManageComment && (
                                            <button
                                              type="button"
                                              onClick={() => handleDeleteComment(post.id, comment.id)}
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

                                  {/* Comment Content or Inline Edit Form */}
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
                                          onClick={handleCancelEditComment}
                                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                                        >
                                          <X className="w-3 h-3" /> Batal
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleSaveEditComment(post.id, comment.id)}
                                          disabled={isSavingComment || !editCommentText.trim()}
                                          className="px-3 py-1 rounded-lg text-[11px] font-bold bg-[#1e1b4b] hover:bg-slate-900 text-white shadow transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
                                        >
                                          <Check className="w-3 h-3" /> {isSavingComment ? 'Menyimpan...' : 'Simpan Perubahan'}
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
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
                                            <div key={reply.id} className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5 group">
                                              <div className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-2">
                                                  <span className="font-bold text-slate-900">{reply.user_name}</span>
                                                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                                                    reply.user_role === 'guru' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                                  }`}>
                                                    {reply.user_role}
                                                  </span>
                                                  <span className="text-[10px] text-indigo-600 font-medium hidden sm:flex items-center gap-0.5">
                                                    <CornerDownRight className="w-2.5 h-2.5" /> membalas
                                                  </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                  <span className="text-[10px] text-slate-400">
                                                    {new Date(reply.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                  </span>

                                                  {!isEditingThisReply && (
                                                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                                      <button
                                                        type="button"
                                                        onClick={() => handleSetReply(post.id, reply)}
                                                        title="Balas Komentar Ini"
                                                        className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                                                      >
                                                        <CornerDownRight className="w-3.5 h-3.5" />
                                                      </button>

                                                      {isReplyAuthor && (
                                                        <button
                                                          type="button"
                                                          onClick={() => handleStartEditComment(reply)}
                                                          title="Edit Balasan"
                                                          className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                                                        >
                                                          <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                      )}
                                                      {canManageReply && (
                                                        <button
                                                          type="button"
                                                          onClick={() => handleDeleteComment(post.id, reply.id)}
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

                                              {/* Reply Content or Inline Edit Form */}
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
                                                      onClick={handleCancelEditComment}
                                                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                                                    >
                                                      <X className="w-3 h-3" /> Batal
                                                    </button>
                                                    <button
                                                      type="button"
                                                      onClick={() => handleSaveEditComment(post.id, reply.id)}
                                                      disabled={isSavingComment || !editCommentText.trim()}
                                                      className="px-3 py-1 rounded-lg text-[11px] font-bold bg-[#1e1b4b] hover:bg-slate-900 text-white shadow transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
                                                    >
                                                      <Check className="w-3 h-3" /> {isSavingComment ? 'Menyimpan...' : 'Simpan Perubahan'}
                                                    </button>
                                                  </div>
                                                </div>
                                              ) : (
                                                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{reply.content}</p>
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
                    })()}

                    {/* Add Comment / Reply Field */}
                    <div className="space-y-1.5 pt-2">
                      {replyTo[post.id] && (
                        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-800 animate-in fade-in">
                          <span className="flex items-center gap-1.5 font-medium">
                            <CornerDownRight className="w-3.5 h-3.5 text-indigo-600" />
                            Membalas <strong className="text-slate-900">@{replyTo[post.id]?.authorName}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleSetReply(post.id, null)}
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
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddComment(post.id);
                          }}
                          placeholder={replyTo[post.id] ? `Balas @${replyTo[post.id]?.authorName}...` : "Balas diskusi..."}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white shadow-2xs"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="p-2 bg-[#1e1b4b] hover:bg-slate-900 text-white rounded-xl transition-colors cursor-pointer shadow-2xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Bahan Ajar & Modul Pembelajaran
            </h2>
            {isTeacher && (
              <button
                onClick={() => {
                  setErrorMsg(null);
                  setIsMaterialModalOpen(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-100 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Unggah Modul Baru
              </button>
            )}
          </div>

          {materials.length === 0 ? (
            <div className="bg-white p-8 text-center text-slate-500 rounded-3xl border border-slate-200 shadow-sm">
              Belum ada materi pembelajaran yang diunggah untuk kelas ini.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {materials.map((mat) => (
                <div key={mat.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100">
                        {mat.type === 'pdf' ? 'Dokumen PDF' : 'Materi Interaktif'}
                      </span>
                      {isTeacher && (
                        <button
                          onClick={() => handleDeleteMaterial(mat.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{mat.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{mat.description || 'Tidak ada catatan tambahan.'}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {new Date(mat.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>

                    {mat.file_url && (
                      <a
                        href={mat.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-100 transition-colors"
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
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Daftar Tugas & Evaluasi Siswa
            </h2>
            {isTeacher && (
              <button
                onClick={() => {
                  setErrorMsg(null);
                  setIsAssignmentModalOpen(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-100 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Buat Tugas Baru
              </button>
            )}
          </div>

          {assignments.length === 0 ? (
            <div className="bg-white p-8 text-center text-slate-500 rounded-3xl border border-slate-200 shadow-sm">
              Belum ada tugas yang diberikan di kelas ini.
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.map((asg) => (
                <div key={asg.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{asg.title}</h3>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Maks {asg.max_score} Poin
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap leading-relaxed">{asg.instructions || asg.description}</p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>Tenggat: {new Date(asg.due_date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                  </div>

                  {/* Actions for Teacher / Student */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    {asg.file_url ? (
                      <a
                        href={asg.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold"
                      >
                        <Download className="w-3.5 h-3.5" /> Lampiran Soal
                      </a>
                    ) : <div></div>}

                    <div className="flex items-center gap-3">
                      {isTeacher ? (
                        <button
                          onClick={() => handleOpenSubmissionsList(asg)}
                          className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 border border-indigo-100 transition-colors cursor-pointer"
                        >
                          <FileCheck className="w-4 h-4" /> Periksa Jawaban ({asg.submission_count || 0})
                        </button>
                      ) : (
                        <div>
                          {asg.is_submitted ? (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Sudah Dikumpulkan
                              </span>
                              {asg.score != null && (
                                <span className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
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
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-100 transition-colors cursor-pointer"
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
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-600" />
              Kuis Interaktif & Ujian Semester
            </h2>
            {isTeacher && (
              <button
                onClick={() => {
                  setErrorMsg(null);
                  setIsQuizModalOpen(true);
                }}
                className="px-4 py-2 bg-[#1e1b4b] hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-100 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Buat Kuis Baru
              </button>
            )}
          </div>

          {quizzes.length === 0 ? (
            <div className="bg-white p-8 text-center text-slate-500 rounded-3xl border border-slate-200 shadow-sm">
              Belum ada ujian online yang dibuat di kelas ini.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quizzes.map((qz) => (
                <div key={qz.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
                        Durasi: {qz.duration_minutes} Menit
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">{qz.questions_count || 0} Butir Soal</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{qz.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{qz.description || 'Ujian evaluasi materi.'}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    {qz.is_completed ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Selesai (Nilai: {qz.score ?? '-'})
                      </span>
                    ) : (
                      <Link
                        to={`/quiz/${qz.id}`}
                        className="px-4 py-2 bg-[#1e1b4b] hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 transition-colors"
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
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Daftar Guru & Siswa Terdaftar
          </h2>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-4">Nama Lengkap</th>
                    <th className="p-4">Peran</th>
                    <th className="p-4">NISN / NIP</th>
                    <th className="p-4">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-bold text-slate-900 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{m.name}</span>
                      </td>
                      <td className="p-4">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          m.role === 'guru' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}>
                          {m.role === 'guru' ? 'Guru Pengajar' : 'Siswa'}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-mono text-slate-500">{m.nip_nik_nisn || m.nisn || '-'}</td>
                      <td className="p-4 text-xs text-slate-500">{m.email}</td>
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
          {errorMsg && <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200">{errorMsg}</div>}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">Judul Materi</label>
            <input
              type="text"
              value={matTitle}
              onChange={(e) => setMatTitle(e.target.value)}
              required
              placeholder="Contoh: Modul 1 - React Components & Hooks"
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">Deskripsi Ringkas</label>
            <textarea
              value={matDesc}
              onChange={(e) => setMatDesc(e.target.value)}
              rows={3}
              placeholder="Petunjuk membaca materi..."
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">File Lampiran (PDF / Dokumen)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.zip,.png,.jpg"
              onChange={(e) => setMatFile(e.target.files?.[0] || null)}
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#1e1b4b] file:text-white hover:file:bg-slate-900 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={isUploadingMat}
            className="w-full py-3 bg-[#1e1b4b] hover:bg-slate-900 text-white font-bold rounded-xl shadow-md shadow-indigo-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isUploadingMat ? 'Mengunggah ke Storage...' : 'Simpan & Publikasikan Modul'}
          </button>
        </form>
      </Modal>

      {/* MODAL 2: CREATE ASSIGNMENT */}
      <Modal isOpen={isAssignmentModalOpen} onClose={() => setIsAssignmentModalOpen(false)} title="Buat Penugasan Baru">
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          {errorMsg && <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200">{errorMsg}</div>}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">Judul Tugas</label>
            <input
              type="text"
              value={asgTitle}
              onChange={(e) => setAsgTitle(e.target.value)}
              required
              placeholder="Contoh: Tugas 1 - Pembuatan Layout LMS Web"
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Tenggat Waktu</label>
              <input
                type="datetime-local"
                value={asgDueDate}
                onChange={(e) => setAsgDueDate(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Skor Maksimal</label>
              <input
                type="number"
                value={asgMaxScore}
                onChange={(e) => setAsgMaxScore(Number(e.target.value))}
                required
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">Instruksi Pengerjaan</label>
            <textarea
              value={asgInstructions}
              onChange={(e) => setAsgInstructions(e.target.value)}
              rows={4}
              placeholder="Kriteria penilaian dan format pengumpulan tugas..."
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">File Soal / Template (Opsional)</label>
            <input
              type="file"
              onChange={(e) => setAsgFile(e.target.files?.[0] || null)}
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={isUploadingAsg}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isUploadingAsg ? 'Memproses Penugasan...' : 'Terbitkan Tugas ke Siswa'}
          </button>
        </form>
      </Modal>

      {/* MODAL 3: SUBMIT ASSIGNMENT (STUDENT) */}
      <Modal isOpen={isSubmitModalOpen} onClose={() => setIsSubmitModalOpen(false)} title={`Kumpulkan Tugas: ${selectedAsg?.title}`}>
        <form onSubmit={handleSubmitAssignment} className="space-y-4">
          {errorMsg && <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200">{errorMsg}</div>}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">Catatan / Jawaban Teks Siswa</label>
            <textarea
              value={subNotes}
              onChange={(e) => setSubNotes(e.target.value)}
              rows={3}
              placeholder="Tuliskan link repository GitHub atau keterangan pengerjaan..."
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">File Hasil Tugas (ZIP / PDF / Gambar)</label>
            <input
              type="file"
              onChange={(e) => setSubFile(e.target.files?.[0] || null)}
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmittingTask}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSubmittingTask ? 'Mengirim Jawaban...' : 'Kirim Tugas Sekarang'}
          </button>
        </form>
      </Modal>

      {/* MODAL 4: SUBMISSIONS LIST (TEACHER) */}
      <Modal isOpen={isSubmissionsListOpen} onClose={() => setIsSubmissionsListOpen(false)} title={`Daftar Jawaban Siswa: ${selectedAsg?.title}`}>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {currentSubmissions.length === 0 ? (
            <div className="p-6 text-center text-slate-500">Belum ada siswa yang mengumpulkan tugas ini.</div>
          ) : (
            <div className="space-y-3">
              {currentSubmissions.map((sub) => (
                <div key={sub.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{sub.student_name}</h4>
                      <span className="text-[11px] text-slate-400">
                        Diserahkan: {new Date(sub.submitted_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {sub.score != null ? (
                        <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                          Nilai: {sub.score}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                          Belum Dinilai
                        </span>
                      )}

                      <button
                        onClick={() => handleOpenGradingModal(sub)}
                        className="px-3 py-1.5 bg-[#1e1b4b] hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
                      >
                        Beri Nilai
                      </button>
                    </div>
                  </div>

                  {sub.notes && <p className="text-xs text-slate-700 bg-white border border-slate-200 p-2.5 rounded-xl">{sub.notes}</p>}

                  {sub.file_url && (
                    <a
                      href={sub.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
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
            <label className="text-xs font-bold text-slate-700 uppercase">Nilai Angka (0 - {selectedAsg?.max_score || 100})</label>
            <input
              type="number"
              min="0"
              max={selectedAsg?.max_score || 100}
              value={gradeScore}
              onChange={(e) => setGradeScore(Number(e.target.value))}
              required
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">Catatan / Umpan Balik Guru</label>
            <textarea
              value={gradeFeedback}
              onChange={(e) => setGradeFeedback(e.target.value)}
              rows={3}
              placeholder="Kerja bagus! Perhatikan kerapian kodingan..."
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSavingGrade}
            className="w-full py-3 bg-[#1e1b4b] hover:bg-slate-900 text-white font-bold rounded-xl shadow-md shadow-indigo-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSavingGrade ? 'Menyimpan...' : 'Simpan Nilai Siswa'}
          </button>
        </form>
      </Modal>

      {/* MODAL 6: CREATE QUIZ (TEACHER) */}
      <Modal isOpen={isQuizModalOpen} onClose={() => setIsQuizModalOpen(false)} title="Buat Ujian Online / Kuis Baru">
        <form onSubmit={handleCreateQuiz} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {errorMsg && <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200">{errorMsg}</div>}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">Judul Kuis / Ujian</label>
            <input
              type="text"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              required
              placeholder="Contoh: Ujian Tengah Semester Pemrograman Web"
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Durasi (Menit)</label>
              <input
                type="number"
                min="5"
                value={quizDuration}
                onChange={(e) => setQuizDuration(Number(e.target.value))}
                required
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Deskripsi</label>
              <input
                type="text"
                value={quizDesc}
                onChange={(e) => setQuizDesc(e.target.value)}
                placeholder="Petunjuk umum ujian..."
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Questions Builder */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-700">Daftar Soal Pilihan Ganda</span>
              <button
                type="button"
                onClick={handleAddQuestionField}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
              >
                + Tambah Soal
              </button>
            </div>

            {quizQuestions.map((q, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800">Nomor {idx + 1}</span>
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
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
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
                    className="bg-white border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:outline-none"
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
                    className="bg-white border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:outline-none"
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
                    className="bg-white border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:outline-none"
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
                    className="bg-white border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-600 font-semibold">Kunci Jawaban Benar:</span>
                  {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                    <label key={opt} className="flex items-center gap-1 cursor-pointer text-slate-800">
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
            className="w-full py-3 bg-[#1e1b4b] hover:bg-slate-900 text-white font-bold rounded-xl shadow-md shadow-indigo-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isCreatingQuiz ? 'Menerbitkan Ujian...' : 'Terbitkan Kuis ke Siswa'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
