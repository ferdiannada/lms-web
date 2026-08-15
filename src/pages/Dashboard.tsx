import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ClassRoom, Assignment, Quiz, Material } from '../types';
import {
  BookOpen,
  FileText,
  HelpCircle,
  Clock,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Calendar as CalendarIcon,
  ChevronLeft,
  Filter,
  Search,
  PlusCircle,
  GraduationCap,
  Award,
  Layers,
  ArrowUpRight,
  ListTodo,
  CheckSquare,
  Square,
  AlertCircle,
  Flame,
  Bookmark
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface InteractiveTask {
  id: string;
  title: string;
  className: string;
  classId: string;
  dueDate: string;
  type: 'assignment' | 'quiz';
  isCompleted: boolean;
  priority: 'high' | 'medium' | 'low';
  score?: number | null;
  maxScore?: number | null;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
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

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const clsData = await api.getClasses();
        setClasses(clsData);

        if (clsData.length > 0) {
          // Fetch assignments, quizzes, and materials for all classes in parallel
          const results = await Promise.allSettled(
            clsData.map((c) =>
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

          // Deduplicate by ID
          const uniqueAsgs = Array.from(new Map(allAsgs.map((a) => [a.id, a])).values());
          const uniqueQzs = Array.from(new Map(allQzs.map((q) => [q.id, q])).values());
          const uniqueMats = Array.from(new Map(allMats.map((m) => [m.id, m])).values());

          setAssignments(uniqueAsgs);
          setQuizzes(uniqueQzs);
          setMaterials(uniqueMats);
        } else {
          try {
            const summary = await api.getDashboardSummary();
            setAssignments(summary.pending_assignments || []);
            setQuizzes(summary.active_quizzes || []);
            setMaterials(summary.recent_materials || []);
          } catch {
            // no data
          }
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Format Greeting Date (e.g. "Senin, 15 Agustus 2026")
  const formattedToday = useMemo(() => {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date());
  }, []);

  // Compute REAL Class Progress based on actual student completions, submissions & published curriculum
  const classProgressMap = useMemo(() => {
    const map: Record<string, { percent: number; label: string; doneCount: number; totalCount: number }> = {};
    const isStudent = user?.role === 'siswa';

    classes.forEach((cls) => {
      const clsAssignments = assignments.filter((a) => a.class_id === cls.id);
      const clsQuizzes = quizzes.filter((q) => q.class_id === cls.id);
      const clsMaterials = materials.filter((m) => m.class_id === cls.id);

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
        // Teacher / Admin: progress based on published curriculum units
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

  // Transform Assignments & Quizzes into Interactive Tasks
  const allTasks: InteractiveTask[] = useMemo(() => {
    const tasks: InteractiveTask[] = [];

    assignments.forEach((asg, i) => {
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
        priority: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'medium' : 'low',
        score: asg.score,
        maxScore: asg.max_score
      });
    });

    quizzes.forEach((qz, i) => {
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
        priority: 'high',
        score: qz.score,
        maxScore: qz.max_score
      });
    });

    return tasks;
  }, [assignments, quizzes, classes, completedTaskIds]);

  // Toggle Task Checkbox
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

  // Filtered Classes
  const filteredClasses = useMemo(() => {
    if (!searchQuery) return classes;
    return classes.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.rombel?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.teacher_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [classes, searchQuery]);

  // Calendar Helpers
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // 0 = Sunday, we shift so 0 = Monday
    let startingDay = firstDay.getDay() - 1;
    if (startingDay === -1) startingDay = 6;

    const totalDays = lastDay.getDate();
    const days: Array<{ date: Date; isCurrentMonth: boolean; hasEvent: boolean }> = [];

    // Previous month filler
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
        hasEvent: false
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const dayDate = new Date(year, month, i);
      // Check if any assignment or quiz has due date on this day
      const hasEvent = allTasks.some((t) => {
        if (!t.dueDate) return false;
        const d = new Date(t.dueDate);
        return (
          d.getDate() === dayDate.getDate() &&
          d.getMonth() === dayDate.getMonth() &&
          d.getFullYear() === dayDate.getFullYear()
        );
      });

      days.push({
        date: dayDate,
        isCurrentMonth: true,
        hasEvent
      });
    }

    // Next month filler to complete 35 or 42 grid
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        hasEvent: false
      });
    }

    return days;
  }, [year, month, allTasks]);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const prevMonth = () => setCurrentCalendarDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentCalendarDate(new Date(year, month + 1, 1));

  // Upcoming Schedule / Events for NeedMCP right sidebar
  const upcomingEvents = useMemo(() => {
    return allTasks
      .filter((t) => !t.isCompleted)
      .slice(0, 4);
  }, [allTasks]);

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      {/* 1. NEEDMCP WIREFRAME: GREETING & HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 lg:p-7 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Tahun Ajaran 2025/2026 • Kurikulum Merdeka</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Selamat Datang, <span className="text-indigo-600">{user?.name}</span> 👋
          </h1>
          <p className="text-sm text-slate-500">
            Hari ini <span className="font-semibold text-slate-800">{formattedToday}</span>. Pantau progres kelas, tugas, dan jadwal ujian Anda.
          </p>
        </div>

        {/* Quick Search & Actions */}
        <div className="flex flex-wrap items-center gap-3 z-10">
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kelas / tugas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-xs"
            />
          </div>

          <Link
            to={user?.role === 'guru' ? '/classes' : '/classes'}
            className="px-5 py-2.5 rounded-xl bg-[#1e1b4b] hover:bg-slate-900 text-white font-bold text-xs shadow-md shadow-indigo-100 flex items-center gap-2 transition-all cursor-pointer"
          >
            {user?.role === 'guru' ? (
              <>
                <PlusCircle className="w-4 h-4" />
                Kelola Ruang Kelas
              </>
            ) : (
              <>
                <BookOpen className="w-4 h-4" />
                Jelajahi Kelas
              </>
            )}
          </Link>
        </div>
      </div>

      {/* 2. NEEDMCP WIREFRAME: QUICK METRIC KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Classes */}
        <Link
          to="/classes"
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-3 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer block group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500 group-hover:text-indigo-600 transition-colors">
              Total Kelas
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{classes.length}</span>
            <span className="text-xs font-semibold text-emerald-600">Rombel Aktif</span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Semester Genap</span>
            <span className="font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
              Buka <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </Link>

        {/* Active Assignments */}
        <Link
          to="/assignments"
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-3 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer block group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500 group-hover:text-emerald-600 transition-colors">
              Modul & Tugas
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{assignments.length}</span>
            <span className="text-xs font-semibold text-emerald-600">Tugas Aktif</span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Evaluasi Berjalan</span>
            <span className="font-semibold text-emerald-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
              Lihat <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </Link>

        {/* Quizzes & Exams */}
        <Link
          to="/quizzes"
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-3 hover:border-amber-200 hover:shadow-md transition-all cursor-pointer block group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500 group-hover:text-amber-600 transition-colors">
              Kuis & Ujian CBT
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <HelpCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{quizzes.length}</span>
            <span className="text-xs font-semibold text-amber-600">Siap Dikerjakan</span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Ujian Online</span>
            <span className="font-semibold text-amber-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
              Masuk <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </Link>

        {/* Learning Materials */}
        <Link
          to="/assignments"
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-3 hover:border-cyan-200 hover:shadow-md transition-all cursor-pointer block group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500 group-hover:text-cyan-600 transition-colors">
              Bahan Ajar Digital
            </span>
            <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{materials.length}</span>
            <span className="text-xs font-semibold text-cyan-600">Materi Terbit</span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Modul & PDF</span>
            <span className="font-semibold text-cyan-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
              Akses <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </Link>
      </div>

      {/* 3. NEEDMCP WIREFRAME: 3-COLUMN MAIN CONTENT + RIGHT SIDEBAR CALENDAR */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* MAIN COLUMN (8 of 12 cols on desktop) */}
        <div className="xl:col-span-8 space-y-8">
          {/* SECTION A: PROJECT / CLASS CARDS GRID (NeedMCP: project-cards layout columns: 3) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  Kelas & Mata Pelajaran
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Progres materi belajar dan evaluasi per mata pelajaran semester ini
                </p>
              </div>

              <Link
                to="/classes"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
              >
                Lihat Semua ({classes.length}) <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            {filteredClasses.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 space-y-3 shadow-sm">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">Tidak ada kelas yang sesuai pencarian.</p>
                <Link
                  to="/classes"
                  className="inline-block px-4 py-2 bg-[#1e1b4b] hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all"
                >
                  Buka Menu Kelas
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClasses.slice(0, 6).map((cls, index) => {
                  const progress = classProgressMap[cls.id] || {
                    percent: 0,
                    label: '0% Selesai',
                    doneCount: 0,
                    totalCount: 0,
                  };
                  
                  // EXACT NeedMCP Project Dashboard Card Palettes:
                  // 1. Purple (#6b46c1), 2. Mint (#a5d8d5), 3. Coral (#ff8a65)
                  const cardStyles = [
                    {
                      bg: 'bg-[#6b46c1]',
                      text: 'text-white',
                      subtext: 'text-white/80',
                      badgeBg: 'bg-white/20 text-white',
                      progressTrack: 'bg-white/20',
                      progressBar: 'bg-white',
                      borderColor: 'border-[#6b46c1]',
                      buttonColor: 'text-white hover:text-white/80'
                    },
                    {
                      bg: 'bg-[#a5d8d5]',
                      text: 'text-slate-900',
                      subtext: 'text-slate-800/80',
                      badgeBg: 'bg-slate-900/10 text-slate-900',
                      progressTrack: 'bg-slate-900/15',
                      progressBar: 'bg-slate-900',
                      borderColor: 'border-[#a5d8d5]',
                      buttonColor: 'text-slate-900 hover:text-slate-700'
                    },
                    {
                      bg: 'bg-[#ff8a65]',
                      text: 'text-white',
                      subtext: 'text-white/80',
                      badgeBg: 'bg-white/20 text-white',
                      progressTrack: 'bg-white/20',
                      progressBar: 'bg-white',
                      borderColor: 'border-[#ff8a65]',
                      buttonColor: 'text-white hover:text-white/80'
                    }
                  ];

                  const style = cardStyles[index % cardStyles.length];

                  return (
                    <Link
                      key={cls.id}
                      to={`/classes/${cls.id}`}
                      className={`${style.bg} ${style.text} p-6 rounded-[2rem] shadow-xl relative overflow-hidden flex flex-col justify-between space-y-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl group cursor-pointer block`}
                    >
                      {/* Top Bar: Rombel & Members */}
                      <div className="flex justify-between items-start">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${style.badgeBg}`}>
                          {cls.rombel || 'SMK'}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                          <GraduationCap className="w-4 h-4 opacity-80" />
                          <span>{cls.student_count || 0} Siswa</span>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="text-xl font-extrabold leading-tight tracking-tight line-clamp-2 group-hover:opacity-90 transition-opacity">
                          {cls.name}
                        </h3>
                        <p className={`text-xs ${style.subtext} mt-1.5 line-clamp-2 leading-relaxed`}>
                          {cls.description || `Mata pelajaran ${cls.name} untuk rombel ${cls.rombel}.`}
                        </p>
                      </div>

                      {/* NeedMCP Wireframe: Real Progress Bar */}
                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between text-[11px] font-bold opacity-90">
                          <span>Progres Pembelajaran</span>
                          <span>{progress.percent}%</span>
                        </div>
                        <div className={`w-full ${style.progressTrack} h-2 rounded-full overflow-hidden`}>
                          <div
                            className={`${style.progressBar} h-full rounded-full transition-all duration-500`}
                            style={{ width: `${progress.percent}%` }}
                          ></div>
                        </div>
                        <p className={`text-[10px] ${style.subtext} font-medium line-clamp-1`}>
                          {progress.label}
                        </p>
                      </div>

                      {/* Bottom Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-black/10 text-xs font-semibold">
                        <span className="truncate max-w-[140px] opacity-90">
                          {cls.teacher_name || 'Guru Pengampu'}
                        </span>
                        <div
                          className={`flex items-center gap-1 font-bold ${style.buttonColor} transition-all group-hover:translate-x-1`}
                        >
                          Buka Kelas <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION B: NEEDMCP WIREFRAME: INTERACTIVE TASK LIST WITH TOGGLE CHECKBOX */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <ListTodo className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Daftar Tugas & Checklist Ujian</h2>
                  <p className="text-xs text-slate-500">Centang tugas yang sudah selesai atau sedang dikerjakan</p>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold self-start sm:self-auto">
                <button
                  onClick={() => setTaskFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    taskFilter === 'all'
                      ? 'bg-[#1e1b4b] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua ({allTasks.length})
                </button>
                <button
                  onClick={() => setTaskFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    taskFilter === 'pending'
                      ? 'bg-[#1e1b4b] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Belum ({allTasks.filter((t) => !t.isCompleted).length})
                </button>
                <button
                  onClick={() => setTaskFilter('completed')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    taskFilter === 'completed'
                      ? 'bg-[#1e1b4b] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Selesai ({allTasks.filter((t) => t.isCompleted).length})
                </button>
              </div>
            </div>

            {/* Task Item List */}
            {filteredTasks.length === 0 ? (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <CheckCircle2 className="w-9 h-9 text-emerald-500 mx-auto" />
                <p className="text-sm font-bold text-slate-800">Semua tugas di filter ini sudah tuntas!</p>
                <p className="text-xs text-slate-400">Hebat! Anda tidak memiliki tanggungan tugas saat ini.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.slice(0, 6).map((task, idx) => {
                  const isDone = task.isCompleted;
                  // NeedMCP Signature left border accents (Orange, Purple, Teal)
                  const borderAccents = ['border-l-4 border-orange-400', 'border-l-4 border-purple-600', 'border-l-4 border-teal-400'];
                  const borderClass = borderAccents[idx % borderAccents.length];

                  return (
                    <div
                      key={task.id}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${borderClass} ${
                        isDone
                          ? 'bg-slate-50/60 border-slate-200/60 opacity-60'
                          : 'bg-slate-50/90 border-slate-200/80 hover:border-slate-300 hover:bg-white shadow-xs'
                      }`}
                    >
                      {/* Left: Checkbox + Title */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* NeedMCP Dynamic Element: task-checkbox */}
                        <button
                          type="button"
                          onClick={() => toggleTaskCompletion(task.id)}
                          className="shrink-0 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                          aria-label="Toggle task"
                        >
                          {isDone ? (
                            <CheckSquare className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-400 hover:text-indigo-600" />
                          )}
                        </button>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4
                              className={`text-xs sm:text-sm font-bold truncate ${
                                isDone ? 'line-through text-slate-400' : 'text-slate-900'
                              }`}
                            >
                              {task.title}
                            </h4>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${
                                task.type === 'quiz'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : 'bg-orange-50 text-orange-700 border border-orange-200'
                              }`}
                            >
                              {task.type === 'quiz' ? 'Ujian CBT' : 'Tugas'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">{task.className}</p>
                        </div>
                      </div>

                      {/* Right: Due Date & Action Link */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                            <Clock className="w-3 h-3 text-amber-500" />
                            <span>
                              {task.dueDate
                                ? new Date(task.dueDate).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short'
                                  })
                                : 'Hari Ini'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {task.score !== undefined && task.score !== null
                              ? `Nilai: ${task.score}/${task.maxScore || 100}`
                              : isDone
                              ? 'Tuntas'
                              : 'Perlu dikerjakan'}
                          </span>
                        </div>

                        <Link
                          to={task.type === 'quiz' ? `/quiz/${task.id}` : '/assignments'}
                          className="px-3.5 py-1.5 rounded-xl bg-[#1e1b4b] hover:bg-slate-900 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1"
                        >
                          Buka <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR COLUMN: CALENDAR & UPCOMING SCHEDULE (4 of 12 cols on desktop) */}
        <div className="xl:col-span-4 space-y-6">
          {/* 1. NEEDMCP WIREFRAME: CALENDAR WIDGET (calendar-title) */}
          <div className="bg-[#fdf8f3] p-5 rounded-3xl border border-orange-100/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#ff8a65]" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  {monthNames[month]} {year}
                </h3>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={prevMonth}
                  className="p-1.5 rounded-lg bg-white hover:bg-orange-50 text-slate-600 hover:text-slate-900 border border-orange-100/80 transition-colors cursor-pointer shadow-2xs"
                  aria-label="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1.5 rounded-lg bg-white hover:bg-orange-50 text-slate-600 hover:text-slate-900 border border-orange-100/80 transition-colors cursor-pointer shadow-2xs"
                  aria-label="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Calendar Day Labels */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Sn</span>
              <span>Sl</span>
              <span>Rb</span>
              <span>Km</span>
              <span>Jm</span>
              <span>Sb</span>
              <span>Mg</span>
            </div>

            {/* Calendar Dates Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {calendarDays.map((d, i) => {
                const isToday =
                  d.date.getDate() === new Date().getDate() &&
                  d.date.getMonth() === new Date().getMonth() &&
                  d.date.getFullYear() === new Date().getFullYear();

                const isSelected =
                  selectedCalendarDate &&
                  d.date.getDate() === selectedCalendarDate.getDate() &&
                  d.date.getMonth() === selectedCalendarDate.getMonth() &&
                  d.date.getFullYear() === selectedCalendarDate.getFullYear();

                return (
                  <button
                    key={i}
                    onClick={() => setSelectedCalendarDate(d.date)}
                    className={`h-8 rounded-lg flex flex-col items-center justify-center font-bold transition-all relative cursor-pointer ${
                      !d.isCurrentMonth
                        ? 'text-slate-300 opacity-40'
                        : isToday
                        ? 'bg-[#1e1b4b] text-white font-bold ring-2 ring-[#ff8a65] shadow-xs'
                        : isSelected
                        ? 'bg-white text-indigo-700 border border-orange-200 shadow-xs'
                        : 'text-slate-700 hover:bg-white hover:text-slate-900'
                    }`}
                  >
                    <span>{d.date.getDate()}</span>
                    {d.hasEvent && !isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff8a65] absolute bottom-0.5"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. NEEDMCP WIREFRAME: CALENDAR EVENTS / UPCOMING DEADLINES (calendar-events) */}
          <div className="bg-[#fdf8f3] p-5 rounded-3xl border border-orange-100/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#ff8a65]" />
                Agenda & Tenggat Waktu
              </h3>
              <Link to="/quizzes" className="text-[11px] font-bold text-[#ff8a65] hover:opacity-80">
                Lihat Jadwal
              </Link>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 space-y-1">
                <p>Tidak ada agenda mendesak.</p>
                <p className="text-[10px] text-slate-400">Semua tugas minggu ini telah diselesaikan.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((evt, idx) => {
                  // NeedMCP Timeline colored border accents
                  const timelineBorders = ['border-l-2 border-teal-400', 'border-l-2 border-orange-400', 'border-l-2 border-purple-600'];
                  const tBorder = timelineBorders[idx % timelineBorders.length];

                  return (
                    <div
                      key={evt.id}
                      className={`p-3 rounded-2xl bg-white border border-orange-100/90 hover:border-orange-200 transition-all space-y-2 shadow-2xs`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className={`min-w-0 pl-2.5 ${tBorder}`}>
                          <h5 className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                            {evt.type === 'quiz' ? 'Ujian Online' : 'Tugas Praktik'}
                          </h5>
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{evt.title}</h4>
                          <p className="text-[11px] text-slate-500 truncate">{evt.className}</p>
                        </div>

                        <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-orange-50 text-orange-700 border border-orange-200 shrink-0">
                          {evt.dueDate
                            ? new Date(evt.dueDate).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short'
                              })
                            : 'Tenggat'}
                        </span>
                      </div>

                      <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Status: Belum Kirim</span>
                        <Link
                          to={evt.type === 'quiz' ? `/quiz/${evt.id}` : '/assignments'}
                          className="font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5"
                        >
                          Buka <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. QUICK ACADEMIC TIPS / MERDEKA CURRICULUM BANNER */}
          <div className="p-4 rounded-3xl bg-indigo-50/80 border border-indigo-100 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-indigo-900 font-bold">
              <Bookmark className="w-4 h-4 text-indigo-600" />
              <span>Info Kurikulum Merdeka</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Penilaian berbasis kompetensi dan portofolio proyek terintegrasi langsung dengan rapor SMK Dapodik Kemendikbud.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
