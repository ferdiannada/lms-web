import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ClassRoom, Material, Assignment, Submission } from '../types';
import {
  FileText,
  BookOpen,
  Plus,
  Clock,
  CheckCircle2,
  Calendar,
  Upload,
  Download,
  Search,
  Filter,
  ExternalLink,
  ChevronRight,
  Trash2,
  FileCheck,
  Eye,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Modal } from '../components/Modal';

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

  // Forms
  const [modalTargetClassId, setModalTargetClassId] = useState('');
  const [matTitle, setMatTitle] = useState('');
  const [matDesc, setMatDesc] = useState('');
  const [matFile, setMatFile] = useState<File | null>(null);
  const [isUploadingMat, setIsUploadingMat] = useState(false);

  const [asgTitle, setAsgTitle] = useState('');
  const [asgInstructions, setAsgInstructions] = useState('');
  const [asgDueDate, setAsgDueDate] = useState('');
  const [asgMaxScore, setAsgMaxScore] = useState(100);
  const [asgFile, setAsgFile] = useState<File | null>(null);
  const [isUploadingAsg, setIsUploadingAsg] = useState(false);

  const [subNotes, setSubNotes] = useState('');
  const [subFile, setSubFile] = useState<File | null>(null);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  const [gradeScore, setGradeScore] = useState<number>(100);
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [isSavingGrade, setIsSavingGrade] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    loadAllData(controller.signal);

    return () => {
      controller.abort();
    };
  }, []);

  const loadAllData = async (signal?: AbortSignal) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const clsData = await api.getClasses();
      if (signal?.aborted) return;
      setClasses(clsData);
      if (clsData.length > 0 && !modalTargetClassId) {
        setModalTargetClassId(clsData[0].id);
      }

      // Fetch materials and assignments from all classes
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
          } catch (err) {
            // Ignore error per class
          }
        })
      );

      if (!signal?.aborted) {
        setMaterials(matList);
        setAssignments(asgList);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Failed to load classes or content:', err);
        setErrorMsg('Gagal memuat daftar modul & tugas dari server.');
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  };

  // Memoized Filter logic to prevent re-filtering on form input keystrokes
  const filteredMaterials = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return materials.filter((m) => {
      const matchClass = selectedClassId === 'all' || m.class_id === selectedClassId;
      const matchSearch =
        !query ||
        m.title.toLowerCase().includes(query) ||
        (m.description || '').toLowerCase().includes(query) ||
        (m.className || '').toLowerCase().includes(query);
      return matchClass && matchSearch;
    });
  }, [materials, selectedClassId, searchQuery]);

  const filteredAssignments = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return assignments.filter((a) => {
      const matchClass = selectedClassId === 'all' || a.class_id === selectedClassId;
      const matchSearch =
        !query ||
        a.title.toLowerCase().includes(query) ||
        (a.instructions || a.description || '').toLowerCase().includes(query) ||
        (a.className || '').toLowerCase().includes(query);
      return matchClass && matchSearch;
    });
  }, [assignments, selectedClassId, searchQuery]);

  // Handlers
  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matTitle.trim() || !modalTargetClassId) return;

    setIsUploadingMat(true);
    setErrorMsg(null);
    try {
      let fileUrl = '';
      if (matFile) {
        const uploadRes = await api.uploadFile(matFile);
        fileUrl = uploadRes.file_url;
      }

      await api.createMaterial(modalTargetClassId, {
        title: matTitle.trim(),
        description: matDesc.trim(),
        file_url: fileUrl,
        type: fileUrl ? 'pdf' : 'manual',
      });

      setIsMaterialModalOpen(false);
      setMatTitle('');
      setMatDesc('');
      setMatFile(null);
      setSuccessMsg('Modul pembelajaran berhasil diunggah!');
      await loadAllData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengunggah materi');
    } finally {
      setIsUploadingMat(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asgTitle.trim() || !modalTargetClassId) return;

    setIsUploadingAsg(true);
    setErrorMsg(null);
    try {
      let fileUrl = '';
      if (asgFile) {
        const uploadRes = await api.uploadFile(asgFile);
        fileUrl = uploadRes.file_url;
      }

      await api.createAssignment(modalTargetClassId, {
        title: asgTitle.trim(),
        instructions: asgInstructions.trim(),
        due_date: asgDueDate ? new Date(asgDueDate).toISOString() : new Date(Date.now() + 7 * 86400000).toISOString(),
        max_score: Number(asgMaxScore) || 100,
        file_url: fileUrl,
      });

      setIsAssignmentModalOpen(false);
      setAsgTitle('');
      setAsgInstructions('');
      setAsgDueDate('');
      setAsgFile(null);
      setSuccessMsg('Tugas baru berhasil diterbitkan!');
      await loadAllData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal membuat tugas');
    } finally {
      setIsUploadingAsg(false);
    }
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsg) return;

    setIsSubmittingTask(true);
    setErrorMsg(null);
    try {
      let fileUrl = '';
      if (subFile) {
        const uploadRes = await api.uploadFile(subFile);
        fileUrl = uploadRes.file_url;
      }

      await api.submitAssignment(selectedAsg.id, {
        notes: subNotes.trim(),
        file_url: fileUrl,
        file_name: subFile ? subFile.name : undefined,
      });

      setIsSubmitModalOpen(false);
      setSubNotes('');
      setSubFile(null);
      setSuccessMsg('Tugas berhasil dikumpulkan!');
      await loadAllData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengumpulkan tugas');
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleOpenSubmissions = async (asg: Assignment) => {
    setSelectedAsg(asg);
    setIsSubmissionsListOpen(true);
    try {
      const subs = await api.getSubmissions(asg.id);
      setCurrentSubmissions(subs);
    } catch (err) {
      console.error('Failed to load submissions:', err);
    }
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub || !selectedAsg) return;

    setIsSavingGrade(true);
    try {
      await api.gradeSubmission(selectedSub.id, Number(gradeScore), gradeFeedback);
      const updatedSubs = await api.getSubmissions(selectedAsg.id);
      setCurrentSubmissions(updatedSubs);
      setIsGradingModalOpen(false);
      setSelectedSub(null);
      setSuccessMsg('Nilai siswa berhasil disimpan.');
      await loadAllData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan nilai');
    } finally {
      setIsSavingGrade(false);
    }
  };

  const handleDeleteMaterial = async (matId: string) => {
    if (!window.confirm('Yakin ingin menghapus modul ini?')) return;
    try {
      await api.deleteMaterial(matId);
      setSuccessMsg('Modul berhasil dihapus.');
      await loadAllData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menghapus modul');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 lg:p-8 shadow-sm">
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

          {/* Action Buttons for Teachers */}
          {isTeacher && (
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => {
                  setErrorMsg(null);
                  setIsMaterialModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#1e1b4b] hover:bg-slate-900 text-white font-bold text-xs shadow-md shadow-indigo-100 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> + Unggah Modul
              </button>
              <button
                onClick={() => {
                  setErrorMsg(null);
                  setIsAssignmentModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-100 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> + Buat Tugas
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
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
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Subtabs */}
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

        {/* Search & Class Dropdown */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
          {/* Class Select */}
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

          {/* Search Input */}
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
          {/* SECTION 1: MATERIALS */}
          {(activeTab === 'all' || activeTab === 'materials') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-cyan-600" />
                  Modul & Bahan Ajar Digital ({filteredMaterials.length})
                </h2>
              </div>

              {filteredMaterials.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 shadow-sm">
                  <BookOpen className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs">Tidak ada modul pembelajaran yang sesuai filter.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMaterials.map((mat) => (
                    <div
                      key={mat.id}
                      className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4 hover:border-slate-300 shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-cyan-50 border border-cyan-100 text-cyan-700 text-[10px] font-bold uppercase truncate max-w-[160px]">
                            {mat.className || 'Kelas'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(mat.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-cyan-700 transition-colors line-clamp-2">
                          {mat.title}
                        </h3>

                        {mat.description && (
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{mat.description}</p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        {mat.file_url || mat.pdf_url ? (
                          <a
                            href={mat.file_url || mat.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" /> Unduh Dokumen
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Materi Bacaan Teks</span>
                        )}

                        <div className="flex items-center gap-2">
                          <Link
                            to={`/classes/${mat.class_id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Buka di Kelas"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          {isTeacher && (
                            <button
                              onClick={() => handleDeleteMaterial(mat.id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Hapus Modul"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION 2: ASSIGNMENTS */}
          {(activeTab === 'all' || activeTab === 'assignments') && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  Tugas & Evaluasi Pembelajaran ({filteredAssignments.length})
                </h2>
              </div>

              {filteredAssignments.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 shadow-sm">
                  <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs">Tidak ada tugas siswa yang sesuai filter.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAssignments.map((asg) => {
                    const isDuePast = asg.due_date && new Date(asg.due_date) < new Date();
                    return (
                      <div
                        key={asg.id}
                        className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4 hover:border-slate-300 shadow-sm hover:shadow-md transition-all group"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase truncate max-w-[160px]">
                              {asg.className || 'Kelas'}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                                isDuePast
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              {asg.due_date
                                ? new Date(asg.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                                : 'No Deadline'}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                            {asg.title}
                          </h3>

                          {(asg.instructions || asg.description) && (
                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                              {asg.instructions || asg.description}
                            </p>
                          )}

                          <div className="flex items-center gap-3 text-[11px] text-slate-500">
                            <span>Maks Nilai: <strong className="text-slate-800">{asg.max_score}</strong></span>
                            {asg.submission_count !== undefined && (
                              <span>Terkumpul: <strong className="text-slate-800">{asg.submission_count} siswa</strong></span>
                            )}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          {/* Student Action */}
                          {!isTeacher && (
                            <button
                              onClick={() => {
                                setSelectedAsg(asg);
                                setIsSubmitModalOpen(true);
                              }}
                              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-100 flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <FileCheck className="w-3.5 h-3.5" /> Kumpulkan Tugas
                            </button>
                          )}

                          {/* Teacher Action */}
                          {isTeacher && (
                            <button
                              onClick={() => handleOpenSubmissions(asg)}
                              className="px-3.5 py-2 rounded-xl bg-[#1e1b4b] hover:bg-slate-900 text-white font-bold text-xs shadow-md shadow-indigo-100 flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" /> Periksa Pengumpulan
                            </button>
                          )}

                          <Link
                            to={`/classes/${asg.class_id}`}
                            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Buka di Kelas"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: UPLOAD MATERIAL (TEACHER) */}
      <Modal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        title="Unggah Modul / Bahan Ajar Baru"
      >
        <form onSubmit={handleUploadMaterial} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Kelas</label>
            <select
              value={modalTargetClassId}
              onChange={(e) => setModalTargetClassId(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
              required
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.rombel})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Judul Modul / Bahan Ajar</label>
            <input
              type="text"
              value={matTitle}
              onChange={(e) => setMatTitle(e.target.value)}
              placeholder="Contoh: Modul 1 - Pemrograman Web Dasar"
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi / Catatan Pembelajaran</label>
            <textarea
              value={matDesc}
              onChange={(e) => setMatDesc(e.target.value)}
              rows={3}
              placeholder="Petunjuk dan penjelasan ringkas untuk siswa..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Lampiran File / PDF (Opsional)</label>
            <input
              type="file"
              onChange={(e) => setMatFile(e.target.files ? e.target.files[0] : null)}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#1e1b4b] file:text-white hover:file:bg-slate-900 cursor-pointer"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsMaterialModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isUploadingMat}
              className="px-5 py-2.5 bg-[#1e1b4b] hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 disabled:opacity-50"
            >
              {isUploadingMat ? 'Mengunggah...' : 'Simpan & Bagikan Modul'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: CREATE ASSIGNMENT (TEACHER) */}
      <Modal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        title="Buat Tugas Baru"
      >
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Kelas</label>
            <select
              value={modalTargetClassId}
              onChange={(e) => setModalTargetClassId(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
              required
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.rombel})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Judul Tugas</label>
            <input
              type="text"
              value={asgTitle}
              onChange={(e) => setAsgTitle(e.target.value)}
              placeholder="Contoh: Praktikum 1 - Membuat Form HTML"
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Instruksi Pengerjaan</label>
            <textarea
              value={asgInstructions}
              onChange={(e) => setAsgInstructions(e.target.value)}
              rows={3}
              placeholder="Rincian instruksi dan format pengumpulan..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tenggat Waktu</label>
              <input
                type="datetime-local"
                value={asgDueDate}
                onChange={(e) => setAsgDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Maksimal Nilai</label>
              <input
                type="number"
                value={asgMaxScore}
                onChange={(e) => setAsgMaxScore(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Lampiran File Soal (Opsional)</label>
            <input
              type="file"
              onChange={(e) => setAsgFile(e.target.files ? e.target.files[0] : null)}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAssignmentModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isUploadingAsg}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-100 disabled:opacity-50"
            >
              {isUploadingAsg ? 'Memproses...' : 'Terbitkan Tugas'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: SUBMIT ASSIGNMENT (STUDENT) */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title={`Kumpulkan Tugas: ${selectedAsg?.title || ''}`}
      >
        <form onSubmit={handleSubmitAssignment} className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs space-y-1">
            <p className="font-bold text-indigo-900">Petunjuk:</p>
            <p className="text-slate-700">{selectedAsg?.instructions || selectedAsg?.description || 'Silakan unggah hasil pengerjaan tugas Anda.'}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Catatan / Jawaban Teks (Opsional)</label>
            <textarea
              value={subNotes}
              onChange={(e) => setSubNotes(e.target.value)}
              rows={3}
              placeholder="Tuliskan keterangan jawaban atau link referensi..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Unggah Berkas Tugas (PDF/ZIP/Dokumen)</label>
            <input
              type="file"
              onChange={(e) => setSubFile(e.target.files ? e.target.files[0] : null)}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmittingTask}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-100 disabled:opacity-50"
            >
              {isSubmittingTask ? 'Mengirim...' : 'Kirim Tugas'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: VIEW SUBMISSIONS (TEACHER) */}
      <Modal
        isOpen={isSubmissionsListOpen}
        onClose={() => setIsSubmissionsListOpen(false)}
        title={`Daftar Pengumpulan: ${selectedAsg?.title || ''}`}
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {currentSubmissions.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">Belum ada siswa yang mengumpulkan tugas ini.</p>
          ) : (
            <div className="space-y-2.5">
              {currentSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{sub.student_name || 'Siswa'}</span>
                      {sub.score !== undefined && sub.score !== null ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          Nilai: {sub.score}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                          Belum Dinilai
                        </span>
                      )}
                    </div>
                    {sub.notes && <p className="text-[11px] text-slate-600 line-clamp-1">{sub.notes}</p>}
                    <p className="text-[10px] text-slate-400">
                      Dikirim: {new Date(sub.submitted_at).toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {sub.file_url && (
                      <a
                        href={sub.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-white hover:bg-slate-100 text-indigo-600 border border-slate-200 shadow-2xs transition-colors"
                        title="Unduh Berkas Siswa"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => {
                        setSelectedSub(sub);
                        setGradeScore(sub.score || 100);
                        setGradeFeedback(sub.feedback || '');
                        setIsGradingModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#1e1b4b] hover:bg-slate-900 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Beri Nilai
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* MODAL 5: GRADE SUBMISSION (TEACHER) */}
      <Modal
        isOpen={isGradingModalOpen}
        onClose={() => setIsGradingModalOpen(false)}
        title={`Beri Nilai Siswa: ${selectedSub?.student_name || ''}`}
      >
        <form onSubmit={handleSaveGrade} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Skor Nilai (0 - {selectedAsg?.max_score || 100})</label>
            <input
              type="number"
              min="0"
              max={selectedAsg?.max_score || 100}
              value={gradeScore}
              onChange={(e) => setGradeScore(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ulasan & Masukan Guru (Feedback)</label>
            <textarea
              value={gradeFeedback}
              onChange={(e) => setGradeFeedback(e.target.value)}
              rows={3}
              placeholder="Kerja bagus! Perhatikan kerapian kodingan..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsGradingModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSavingGrade}
              className="px-5 py-2.5 bg-[#1e1b4b] hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 disabled:opacity-50"
            >
              {isSavingGrade ? 'Menyimpan...' : 'Simpan Nilai'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
