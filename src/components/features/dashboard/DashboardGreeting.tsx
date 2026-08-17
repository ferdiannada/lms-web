import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  Lightbulb, 
  Compass, 
  PenTool, 
  Shapes 
} from 'lucide-react';
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
    <div className="relative overflow-hidden rounded-[2rem] bg-m3-primary p-6 lg:p-8 text-m3-on-primary shadow-m3-elevation-2 animate-m3-enter group">
      {/* M3 Ambient Blurs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-10 left-20 w-72 h-72 bg-m3-secondary/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Floating Decorative Icons (Animate on hover) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <BookOpen className="absolute -top-4 -right-2 w-24 h-24 text-white/20 -rotate-12 animate-[spin_20s_linear_infinite] [animation-play-state:paused] group-hover:[animation-play-state:running]" />
        <Lightbulb className="absolute top-8 left-1/4 w-12 h-12 text-white/20 rotate-12 animate-pulse [animation-play-state:paused] group-hover:[animation-play-state:running]" />
        <Compass className="absolute -bottom-6 right-1/4 w-20 h-20 text-white/20 rotate-45 animate-[spin_15s_linear_infinite_reverse] [animation-play-state:paused] group-hover:[animation-play-state:running]" />
        <PenTool className="absolute top-1/2 right-12 w-10 h-10 text-white/20 -rotate-45 transition-all duration-[2000ms] ease-out group-hover:rotate-[15deg] group-hover:-translate-y-4 group-hover:scale-110" />
        <Shapes className="absolute bottom-4 left-1/3 w-14 h-14 text-white/20 rotate-12 animate-[bounce_3s_infinite] [animation-play-state:paused] group-hover:[animation-play-state:running]" />
        <Sparkles className="absolute top-12 right-1/3 w-8 h-8 text-white/30 animate-pulse [animation-play-state:paused] group-hover:[animation-play-state:running]" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-m3-on-primary/10 backdrop-blur-md border border-m3-on-primary/15 text-m3-on-primary text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-m3-secondary-container animate-ping"></span>
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
            className="px-6 py-3.5 rounded-full bg-m3-surface text-m3-primary hover:bg-m3-surface-variant font-bold text-sm shadow-m3-elevation-1 hover:shadow-m3-elevation-2 flex items-center justify-center gap-2 transition-all duration-300 ease-m3-standard active:scale-[0.98]"
          >
            <span>Buka Ruang Kelas</span>
            <ArrowRight className="w-4 h-4 text-m3-primary" />
          </Link>
        </div>
      </div>
    </div>
  );
};
