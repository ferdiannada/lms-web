import React from 'react';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { User } from '../../../types';

interface DashboardGreetingProps {
  user: User | null;
  formattedToday: string;
  totalPendingCount: number;
}

export const DashboardGreeting: React.FC<DashboardGreetingProps> = ({
  user,
  formattedToday,
  totalPendingCount,
}) => {
  const isTeacher = user?.role === 'guru' || user?.role === 'admin';

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#1e1b4b] via-[#312e81] to-[#4338ca] p-6 lg:p-8 text-white shadow-xl">
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-indigo-200 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>{formattedToday}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight">
            Selamat Datang Kembali, {user?.name || 'Siswa SMK'}! 👋
          </h1>
          <p className="text-indigo-200/90 text-xs sm:text-sm max-w-xl leading-relaxed">
            {isTeacher
              ? 'Kelola ruang kelas kejuruan, publikasikan modul belajar, dan evaluasi capaian kompetensi siswa.'
              : `Anda memiliki ${totalPendingCount} evaluasi & tugas aktif yang perlu diselesaikan pekan ini.`}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/classes"
            className="px-5 py-3 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105"
          >
            <span>Buka Ruang Kelas</span>
            <ArrowRight className="w-4 h-4 text-indigo-600" />
          </Link>
        </div>
      </div>
    </div>
  );
};
