import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (attemptResult || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, attemptResult]);

  const handleSelectOption = (questionId: string, optionValue: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionValue }));
  };

  const handleSubmit = async () => {
    if (!id || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await api.submitQuiz(id, answers);
      setAttemptResult(res);
    } catch (err: any) {
      alert(err.message || 'Gagal mengumpulkan jawaban ujian');
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
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
            <Award className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-white">Ujian Berhasil Dikumpulkan!</h1>
            <p className="text-slate-400 text-sm">Hasil evaluasi otomatis oleh mesin penilaian Go Gin Backend</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Nilai Akhir Anda</span>
            <div className="text-5xl font-extrabold text-emerald-400">
              {attemptResult.score} <span className="text-2xl text-slate-500">/ {attemptResult.total || 100}</span>
            </div>
          </div>

          <button
            onClick={() => navigate(`/classes/${quiz.class_id}`)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-colors cursor-pointer"
          >
            Kembali ke Ruang Kelas
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Belum Ada Soal di Ujian Ini</h2>
        <p className="text-sm text-slate-400">Guru belum menambahkan butir soal untuk kuis ini.</p>
        <button
          onClick={() => navigate(`/classes/${quiz.class_id}`)}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl cursor-pointer"
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
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-white line-clamp-1">{quiz.title}</h1>
          <p className="text-xs text-slate-400">Soal {currentIdx + 1} dari {questions.length}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-bold text-sm">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            {formatTime(timeLeft)}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" /> Selesaikan Ujian
          </button>
        </div>
      </div>

      {/* Main Question Card */}
      {currentQ && (
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
          {/* Question Text */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                Pertanyaan #{currentIdx + 1} ({currentQ.points || 10} Poin)
              </span>
            </div>
            <p className="text-base font-semibold text-slate-100 leading-relaxed">
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
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
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
          <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold text-xs flex items-center gap-1.5 disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Soal Sebelumnya
            </button>

            {currentIdx < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                Soal Berikutnya <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" /> Selesai & Kirim Ujian
              </button>
            )}
          </div>
        </div>
      )}

      {/* Number Navigation Map */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
        <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Navigasi Nomor Soal</span>
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
                    ? 'ring-2 ring-indigo-400 bg-indigo-600 text-white'
                    : isAnswered
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
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
