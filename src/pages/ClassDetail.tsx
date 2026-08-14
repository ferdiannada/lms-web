import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ClassRoom, Material, Assignment, Quiz, ForumPost, ClassMember } from '../types';
import {
  MessageSquare,
  BookOpen,
  FileText,
  HelpCircle,
  Users,
  Plus,
  Send,
  Paperclip,
  Download,
  CheckCircle,
  Clock,
  ThumbsUp,
  Flame,
  Award,
  Pin,
  FileCode
} from 'lucide-react';
import { Modal } from '../components/Modal';

export const ClassDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [classDetail, setClassDetail] = useState<ClassRoom | null>(null);
  const [activeTab, setActiveTab] = useState<'forum' | 'materi' | 'tugas' | 'kuis' | 'anggota'>('forum');

  // Tab Data States
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [members, setMembers] = useState<ClassMember[]>([]);

  // Forum Composer State
  const [newPostContent, setNewPostContent] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Modals
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedAsg, setSelectedAsg] = useState<Assignment | null>(null);

  // Form Inputs for Modals
  const [matTitle, setMatTitle] = useState('');
  const [matDesc, setMatDesc] = useState('');

  const [asgTitle, setAsgTitle] = useState('');
  const [asgInstructions, setAsgInstructions] = useState('');
  const [asgDueDate, setAsgDueDate] = useState('');

  const [subNotes, setSubNotes] = useState('');
  const [subFileName, setSubFileName] = useState('jawaban-tugas-react.zip');

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
      console.error(err);
    }
  };

  const loadTabData = async () => {
    if (!id) return;
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
      console.error(err);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !id) return;
    try {
      await api.createForumPost(id, newPostContent);
      setNewPostContent('');
      loadTabData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (postId: string, parentId?: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;
    try {
      await api.addComment(postId, text, parentId);
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
      loadTabData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await api.createMaterial(id, {
        title: matTitle,
        description: matDesc,
        file_name: 'modul-web-react.pdf',
        file_url: '/uploads/modul-web-react.pdf',
      });
      setIsMaterialModalOpen(false);
      setMatTitle('');
      setMatDesc('');
      loadTabData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await api.createAssignment(id, {
        title: asgTitle,
        instructions: asgInstructions,
        due_date: asgDueDate || new Date(Date.now() + 86400000 * 7).toISOString(),
        max_score: 100,
      });
      setIsAssignmentModalOpen(false);
      setAsgTitle('');
      setAsgInstructions('');
      loadTabData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsg) return;
    try {
      await api.submitAssignment(selectedAsg.id, {
        file_name: subFileName,
        file_url: `/uploads/${subFileName}`,
        notes: subNotes,
      });
      setIsSubmitModalOpen(false);
      setSubNotes('');
      loadTabData();
    } catch (err) {
      console.error(err);
    }
  };

  if (!classDetail) {
    return <div className="p-8 text-center text-slate-400">Memuat detail kelas...</div>;
  }

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
        <p className="text-indigo-100 text-sm max-w-2xl">{classDetail.description}</p>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('forum')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'forum'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Diskusi Forum
        </button>

        <button
          onClick={() => setActiveTab('materi')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'materi'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Modul & Materi
        </button>

        <button
          onClick={() => setActiveTab('tugas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'tugas'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          Tugas Sekolah
        </button>

        <button
          onClick={() => setActiveTab('kuis')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'kuis'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          Kuis & Ujian
        </button>

        <button
          onClick={() => setActiveTab('anggota')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'anggota'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-4 h-4" />
          Anggota Kelas
        </button>
      </div>

      {/* TAB CONTENT: FORUM STREAM */}
      {activeTab === 'forum' && (
        <div className="space-y-6">
          {/* Post Composer */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-200">Bagikan topik atau pertanyaan ke kelas:</h3>
            <form onSubmit={handleCreatePost} className="space-y-3">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Tulis pesan, instruksi, atau tanyakan tentang materi React & Go..."
                rows={3}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl p-4 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Paperclip className="w-4 h-4 text-slate-500" />
                  Mendukung format mention @siswa / @guru
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Posting
                </button>
              </div>
            </form>
          </div>

          {/* Posts Feed */}
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                {/* Author Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                      alt={post.user_name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-100">{post.user_name}</span>
                        {post.user_role === 'guru' && (
                          <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            Guru
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">{new Date(post.created_at).toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  {post.is_pinned && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                      <Pin className="w-3 h-3" /> Disematkan
                    </span>
                  )}
                </div>

                {/* Content */}
                {post.title && <h3 className="text-base font-bold text-white">{post.title}</h3>}
                <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{post.content}</p>

                {/* Reactions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  {post.reactions.map((r, i) => (
                    <button
                      key={i}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700/60 text-xs text-slate-300 hover:border-indigo-500/40 transition-colors"
                    >
                      <span>{r.emoji}</span>
                      <span className="font-bold">{r.count}</span>
                    </button>
                  ))}
                </div>

                {/* Comments List */}
                {post.comments && post.comments.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-800/60 space-y-3">
                    {post.comments.map((c) => (
                      <div key={c.id} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-indigo-300">{c.user_name}</span>
                          <span className="text-[10px] text-slate-500">{new Date(c.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-xs text-slate-300">{c.content}</p>

                        {/* Nested Replies */}
                        {c.replies && c.replies.map((reply) => (
                          <div key={reply.id} className="ml-4 pl-3 border-l-2 border-indigo-500/30 pt-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-emerald-400">{reply.user_name}</span>
                            </div>
                            <p className="text-xs text-slate-300">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Comment Input */}
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={commentInputs[post.id] || ''}
                    onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                    placeholder="Tulis komentar balasan..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => handleAddComment(post.id)}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Kirim
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: MATERI */}
      {activeTab === 'materi' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Modul Pembelajaran SMK</h2>
            {user?.role === 'guru' && (
              <button
                onClick={() => setIsMaterialModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Unggah Modul Baru
              </button>
            )}
          </div>

          <div className="space-y-3">
            {materials.map((m) => (
              <div key={m.id} className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                    <FileCode className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{m.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{m.description}</p>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      File: {m.file_name} • {( (m.file_size || 2000000) / 1000000 ).toFixed(1)} MB
                    </span>
                  </div>
                </div>

                <a
                  href={m.file_url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-colors"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: TUGAS */}
      {activeTab === 'tugas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Daftar Tugas & Proyek</h2>
            {user?.role === 'guru' && (
              <button
                onClick={() => setIsAssignmentModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Buat Tugas Baru
              </button>
            )}
          </div>

          <div className="space-y-3">
            {assignments.map((asg) => (
              <div key={asg.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">{asg.title}</h3>
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                    Maks Nilai: {asg.max_score}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{asg.instructions}</p>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-500" />
                    Tenggat: {new Date(asg.due_date).toLocaleDateString('id-ID')}
                  </span>

                  {user?.role === 'siswa' && (
                    asg.submission ? (
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Dikumpulkan ({asg.submission.score ? `Nilai: ${asg.submission.score}` : 'Belum Dinilai'})
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedAsg(asg);
                          setIsSubmitModalOpen(true);
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        Kirim Jawaban Tugas
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: KUIS & UJIAN */}
      {activeTab === 'kuis' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Ujian Online & Kuis Evaluasi</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes.map((qz) => (
              <div key={qz.id} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      Durasi: {qz.duration_minutes} Menit
                    </span>
                    <span className="text-xs text-slate-400">{qz.questions_count || 5} Soal</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{qz.title}</h3>
                  <p className="text-xs text-slate-400">{qz.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  {qz.attempt ? (
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <Award className="w-4 h-4" /> Skor UTS: {qz.attempt.score} / {qz.attempt.max_score}
                    </div>
                  ) : (
                    <Link
                      to={`/quiz/${qz.id}`}
                      className="w-full text-center py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
                    >
                      Mulai Kerjakan Ujian Online
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: ANGGOTA */}
      {activeTab === 'anggota' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white">Anggota Roster Kelas ({members.length})</h2>
          <div className="divide-y divide-slate-800">
            {members.map((m) => (
              <div key={m.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center text-xs">
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-200">{m.name}</p>
                    <p className="text-xs text-slate-500">{m.email} {m.nisn ? `• NISN: ${m.nisn}` : ''}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${m.role === 'guru' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                  {m.role.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals for Modul, Tugas, & Submit */}
      <Modal isOpen={isMaterialModalOpen} onClose={() => setIsMaterialModalOpen(false)} title="Unggah Modul Materi Baru">
        <form onSubmit={handleCreateMaterial} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase">Judul Modul</label>
            <input
              type="text"
              value={matTitle}
              onChange={(e) => setMatTitle(e.target.value)}
              required
              placeholder="Contoh: Bab 3 - REST API Go & Authentication"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:border-indigo-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase">Deskripsi Penjelasan</label>
            <textarea
              value={matDesc}
              onChange={(e) => setMatDesc(e.target.value)}
              rows={3}
              placeholder="Penjelasan materi..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-colors cursor-pointer"
          >
            Terbitkan Modul
          </button>
        </form>
      </Modal>

      <Modal isOpen={isAssignmentModalOpen} onClose={() => setIsAssignmentModalOpen(false)} title="Buat Tugas Baru untuk Siswa">
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase">Judul Tugas</label>
            <input
              type="text"
              value={asgTitle}
              onChange={(e) => setAsgTitle(e.target.value)}
              required
              placeholder="Contoh: Tugas Praktik React Router & Form Handling"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:border-indigo-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase">Instruksi Pengerjaan</label>
            <textarea
              value={asgInstructions}
              onChange={(e) => setAsgInstructions(e.target.value)}
              rows={3}
              placeholder="Instruksi pengerjaan tugas..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-colors cursor-pointer"
          >
            Terbitkan Tugas
          </button>
        </form>
      </Modal>

      <Modal isOpen={isSubmitModalOpen} onClose={() => setIsSubmitModalOpen(false)} title={`Pengumpulan: ${selectedAsg?.title}`}>
        <form onSubmit={handleSubmitAssignment} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase">Nama File Jawaban (ZIP / PDF)</label>
            <input
              type="text"
              value={subFileName}
              onChange={(e) => setSubFileName(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:border-indigo-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase">Catatan Tambahan ke Guru</label>
            <textarea
              value={subNotes}
              onChange={(e) => setSubNotes(e.target.value)}
              rows={2}
              placeholder="Catatan..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-colors cursor-pointer"
          >
            Kirim Pengumpulan Tugas
          </button>
        </form>
      </Modal>
    </div>
  );
};
