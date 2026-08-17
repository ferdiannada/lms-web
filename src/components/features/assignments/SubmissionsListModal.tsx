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
      <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1 custom-scrollbar">
        {submissions.length === 0 ? (
          <div className="text-center py-10 bg-m3-surface-container/30 rounded-[1.25rem] border border-m3-outline-variant/30 border-dashed">
            <FileText className="w-12 h-12 mx-auto mb-3 text-m3-on-surface-variant/40" />
            <p className="text-sm font-bold text-m3-on-surface">Belum ada siswa yang mengumpulkan.</p>
            <p className="text-xs text-m3-on-surface-variant mt-1">Pengumpulan tugas akan muncul di sini secara real-time.</p>
          </div>
        ) : (
          submissions.map((sub) => (
            <div
              key={sub.id}
              className="p-4 bg-m3-surface-container hover:bg-m3-surface-container-high rounded-[1.25rem] border border-m3-outline-variant/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
            >
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-m3-on-surface truncate">
                    {sub.student_name}
                  </span>
                  {sub.score != null ? (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Nilai: {sub.score}/{assignment?.max_score || 100}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      <Clock className="w-3.5 h-3.5" />
                      Menunggu Nilai
                    </span>
                  )}
                </div>

                {sub.notes && (
                  <p className="text-xs text-m3-on-surface-variant line-clamp-2 bg-m3-surface p-2.5 rounded-xl border border-m3-outline-variant/30 font-medium">
                    "{sub.notes}"
                  </p>
                )}

                {sub.file_url && (
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={sanitizeUrl(sub.file_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-m3-primary hover:text-m3-primary/80 hover:underline transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      {sub.file_name || 'Unduh Lampiran Siswa'}
                    </a>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => onOpenGrading(sub)}
                  className="px-4 py-2 text-xs font-bold bg-m3-primary hover:bg-m3-primary/90 text-m3-on-primary rounded-full shadow-m3-elevation-1 hover:shadow-m3-elevation-2 transition-all duration-300 ease-out active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
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
