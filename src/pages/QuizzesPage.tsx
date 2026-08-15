import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ClassRoom, Quiz } from '../types';
import {
  HelpCircle,
  Clock,
  Award,
  Plus,
  Play,
  CheckCircle2,
  Calendar,
  Search,
  ExternalLink,
  Trash2,
  AlertCircle,
  FileQuestion,
  BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Modal } from '../components/Modal';

export const QuizzesPage: React.FC = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'guru' || user?.role === 'admin';

  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [quizzes, setQuizzes] = useState<(Quiz & { className?: string })[]>([]);

  // Create Quiz Modal
  const [isCreateQuizModalOpen, setIsCreateQuizModalOpen] = useState(false);
  const [modalTargetClassId, setModalTargetClassId] = useState('');
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
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    loadAllQuizzes(controller.signal);

    return () => {
      controller.abort();
    };
  }, []);

  const loadAllQuizzes = async (signal?: AbortSignal) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const clsData = await api.getClasses();
      if (signal?.aborted) return;
      setClasses(clsData);
      if (clsData.length > 0 && !modalTargetClassId) {
        setModalTargetClassId(clsData[0].id);
      }

      const allQuizzes: (Quiz & { className?: string })[] = [];
      await Promise.all(
        clsData.map(async (cls) => {
          try {
            const cQuizzes = await api.getQuizzes(cls.id, { signal }).catch(() => []);
            if (signal?.aborted) return;
            cQuizzes.forEach((q) => allQuizzes.push({ ...q, className: cls.name }));
          } catch (err) {
            // Ignore per class
          }
        })
      );

      if (!signal?.aborted) {
        setQuizzes(allQuizzes);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Failed to load quizzes:', err);
        setErrorMsg('Gagal memuat daftar kuis dari server.');
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  };

  const filteredQuizzes = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return quizzes.filter((q) => {
      const matchClass = selectedClassId === 'all' || q.class_id === selectedClassId;
      const matchSearch =
        !query ||
        q.title.toLowerCase().includes(query) ||
        (q.description || '').toLowerCase().includes(query) ||
        (q.className || '').toLowerCase().includes(query);

      const isCompleted = q.is_completed || q.score != null;
      let matchTab = true;
      if (activeTab === 'active') matchTab = !isCompleted;
      if (activeTab === 'completed') matchTab = isCompleted;

      return matchClass && matchSearch && matchTab;
    });
  }, [quizzes, selectedClassId, searchQuery, activeTab]);

  const handleAddQuestion = () => {
    setQuizQuestions([
      ...quizQuestions,
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

  const handleRemoveQuestion = (index: number) => {
    if (quizQuestions.length <= 1) return;
    setQuizQuestions(quizQuestions.filter((_, idx) => idx !== index));
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const updated = [...quizQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setQuizQuestions(updated);
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle.trim() || !modalTargetClassId) return;

    // Validate questions
    for (let i = 0; i < quizQuestions.length; i++) {
      const q = quizQuestions[i];
      if (!q.question_text.trim() || !q.option_a.trim() || !q.option_b.trim()) {
        setErrorMsg(`Soal nomor ${i + 1} belum lengkap.`);
        return;
      }
    }

    setIsCreatingQuiz(true);
    setErrorMsg(null);
    try {
      await api.createQuiz(modalTargetClassId, {
        title: quizTitle.trim(),
        description: quizDesc.trim(),
        duration_minutes: Number(quizDuration) || 30,
        questions: quizQuestions.map((q) => ({
          question_text: q.question_text.trim(),
          points: Number(q.points) || 20,
          option_a: q.option_a.trim(),
          option_b: q.option_b.trim(),
          option_c: q.option_c.trim(),
          option_d: q.option_d.trim(),
          correct_option: q.correct_option,
        })),
      });

      setIsCreateQuizModalOpen(false);
      setQuizTitle('');
      setQuizDesc('');
      setQuizDuration(30);
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
      setSuccessMsg('Kuis / Ujian CBT berhasil dibuat!');
      await loadAllQuizzes();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal membuat kuis');
    } finally {
      setIsCreatingQuiz(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!window.confirm('Yakin ingin menghapus kuis ini?')) return;
    try {
      await api.deleteQuiz(quizId);
      setSuccessMsg('Kuis berhasil dihapus.');
      await loadAllQuizzes();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menghapus kuis');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 lg:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              Computer Based Test (CBT) Center
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">Kuis & Ujian Online</h1>
            <p className="text-slate-500 text-sm max-w-xl">
              {isTeacher
                ? 'Buat paket soal ujian pilihan ganda atau essay, tentukan durasi pengerjaan, dan pantau rekapitulasi nilai evaluasi siswa.'
                : 'Uji pemahaman materi kejuruan Anda dengan kuis interaktif dan ujian online berkala sesuai jadwal kelas.'}
            </p>
          </div>

          {/* Action Buttons for Teachers */}
          {isTeacher && (
            <button
              onClick={() => {
                setErrorMsg(null);
                setIsCreateQuizModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#1e1b4b] hover:bg-slate-900 text-white font-bold text-xs shadow-md shadow-indigo-100 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> + Buat Ujian / Kuis
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">×</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-700 hover:text-rose-900 font-bold">×</button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Subtabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'all'
                ? 'bg-[#1e1b4b] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Semua ({quizzes.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'active'
                ? 'bg-[#1e1b4b] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Tersedia / Berjalan
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'completed'
                ? 'bg-[#1e1b4b] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Selesai Dikerjakan
          </button>
        </div>

        {/* Search & Class Dropdown */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
          {/* Class Select */}
          <div className="relative w-full sm:w-48">
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white cursor-pointer shadow-2xs"
            >
              <option value="all">Semua Kelas ({classes.length})</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari judul kuis / ujian..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white shadow-2xs"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-slate-500">
          <div className="inline-block w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm">Memuat paket ujian dari seluruh kelas...</p>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 space-y-3 shadow-sm">
          <FileQuestion className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">Tidak ada kuis atau ujian yang ditemukan.</p>
          <p className="text-xs text-slate-400">Coba ubah filter kelas atau cari dengan kata kunci lain.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredQuizzes.map((qz) => {
            const hasCompleted = qz.is_completed || qz.score != null;
            return (
              <div
                key={qz.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4 hover:border-slate-300 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold uppercase truncate max-w-[160px]">
                      {qz.className || 'Kelas'}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-600 flex items-center gap-1 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                      <Clock className="w-3 h-3 text-amber-600" /> {qz.duration_minutes} Menit
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-2">
                    {qz.title}
                  </h3>

                  {qz.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{qz.description}</p>
                  )}

                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Jumlah Soal: <strong className="text-slate-800">{qz.questions_count || qz.question_count || qz.questions?.length || 'Multiple Choice'}</strong>
                    </span>

                    {hasCompleted ? (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" /> Nilai: {qz.score !== undefined && qz.score !== null ? qz.score : 'Selesai'}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold">
                        Siap Dikerjakan
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    to={`/quiz/${qz.id}`}
                    className={`flex-1 py-2 rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all ${
                      hasCompleted
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'bg-[#1e1b4b] hover:bg-slate-900 text-white'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5" />
                    {hasCompleted ? 'Lihat Hasil Ujian' : 'Mulai Kerjakan Ujian'}
                  </Link>

                  <Link
                    to={`/classes/${qz.class_id}`}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Buka di Kelas"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>

                  {isTeacher && (
                    <button
                      onClick={() => handleDeleteQuiz(qz.id)}
                      className="p-2 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Hapus Kuis"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE QUIZ MODAL (TEACHER) */}
      <Modal
        isOpen={isCreateQuizModalOpen}
        onClose={() => setIsCreateQuizModalOpen(false)}
        title="Buat Ujian / Kuis CBT Baru"
      >
        <form onSubmit={handleCreateQuiz} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Kelas</label>
            <select
              value={modalTargetClassId}
              onChange={(e) => setModalTargetClassId(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
              required
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.rombel})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Judul Ujian / Kuis</label>
            <input
              type="text"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder="Contoh: Penilaian Harian 1 - Jaringan Dasar"
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Durasi Pengerjaan (Menit)</label>
              <input
                type="number"
                min="5"
                max="180"
                value={quizDuration}
                onChange={(e) => setQuizDuration(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Ringkas</label>
              <input
                type="text"
                value={quizDesc}
                onChange={(e) => setQuizDesc(e.target.value)}
                placeholder="Petunjuk ujian CBT..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Questions Builder */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Daftar Soal Pilihan Ganda ({quizQuestions.length})
              </h4>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Soal
              </button>
            </div>

            {quizQuestions.map((q, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Soal #{idx + 1}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">Poin:</span>
                    <input
                      type="number"
                      value={q.points}
                      onChange={(e) => handleQuestionChange(idx, 'points', Number(e.target.value))}
                      className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 text-center font-bold"
                    />
                    {quizQuestions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(idx)}
                        className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  value={q.question_text}
                  onChange={(e) => handleQuestionChange(idx, 'question_text', e.target.value)}
                  placeholder={`Tuliskan pertanyaan untuk nomor ${idx + 1}...`}
                  rows={2}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(['a', 'b', 'c', 'd'] as const).map((opt) => (
                    <div key={opt} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700 uppercase shrink-0">
                        {opt}
                      </span>
                      <input
                        type="text"
                        value={(q as any)[`option_${opt}`]}
                        onChange={(e) => handleQuestionChange(idx, `option_${opt}`, e.target.value)}
                        placeholder={`Pilihan ${opt.toUpperCase()}...`}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                        required
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs font-semibold text-emerald-700">Kunci Jawaban Benar:</span>
                  <select
                    value={q.correct_option}
                    onChange={(e) => handleQuestionChange(idx, 'correct_option', e.target.value)}
                    className="px-3 py-1 bg-white border border-emerald-300 rounded-lg text-xs font-bold text-emerald-700 cursor-pointer"
                  >
                    <option value="A">Pilihan A</option>
                    <option value="B">Pilihan B</option>
                    <option value="C">Pilihan C</option>
                    <option value="D">Pilihan D</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateQuizModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isCreatingQuiz}
              className="px-5 py-2.5 bg-[#1e1b4b] hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 disabled:opacity-50"
            >
              {isCreatingQuiz ? 'Menerbitkan...' : 'Terbitkan Kuis CBT'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
