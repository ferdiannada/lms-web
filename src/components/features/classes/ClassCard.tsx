import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Users, FileText, HelpCircle, ArrowRight, Trash2 } from 'lucide-react';
import { ClassRoom } from '../../../types';

export const NEEDMCP_CARD_PALETTES = [
  {
    bg: 'bg-[#6b46c1]',
    text: 'text-white',
    subtext: 'text-white/85',
    badgeBg: 'bg-white/20 text-white border border-white/25',
    pillBg: 'bg-white/15 text-white border border-white/20',
    progressTrack: 'bg-white/20',
    progressBar: 'bg-white',
    arrowBtn: 'bg-white text-[#6b46c1] hover:bg-white/90 shadow-md',
    avatarBg: 'bg-white/20 text-white',
  },
  {
    bg: 'bg-[#a5d8d5]',
    text: 'text-slate-900',
    subtext: 'text-slate-800/85',
    badgeBg: 'bg-slate-900/10 text-slate-900 font-bold border border-slate-900/15',
    pillBg: 'bg-slate-900/10 text-slate-900 border border-slate-900/15 font-semibold',
    progressTrack: 'bg-slate-900/15',
    progressBar: 'bg-slate-900',
    arrowBtn: 'bg-[#1e1b4b] text-white hover:bg-slate-900 shadow-md',
    avatarBg: 'bg-slate-900/15 text-slate-900',
  },
  {
    bg: 'bg-[#ff8a65]',
    text: 'text-white',
    subtext: 'text-white/85',
    badgeBg: 'bg-white/20 text-white border border-white/25',
    pillBg: 'bg-white/15 text-white border border-white/20',
    progressTrack: 'bg-white/20',
    progressBar: 'bg-white',
    arrowBtn: 'bg-white text-[#ff8a65] hover:bg-white/90 shadow-md',
    avatarBg: 'bg-white/20 text-white',
  },
];

export interface ClassProgressInfo {
  percent: number;
  label: string;
  doneCount: number;
  totalCount: number;
  matCount: number;
  asgCount: number;
  qzCount: number;
}

interface ClassCardProps {
  cls: ClassRoom;
  index: number;
  progressInfo: ClassProgressInfo;
  isTeacher?: boolean;
  onDeleteClick?: (cls: ClassRoom) => void;
}

export const ClassCard: React.FC<ClassCardProps> = ({
  cls,
  index,
  progressInfo,
  isTeacher = false,
  onDeleteClick,
}) => {
  const style = NEEDMCP_CARD_PALETTES[index % NEEDMCP_CARD_PALETTES.length];
  const studentCount = cls.student_count || 0;

  return (
    <Link
      to={`/classes/${cls.id}`}
      className={`${style.bg} ${style.text} p-4 sm:p-5 rounded-2xl shadow-md relative overflow-hidden flex flex-col justify-between space-y-3 sm:space-y-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group cursor-pointer block`}
    >
      {/* Top Row: Rombel Badge + Student Count + Quick Delete */}
      <div className="flex justify-between items-center gap-2">
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider ${style.badgeBg}`}>
          {cls.rombel || 'SMK'}
        </span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold opacity-90">
            <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{studentCount} Siswa</span>
          </div>

          {isTeacher && onDeleteClick && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDeleteClick(cls);
              }}
              title="Hapus Kelas"
              className="p-1 sm:p-1.5 rounded-full bg-black/10 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Class Title & Description */}
      <div className="space-y-1">
        <h3 className="text-lg sm:text-xl font-bold leading-tight tracking-tight line-clamp-2 group-hover:opacity-90 transition-opacity">
          {cls.name}
        </h3>
        <p className={`text-[11px] sm:text-xs ${style.subtext} line-clamp-2 leading-snug`}>
          {cls.description || `Ruang pembelajaran ${cls.name} untuk rombongan belajar ${cls.rombel || 'SMK'}.`}
        </p>
      </div>

      {/* Resource Pill Badges */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-bold text-center">
        <div className={`py-1 px-1.5 sm:py-1.5 sm:px-2 rounded-lg sm:rounded-xl flex items-center justify-center gap-1 ${style.pillBg}`}>
          <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 opacity-80" />
          <span className="truncate">{studentCount} Siswa</span>
        </div>
        <div className={`py-1 px-1.5 sm:py-1.5 sm:px-2 rounded-lg sm:rounded-xl flex items-center justify-center gap-1 ${style.pillBg}`}>
          <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 opacity-80" />
          <span className="truncate">{progressInfo.matCount} Modul</span>
        </div>
        <div className={`py-1 px-1.5 sm:py-1.5 sm:px-2 rounded-lg sm:rounded-xl flex items-center justify-center gap-1 ${style.pillBg}`}>
          <HelpCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 opacity-80" />
          <span className="truncate">{progressInfo.asgCount + progressInfo.qzCount} Tugas</span>
        </div>
      </div>

      {/* NeedMCP Real Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] sm:text-[11px] font-bold opacity-90">
          <span>Progres Pembelajaran</span>
          <span>{progressInfo.percent}%</span>
        </div>
        <div className={`w-full ${style.progressTrack} h-1.5 sm:h-2 rounded-full overflow-hidden`}>
          <div
            className={`${style.progressBar} h-full rounded-full transition-all duration-500`}
            style={{ width: `${progressInfo.percent}%` }}
          ></div>
        </div>
        <p className={`text-[9px] sm:text-[10px] ${style.subtext} font-medium line-clamp-1`}>
          {progressInfo.label}
        </p>
      </div>

      {/* Card Footer: Teacher Info + CTA Arrow Button */}
      <div className="pt-2 sm:pt-3 border-t border-white/20 flex items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${style.avatarBg}`}>
            {(cls.teacher_name || 'G').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-[9px] sm:text-[10px] opacity-75 leading-none">Pengajar</p>
            <p className="text-[11px] sm:text-xs font-bold truncate mt-0.5">{cls.teacher_name || 'Guru Pengampu'}</p>
          </div>
        </div>

        <div
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shrink-0 ${style.arrowBtn}`}
          title="Masuk ke Ruang Kelas"
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Link>
  );
};
