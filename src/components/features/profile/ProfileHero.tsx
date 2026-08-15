import React from 'react';
import { Sparkles, ShieldCheck, GraduationCap, Building2, Calendar, Award } from 'lucide-react';
import { User } from '../../../types';

interface ProfileHeroProps {
  user: User | null;
  isTeacher: boolean;
}

export const ProfileHero: React.FC<ProfileHeroProps> = ({ user, isTeacher }) => {
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric',
      })
    : '2026';

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#1e1b4b] via-[#312e81] to-[#4338ca] text-white p-6 sm:p-8 lg:p-10 shadow-xl">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-400/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left: Avatar & Identity */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar Circle with Badge */}
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/15 backdrop-blur-md border-2 border-white/30 shadow-2xl flex items-center justify-center text-3xl sm:text-4xl font-black text-white group-hover:scale-105 transition-transform">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-xl bg-emerald-500 text-white border-2 border-[#1e1b4b] shadow-md">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 border border-white/25 text-white">
                {isTeacher ? 'Guru Pengajar SMK' : 'Siswa Kejuruan'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Dapodik Terverifikasi
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              {user?.name}
            </h1>

            <p className="text-indigo-200 text-xs sm:text-sm flex items-center gap-2 font-medium">
              <span>{user?.email}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-300" /> Bergabung {memberSince}
              </span>
            </p>
          </div>
        </div>

        {/* Right: Summary Quick Badges */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full md:w-auto shrink-0">
          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[120px]">
            <p className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider">
              {isTeacher ? 'NIP / NIK' : 'NISN'}
            </p>
            <p className="text-sm font-black text-white font-mono mt-0.5 truncate">
              {user?.nip_nik_nisn || user?.nisn || user?.nip || '-'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[120px]">
            <p className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider">Rombel</p>
            <p className="text-sm font-black text-white mt-0.5 truncate">
              {user?.rombel || 'Semua Rombel'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
