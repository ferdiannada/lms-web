import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ClassRoom, Assignment, Quiz } from '../types';
import { BookOpen, FileText, HelpCircle, Clock, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clsData = await api.getClasses();
        setClasses(clsData);

        if (clsData.length > 0) {
          const asgData = await api.getAssignments(clsData[0].id);
          const qzData = await api.getQuizzes(clsData[0].id);
          setAssignments(asgData);
          setQuizzes(qzData);
        }
      } catch (err) {
        console.error(err);
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
              Tahun Ajaran 2025/2026 • Semester Genap
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white">
              Selamat datang kembali, <span className="text-indigo-400">{user?.name}</span>!
            </h1>
            <p className="text-slate-400 text-sm max-w-xl">
              {user?.role === 'guru'
                ? 'Kelola ruang kelas virtual, unggah modul materi, buat tugas, dan periksa hasil ujian siswa.'
                : 'Pantau tugas sekolah, ikuti kuis interaktif, dan diskusi bersama guru serta teman sekelas.'}
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/classes"
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
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
          <p className="text-[11px] text-slate-400">Tugas menunggu pengumpulan</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Kuis & Ujian</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <HelpCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">{quizzes.length}</div>
          <p className="text-[11px] text-slate-400">Ujian siap dikerjakan</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Progres Pembelajaran</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">95%</div>
          <p className="text-[11px] text-emerald-400 font-semibold">Tugas & kehadiran sempurna</p>
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
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{cls.description}</p>
                </div>
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>{cls.teacher_name}</span>
                  <span className="font-semibold text-slate-300">{cls.student_count || 36} Siswa</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks & Quizzes Side Widget */}
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Clock className="w-4 h-4 text-amber-400" />
              Tenggat Tugas & Ujian
            </h3>

            <div className="space-y-3">
              {assignments.map((asg) => (
                <div key={asg.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">Tugas Web</span>
                    <span className="text-[10px] text-slate-400">Batas: 20 Agt</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">{asg.title}</h4>
                </div>
              ))}

              {quizzes.map((qz) => (
                <div key={qz.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-400 uppercase">Kuis / Ujian</span>
                    <span className="text-[10px] text-slate-400">{qz.duration_minutes} Menit</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">{qz.title}</h4>
                  <Link
                    to={`/quiz/${qz.id}`}
                    className="inline-block text-[11px] text-indigo-400 font-bold hover:underline mt-1"
                  >
                    Kerjakan Ujian Sekarang →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
