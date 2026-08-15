import React from 'react';
import { ClassRoom } from '../../../types';

interface ClassHeroBannerProps {
  classDetail: ClassRoom;
}

export const ClassHeroBanner: React.FC<ClassHeroBannerProps> = ({ classDetail }) => {
  return (
    <div className="p-8 lg:p-9 rounded-[2rem] bg-gradient-to-r from-[#6b46c1] via-[#5b21b6] to-[#1e1b4b] text-white shadow-xl space-y-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="flex items-center justify-between relative z-10 flex-wrap gap-2">
        <span className="text-xs font-mono font-black uppercase tracking-widest bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/25">
          {classDetail.rombel} • Kode: {classDetail.code || classDetail.class_code}
        </span>
        <span className="text-xs font-bold text-indigo-100 bg-white/10 px-3 py-1 rounded-full border border-white/15">
          Pengajar: {classDetail.teacher_name}
        </span>
      </div>

      <div className="space-y-1.5 relative z-10">
        <h1 className="text-3xl lg:text-4xl font-black tracking-tight">{classDetail.name}</h1>
        <p className="text-indigo-100/90 text-sm max-w-2xl leading-relaxed">
          {classDetail.description || 'Ruang kelas pembelajaran interaktif SMK Al-Azhar.'}
        </p>
      </div>
    </div>
  );
};
