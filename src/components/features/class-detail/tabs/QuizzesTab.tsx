import React from 'react';
import { Plus, HelpCircle, Clock, Award, Play, CheckCircle2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Quiz } from '../../../../types';

interface QuizzesTabProps {
  quizzes: Quiz[];
  isTeacher: boolean;
  onOpenCreateModal: () => void;
  onDeleteQuiz: (id: string) => Promise<void>;
}

export const QuizzesTab: React.FC<QuizzesTabProps> = ({
  quizzes,
  isTeacher,
  onOpenCreateModal,
  onDeleteQuiz,
}) => {
  return (
    <div className="space-y-6">
      {isTeacher && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="px-5 py-2.5 bg-[#1e1b4b] hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-indigo-100 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Buat Kuis & Ujian Baru
          </button>
        </div>
      )}

      {quizzes.length === 0 ? (
        <div className="bg-white p-10 text-center text-slate-500 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <HelpCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="font-bold text-slate-700 text-sm">Belum ada kuis aktif</p>
          <p className="text-xs text-slate-400">Guru belum mempublikasikan kuis atau ujian untuk kelas ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map((qz) => {
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
                        <h3 className="font-bold text-slate-900 text-sm truncate">{qz.title}</h3>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {qz.duration_minutes} Menit
                          </span>
                          <span>•</span>
                          <span>{qz.questions_count || qz.questions?.length || 0} Soal</span>
                        </div>
                      </div>
                    </div>

                    {isTeacher && (
                      <button
                        type="button"
                        onClick={() => onDeleteQuiz(qz.id)}
                        title="Hapus Kuis"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition opacity-80 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {qz.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed whitespace-pre-wrap">
                      {qz.description}
                    </p>
                  )}

                  {!isTeacher && hasAttempt && (
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="w-3 h-3" />
                        Nilai Ujian: {qz.score}/{qz.max_score || 100}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  {isTeacher ? (
                    <span className="text-xs font-semibold text-slate-600">
                      {qz.attempts_count ?? 0} Siswa Telah Mengerjakan
                    </span>
                  ) : (
                    <>
                      <span className="text-[11px] text-slate-400">
                        {hasAttempt ? 'Ujian telah diselesaikan' : 'Siap dikerjakan'}
                      </span>
                      <Link
                        to={`/quiz/${qz.id}`}
                        className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-xl transition ${
                          hasAttempt
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>{hasAttempt ? 'Kerjakan Ulang' : 'Mulai Kuis'}</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
