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
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 lg:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold">
              <FileQuestion className="w-3.5 h-3.5 text-emerald-600" />
              Evaluasi & Computer Based Test (CBT)
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">Ujian & Kuis Interaktif</h1>
            <p className="text-slate-500 text-sm max-w-xl">
              {isTeacher
                ? 'Buat soal pilihan ganda, atur batas waktu pengerjaan, dan pantau hasil evaluasi pemahaman siswa secara otomatis.'
                : 'Uji pemahaman materi pembelajaran kejuruan dengan kuis interaktif dan dapatkan nilai langsung setelah selesai.'}
            </p>
          </div>

          {isTeacher && (
            <button
              onClick={() => setIsCreateQuizModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-100 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> + Buat Kuis Baru
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
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
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
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'active'
                ? 'bg-[#1e1b4b] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {isTeacher ? 'Kuis Aktif' : 'Belum Dikerjakan'}
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'completed'
                ? 'bg-[#1e1b4b] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Sudah Selesai
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
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

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari judul kuis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white shadow-2xs"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-slate-500">
          <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm">Memuat daftar kuis CBT...</p>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
          <HelpCircle className="w-12 h-12 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-bold text-slate-700">Tidak ada kuis ditemukan</p>
          <p className="text-xs text-slate-400">Belum ada evaluasi kuis yang sesuai dengan filter pencarian Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuizzes.map((qz) => {
            const hasAttempt = qz.is_completed || (qz.score != null && qz.score !== undefined);

            return (
              <div
                key={qz.id}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3.5 flex flex-col justify-between hover:shadow-md transition group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <HelpCircle className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-xs text-slate-900 truncate">{qz.title}</h3>
                        <p className="text-[10px] text-indigo-600 font-semibold">{qz.className}</p>
                      </div>
                    </div>

                    {isTeacher && (
                      <button
                        type="button"
                        onClick={() => handleDeleteQuiz(qz.id)}
                        title="Hapus Kuis"
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {qz.description && (
                    <p className="text-xs text-slate-600 line-clamp-2">{qz.description}</p>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {qz.duration_minutes} Menit
                    </span>
                    <span>•</span>
                    <span>{qz.questions_count || qz.questions?.length || 0} Soal</span>
                  </div>

                  {!isTeacher && hasAttempt && (
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="w-3 h-3" /> Nilai: {qz.score}/{qz.max_score || 100}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  {isTeacher ? (
                    <span className="text-[11px] font-semibold text-slate-500">
                      {qz.attempts_count ?? 0} Siswa Mengerjakan
                    </span>
                  ) : (
                    <>
                      <Link
                        to={`/classes/${qz.class_id}`}
                        className="text-[11px] font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-0.5"
                      >
                        Lihat Kelas <ChevronRight className="w-3 h-3" />
                      </Link>
                      <Link
                        to={`/quiz/${qz.id}`}
                        className={`inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
                          hasAttempt
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                        }`}
                      >
                        <Play className="w-3 h-3" />
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
