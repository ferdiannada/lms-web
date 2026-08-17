import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services';
import { ClassRoom, Quiz } from '../types';
import {
  HelpCircle,
  Clock,
  Plus,
  Play,
  CheckCircle2,
  Calendar,
  Search,
  Trash2,
  AlertCircle,
  FileQuestion,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { QuizCreateModal } from '../components/features/quizzes/QuizCreateModal';

export const QuizzesPage: React.FC = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'guru' || user?.role === 'admin';

  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [quizzes, setQuizzes] = useState<(Quiz & { className?: string })[]>([]);
  const [isCreateQuizModalOpen, setIsCreateQuizModalOpen] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadAllQuizzes = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const clsData = await api.getClasses();
      if (signal?.aborted) return;
      setClasses(clsData);

      const allQuizzes: (Quiz & { className?: string })[] = [];
      await Promise.all(
        clsData.map(async (cls) => {
          try {
            const cQuizzes = await api.getQuizzes(cls.id, { signal }).catch(() => []);
            if (signal?.aborted) return;
            cQuizzes.forEach((q) => allQuizzes.push({ ...q, className: cls.name }));
          } catch {
            // Ignore
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
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadAllQuizzes(controller.signal);
    return () => {
      controller.abort();
    };
  }, [loadAllQuizzes]);

  // Filters
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((q) => {
      const matchClass = selectedClassId === 'all' || q.class_id === selectedClassId;
      const matchSearch =
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.className || '').toLowerCase().includes(searchQuery.toLowerCase());

      const hasAttempt = q.is_completed || (q.score != null && q.score !== undefined);
      let matchTab = true;
      if (activeTab === 'active') matchTab = !hasAttempt;
      if (activeTab === 'completed') matchTab = hasAttempt;

      return matchClass && matchSearch && matchTab;
    });
  }, [quizzes, selectedClassId, searchQuery, activeTab]);

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kuis ini?')) return;
    try {
      await api.deleteQuiz(quizId);
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
      setSuccessMsg('Kuis berhasil dihapus.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menghapus kuis.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-[2rem] bg-m3-primary border border-m3-outline-variant/20 p-6 lg:p-8 shadow-lg group">
        {/* M3 Ambient Blurs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 left-20 w-72 h-72 bg-m3-secondary/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Decorative Floating Icons */}
        <div className="absolute top-4 right-16 w-20 h-20 opacity-20 group-hover:opacity-40 transition-opacity duration-700 animate-[spin_15s_linear_infinite] [animation-play-state:paused] group-hover:[animation-play-state:running] pointer-events-none">
          <FileQuestion className="w-full h-full text-white" />
        </div>
        <div className="absolute -bottom-8 right-40 w-32 h-32 opacity-10 group-hover:opacity-30 transition-opacity duration-700 animate-[bounce_8s_infinite] [animation-play-state:paused] group-hover:[animation-play-state:running] pointer-events-none">
          <HelpCircle className="w-full h-full text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-m3-on-primary/10 backdrop-blur-md border border-m3-on-primary/15 text-m3-on-primary text-xs font-semibold">
              <FileQuestion className="w-3.5 h-3.5" />
              Evaluasi & Computer Based Test (CBT)
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-m3-on-primary tracking-tight">
              Ujian & Kuis Interaktif
            </h1>
            <p className="text-indigo-200/90 text-sm max-w-xl leading-relaxed">
              {isTeacher
                ? 'Buat soal pilihan ganda, atur batas waktu pengerjaan, dan pantau hasil evaluasi pemahaman siswa secara otomatis.'
                : 'Uji pemahaman materi pembelajaran kejuruan dengan kuis interaktif dan dapatkan nilai langsung setelah selesai.'}
            </p>
          </div>

          {isTeacher && (
            <button
              onClick={() => setIsCreateQuizModalOpen(true)}
              className="px-6 py-3.5 rounded-full bg-m3-surface text-m3-primary hover:bg-m3-surface-variant font-bold text-sm shadow-m3-elevation-1 hover:shadow-m3-elevation-2 flex items-center gap-2 transition-all duration-300 ease-m3-standard active:scale-[0.98] cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" /> Buat Kuis Baru
            </button>
          )}
        </div>
      </div>

      {/* Alerts */}
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

      {/* Filter and Search Bar */}
      <div className="bg-m3-surface p-4 rounded-[1.5rem] border border-m3-outline-variant/30 shadow-m3-elevation-1 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto py-2 px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-300 ease-out cursor-pointer shrink-0 ${
              activeTab === 'all'
                ? 'bg-[#1e1b4b] text-white shadow-md scale-105'
                : 'text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-variant'
            }`}
          >
            Semua ({quizzes.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-300 ease-out cursor-pointer shrink-0 ${
              activeTab === 'active'
                ? 'bg-[#1e1b4b] text-white shadow-md scale-105'
                : 'text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-variant'
            }`}
          >
            {isTeacher ? 'Kuis Aktif' : 'Belum Dikerjakan'}
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-300 ease-out cursor-pointer shrink-0 ${
              activeTab === 'completed'
                ? 'bg-[#1e1b4b] text-white shadow-md scale-105'
                : 'text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-variant'
            }`}
          >
            Sudah Selesai
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-48">
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full pl-4 pr-8 py-2.5 bg-m3-surface-container border border-m3-outline-variant/50 rounded-xl text-xs font-bold text-m3-on-surface focus:outline-none focus:border-[#1e1b4b] transition-colors cursor-pointer appearance-none"
            >
              <option value="all">Semua Kelas ({classes.length})</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-m3-on-surface-variant">
              <ChevronRight className="w-4 h-4 rotate-90" />
            </div>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-m3-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari judul kuis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-m3-surface-container border border-m3-outline-variant/50 rounded-xl text-sm font-medium text-m3-on-surface placeholder-m3-on-surface-variant/70 focus:outline-none focus:border-[#1e1b4b] transition-colors"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-m3-on-surface-variant">
          <div className="inline-block w-8 h-8 border-4 border-[#1e1b4b] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-bold">Memuat daftar kuis CBT...</p>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="bg-m3-surface rounded-[2rem] border border-m3-outline-variant/30 p-16 text-center text-m3-on-surface-variant space-y-3 shadow-sm">
          <HelpCircle className="w-16 h-16 mx-auto text-m3-on-surface-variant/40 mb-3" />
          <p className="text-base font-bold text-m3-on-surface">Tidak ada kuis ditemukan</p>
          <p className="text-sm">Belum ada evaluasi kuis yang sesuai dengan filter pencarian Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredQuizzes.map((qz) => {
            const hasAttempt = qz.is_completed || (qz.score != null && qz.score !== undefined);

            return (
              <div
                key={qz.id}
                className="p-6 rounded-[1.75rem] bg-m3-surface border border-m3-outline-variant/30 shadow-m3-elevation-1 hover:shadow-m3-elevation-2 space-y-4 flex flex-col justify-between transition-all duration-300 ease-out group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-m3-primary/10 text-m3-primary flex items-center justify-center shrink-0">
                        <FileQuestion className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-m3-on-surface truncate">{qz.title}</h3>
                        <p className="text-xs text-m3-primary font-bold mt-0.5 truncate">{qz.className}</p>
                      </div>
                    </div>

                    {isTeacher && (
                      <button
                        type="button"
                        onClick={() => handleDeleteQuiz(qz.id)}
                        title="Hapus Kuis"
                        className="p-2 rounded-xl text-m3-on-surface-variant hover:text-m3-error hover:bg-m3-error-container/50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {qz.description && (
                    <p className="text-xs font-medium text-m3-on-surface-variant line-clamp-2 leading-relaxed">{qz.description}</p>
                  )}

                  <div className="flex items-center gap-3 text-xs font-bold text-m3-on-surface-variant pt-2">
                    <span className="flex items-center gap-1.5 bg-m3-surface-container px-2.5 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5" />
                      {qz.duration_minutes} Menit
                    </span>
                    <span className="flex items-center gap-1.5 bg-m3-surface-container px-2.5 py-1 rounded-lg">
                      <HelpCircle className="w-3.5 h-3.5" />
                      {qz.questions_count || qz.questions?.length || 0} Soal
                    </span>
                  </div>

                  {!isTeacher && hasAttempt && (
                    <div className="pt-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Nilai: {qz.score}/{qz.max_score || 100}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-m3-outline-variant/30 flex items-center justify-between">
                  {isTeacher ? (
                    <span className="text-xs font-bold text-m3-on-surface-variant">
                      {qz.attempts_count ?? 0} Siswa Mengerjakan
                    </span>
                  ) : (
                    <>
                      <Link
                        to={`/classes/${qz.class_id}`}
                        className="text-xs font-bold text-m3-on-surface-variant hover:text-m3-primary flex items-center gap-1 transition-colors group/link"
                      >
                        Lihat Kelas <ChevronRight className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform" />
                      </Link>
                      <Link
                        to={`/quiz/${qz.id}`}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full transition-all duration-300 ease-out active:scale-95 ${
                          hasAttempt
                            ? 'bg-m3-surface-container-high text-m3-on-surface hover:bg-m3-surface-variant'
                            : 'bg-m3-primary text-m3-on-primary hover:bg-m3-primary/90 shadow-m3-elevation-1'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>{hasAttempt ? 'Ulangi' : 'Mulai Ujian'}</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Shared Quiz Create Modal */}
      <QuizCreateModal
        isOpen={isCreateQuizModalOpen}
        onClose={() => setIsCreateQuizModalOpen(false)}
        classes={classes}
        onSuccess={(newQuiz) => {
          setQuizzes((prev) => [newQuiz, ...prev]);
          setSuccessMsg('Kuis evaluasi baru berhasil dibuat.');
        }}
      />
    </div>
  );
};
