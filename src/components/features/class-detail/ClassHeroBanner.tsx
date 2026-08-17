import React from 'react';
import { Trash2, Sparkles, BookOpen, GraduationCap } from 'lucide-react';
import { ClassRoom } from '../../../types';

interface ClassHeroBannerProps {
  classDetail: ClassRoom;
  isTeacher?: boolean;
  onDeleteClick?: () => void;
}

export const ClassHeroBanner: React.FC<ClassHeroBannerProps> = ({
  classDetail,
  isTeacher = false,
  onDeleteClick,
}) => {
  return (
    <div className="p-6 lg:p-8 rounded-[2rem] bg-m3-primary text-m3-on-primary shadow-lg relative overflow-hidden group">
      {/* M3 Ambient Blurs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-10 left-20 w-72 h-72 bg-m3-secondary/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Decorative Floating Icons */}
      <div className="absolute top-4 right-16 w-20 h-20 opacity-20 group-hover:opacity-40 transition-opacity duration-700 animate-[spin_15s_linear_infinite] [animation-play-state:paused] group-hover:[animation-play-state:running] pointer-events-none">
        <Sparkles className="w-full h-full text-white" />
      </div>
      <div className="absolute -bottom-8 right-40 w-32 h-32 opacity-10 group-hover:opacity-30 transition-opacity duration-700 animate-[bounce_8s_infinite] [animation-play-state:paused] group-hover:[animation-play-state:running] pointer-events-none">
        <GraduationCap className="w-full h-full text-white" />
      </div>
      <div className="absolute -top-10 left-1/3 w-24 h-24 opacity-10 group-hover:opacity-20 transition-opacity duration-700 animate-[pulse_6s_ease-in-out_infinite] [animation-play-state:paused] group-hover:[animation-play-state:running] pointer-events-none">
        <BookOpen className="w-full h-full text-white" />
      </div>

      <div className="space-y-5 relative z-10">
        {/* Top Meta Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-[11px] font-mono font-black uppercase tracking-widest bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/25 text-white">
            {classDetail.rombel} • Kode: {classDetail.code || classDetail.class_code}
          </span>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-indigo-100 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15">
              Pengajar: {classDetail.teacher_name}
            </span>

            {isTeacher && onDeleteClick && (
              <button
                type="button"
                onClick={onDeleteClick}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white border border-rose-400 text-xs font-bold transition-all cursor-pointer shadow-m3-elevation-1 hover:shadow-m3-elevation-2 active:scale-95"
                title="Hapus Kelas / Mata Pelajaran Ini"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Kelas</span>
              </button>
            )}
          </div>
        </div>

        {/* Title and Description */}
        <div className="space-y-1.5">
          <h1 className="text-2xl lg:text-3xl font-black text-m3-on-primary tracking-tight leading-tight">
            {classDetail.name}
          </h1>
          <p className="text-indigo-200/90 text-xs sm:text-sm max-w-2xl leading-relaxed">
            {classDetail.description || 'Ruang kelas pembelajaran interaktif SMK Al-Azhar.'}
          </p>
        </div>
      </div>
    </div>
  );
};
