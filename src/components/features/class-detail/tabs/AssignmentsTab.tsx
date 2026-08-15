import React from 'react';
import {
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  Calendar,
  Trash2,
  Award,
  Users,
} from 'lucide-react';
import { Assignment } from '../../../../types';

interface AssignmentsTabProps {
  assignments: Assignment[];
  isTeacher: boolean;
  onOpenCreateModal: () => void;
  onOpenSubmitModal: (asg: Assignment) => void;
  onOpenSubmissionsList: (asg: Assignment) => void;
  onDeleteAssignment: (id: string) => Promise<void>;
}

export const AssignmentsTab: React.FC<AssignmentsTabProps> = ({
  assignments,
  isTeacher,
  onOpenCreateModal,
  onOpenSubmitModal,
  onOpenSubmissionsList,
  onDeleteAssignment,
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
            <Plus className="w-4 h-4" /> Buat Penugasan Baru
          </button>
        </div>
      )}

      {assignments.length === 0 ? (
        <div className="bg-white p-10 text-center text-slate-500 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="font-bold text-slate-700 text-sm">Belum ada tugas atau evaluasi</p>
          <p className="text-xs text-slate-400">Tidak ada penugasan aktif pada kelas ini saat ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((asg) => {
            const isSubmitted = asg.is_submitted || !!asg.submission;
            const score = asg.score ?? asg.submission?.score;

            return (
              <div
                key={asg.id}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3.5 flex flex-col justify-between hover:shadow-md transition group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm truncate">{asg.title}</h3>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>
                            Tenggat:{' '}
                            {new Date(asg.due_date).toLocaleString('id-ID', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isTeacher && (
                      <button
                        type="button"
                        onClick={() => onDeleteAssignment(asg.id)}
                        title="Hapus Tugas"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition opacity-80 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {(asg.instructions || asg.description) && (
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                      {asg.instructions || asg.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      <Award className="w-3 h-3 text-amber-500" />
                      Maks. {asg.max_score || 100} Poin
                    </span>

                    {!isTeacher && (
                      <>
                        {isSubmitted ? (
                          score != null ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                              <CheckCircle2 className="w-3 h-3" />
                              Dinilai: {score}/{asg.max_score || 100}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                              <CheckCircle2 className="w-3 h-3" />
                              Telah Dikumpulkan
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                            <Clock className="w-3 h-3" />
                            Belum Mengumpulkan
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  {isTeacher ? (
                    <>
                      <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {asg.submission_count ?? 0} Siswa Mengumpulkan
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenSubmissionsList(asg)}
                        className="px-3.5 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition"
                      >
                        Periksa Tugas
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-[11px] text-slate-400">
                        {isSubmitted ? 'Pengumpulan tersimpan' : 'Siap dikumpulkan'}
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenSubmitModal(asg)}
                        className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${
                          isSubmitted
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                        }`}
                      >
                        {isSubmitted ? 'Kirim Ulang / Edit' : 'Kumpulkan Tugas'}
                      </button>
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
