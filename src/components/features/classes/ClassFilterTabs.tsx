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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 lg:p-8 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Kurikulum Merdeka • Manajemen Rombel & Pembelajaran</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-indigo-600" />
            Ruang Kelas Pembelajaran
          </h1>
          <p className="text-sm text-slate-500 max-w-2xl">
            Akses materi modul terpadu, kumpulkan tugas harian, ikuti kuis CBT interaktif, dan pantau kehadiran rombel Anda.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 z-10">
          {isStudent && (
            <button
              onClick={onOpenJoin}
              className="px-5 py-3 rounded-2xl bg-[#1e1b4b] hover:bg-slate-900 text-white font-bold text-xs shadow-md shadow-indigo-100 flex items-center gap-2 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Gabung Kelas (Kode)
            </button>
          )}

          {isTeacher && (
            <button
              onClick={onOpenCreate}
              className="px-5 py-3 rounded-2xl bg-[#1e1b4b] hover:bg-slate-900 text-white font-bold text-xs shadow-md shadow-indigo-100 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Buat Kelas Baru
            </button>
          )}
        </div>
      </div>

      {/* 2. Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Grade Filters */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => onGradeFilterChange('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              gradeFilter === 'all'
                ? 'bg-[#1e1b4b] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Semua ({totalCount})
          </button>
          <button
            onClick={() => onGradeFilterChange('X')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              gradeFilter === 'X'
                ? 'bg-[#1e1b4b] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Kelas X ({countX})
          </button>
          <button
            onClick={() => onGradeFilterChange('XI')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              gradeFilter === 'XI'
                ? 'bg-[#1e1b4b] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Kelas XI ({countXI})
          </button>
          <button
            onClick={() => onGradeFilterChange('XII')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              gradeFilter === 'XII'
                ? 'bg-[#1e1b4b] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Kelas XII ({countXII})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari nama kelas, mapel, atau rombel..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all shadow-2xs"
          />
        </div>
      </div>
    </div>
  );
};
