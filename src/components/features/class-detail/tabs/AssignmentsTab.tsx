import React, { useState, useEffect, useCallback } from 'react';
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
import { Assignment, Submission } from '../../../../types';
import { api } from '../../../../services/api';
import { AssignmentCreateModal } from '../../assignments/AssignmentCreateModal';
import { AssignmentSubmitModal } from '../../assignments/AssignmentSubmitModal';
import { SubmissionsListModal } from '../../assignments/SubmissionsListModal';
import { GradingModal } from '../../assignments/GradingModal';

interface AssignmentsTabProps {
  classId: string;
  isTeacher: boolean;
}

export const AssignmentsTab: React.FC<AssignmentsTabProps> = ({ classId, isTeacher }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAsg, setSelectedAsg] = useState<Assignment | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  
  const [isSubmissionsListOpen, setIsSubmissionsListOpen] = useState(false);
  const [currentSubmissions, setCurrentSubmissions] = useState<Submission[]>([]);
  
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);

  const fetchAssignments = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    try {
      const data = await api.getAssignments(classId, { signal });
      if (!signal?.aborted) setAssignments(data);
    } catch (err: any) {
      if (err.name !== 'AbortError') console.error('Failed to load assignments:', err);
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    const controller = new AbortController();
    fetchAssignments(controller.signal);
    return () => controller.abort();
  }, [fetchAssignments]);

  const handleDeleteAssignment = async (asgId: string) => {
    if (!confirm('Yakin ingin menghapus tugas ini?')) return;
    try {
      await api.deleteAssignment(asgId);
      setAssignments((prev) => prev.filter((a) => a.id !== asgId));
    } catch (err) {
      alert('Gagal menghapus tugas.');
    }
  };

  const handleOpenSubmitModal = (asg: Assignment) => {
    setSelectedAsg(asg);
    setIsSubmitModalOpen(true);
  };

  const handleOpenSubmissionsList = async (asg: Assignment) => {
    setSelectedAsg(asg);
    try {
      const subs = await api.getSubmissions(asg.id);
      setCurrentSubmissions(subs);
      setIsSubmissionsListOpen(true);
    } catch (err: any) {
      alert(err.message || 'Gagal memuat jawaban siswa');
    }
  };

  const handleOpenGradingModal = (sub: Submission) => {
    setSelectedSub(sub);
    setIsGradingModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-3">
        <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold">Memuat tugas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isTeacher && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-m3-primary hover:bg-m3-primary/90 text-m3-on-primary font-bold text-xs rounded-full flex items-center gap-2 shadow-m3-elevation-2 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Buat Penugasan Baru
          </button>
        </div>
      )}

      {assignments.length === 0 ? (
        <div className="bg-m3-surface p-12 text-center text-m3-on-surface-variant rounded-[2rem] border border-m3-outline-variant/30 shadow-m3-elevation-1 space-y-2">
          <FileText className="w-12 h-12 mx-auto text-m3-outline-variant mb-3 opacity-50" />
          <p className="font-bold text-m3-on-surface text-sm">Belum ada tugas atau evaluasi</p>
          <p className="text-xs text-m3-on-surface-variant">Tidak ada penugasan aktif pada kelas ini saat ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {assignments.map((asg) => {
            const isSubmitted = asg.is_submitted || !!asg.submission;
            const score = asg.score ?? asg.submission?.score;

            return (
              <div
                key={asg.id}
                className="p-6 rounded-[1.5rem] bg-m3-surface border border-m3-outline-variant/30 shadow-m3-elevation-1 space-y-4 flex flex-col justify-between hover:shadow-m3-elevation-2 transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-[1rem] bg-m3-secondary-container text-m3-on-secondary-container flex items-center justify-center shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-m3-on-surface text-sm truncate leading-tight">{asg.title}</h3>
                        <div className="flex items-center gap-1.5 text-[10px] text-m3-on-surface-variant mt-1 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
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
                        onClick={() => handleDeleteAssignment(asg.id)}
                        title="Hapus Tugas"
                        className="p-2 rounded-xl text-m3-on-surface-variant hover:text-rose-600 hover:bg-rose-50 transition opacity-80 group-hover:opacity-100 cursor-pointer active:scale-90"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {(asg.instructions || asg.description) && (
                    <p className="text-xs text-m3-on-surface-variant line-clamp-3 leading-relaxed whitespace-pre-wrap">
                      {asg.instructions || asg.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-m3-surface-container-highest text-m3-on-surface">
                      <Award className="w-3.5 h-3.5 text-m3-primary" />
                      Maks. {asg.max_score || 100} Poin
                    </span>

                    {!isTeacher && (
                      <>
                        {isSubmitted ? (
                          score != null ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Dinilai: {score}/{asg.max_score || 100}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-m3-primary-container text-m3-on-primary-container">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Telah Dikumpulkan
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-m3-error-container text-m3-on-error-container">
                            <Clock className="w-3.5 h-3.5" />
                            Belum Mengumpulkan
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-m3-outline-variant/20 flex items-center justify-between">
                  {isTeacher ? (
                    <>
                      <span className="text-xs font-semibold text-m3-on-surface flex items-center gap-2">
                        <Users className="w-4 h-4 text-m3-on-surface-variant" />
                        {asg.submission_count ?? 0} Siswa Mengumpulkan
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenSubmissionsList(asg)}
                        className="px-5 py-2.5 text-xs font-bold text-m3-on-primary-container bg-m3-primary-container hover:bg-m3-primary/15 rounded-full transition-all active:scale-95 cursor-pointer"
                      >
                        Periksa Tugas
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-[11px] text-m3-on-surface-variant font-medium">
                        {isSubmitted ? 'Pengumpulan tersimpan' : 'Siap dikumpulkan'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenSubmitModal(asg)}
                        className={`px-5 py-2.5 text-xs font-bold rounded-full transition-all active:scale-95 cursor-pointer ${
                          isSubmitted
                            ? 'bg-m3-surface-container-highest text-m3-on-surface hover:bg-m3-surface-variant'
                            : 'bg-m3-primary text-m3-on-primary shadow-m3-elevation-1 hover:shadow-m3-elevation-2'
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

      {isCreateModalOpen && (
        <AssignmentCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          defaultClassId={classId}
          onSuccess={() => {
            fetchAssignments();
          }}
        />
      )}

      {isSubmitModalOpen && selectedAsg && (
        <AssignmentSubmitModal
          isOpen={isSubmitModalOpen}
          onClose={() => {
            setIsSubmitModalOpen(false);
            setSelectedAsg(null);
          }}
          assignment={selectedAsg}
          onSuccess={() => {
            fetchAssignments();
          }}
        />
      )}

      {isSubmissionsListOpen && selectedAsg && (
        <SubmissionsListModal
          isOpen={isSubmissionsListOpen}
          onClose={() => setIsSubmissionsListOpen(false)}
          assignment={selectedAsg}
          submissions={currentSubmissions}
          onOpenGrading={handleOpenGradingModal}
        />
      )}

      {isGradingModalOpen && selectedSub && (
        <GradingModal
          isOpen={isGradingModalOpen}
          onClose={() => {
            setIsGradingModalOpen(false);
            setSelectedSub(null);
            if (selectedAsg) handleOpenSubmissionsList(selectedAsg);
          }}
          submission={selectedSub}
          onSuccess={() => {
            fetchAssignments();
          }}
        />
      )}
    </div>
  );
};
