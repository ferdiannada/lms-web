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
            className="px-6 py-3 bg-m3-primary hover:bg-m3-primary/90 text-m3-on-primary font-bold text-xs rounded-full flex items-center gap-2 shadow-m3-elevation-2 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Buat Kuis & Ujian Baru
          </button>
        </div>
      )}

      {quizzes.length === 0 ? (
        <div className="bg-m3-surface p-12 text-center text-m3-on-surface-variant rounded-[2rem] border border-m3-outline-variant/30 shadow-m3-elevation-1 space-y-2">
          <HelpCircle className="w-12 h-12 mx-auto text-m3-outline-variant mb-3 opacity-50" />
          <p className="font-bold text-m3-on-surface text-sm">Belum ada kuis aktif</p>
          <p className="text-xs text-m3-on-surface-variant">Guru belum mempublikasikan kuis atau ujian untuk kelas ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {quizzes.map((qz) => {
            const hasAttempt = qz.is_completed || (qz.score != null && qz.score !== undefined);

            return (
              <div
                key={qz.id}
                className="p-6 rounded-[1.5rem] bg-m3-surface border border-m3-outline-variant/30 shadow-m3-elevation-1 space-y-4 flex flex-col justify-between hover:shadow-m3-elevation-2 transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-[1rem] bg-m3-tertiary-container text-m3-on-tertiary-container flex items-center justify-center shrink-0">
                        <HelpCircle className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-m3-on-surface text-sm truncate leading-tight">{qz.title}</h3>
                        <div className="flex items-center gap-3 text-[10px] text-m3-on-surface-variant mt-1 font-medium">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {qz.duration_minutes} Menit
                          </span>
                          <span>•</span>
                          <span className="font-bold text-m3-on-surface-variant/80">{qz.questions_count || qz.questions?.length || 0} Soal</span>
                        </div>
                      </div>
                    </div>

                    {isTeacher && (
                      <button
                        type="button"
                        onClick={() => onDeleteQuiz(qz.id)}
                        title="Hapus Kuis"
                        className="p-2 rounded-xl text-m3-on-surface-variant hover:text-rose-600 hover:bg-rose-50 transition opacity-80 group-hover:opacity-100 cursor-pointer active:scale-90"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {qz.description && (
                    <p className="text-xs text-m3-on-surface-variant line-clamp-2 leading-relaxed whitespace-pre-wrap">
                      {qz.description}
                    </p>
                  )}

                  {!isTeacher && hasAttempt && (
                    <div className="pt-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Nilai Ujian: {qz.score}/{qz.max_score || 100}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-m3-outline-variant/20 flex items-center justify-between">
                  {isTeacher ? (
                    <span className="text-xs font-semibold text-m3-on-surface">
                      {qz.attempts_count ?? 0} Siswa Telah Mengerjakan
                    </span>
                  ) : (
                    <>
                      <span className="text-[11px] text-m3-on-surface-variant font-medium">
                        {hasAttempt ? 'Ujian telah diselesaikan' : 'Siap dikerjakan'}
                      </span>
                      <Link
                        to={`/quiz/${qz.id}`}
                        className={`inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold rounded-full transition-all active:scale-95 cursor-pointer ${
                          hasAttempt
                            ? 'bg-m3-surface-container-highest text-m3-on-surface hover:bg-m3-surface-variant'
                            : 'bg-m3-primary text-m3-on-primary shadow-m3-elevation-1 hover:shadow-m3-elevation-2'
                        }`}
                      >
                        <Play className="w-4 h-4" />
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
