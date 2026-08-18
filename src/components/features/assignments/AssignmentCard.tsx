import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calendar, CheckCircle2, Clock, Users, ChevronRight, Trash2, Eye } from 'lucide-react';
import { Assignment } from '../../../types';
import { MaterialViewerModal } from '../materials/MaterialViewerModal';

interface AssignmentCardProps {
  assignment: Assignment & { className?: string };
  isTeacher: boolean;
  onDelete?: (id: string) => void;
  onOpenSubmissions?: (asg: Assignment) => void;
  onSubmitAssignment?: (asg: Assignment) => void;
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  isTeacher,
  onDelete,
  onOpenSubmissions,
  onSubmitAssignment,
}) => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const isSubmitted = assignment.is_submitted || !!assignment.submission;
  const score = assignment.score ?? assignment.submission?.score;

  return (
    <>
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3.5 flex flex-col justify-between hover:shadow-md transition group">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-xs text-slate-900 truncate">{assignment.title}</h3>
                {assignment.className && (
                  <p className="text-[10px] text-indigo-600 font-semibold">{assignment.className}</p>
                )}
              </div>
            </div>

            {isTeacher && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(assignment.id)}
                title="Hapus Tugas"
                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <Calendar className="w-3 h-3" />
            <span>
              Tenggat:{' '}
              {new Date(assignment.due_date).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>

          {!isTeacher && (
            <div className="pt-1">
              {isSubmitted ? (
                score != null ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="w-3 h-3" /> Nilai: {score}/{assignment.max_score || 100}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                    <CheckCircle2 className="w-3 h-3" /> Terkumpul
                  </span>
                )
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                  <Clock className="w-3 h-3" /> Belum Mengumpulkan
                </span>
              )}
            </div>
          )}

          {assignment.file_url && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsViewerOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-m3-on-primary-container bg-m3-primary-container hover:bg-m3-primary/15 rounded-full transition cursor-pointer active:scale-95"
              >
                <Eye className="w-3 h-3" /> Buka Lampiran Tugas
              </button>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
          {isTeacher ? (
            <>
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                <Users className="w-3 h-3" />
                {assignment.submission_count ?? 0} Siswa
              </span>
              {onOpenSubmissions && (
                <button
                  type="button"
                  onClick={() => onOpenSubmissions(assignment)}
                  className="px-3 py-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition cursor-pointer"
                >
                  Periksa
                </button>
              )}
            </>
          ) : (
            <>
              <Link
                to={`/classes/${assignment.class_id}`}
                className="text-[11px] font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-0.5"
              >
                Masuk Kelas <ChevronRight className="w-3 h-3" />
              </Link>
              {onSubmitAssignment && (
                <button
                  type="button"
                  onClick={() => onSubmitAssignment(assignment)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                    isSubmitted
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {isSubmitted ? 'Edit Jawaban' : 'Kumpulkan'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {assignment.file_url && (
        <MaterialViewerModal
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          title={assignment.title}
          fileUrl={assignment.file_url}
        />
      )}
    </>
  );
};
