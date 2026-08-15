import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ClassRoom, Assignment, Quiz, Material } from '../types';
import { BookOpen, FileText, HelpCircle, Clock, ChevronRight, Sparkles, CheckCircle2, Award, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const clsData = await api.getClasses();
        setClasses(clsData);

        // Try getting dashboard summary
        try {
          const summary = await api.getDashboardSummary();
          setAssignments(summary.pending_assignments);
          setQuizzes(summary.active_quizzes);
          setMaterials(summary.recent_materials);
        } catch {
          // Fallback per class
          if (clsData.length > 0) {
            const asgData = await api.getAssignments(clsData[0].id);
            const qzData = await api.getQuizzes(clsData[0].id);
            const matData = await api.getMaterials(clsData[0].id);
            setAssignments(asgData);
            setQuizzes(qzData);
            setMaterials(matData);
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

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/80 via-slate-900 to-slate-950 border border-indigo-500/20 p-6 lg:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Tahun Ajaran 2025/2026 • SMK Al-Azhar
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white">
              Selamat datang kembali, <span className="text-indigo-400">{user?.name}</span>!
            </h1>
            <p className="text-slate-400 text-sm max-w-xl">
              {user?.role === 'guru'
                ? 'Kelola ruang kelas virtual, unggah modul bahan ajar, buat tugas, dan evaluasi hasil ujian siswa.'
                : 'Pantau tugas sekolah, pelajari modul digital, dan kerjakan kuis online langsung dari portal ini.'}
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/classes"
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              Lihat Semua Kelas
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Total Kelas</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">{classes.length}</div>
          <p className="text-[11px] text-slate-400">Terdaftar di semester ini</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Tugas Aktif</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">{assignments.length}</div>
          <p className="text-[11px] text-slate-400">Tugas & evaluasi berjalan</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Kuis & Ujian</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <HelpCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">{quizzes.length}</div>
          <p className="text-[11px] text-slate-400">Ujian online tersedia</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Modul Belajar</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">{materials.length}</div>
          <p className="text-[11px] text-cyan-400 font-semibold">Bahan ajar terunggah</p>
        </div>
      </div>

      {/* Main Grid: Enrolled Classes + Side Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Classes Section (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              Kelas Pembelajaran Saya
            </h2>
            <Link to="/classes" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              Lihat Selengkapnya <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {classes.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center text-slate-400 space-y-3">
              <p>Belum ada kelas terdaftar.</p>
              <Link
                to="/classes"
                className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl"
              >
                Jelajahi & Gabung Kelas
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {classes.map((cls) => (
                <Link
                  key={cls.id}
                  to={`/classes/${cls.id}`}
                  className="glass-card p-5 rounded-2xl space-y-4 group transition-all"
                >
                  <div className={`h-2.5 w-full rounded-full bg-gradient-to-r ${cls.banner_color || 'from-indigo-600 to-violet-600'}`}></div>
                  <div>
                    <span className="text-[11px] font-bold uppercase text-indigo-400 tracking-wider">
                      {cls.rombel} • {cls.code}
                    </span>
                    <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {cls.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{cls.description || 'Ruang kelas virtual SMK.'}</p>
                  </div>
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>{cls.teacher_name}</span>
                    <span className="font-semibold text-slate-300">{cls.student_count || 0} Siswa</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Side Section: Upcoming Deadlines & Tasks */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            Tugas & Ujian Terbaru
          </h2>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            {assignments.length === 0 && quizzes.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Tidak ada tugas aktif saat ini.</p>
            ) : (
              <div className="space-y-3">
                {assignments.slice(0, 3).map((asg) => (
                  <div key={asg.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white line-clamp-1">{asg.title}</span>
                      <span className="text-[10px] text-amber-400 font-semibold shrink-0">
                        {asg.due_date ? new Date(asg.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Tugas'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{asg.instructions || asg.description}</p>
                  </div>
                ))}

                {quizzes.slice(0, 2).map((qz) => (
                  <Link
                    key={qz.id}
                    to={`/quiz/${qz.id}`}
                    className="block p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 hover:border-indigo-500/40 space-y-1 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-300 line-clamp-1">{qz.title}</span>
                      <span className="text-[10px] text-indigo-400 font-semibold shrink-0">{qz.duration_minutes}m</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Klik untuk membuka lembar ujian</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
