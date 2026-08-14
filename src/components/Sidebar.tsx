import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpenCheck, FileText, HelpCircle, Award, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/classes', label: 'Kelas Saya', icon: BookOpenCheck },
    { to: '/assignments', label: 'Modul & Tugas', icon: FileText },
    { to: '/quizzes', label: 'Kuis & Ujian', icon: HelpCircle },
    { to: '/grades', label: user?.role === 'guru' ? 'Rekap Nilai Siswa' : 'Riwayat Nilai', icon: Award },
    { to: '/profile', label: 'Pengaturan Profil', icon: User },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-slate-800/80 min-h-[calc(100vh-65px)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        <div>
          <h3 className="px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            Menu {user?.role === 'guru' ? 'Guru Pengajar' : 'Siswa'}
          </h3>
          <nav className="mt-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/25 font-semibold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Role Context Pill */}
        <div className="p-3.5 rounded-2xl glass-card border border-indigo-500/20 bg-indigo-950/20">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Akses Sebagai {user?.role === 'guru' ? 'Guru' : 'Siswa'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {user?.role === 'guru'
              ? 'Anda memiliki hak pengajar untuk membuat materi, tugas, kuis, dan memberi nilai.'
              : 'Anda terdaftar di kelas SMK. Kumpulkan tugas dan kerjakan kuis tepat waktu.'}
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-3 py-2 border-t border-slate-800/80 text-[11px] text-slate-500">
        <p>PEDIA LMS SMK Web v2.0</p>
        <p>© 2026 SMK Al-Azhar</p>
      </div>
    </aside>
  );
};
