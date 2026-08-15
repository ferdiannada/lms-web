import React from 'react';
import { Download, ExternalLink, Award, FileText, CheckCircle2, Clock } from 'lucide-react';
import { Modal } from '../../Modal';
import { Assignment, Submission } from '../../../types';

import { sanitizeUrl } from '../../../utils/security';

interface SubmissionsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  submissions: Submission[];
  onOpenGrading: (sub: Submission) => void;
}

export const SubmissionsListModal: React.FC<SubmissionsListModalProps> = ({
  isOpen,
  onClose,
  assignment,
  submissions,
  onOpenGrading,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={assignment ? `Pengumpulan Tugas: ${assignment.title}` : 'Daftar Pengumpulan'}
    >
      <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
        {submissions.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-semibold text-slate-600">Belum ada siswa yang mengumpulkan.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Pengumpulan tugas akan muncul di sini secara real-time.</p>
          </div>
        ) : (
          submissions.map((sub) => (
            <div
              key={sub.id}
              className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {sub.student_name}
                  </span>
                  {sub.score != null ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="w-3 h-3" />
                      Nilai: {sub.score}/{assignment?.max_score || 100}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-700">
                      <Clock className="w-3 h-3" />
                      Menunggu Nilai
                    </span>
                  )}
                </div>

                {sub.notes && (
                  <p className="text-[11px] text-slate-600 line-clamp-2 bg-white/70 p-1.5 rounded-lg border border-slate-200/50">
                    "{sub.notes}"
                  </p>
                )}

                {sub.file_url && (
                  <div className="flex items-center gap-2 pt-0.5">
                    <a
                      href={sanitizeUrl(sub.file_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      <Download className="w-3 h-3" />
                      {sub.file_name || 'Unduh Lampiran Siswa'}
                    </a>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => onOpenGrading(sub)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs hover:shadow transition flex items-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>{sub.score != null ? 'Edit Nilai' : 'Beri Nilai'}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};
