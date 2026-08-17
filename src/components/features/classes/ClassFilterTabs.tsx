import React from 'react';
import { Search, Sparkles, BookOpen, Plus, UserPlus } from 'lucide-react';

interface ClassFilterTabsProps {
  totalCount: number;
  countX: number;
  countXI: number;
  countXII: number;
  gradeFilter: 'all' | 'X' | 'XI' | 'XII';
  onGradeFilterChange: (filter: 'all' | 'X' | 'XI' | 'XII') => void;
  search: string;
  onSearchChange: (val: string) => void;
  isStudent: boolean;
  isTeacher: boolean;
  onOpenJoin: () => void;
  onOpenCreate: () => void;
}

export const ClassFilterTabs: React.FC<ClassFilterTabsProps> = ({
  totalCount,
  countX,
  countXI,
  countXII,
  gradeFilter,
  onGradeFilterChange,
  search,
  onSearchChange,
  isStudent,
  isTeacher,
  onOpenJoin,
  onOpenCreate,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-m3-primary p-6 lg:p-8 rounded-[2rem] shadow-lg relative overflow-hidden group">
        {/* M3 Ambient Blurs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 left-20 w-72 h-72 bg-m3-secondary/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Decorative Floating Icons */}
        <div className="absolute top-4 right-16 w-20 h-20 opacity-20 group-hover:opacity-40 transition-opacity duration-700 animate-[spin_15s_linear_infinite] [animation-play-state:paused] group-hover:[animation-play-state:running] pointer-events-none">
          <Sparkles className="w-full h-full text-white" />
        </div>
        <div className="absolute -bottom-8 right-40 w-32 h-32 opacity-10 group-hover:opacity-30 transition-opacity duration-700 animate-[bounce_8s_infinite] [animation-play-state:paused] group-hover:[animation-play-state:running] pointer-events-none">
          <BookOpen className="w-full h-full text-white" />
        </div>
        <div className="absolute -top-10 left-1/3 w-24 h-24 opacity-10 group-hover:opacity-20 transition-opacity duration-700 animate-[pulse_6s_ease-in-out_infinite] [animation-play-state:paused] group-hover:[animation-play-state:running] pointer-events-none">
          <UserPlus className="w-full h-full text-white" />
        </div>

        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-m3-on-primary/10 backdrop-blur-md border border-m3-on-primary/15 text-m3-on-primary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kurikulum Merdeka • Manajemen Rombel & Pembelajaran</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-m3-on-primary tracking-tight flex items-center gap-2.5">
            Ruang Kelas Pembelajaran
          </h1>
          <p className="text-indigo-200/90 text-xs sm:text-sm max-w-xl leading-relaxed">
            Akses materi modul terpadu, kumpulkan tugas harian, ikuti kuis CBT interaktif, dan pantau kehadiran rombel Anda di satu tempat yang terintegrasi.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 z-10 shrink-0">
          {isStudent && (
            <button
              onClick={onOpenJoin}
              className="px-6 py-3.5 rounded-full bg-m3-surface text-m3-primary hover:bg-m3-surface-variant font-bold text-sm shadow-m3-elevation-1 hover:shadow-m3-elevation-2 flex items-center gap-2 transition-all duration-300 ease-m3-standard active:scale-[0.98] cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Gabung Kelas
            </button>
          )}

          {isTeacher && (
            <button
              onClick={onOpenCreate}
              className="px-6 py-3.5 rounded-full bg-m3-surface text-m3-primary hover:bg-m3-surface-variant font-bold text-sm shadow-m3-elevation-1 hover:shadow-m3-elevation-2 flex items-center gap-2 transition-all duration-300 ease-m3-standard active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Buat Kelas Baru
            </button>
          )}
        </div>
      </div>

      {/* 2. Filters & Search Toolbar */}
      <div className="bg-m3-surface p-4 rounded-[1.5rem] border border-m3-outline-variant/30 shadow-m3-elevation-1 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Grade Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto overflow-y-hidden py-2 px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <button
            onClick={() => onGradeFilterChange('all')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-500 ease-m3-standard active:scale-90 cursor-pointer shrink-0 ${
              gradeFilter === 'all'
                ? 'bg-[#1e1b4b] text-white shadow-md scale-105'
                : 'text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-container'
            }`}
          >
            Semua ({totalCount})
          </button>
          <button
            onClick={() => onGradeFilterChange('X')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-500 ease-m3-standard active:scale-90 cursor-pointer shrink-0 ${
              gradeFilter === 'X'
                ? 'bg-[#1e1b4b] text-white shadow-md scale-105'
                : 'text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-container'
            }`}
          >
            Kelas X ({countX})
          </button>
          <button
            onClick={() => onGradeFilterChange('XI')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-500 ease-m3-standard active:scale-90 cursor-pointer shrink-0 ${
              gradeFilter === 'XI'
                ? 'bg-[#1e1b4b] text-white shadow-md scale-105'
                : 'text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-container'
            }`}
          >
            Kelas XI ({countXI})
          </button>
          <button
            onClick={() => onGradeFilterChange('XII')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-500 ease-m3-standard active:scale-90 cursor-pointer shrink-0 ${
              gradeFilter === 'XII'
                ? 'bg-[#1e1b4b] text-white shadow-md scale-105'
                : 'text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-container'
            }`}
          >
            Kelas XII ({countXII})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80 group">
          <Search className="w-4 h-4 text-m3-on-surface-variant absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-m3-primary transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari nama kelas atau rombel..."
            className="w-full bg-m3-surface-container border border-m3-outline-variant focus:border-m3-primary focus:bg-m3-surface rounded-xl py-3 pl-11 pr-4 text-xs text-m3-on-surface placeholder-m3-on-surface-variant focus:outline-none focus:ring-1 focus:ring-m3-primary transition-all shadow-xs"
          />
        </div>
      </div>
    </div>
  );
};
