import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services';
import { ClassRoom, Assignment, Quiz, Material, Rombel } from '../types';
import { BookOpen } from 'lucide-react';
import { ClassCard } from '../components/features/classes/ClassCard';
import { ClassFilterTabs } from '../components/features/classes/ClassFilterTabs';
import { JoinClassModal } from '../components/features/classes/JoinClassModal';
import { CreateClassModal } from '../components/features/classes/CreateClassModal';

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

  const fetchClasses = useCallback(async (forceRefresh: boolean = false, signal?: AbortSignal) => {
    if (!cached || cached.length === 0 || forceRefresh) {
      setIsLoading(true);
    }
    try {
      const data = await api.getClasses(forceRefresh, { signal });
      if (signal?.aborted) return;
      setClasses(data);

      if (data.length > 0) {
        const results = await Promise.allSettled(
          data.map((c) =>
            Promise.allSettled([
              api.getAssignments(c.id, { signal }),
              api.getQuizzes(c.id, { signal }),
              api.getMaterials(c.id, { signal }),
            ])
          )
        );

        if (signal?.aborted) return;

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
      if (err.name !== 'AbortError') {
        console.error('Failed to fetch classes:', err);
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [cached]);

  useEffect(() => {
    const controller = new AbortController();
    fetchClasses(false, controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchClasses]);

  const handleOpenCreateModal = async () => {
    setIsCreateOpen(true);
    if (rombels.length === 0) {
      try {
        const rList = await api.getRombels();
        setRombels(rList);
      } catch (err) {
        console.error('Failed to fetch rombels:', err);
      }
    }
  };

  // Grade filter helpers
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

  // Compute Real Class Progress Map
  const classProgressMap = useMemo(() => {
    const map: Record<string, { percent: number; label: string; doneCount: number; totalCount: number; matCount: number; asgCount: number; qzCount: number }> = {};
    const isStudent = user?.role === 'siswa';

    const asgsByClass = new Map<string, Assignment[]>();
    assignments.forEach((a) => {
      if (!asgsByClass.has(a.class_id)) asgsByClass.set(a.class_id, []);
      asgsByClass.get(a.class_id)!.push(a);
    });

    const qzsByClass = new Map<string, Quiz[]>();
    quizzes.forEach((q) => {
      if (!qzsByClass.has(q.class_id)) qzsByClass.set(q.class_id, []);
      qzsByClass.get(q.class_id)!.push(q);
    });

    const matsByClass = new Map<string, Material[]>();
    materials.forEach((m) => {
      if (!matsByClass.has(m.class_id)) matsByClass.set(m.class_id, []);
      matsByClass.get(m.class_id)!.push(m);
    });

    classes.forEach((cls) => {
      const clsAssignments = asgsByClass.get(cls.id) || [];
      const clsQuizzes = qzsByClass.get(cls.id) || [];
      const clsMaterials = matsByClass.get(cls.id) || [];

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
            label: 'Belum ada materi / tugas diterbitkan',
            doneCount: 0,
            totalCount: 0,
            matCount: 0,
            asgCount: 0,
            qzCount: 0,
          };
        }
      }
    });

    return map;
  }, [classes, assignments, quizzes, materials, completedTaskIds, user?.role]);

  // Filtered classes
  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      const matchSearch =
        cls.name.toLowerCase().includes(search.toLowerCase()) ||
        (cls.description || '').toLowerCase().includes(search.toLowerCase()) ||
        (cls.rombel || '').toLowerCase().includes(search.toLowerCase()) ||
        (cls.teacher_name || '').toLowerCase().includes(search.toLowerCase());

      let matchGrade = true;
      if (gradeFilter === 'X') matchGrade = isGradeX(cls);
      if (gradeFilter === 'XI') matchGrade = isGradeXI(cls);
      if (gradeFilter === 'XII') matchGrade = isGradeXII(cls);

      return matchSearch && matchGrade;
    });
  }, [classes, search, gradeFilter]);

  const isStudent = user?.role === 'siswa';
  const isTeacher = user?.role === 'guru' || user?.role === 'admin';

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      {/* 1. Header & Filters Toolbar */}
      <ClassFilterTabs
        totalCount={classes.length}
        countX={countX}
        countXI={countXI}
        countXII={countXII}
        gradeFilter={gradeFilter}
        onGradeFilterChange={setGradeFilter}
        search={search}
        onSearchChange={setSearch}
        isStudent={isStudent}
        isTeacher={isTeacher}
        onOpenJoin={() => setIsJoinOpen(true)}
        onOpenCreate={handleOpenCreateModal}
      />

      {/* 2. Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="bg-slate-200/80 rounded-[2rem] p-7 space-y-6 h-72">
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

      {/* 3. Empty State */}
      {!isLoading && filteredClasses.length === 0 && (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">Belum Ada Ruang Kelas Ditemukan</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {search || gradeFilter !== 'all'
                ? 'Coba ganti kata kunci pencarian atau ubah filter tingkat kelas.'
                : isTeacher
                ? 'Klik tombol "Buat Kelas Baru" untuk membuat ruang pembelajaran virtual untuk siswa.'
                : 'Gunakan tombol "Gabung Kelas" untuk memasukkan kode unik kelas dari Guru pengajar.'}
            </p>
          </div>
        </div>
      )}

      {/* 4. Class Cards Grid */}
      {!isLoading && filteredClasses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls, index) => {
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
              <ClassCard
                key={cls.id}
                cls={cls}
                index={index}
                progressInfo={progressInfo}
              />
            );
          })}
        </div>
      )}

      {/* Modals */}
      <JoinClassModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onSuccess={() => fetchClasses(true)}
      />

      <CreateClassModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        rombels={rombels}
        onSuccess={() => fetchClasses(true)}
      />
    </div>
  );
};
