import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Quiz, Question, QuizAttempt } from '../types';
import { Clock, CheckCircle2, ChevronLeft, ChevronRight, Award, AlertTriangle, Send } from 'lucide-react';

export const QuizPlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptResult, setAttemptResult] = useState<{ score: number; total: number; attempt: QuizAttempt } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use ref to keep latest answers available for timer auto-submit without stale closure
  const answersRef = useRef<Record<string, string>>({});
  answersRef.current = answers;

  useEffect(() => {
    if (!id) return;
    const loadQuiz = async () => {
      setIsLoading(true);
      try {
        const q = await api.getQuizDetail(id);
        setQuiz(q);
        setTimeLeft((q.duration_minutes || 30) * 60);
        // Start quiz attempt in backend if needed
        await api.startQuiz(id).catch(() => {});
      } catch (err: any) {
        console.error('Failed to load quiz:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadQuiz();
  }, [id]);

  // Clean timer with fixed tick that does not re-create interval every second
  useEffect(() => {
    if (isLoading || !quiz || attemptResult) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(answersRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading, !!quiz, !!attemptResult]);

  const handleSelectOption = (questionId: string, optionValue: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionValue }));
  };

  // Synchronous submit lock ref to prevent simultaneous double submission
  const isSubmittingRef = useRef(false);

  const handleSubmit = async (submitAnswers?: Record<string, string>) => {
    if (!id || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    const finalAnswers = submitAnswers || answersRef.current;
    setIsSubmitting(true);
    try {
      const res = await api.submitQuiz(id, finalAnswers);
      setAttemptResult(res);
    } catch (err: any) {
      alert(err.message || 'Gagal mengumpulkan jawaban ujian');
      isSubmittingRef.current = false;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !quiz) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p>Memuat lembar ujian online...</p>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const questions = quiz.questions || [];
  const currentQ = questions[currentIdx];

  // If Quiz finished
  if (attemptResult) {
    return (
      <div className="max-w-2xl mx-auto py-12 space-y-6 animate-in fade-in">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200">
            <Award className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-slate-900">Ujian Berhasil Dikumpulkan!</h1>
            <p className="text-slate-500 text-sm">Hasil evaluasi otomatis oleh mesin penilaian Go Gin Backend</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Nilai Akhir Anda</span>
            <div className="text-5xl font-black text-emerald-600">
              {attemptResult.score} <span className="text-2xl text-slate-400">/ {attemptResult.total || 100}</span>
            </div>
          </div>

          <button
            onClick={() => navigate(`/classes/${quiz.class_id}`)}
            className="px-6 py-3 bg-[#1e1b4b] hover:bg-slate-900 text-white font-bold rounded-xl shadow-md shadow-indigo-100 transition-colors cursor-pointer"
          >
            Kembali ke Ruang Kelas
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Belum Ada Soal di Ujian Ini</h2>
        <p className="text-sm text-slate-500">Guru belum menambahkan butir soal untuk kuis ini.</p>
        <button
          onClick={() => navigate(`/classes/${quiz.class_id}`)}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl cursor-pointer"
        >
          Kembali ke Kelas
        </button>
      </div>
    );
  }

  // Determine options to render
  const optionsToRender: { label: string; text: string; value: string }[] = [];
  if (currentQ) {
    if (Array.isArray(currentQ.options) && currentQ.options.length > 0) {
      currentQ.options.forEach((opt) => {
        optionsToRender.push({
          label: opt.label || '•',
          text: opt.text,
          value: opt.id || opt.label,
        });
      });
    } else {
      if (currentQ.option_a) optionsToRender.push({ label: 'A', text: currentQ.option_a, value: 'A' });
      if (currentQ.option_b) optionsToRender.push({ label: 'B', text: currentQ.option_b, value: 'B' });
      if (currentQ.option_c) optionsToRender.push({ label: 'C', text: currentQ.option_c, value: 'C' });
      if (currentQ.option_d) optionsToRender.push({ label: 'D', text: currentQ.option_d, value: 'D' });
      if (currentQ.option_e) optionsToRender.push({ label: 'E', text: currentQ.option_e, value: 'E' });
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      {/* Quiz Top Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div>
          <h1 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1">{quiz.title}</h1>
          <p className="text-xs text-slate-500">Soal {currentIdx + 1} dari {questions.length}</p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2.5">
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-mono font-bold text-xs sm:text-sm">
            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
            {formatTime(timeLeft)}
          </div>

          <button
            onClick={() => handleSubmit()}
            disabled={isSubmitting}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" /> Selesaikan Ujian
          </button>
        </div>
      </div>

      {/* Main Question Card */}
      {currentQ && (
        <div className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          {/* Question Text */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Pertanyaan #{currentIdx + 1} ({currentQ.points || 10} Poin)
              </span>
            </div>
            <p className="text-base font-bold text-slate-900 leading-relaxed">
              {currentQ.question_text}
            </p>
          </div>

          {/* Options Radio List */}
          <div className="space-y-3 pt-2">
            {optionsToRender.map((opt) => {
              const qKey = currentQ.id || String(currentIdx);
              const isSelected = answers[qKey] === opt.value || answers[qKey] === opt.label;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectOption(qKey, opt.value)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-4 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950 font-semibold ring-1 ring-indigo-200 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 ${
                      isSelected ? 'bg-[#1e1b4b] text-white' : 'bg-white border border-slate-200 text-slate-600'
                    }`}
                  >
                    {opt.label}
                  </div>
                  <span className="text-sm font-medium leading-normal">{opt.text}</span>
                </button>
              );
            })}
          </div>

          {/* Bottom Pagination Buttons */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Soal Sebelumnya
            </button>

            {currentIdx < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                className="px-4 py-2 rounded-xl bg-[#1e1b4b] hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-100 cursor-pointer"
              >
                Soal Berikutnya <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => handleSubmit()}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-100 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" /> Selesai & Kirim Ujian
              </button>
            )}
          </div>
        </div>
      )}

      {/* Number Navigation Map */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Navigasi Nomor Soal</span>
        <div className="flex flex-wrap gap-2">
          {questions.map((q, idx) => {
            const key = q.id || String(idx);
            const isAnswered = Boolean(answers[key]);
            const isCurrent = idx === currentIdx;
            return (
              <button
                key={key}
                onClick={() => setCurrentIdx(idx)}
                className={`w-9 h-9 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  isCurrent
                    ? 'ring-2 ring-indigo-400 bg-[#1e1b4b] text-white shadow-xs'
                    : isAnswered
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
