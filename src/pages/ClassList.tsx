import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ClassRoom, Rombel, Assignment, Quiz, Material } from '../types';
import { BookOpen, Plus, UserPlus, Search, ArrowRight, Users, FileText, HelpCircle, Sparkles, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Modal } from '../components/Modal';
import { SearchableSelect } from '../components/SearchableSelect';

// NeedMCP Signature Theme Palettes (Purple, Mint, Coral, Indigo, Emerald, Amber)
const NEEDMCP_CARD_PALETTES = [
  {
    bg: 'bg-[#6b46c1]',
    text: 'text-white',
    subtext: 'text-white/85',
    badgeBg: 'bg-white/20 text-white border border-white/25',
    pillBg: 'bg-white/15 text-white border border-white/20',
    progressTrack: 'bg-white/20',
    progressBar: 'bg-white',
    arrowBtn: 'bg-white text-[#6b46c1] hover:bg-white/90 shadow-md',
    avatarBg: 'bg-white/20 text-white',
  },
  {
    bg: 'bg-[#a5d8d5]',
    text: 'text-slate-900',
    subtext: 'text-slate-800/85',
    badgeBg: 'bg-slate-900/10 text-slate-900 font-bold border border-slate-900/15',
    pillBg: 'bg-slate-900/10 text-slate-900 border border-slate-900/15 font-semibold',
    progressTrack: 'bg-slate-900/15',
    progressBar: 'bg-slate-900',
    arrowBtn: 'bg-[#1e1b4b] text-white hover:bg-slate-900 shadow-md',
    avatarBg: 'bg-slate-900/15 text-slate-900',
  },
  {
    bg: 'bg-[#ff8a65]',
    text: 'text-white',
    subtext: 'text-white/85',
    badgeBg: 'bg-white/20 text-white border border-white/25',
    pillBg: 'bg-white/15 text-white border border-white/20',
    progressTrack: 'bg-white/20',
    progressBar: 'bg-white',
    arrowBtn: 'bg-white text-[#ff8a65] hover:bg-white/90 shadow-md',
    avatarBg: 'bg-white/20 text-white',
  },
  {
    bg: 'bg-[#312e81]',
    text: 'text-white',
    subtext: 'text-white/85',
    badgeBg: 'bg-white/20 text-white border border-white/25',
    pillBg: 'bg-white/15 text-white border border-white/20',
    progressTrack: 'bg-white/20',
    progressBar: 'bg-white',
    arrowBtn: 'bg-white text-[#312e81] hover:bg-white/90 shadow-md',
    avatarBg: 'bg-white/20 text-white',
  },
  {
    bg: 'bg-[#0f766e]',
    text: 'text-white',
    subtext: 'text-white/85',
    badgeBg: 'bg-white/20 text-white border border-white/25',
    pillBg: 'bg-white/15 text-white border border-white/20',
    progressTrack: 'bg-white/20',
    progressBar: 'bg-white',
    arrowBtn: 'bg-white text-[#0f766e] hover:bg-white/90 shadow-md',
    avatarBg: 'bg-white/20 text-white',
  },
  {
    bg: 'bg-[#c2410c]',
    text: 'text-white',
    subtext: 'text-white/85',
    badgeBg: 'bg-white/20 text-white border border-white/25',
    pillBg: 'bg-white/15 text-white border border-white/20',
    progressTrack: 'bg-white/20',
    progressBar: 'bg-white',
    arrowBtn: 'bg-white text-[#c2410c] hover:bg-white/90 shadow-md',
    avatarBg: 'bg-white/20 text-white',
  },
];

export const ClassList: React.FC = () => {
  const { user } = useAuth();
  const cached = api.getCachedClasses();

  const [classes, setClasses] = useState<ClassRoom[]>(cached || []);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [completedTaskIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('lms_completed_tasks');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [rombels, setRombels] = useState<Rombel[]>([]);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState<'all' | 'X' | 'XI' | 'XII'>('all');
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(!cached || cached.length === 0);
  const [isRombelsLoading, setIsRombelsLoading] = useState(false);

  // Form states
  const [joinCode, setJoinCode] = useState('');
  const [className, setClassName] = useState('');
  const [selectedRombelId, setSelectedRombelId] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchClasses(false);
  }, []);

  const fetchClasses = async (forceRefresh: boolean = false) => {
    if (!cached || cached.length === 0 || forceRefresh) {
      setIsLoading(true);
    }
    try {
      const data = await api.getClasses(forceRefresh);
      setClasses(data);

      if (data.length > 0) {
        // Concurrently fetch assignments, quizzes, and materials across all classes for real progress
        const results = await Promise.allSettled(
          data.map((c) =>
            Promise.allSettled([
              api.getAssignments(c.id),
              api.getQuizzes(c.id),
              api.getMaterials(c.id),
            ])
          )
        );

        const allAsgs: Assignment[] = [];
        const allQzs: Quiz[] = [];
        const allMats: Material[] = [];

        results.forEach((res) => {
          if (res.status === 'fulfilled') {
            const [asgRes, qzRes, matRes] = res.value;
            if (asgRes.status === 'fulfilled' && Array.isArray(asgRes.value)) {
              allAsgs.push(...asgRes.value);
            }
            if (qzRes.status === 'fulfilled' && Array.isArray(qzRes.value)) {
              allQzs.push(...qzRes.value);
            }
            if (matRes.status === 'fulfilled' && Array.isArray(matRes.value)) {
              allMats.push(...matRes.value);
            }
          }
        });

        const uniqueAsgs = Array.from(new Map(allAsgs.map((a) => [a.id, a])).values());
        const uniqueQzs = Array.from(new Map(allQzs.map((q) => [q.id, q])).values());
        const uniqueMats = Array.from(new Map(allMats.map((m) => [m.id, m])).values());

        setAssignments(uniqueAsgs);
        setQuizzes(uniqueQzs);
        setMaterials(uniqueMats);
      }
    } catch (err: any) {
      console.error('Failed to fetch classes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRombels = async () => {
    setIsRombelsLoading(true);
    try {
      const data = await api.getRombels();

      const excludedKeywords = [
        'bahasa jepang',
        'jepang',
        'tsm',
        'dkv',
        'perbankan',
        'syariah',
        'pbs',
      ];

      const filtered = data.filter((r) => {
        const name = (r.name || '').toLowerCase();
        return !excludedKeywords.some((keyword) => name.includes(keyword));
      });

      const rombelMap = new Map<string, Rombel>();
      filtered.forEach((r) => {
        const key = (r.name || '').trim().toUpperCase();
        const existing = rombelMap.get(key);

        if (!existing) {
          rombelMap.set(key, r);
        } else {
          const existingCount = existing.student_count || 0;
          const currentCount = r.student_count || 0;
          if (currentCount > existingCount) {
            rombelMap.set(key, r);
          }
        }
      });

      const cleanRombels = Array.from(rombelMap.values()).sort((a, b) => {
        if ((a.tingkat || 0) !== (b.tingkat || 0)) {
          return (a.tingkat || 0) - (b.tingkat || 0);
        }
        return (a.name || '').localeCompare(b.name || '');
      });

      setRombels(cleanRombels);
      if (cleanRombels.length > 0 && (!selectedRombelId || cleanRombels.every((r) => r.id !== selectedRombelId))) {
        setSelectedRombelId(cleanRombels[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch rombels:', err);
    } finally {
      setIsRombelsLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setError(null);
    setIsCreateOpen(true);
    if (rombels.length === 0) {
      fetchRombels();
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await api.joinClass(joinCode);
      setIsJoinOpen(false);
      setJoinCode('');
      await fetchClasses(true);
    } catch (err: any) {
      setError(err.message || 'Gagal bergabung ke kelas.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRombelId) {
      setError('Pilih rombongan belajar (rombel) terlebih dahulu.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await api.createClass({
        name: className,
        description,
        rombel_id: selectedRombelId,
      });
      setIsCreateOpen(false);
      setClassName('');
      setDescription('');
      await fetchClasses(true);
    } catch (err: any) {
      setError(err.message || 'Gagal membuat kelas baru.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper matcher functions for precise grade filtering (word boundary prevents "X" matching "XI" or "XII")
  const isGradeX = (c: ClassRoom) => {
    const rombel = (c.rombel || '').trim().toUpperCase();
    const name = (c.name || '').trim().toUpperCase();
    return /\b(10|X)\b/i.test(rombel) || /\b(10|X)\b/i.test(name);
  };

  const isGradeXI = (c: ClassRoom) => {
    const rombel = (c.rombel || '').trim().toUpperCase();
    const name = (c.name || '').trim().toUpperCase();
    return /\b(11|XI)\b/i.test(rombel) || /\b(11|XI)\b/i.test(name);
  };

  const isGradeXII = (c: ClassRoom) => {
    const rombel = (c.rombel || '').trim().toUpperCase();
    const name = (c.name || '').trim().toUpperCase();
    return /\b(12|XII)\b/i.test(rombel) || /\b(12|XII)\b/i.test(name);
  };

  const countX = useMemo(() => classes.filter(isGradeX).length, [classes]);
  const countXI = useMemo(() => classes.filter(isGradeXI).length, [classes]);
  const countXII = useMemo(() => classes.filter(isGradeXII).length, [classes]);

  // Compute REAL Class Progress based on actual student completions, submissions & published curriculum
  const classProgressMap = useMemo(() => {
    const map: Record<string, { percent: number; label: string; doneCount: number; totalCount: number; matCount: number; asgCount: number; qzCount: number }> = {};
    const isStudent = user?.role === 'siswa';

    classes.forEach((cls) => {
      const clsAssignments = assignments.filter((a) => a.class_id === cls.id);
      const clsQuizzes = quizzes.filter((q) => q.class_id === cls.id);
      const clsMaterials = materials.filter((m) => m.class_id === cls.id);

      const matCount = clsMaterials.length || cls.material_count || 0;
      const asgCount = clsAssignments.length || cls.assignment_count || 0;
      const qzCount = clsQuizzes.length || cls.quiz_count || 0;

      if (isStudent) {
        const totalEvaluations = clsAssignments.length + clsQuizzes.length;
        const doneAssignments = clsAssignments.filter((a) => a.is_submitted || completedTaskIds.has(a.id)).length;
        const doneQuizzes = clsQuizzes.filter((q) => q.is_completed || completedTaskIds.has(q.id)).length;
        const totalDone = doneAssignments + doneQuizzes;

        if (totalEvaluations > 0) {
          const percent = Math.round((totalDone / totalEvaluations) * 100);
          map[cls.id] = {
            percent,
            label: `${totalDone}/${totalEvaluations} Tugas & Kuis Selesai`,
            doneCount: totalDone,
            totalCount: totalEvaluations,
            matCount,
            asgCount,
            qzCount,
          };
        } else if (matCount > 0) {
          map[cls.id] = {
            percent: 100,
            label: `${matCount} Modul • Bebas Tugas`,
            doneCount: 0,
            totalCount: 0,
            matCount,
            asgCount,
            qzCount,
          };
        } else {
          map[cls.id] = {
            percent: 0,
            label: 'Belum ada materi/tugas',
            doneCount: 0,
            totalCount: 0,
            matCount,
            asgCount,
            qzCount,
          };
        }
      } else {
        // Teacher / Admin
        const totalUnits = matCount + asgCount + qzCount;
        if (totalUnits > 0) {
          const percent = Math.min(100, Math.round((totalUnits / 8) * 100));
          map[cls.id] = {
            percent,
            label: `${matCount} Modul • ${asgCount + qzCount} Evaluasi`,
            doneCount: totalUnits,
            totalCount: 8,
            matCount,
            asgCount,
            qzCount,
          };
        } else {
          map[cls.id] = {
            percent: 0,
            label: 'Belum ada materi atau tugas diterbitkan',
            doneCount: 0,
            totalCount: 0,
            matCount,
            asgCount,
            qzCount,
          };
        }
      }
    });

    return map;
  }, [classes, assignments, quizzes, materials, completedTaskIds, user?.role]);

  const filteredClasses = useMemo(() => {
    const q = search.toLowerCase().trim();
    return classes.filter((c) => {
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.subject && c.subject.toLowerCase().includes(q)) ||
        (c.rombel && c.rombel.toLowerCase().includes(q)) ||
        (c.code && c.code.toLowerCase().includes(q)) ||
        (c.teacher_name && c.teacher_name.toLowerCase().includes(q));

      let matchGrade = true;
      if (gradeFilter === 'X') {
        matchGrade = isGradeX(c);
      } else if (gradeFilter === 'XI') {
        matchGrade = isGradeXI(c);
      } else if (gradeFilter === 'XII') {
        matchGrade = isGradeXII(c);
      }

      return matchSearch && matchGrade;
    });
  }, [classes, search, gradeFilter]);

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      {/* 1. NEEDMCP GREETING & PAGE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 lg:p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Kurikulum Merdeka • Manajemen Rombel & Pembelajaran</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-indigo-600" />
            Ruang Kelas Pembelajaran
          </h1>
          <p className="text-sm text-slate-500 max-w-2xl">
            Akses materi modul terpadu, kumpulkan tugas harian, ikuti kuis CBT interaktif, dan pantau kehadiran rombel Anda.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 z-10">
          {user?.role === 'siswa' && (
            <button
              onClick={() => {
                setError(null);
                setIsJoinOpen(true);
              }}
              className="px-5 py-3 rounded-2xl bg-[#1e1b4b] hover:bg-slate-900 text-white font-bold text-xs shadow-md shadow-indigo-100 flex items-center gap-2 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Gabung Kelas (Kode)
            </button>
          )}

          {(user?.role === 'guru' || user?.role === 'admin') && (
            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-3 rounded-2xl bg-[#1e1b4b] hover:bg-slate-900 text-white font-bold text-xs shadow-md shadow-indigo-100 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Buat Kelas Baru
            </button>
          )}
        </div>
      </div>

      {/* 2. FILTERS & SEARCH TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Grade Filters */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setGradeFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              gradeFilter === 'all'
                ? 'bg-[#1e1b4b] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Semua ({classes.length})
          </button>
          <button
            onClick={() => setGradeFilter('X')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              gradeFilter === 'X'
                ? 'bg-[#1e1b4b] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Kelas X ({countX})
          </button>
          <button
            onClick={() => setGradeFilter('XI')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              gradeFilter === 'XI'
                ? 'bg-[#1e1b4b] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Kelas XI ({countXI})
          </button>
          <button
            onClick={() => setGradeFilter('XII')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              gradeFilter === 'XII'
                ? 'bg-[#1e1b4b] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Kelas XII ({countXII})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama kelas, mapel, atau rombel..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* 3. LOADING SKELETON */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="bg-slate-200/80 rounded-[2rem] p-7 space-y-6 h-72"
            >
              <div className="flex justify-between items-center">
                <div className="h-6 w-20 bg-slate-300 rounded-full"></div>
                <div className="h-4 w-16 bg-slate-300 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-6 w-3/4 bg-slate-300 rounded"></div>
                <div className="h-3 w-1/2 bg-slate-300 rounded"></div>
              </div>
              <div className="h-10 bg-slate-300/80 rounded-xl"></div>
              <div className="h-8 bg-slate-300 rounded-full"></div>
            </div>
          ))}
        </div>
      )}

      {/* 4. EMPTY STATE */}
      {!isLoading && filteredClasses.length === 0 && (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">Belum Ada Ruang Kelas Ditemukan</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {search || gradeFilter !== 'all'
                ? 'Coba ganti kata kunci pencarian atau ubah filter tingkat kelas.'
                : user?.role === 'guru'
                ? 'Klik tombol "Buat Kelas Baru" untuk membuat ruang pembelajaran virtual untuk siswa.'
                : 'Gunakan tombol "Gabung Kelas" untuk memasukkan kode unik kelas dari Guru pengajar.'}
            </p>
          </div>
        </div>
      )}

      {/* 5. NEEDMCP 3-COLOR SIGNATURE PROJECT CARDS GRID */}
      {!isLoading && filteredClasses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls, index) => {
            const style = NEEDMCP_CARD_PALETTES[index % NEEDMCP_CARD_PALETTES.length];
            const studentCount = cls.student_count || 0;
            const progressInfo = classProgressMap[cls.id] || {
              percent: 0,
              label: '0% Selesai',
              doneCount: 0,
              totalCount: 0,
              matCount: cls.material_count || 0,
              asgCount: cls.assignment_count || 0,
              qzCount: cls.quiz_count || 0,
            };

            return (
              <Link
                key={cls.id}
                to={`/classes/${cls.id}`}
                className={`${style.bg} ${style.text} p-6 lg:p-7 rounded-[2rem] shadow-lg relative overflow-hidden flex flex-col justify-between space-y-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl group cursor-pointer block`}
              >
                {/* Top Row: Rombel Badge + Student Count */}
                <div className="flex justify-between items-center gap-2">
                  <span className={`px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${style.badgeBg}`}>
                    {cls.rombel || 'SMK'}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold opacity-90">
                    <GraduationCap className="w-4 h-4" />
                    <span>{studentCount} Siswa</span>
                  </div>
                </div>

                {/* Class Title & Description */}
                <div className="space-y-1.5">
                  <h3 className="text-xl lg:text-2xl font-black leading-tight tracking-tight line-clamp-2 group-hover:opacity-90 transition-opacity">
                    {cls.name}
                  </h3>
                  <p className={`text-xs ${style.subtext} line-clamp-2 leading-relaxed`}>
                    {cls.description || `Ruang pembelajaran ${cls.name} untuk rombongan belajar ${cls.rombel || 'SMK'}.`}
                  </p>
                </div>

                {/* Resource Pill Badges */}
                <div className="grid grid-cols-3 gap-2 text-[11px] font-bold text-center">
                  <div className={`py-1.5 px-2 rounded-xl flex items-center justify-center gap-1 ${style.pillBg}`}>
                    <Users className="w-3.5 h-3.5 shrink-0 opacity-80" />
                    <span className="truncate">{studentCount} Siswa</span>
                  </div>
                  <div className={`py-1.5 px-2 rounded-xl flex items-center justify-center gap-1 ${style.pillBg}`}>
                    <FileText className="w-3.5 h-3.5 shrink-0 opacity-80" />
                    <span className="truncate">{progressInfo.matCount} Modul</span>
                  </div>
                  <div className={`py-1.5 px-2 rounded-xl flex items-center justify-center gap-1 ${style.pillBg}`}>
                    <HelpCircle className="w-3.5 h-3.5 shrink-0 opacity-80" />
                    <span className="truncate">{progressInfo.asgCount + progressInfo.qzCount} Tugas</span>
                  </div>
                </div>

                {/* NeedMCP Real Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold opacity-90">
                    <span>Progres Pembelajaran</span>
                    <span>{progressInfo.percent}%</span>
                  </div>
                  <div className={`w-full ${style.progressTrack} h-2 rounded-full overflow-hidden`}>
                    <div
                      className={`${style.progressBar} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${progressInfo.percent}%` }}
                    ></div>
                  </div>
                  <p className={`text-[10px] ${style.subtext} font-medium line-clamp-1`}>
                    {progressInfo.label}
                  </p>
                </div>

                {/* Card Footer: Teacher Info + CTA Arrow Button */}
                <div className="pt-3 border-t border-white/20 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${style.avatarBg}`}>
                      {(cls.teacher_name || 'G').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] opacity-75 leading-none">Pengajar</p>
                      <p className="text-xs font-extrabold truncate mt-0.5">{cls.teacher_name || 'Guru Pengampu'}</p>
                    </div>
                  </div>

                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shrink-0 ${style.arrowBtn}`}
                    title="Masuk ke Ruang Kelas"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* MODAL 1: JOIN CLASS (STUDENT) */}
      <Modal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} title="Gabung ke Ruang Kelas">
        <form onSubmit={handleJoin} className="space-y-4">
          {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">{error}</div>}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">Kode Unik Kelas (Dari Guru)</label>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              required
              placeholder="Contoh: 4DLVVH"
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 font-mono uppercase tracking-widest focus:border-indigo-600 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400">Mintalah 6 digit kode kelas kepada Guru pengajar Anda.</p>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsJoinOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#1e1b4b] hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Memproses...' : 'Gabung Kelas Sekarang'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: CREATE CLASS (TEACHER) */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Buat Ruang Kelas Baru">
        <form onSubmit={handleCreate} className="space-y-4">
          {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">{error}</div>}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">Nama Mata Pelajaran / Kelas</label>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              required
              placeholder="Contoh: Pemrograman Web & Perangkat Bergerak"
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">Pilih Rombongan Belajar (Dapodik)</label>
            <SearchableSelect
              options={rombels.map((r) => ({
                value: r.id,
                label: r.name,
                badge: `Tingkat ${r.tingkat}`,
                subLabel: r.student_count !== undefined ? `${r.student_count} Siswa` : undefined,
              }))}
              value={selectedRombelId}
              onChange={(val) => setSelectedRombelId(val)}
              placeholder="Pilih atau cari rombongan belajar..."
              searchPlaceholder="Ketik nama rombel (contoh: XI RPL, X TKJ)..."
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">Deskripsi Ringkas</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Silabus dan target kompetensi pembelajaran..."
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#1e1b4b] hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan & Terbitkan Kelas'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
