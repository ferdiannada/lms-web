import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services';
import { ClassRoom, Assignment, Quiz, Material } from '../types';
import { DashboardGreeting } from '../components/features/dashboard/DashboardGreeting';
import { DashboardStatsCards } from '../components/features/dashboard/DashboardStatsCards';
import { DashboardRecentClasses } from '../components/features/dashboard/DashboardRecentClasses';
import { DashboardTaskList, DashboardTaskItem } from '../components/features/dashboard/DashboardTaskList';
import { DashboardCalendar } from '../components/features/dashboard/DashboardCalendar';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'guru' || user?.role === 'admin';

  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Task Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('lms_completed_tasks');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Calendar State
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(new Date());

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    try {
      const clsData = await api.getClasses(false, { signal });
      if (signal?.aborted) return;
      setClasses(clsData);

      if (clsData.length > 0) {
        const results = await Promise.allSettled(
          clsData.map((c) =>
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

        // Deduplicate by ID
        const uniqueAsgs = Array.from(new Map(allAsgs.map((a) => [a.id, a])).values());
        const uniqueQzs = Array.from(new Map(allQzs.map((q) => [q.id, q])).values());
        const uniqueMats = Array.from(new Map(allMats.map((m) => [m.id, m])).values());

        setAssignments(uniqueAsgs);
        setQuizzes(uniqueQzs);
        setMaterials(uniqueMats);
      } else {
        try {
          const summary = await api.getDashboardSummary({ signal });
          if (signal?.aborted) return;
          setAssignments(summary.pending_assignments || []);
          setQuizzes(summary.active_quizzes || []);
          setMaterials(summary.recent_materials || []);
        } catch {
          // ignore
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Failed to fetch dashboard data:', err);
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchData]);

  // Formatted date string
  const formattedToday = useMemo(() => {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  }, []);

  // Class Progress Map - Single Pass Grouping O(N) instead of O(N * M)
  const classProgressMap = useMemo(() => {
    const map: Record<string, { percent: number; label: string; doneCount: number; totalCount: number }> = {};
    const isStudent = user?.role === 'siswa';

    // Group items by class_id once
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
          };
        } else if (clsMaterials.length > 0) {
          map[cls.id] = {
            percent: 100,
            label: `${clsMaterials.length} Modul • Bebas Tugas`,
            doneCount: 0,
            totalCount: 0,
          };
        } else {
          map[cls.id] = {
            percent: 0,
            label: 'Belum ada materi/tugas',
            doneCount: 0,
            totalCount: 0,
          };
        }
      } else {
        const totalUnits = clsMaterials.length + clsAssignments.length + clsQuizzes.length;
        if (totalUnits > 0) {
          const percent = Math.min(100, Math.round((totalUnits / 8) * 100));
          map[cls.id] = {
            percent,
            label: `${clsMaterials.length} Modul • ${clsAssignments.length + clsQuizzes.length} Evaluasi`,
            doneCount: totalUnits,
            totalCount: 8,
          };
        } else {
          map[cls.id] = {
            percent: 0,
            label: 'Belum ada materi atau tugas diterbitkan',
            doneCount: 0,
            totalCount: 0,
          };
        }
      }
    });

    return map;
  }, [classes, assignments, quizzes, materials, completedTaskIds, user?.role]);

  // Transform Tasks
  const allTasks: DashboardTaskItem[] = useMemo(() => {
    const tasks: DashboardTaskItem[] = [];

    assignments.forEach((asg) => {
      const cls = classes.find((c) => c.id === asg.class_id);
      const isDone = asg.is_submitted || completedTaskIds.has(asg.id);
      tasks.push({
        id: asg.id,
        title: asg.title,
        className: cls?.name || 'Mata Pelajaran',
        classId: asg.class_id,
        dueDate: asg.due_date,
        type: 'assignment',
        isCompleted: !!isDone,
        score: asg.score,
        maxScore: asg.max_score,
      });
    });

    quizzes.forEach((qz) => {
      const cls = classes.find((c) => c.id === qz.class_id);
      const isDone = qz.is_completed || completedTaskIds.has(qz.id);
      tasks.push({
        id: qz.id,
        title: qz.title,
        className: cls?.name || 'Ujian Online',
        classId: qz.class_id,
        dueDate: qz.due_date || qz.end_time || qz.created_at,
        type: 'quiz',
        isCompleted: !!isDone,
        score: qz.score,
        maxScore: qz.max_score,
      });
    });

    return tasks;
  }, [assignments, quizzes, classes, completedTaskIds]);

  const toggleTaskCompletion = (taskId: string) => {
    setCompletedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      try {
        localStorage.setItem('lms_completed_tasks', JSON.stringify(Array.from(next)));
      } catch (err) {
        console.error('Failed to save task status:', err);
      }
      return next;
    });
  };

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return allTasks.filter((t) => {
      const matchSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.className.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;
      if (taskFilter === 'pending') return !t.isCompleted;
      if (taskFilter === 'completed') return t.isCompleted;
      return true;
    });
  }, [allTasks, searchQuery, taskFilter]);

  // Top 3 Classes
  const topClasses = useMemo(() => {
    return [...classes]
      .sort((a, b) => {
        const percentA = classProgressMap[a.id]?.percent ?? 0;
        const percentB = classProgressMap[b.id]?.percent ?? 0;
        if (percentB !== percentA) {
          return percentB - percentA;
        }
        return a.name.localeCompare(b.name);
      })
      .slice(0, 3);
  }, [classes, classProgressMap]);

  const totalPendingCount = useMemo(() => {
    return allTasks.filter((t) => !t.isCompleted).length;
  }, [allTasks]);

  if (isLoading) {
    return (
      <div className="p-16 text-center text-slate-500 space-y-3 animate-in fade-in">
        <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold">Memuat beranda aktivitas LMS...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* 1. Greeting & Hero Banner */}
      <DashboardGreeting
        user={user}
        formattedToday={formattedToday}
        totalPendingCount={totalPendingCount}
      />

      {/* 2. Overview Stats Cards */}
      <DashboardStatsCards
        stats={{
          classesCount: classes.length,
          pendingAssignmentsCount: assignments.length,
          activeQuizzesCount: quizzes.length,
          materialsCount: materials.length,
        }}
        isTeacher={isTeacher}
      />

      {/* 3. Top Classes Section */}
      <DashboardRecentClasses classes={topClasses} progressMap={classProgressMap} />

      {/* 4. Two-Column Layout: Task List & Calendar / Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Interactive Task List */}
        <div className="lg:col-span-2">
          <DashboardTaskList
            tasks={filteredTasks}
            filter={taskFilter}
            searchQuery={searchQuery}
            onFilterChange={setTaskFilter}
            onSearchChange={setSearchQuery}
            onToggleTask={toggleTaskCompletion}
          />
        </div>

        {/* Right Column (1 span): Interactive Mini-Calendar */}
        <div className="space-y-6">
          <DashboardCalendar
            currentDate={currentCalendarDate}
            selectedDate={selectedCalendarDate}
            tasks={allTasks}
            onDateSelect={setSelectedCalendarDate}
            onPrevMonth={() =>
              setCurrentCalendarDate(
                new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1)
              )
            }
            onNextMonth={() =>
              setCurrentCalendarDate(
                new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1)
              )
            }
          />
        </div>
      </div>
    </div>
  );
};
