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
      <div className="relative overflow-hidden rounded-[2rem] bg-m3-primary border border-m3-outline-variant/20 p-6 lg:p-8 shadow-lg group">
        {/* M3 Ambient Blurs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 left-20 w-72 h-72 bg-m3-secondary/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Decorative Floating Icons */}
        <div className="absolute top-4 right-16 w-20 h-20 opacity-20 group-hover:opacity-40 transition-opacity duration-700 animate-[spin_15s_linear_infinite] [animation-play-state:paused] group-hover:[animation-play-state:running] pointer-events-none">
          <BookOpen className="w-full h-full text-white" />
        </div>
        <div className="absolute -bottom-8 right-40 w-32 h-32 opacity-10 group-hover:opacity-30 transition-opacity duration-700 animate-[bounce_8s_infinite] [animation-play-state:paused] group-hover:[animation-play-state:running] pointer-events-none">
          <FileText className="w-full h-full text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-m3-on-primary/10 backdrop-blur-md border border-m3-on-primary/15 text-m3-on-primary text-xs font-semibold">
              <FileText className="w-3.5 h-3.5" />
              Pusat Bahan Ajar & Tugas SMK
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-m3-on-primary tracking-tight">
              Modul & Tugas Pembelajaran
            </h1>
            <p className="text-indigo-200/90 text-sm max-w-xl leading-relaxed">
              {isTeacher
                ? 'Kelola modul materi ajar digital, bagikan tugas kepada siswa, dan tinjau pengumpulan tugas siswa secara berkala.'
                : 'Unduh bahan ajar guru, pelajari materi kejuruan, dan kumpulkan tugas sekolah sebelum batas waktu berakhir.'}
            </p>
          </div>

          {isTeacher && (
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => setIsMaterialModalOpen(true)}
                className="px-6 py-3.5 rounded-full bg-m3-surface text-m3-primary hover:bg-m3-surface-variant font-bold text-sm shadow-m3-elevation-1 hover:shadow-m3-elevation-2 flex items-center gap-2 transition-all duration-300 ease-m3-standard active:scale-[0.98] cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Unggah Modul
              </button>
              <button
                onClick={() => setIsAssignmentModalOpen(true)}
                className="px-6 py-3.5 rounded-full bg-m3-tertiary hover:bg-m3-tertiary/90 text-m3-on-tertiary font-bold text-sm shadow-m3-elevation-1 hover:shadow-m3-elevation-2 flex items-center gap-2 transition-all duration-300 ease-m3-standard active:scale-[0.98] cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Buat Tugas
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-4 rounded-[1.25rem] bg-m3-primary-container/50 border border-m3-primary/20 text-m3-on-primary-container text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-m3-primary" />
            <span className="font-medium">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-m3-on-primary-container hover:text-m3-primary font-bold cursor-pointer transition-colors">×</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-[1.25rem] bg-m3-error-container/50 border border-m3-error/20 text-m3-on-error-container text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-m3-error" />
            <span className="font-medium">{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-m3-on-error-container hover:text-m3-error font-bold cursor-pointer transition-colors">×</button>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="bg-m3-surface p-4 rounded-[1.5rem] border border-m3-outline-variant/30 shadow-m3-elevation-1 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto py-2 px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-500 ease-m3-standard active:scale-90 cursor-pointer shrink-0 ${
              activeTab === 'all'
                ? 'bg-[#1e1b4b] text-white shadow-md scale-105'
                : 'text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-container'
            }`}
          >
            Semua ({materials.length + assignments.length})
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-500 ease-m3-standard active:scale-90 cursor-pointer shrink-0 flex items-center gap-2 ${
              activeTab === 'materials'
                ? 'bg-[#1e1b4b] text-white shadow-md scale-105'
                : 'text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-container'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Modul & Materi ({materials.length})
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-500 ease-m3-standard active:scale-90 cursor-pointer shrink-0 flex items-center gap-2 ${
              activeTab === 'assignments'
                ? 'bg-[#1e1b4b] text-white shadow-md scale-105'
                : 'text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-container'
            }`}
          >
            <FileText className="w-4 h-4" /> Tugas Siswa ({assignments.length})
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-48">
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-m3-surface-container border border-m3-outline-variant/50 rounded-xl text-xs font-medium text-m3-on-surface focus:outline-none focus:border-m3-primary focus:bg-m3-surface cursor-pointer shadow-sm transition-all appearance-none"
            >
              <option value="all">Semua Kelas ({classes.length})</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
            {/* Custom arrow for select since appearance-none hides the default one */}
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-m3-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

          <div className="relative w-full sm:w-64 group">
            <Search className="w-4 h-4 text-m3-on-surface-variant absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-m3-primary transition-colors" />
            <input
              type="text"
              placeholder="Cari judul modul / tugas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-m3-surface-container border border-m3-outline-variant/50 rounded-xl text-xs font-medium text-m3-on-surface placeholder-m3-on-surface-variant focus:outline-none focus:border-m3-primary focus:bg-m3-surface shadow-sm transition-all"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-m3-on-surface-variant flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-m3-primary/30 border-t-m3-primary rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-medium">Memuat modul & tugas dari seluruh kelas...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Materials Section */}
          {(activeTab === 'all' || activeTab === 'materials') && (
            <div className="space-y-4 animate-in fade-in">
              <h2 className="text-lg font-black text-m3-on-surface flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-m3-primary" />
                Modul & Bahan Ajar Digital ({filteredMaterials.length})
              </h2>

              {filteredMaterials.length === 0 ? (
                <div className="p-12 text-center bg-m3-surface-container/50 rounded-[1.5rem] border border-m3-outline-variant/30 flex flex-col items-center justify-center">
                  <BookOpen className="w-12 h-12 text-m3-on-surface-variant/30 mb-3" />
                  <p className="text-m3-on-surface-variant text-sm font-medium">Tidak ada modul materi yang ditemukan.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
            <div className="space-y-4 animate-in fade-in">
              <h2 className="text-lg font-black text-m3-on-surface flex items-center gap-2">
                <FileText className="w-5 h-5 text-m3-tertiary" />
                Tugas & Evaluasi Pembelajaran ({filteredAssignments.length})
              </h2>

              {filteredAssignments.length === 0 ? (
                <div className="p-12 text-center bg-m3-surface-container/50 rounded-[1.5rem] border border-m3-outline-variant/30 flex flex-col items-center justify-center">
                  <FileText className="w-12 h-12 text-m3-on-surface-variant/30 mb-3" />
                  <p className="text-m3-on-surface-variant text-sm font-medium">Tidak ada penugasan yang ditemukan.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
