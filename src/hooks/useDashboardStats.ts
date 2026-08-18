import { useState, useMemo } from 'react';
import { ClassRoom, Assignment, Quiz, Material, User } from '../types';
import { DashboardTaskItem } from '../components/features/dashboard/DashboardTaskList';

interface UseDashboardStatsProps {
  classes: ClassRoom[];
  assignments: Assignment[];
  quizzes: Quiz[];
  materials: Material[];
  user: User | null;
}

export function useDashboardStats({ classes, assignments, quizzes, materials, user }: UseDashboardStatsProps) {
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

  const classProgressMap = useMemo(() => {
    const map: Record<string, { percent: number; label: string; doneCount: number; totalCount: number }> = {};
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

  return {
    classProgressMap,
    allTasks,
    filteredTasks,
    topClasses,
    totalPendingCount,
    searchQuery,
    setSearchQuery,
    taskFilter,
    setTaskFilter,
    toggleTaskCompletion,
  };
}
