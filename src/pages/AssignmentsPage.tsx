import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services';
import { ClassRoom, Material, Assignment, Submission } from '../types';
import {
  FileText,
  BookOpen,
  Plus,
  CheckCircle2,
  Search,
  AlertCircle,
} from 'lucide-react';
import { MaterialCard } from '../components/features/materials/MaterialCard';
import { AssignmentCard } from '../components/features/assignments/AssignmentCard';
import { MaterialUploadModal } from '../components/features/materials/MaterialUploadModal';
import { AssignmentCreateModal } from '../components/features/assignments/AssignmentCreateModal';
import { AssignmentSubmitModal } from '../components/features/assignments/AssignmentSubmitModal';
import { SubmissionsListModal } from '../components/features/assignments/SubmissionsListModal';
import { GradingModal } from '../components/features/assignments/GradingModal';

export const AssignmentsPage: React.FC = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'guru' || user?.role === 'admin';

  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'materials' | 'assignments'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [materials, setMaterials] = useState<(Material & { className?: string })[]>([]);
  const [assignments, setAssignments] = useState<(Assignment & { className?: string })[]>([]);

  // Modals
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmissionsListOpen, setIsSubmissionsListOpen] = useState(false);
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);

  // Selected entities for actions
  const [selectedAsg, setSelectedAsg] = useState<Assignment | null>(null);
  const [currentSubmissions, setCurrentSubmissions] = useState<Submission[]>([]);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadAllData = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const clsData = await api.getClasses(false, { signal });
      if (signal?.aborted) return;
      setClasses(clsData);

      const matList: (Material & { className?: string })[] = [];
      const asgList: (Assignment & { className?: string })[] = [];

      await Promise.all(
        clsData.map(async (cls) => {
          try {
            const [cMats, cAsgs] = await Promise.all([
              api.getMaterials(cls.id, { signal }).catch(() => []),
              api.getAssignments(cls.id, { signal }).catch(() => []),
            ]);

            if (signal?.aborted) return;
            cMats.forEach((m) => matList.push({ ...m, className: cls.name }));
            cAsgs.forEach((a) => asgList.push({ ...a, className: cls.name }));
          } catch {
            // Ignore individual class errors
          }
        })
      );

      if (!signal?.aborted) {
        setMaterials(matList);
        setAssignments(asgList);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Failed to load materials and assignments:', err);
        setErrorMsg('Gagal memuat bahan ajar dan tugas.');
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadAllData(controller.signal);
    return () => {
      controller.abort();
    };
  }, [loadAllData]);

  // Filters
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      const matchClass = selectedClassId === 'all' || m.class_id === selectedClassId;
      const matchSearch =
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.className || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchClass && matchSearch;
    });
  }, [materials, selectedClassId, searchQuery]);

  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const matchClass = selectedClassId === 'all' || a.class_id === selectedClassId;
      const matchSearch =
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.instructions || a.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.className || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchClass && matchSearch;
    });
  }, [assignments, selectedClassId, searchQuery]);

  // Actions
  const handleDeleteMaterial = async (matId: string) => {
    if (!confirm('Hapus modul materi ini?')) return;
    try {
      await api.deleteMaterial(matId);
      setMaterials((prev) => prev.filter((m) => m.id !== matId));
      setSuccessMsg('Modul materi berhasil dihapus.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menghapus materi.');
    }
  };

  const handleDeleteAssignment = async (asgId: string) => {
    if (!confirm('Hapus penugasan ini?')) return;
    try {
      await api.deleteAssignment(asgId);
      setAssignments((prev) => prev.filter((a) => a.id !== asgId));
      setSuccessMsg('Penugasan berhasil dihapus.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menghapus tugas.');
    }
  };

  const handleOpenSubmissions = async (asg: Assignment) => {
    setSelectedAsg(asg);
    try {
      const subs = await api.getSubmissions(asg.id);
      setCurrentSubmissions(subs);
      setIsSubmissionsListOpen(true);
    } catch (err: any) {
      alert(err.message || 'Gagal memuat jawaban siswa');
    }
  };

  const handleOpenGrading = (sub: Submission) => {
    setSelectedSub(sub);
    setIsGradingModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 lg:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              Pusat Bahan Ajar & Tugas SMK
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">Modul & Tugas Pembelajaran</h1>
            <p className="text-slate-500 text-sm max-w-xl">
              {isTeacher
                ? 'Kelola modul materi ajar digital, bagikan tugas kepada siswa, dan tinjau pengumpulan tugas siswa secara berkala.'
                : 'Unduh bahan ajar guru, pelajari materi kejuruan, dan kumpulkan tugas sekolah sebelum batas waktu berakhir.'}
            </p>
          </div>

          {isTeacher && (
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => setIsMaterialModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-[#1e1b4b] hover:bg-slate-900 text-white font-bold text-xs shadow-md shadow-indigo-100 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> + Unggah Modul
              </button>
              <button
                onClick={() => setIsAssignmentModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-100 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> + Buat Tugas
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">×</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-700 hover:text-rose-900 font-bold">×</button>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'all'
                ? 'bg-[#1e1b4b] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Semua ({materials.length + assignments.length})
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'materials'
                ? 'bg-[#1e1b4b] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Modul & Materi ({materials.length})
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'assignments'
                ? 'bg-[#1e1b4b] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Tugas Siswa ({assignments.length})
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
          <div className="relative w-full sm:w-48">
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white cursor-pointer shadow-2xs"
            >
              <option value="all">Semua Kelas ({classes.length})</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari judul modul / tugas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white shadow-2xs"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-slate-500">
          <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm">Memuat modul & tugas dari seluruh kelas...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Materials Section */}
          {(activeTab === 'all' || activeTab === 'materials') && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Modul & Bahan Ajar Digital ({filteredMaterials.length})
              </h2>

              {filteredMaterials.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
                  Tidak ada modul materi yang ditemukan.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMaterials.map((mat) => (
                    <MaterialCard
                      key={mat.id}
                      material={mat}
                      isTeacher={isTeacher}
                      onDelete={handleDeleteMaterial}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Assignments Section */}
          {(activeTab === 'all' || activeTab === 'assignments') && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                Tugas & Evaluasi Pembelajaran ({filteredAssignments.length})
              </h2>

              {filteredAssignments.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
                  Tidak ada penugasan yang ditemukan.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAssignments.map((asg) => (
                    <AssignmentCard
                      key={asg.id}
                      assignment={asg}
                      isTeacher={isTeacher}
                      onDelete={handleDeleteAssignment}
                      onOpenSubmissions={handleOpenSubmissions}
                      onSubmitAssignment={(targetAsg) => {
                        setSelectedAsg(targetAsg);
                        setIsSubmitModalOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Shared Modals */}
      <MaterialUploadModal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        classes={classes}
        onSuccess={(newMat) => {
          setMaterials((prev) => [newMat, ...prev]);
          setSuccessMsg('Modul materi ajar berhasil diterbitkan.');
        }}
      />

      <AssignmentCreateModal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        classes={classes}
        onSuccess={(newAsg) => {
          setAssignments((prev) => [newAsg, ...prev]);
          setSuccessMsg('Penugasan berhasil diterbitkan ke kelas.');
        }}
      />

      <AssignmentSubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        assignment={selectedAsg}
        onSuccess={(sub) => {
          setAssignments((prev) =>
            prev.map((a) =>
              a.id === selectedAsg?.id ? { ...a, is_submitted: true, submission: sub } : a
            )
          );
          setSuccessMsg('Tugas berhasil dikumpulkan.');
        }}
      />

      <SubmissionsListModal
        isOpen={isSubmissionsListOpen}
        onClose={() => setIsSubmissionsListOpen(false)}
        assignment={selectedAsg}
        submissions={currentSubmissions}
        onOpenGrading={handleOpenGrading}
      />

      <GradingModal
        isOpen={isGradingModalOpen}
        onClose={() => setIsGradingModalOpen(false)}
        submission={selectedSub}
        maxScore={selectedAsg?.max_score || 100}
        onSuccess={(subId, score, feedback) => {
          setCurrentSubmissions((prev) =>
            prev.map((s) => (s.id === subId ? { ...s, score, feedback, status: 'graded' } : s))
          );
          setAssignments((prev) =>
            prev.map((a) => {
              if (a.id === selectedAsg?.id && a.submission?.id === subId) {
                return {
                  ...a,
                  score,
                  submission: { ...a.submission, score, feedback, status: 'graded' },
                };
              }
              return a;
            })
          );
          setSuccessMsg('Nilai tugas berhasil disimpan.');
        }}
      />
    </div>
  );
};
