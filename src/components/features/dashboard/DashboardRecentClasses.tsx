import React from 'react';
import { BookOpen, Users, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ClassRoom } from '../../../types';

// NeedMCP Signature Theme Palettes
const CARD_PALETTES = [
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

interface DashboardRecentClassesProps {
  classes: ClassRoom[];
  progressMap: Record<string, { percent: number; label: string }>;
}

export const DashboardRecentClasses: React.FC<DashboardRecentClassesProps> = ({
  classes,
  progressMap,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          Progres Ruang Kelas Kejuruan Teratas
        </h2>
        <Link
          to="/classes"
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
        >
          Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {classes.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-400 text-xs">
          Belum ada ruang kelas yang terdaftar.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {classes.map((cls, idx) => {
            const palette = CARD_PALETTES[idx % CARD_PALETTES.length];
            const prog = progressMap[cls.id] || { percent: 0, label: '0% Selesai' };

            return (
              <Link
                key={cls.id}
                to={`/classes/${cls.id}`}
                className={`p-6 flex flex-col justify-between rounded-3xl ${palette.bg} ${palette.text} shadow-md space-y-4 relative overflow-hidden group hover:scale-[1.02] transition-transform`}
              >
                <div className="space-y-2 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${palette.badgeBg}`}>
                      {cls.rombel}
                    </span>
                    <span className={`text-[11px] font-semibold ${palette.subtext}`}>
                      {cls.student_count || cls.member_count || 0} Siswa
                    </span>
                  </div>

                  <h3 className="text-base font-black truncate">{cls.name}</h3>
                  <p className={`text-xs line-clamp-2 ${palette.subtext}`}>
                    Pengajar: {cls.teacher_name || 'Guru SMK'}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 relative z-10 pt-2 border-t border-white/20">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span>{prog.label}</span>
                    <span>{prog.percent}%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${palette.progressTrack}`}>
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${palette.progressBar}`}
                      style={{ width: `${Math.max(5, prog.percent)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end relative z-10">
                  <div
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${palette.arrowBtn}`}
                  >
                    <span>Masuk Kelas</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
