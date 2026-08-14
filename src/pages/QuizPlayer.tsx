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
  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 mins in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptResult, setAttemptResult] = useState<{ score: number; total: number; attempt: QuizAttempt } | null>(null);

  useEffect(() => {
    if (!id) return;
    const loadQuiz = async () => {
      try {
        const q = await api.getQuizDetail(id);
        setQuiz(q);
        setTimeLeft((q.duration_minutes || 45) * 60);
      } catch (err) {
        console.error(err);
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

  const handleSelectOption = (questionId: string, optionKey: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
  };

  const handleSubmit = async () => {
    if (!id || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await api.submitQuiz(id, answers);
      setAttemptResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!quiz) {
    return <div className="p-8 text-center text-slate-400">Memuat data ujian online...</div>;
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
            <p className="text-slate-400 text-sm">Hasil evaluasi otomatis oleh sistem LMS Go Gin Backend</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Nilai Akhir Anda</span>
            <div className="text-5xl font-extrabold text-emerald-400">
              {attemptResult.score} <span className="text-2xl text-slate-500">/ {attemptResult.total}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/classes')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-colors cursor-pointer"
          >
            Kembali ke Ruang Kelas
          </button>
        </div>
      </div>
    );
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
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-colors cursor-pointer"
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
                Pertanyaan #{currentIdx + 1} ({currentQ.points} Poin)
              </span>
            </div>
            <p className="text-base font-semibold text-slate-100 leading-relaxed">
              {currentQ.question_text}
            </p>
          </div>

          {/* Options Radio List */}
          <div className="space-y-3 pt-2">
            {[
              { key: 'A', text: currentQ.option_a },
              { key: 'B', text: currentQ.option_b },
              { key: 'C', text: currentQ.option_c },
              { key: 'D', text: currentQ.option_d },
              ...(currentQ.option_e ? [{ key: 'E', text: currentQ.option_e }] : []),
            ].map((opt) => {
              const isSelected = answers[currentQ.id] === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => handleSelectOption(currentQ.id, opt.key)}
                  className={`w-full p-4 rounded-2xl border text-left flex items-start gap-4 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {opt.key}
                  </span>
                  <span className="text-sm font-medium pt-0.5">{opt.text}</span>
                </button>
              );
            })}
          </div>

          {/* Pagination Navigation Controls */}
          <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Soal Sebelumnya
            </button>

            {/* Questions Pipelined Grid Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-xs">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isCurrent = idx === currentIdx;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                        : isAnswered
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIdx === questions.length - 1}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
            >
              Soal Selanjutnya <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
