import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpenCheck,
  FileText,
  HelpCircle,
  Award,
  User as UserIcon,
  Sparkles,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/classes', label: 'Kelas Saya', icon: BookOpenCheck },
    { to: '/assignments', label: 'Modul & Tugas', icon: FileText },
    { to: '/quizzes', label: 'Kuis & Ujian', icon: HelpCircle },
    { to: '/grades', label: user?.role === 'guru' ? 'Rekap Nilai Siswa' : 'Riwayat Nilai', icon: Award },
    { to: '/profile', label: 'Pengaturan Profil', icon: UserIcon },
  ];

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 h-full overflow-y-auto p-4 flex flex-col justify-between hidden md:flex shrink-0 shadow-xs">
      <div className="space-y-5">
        {/* NeedMCP Wireframe: Profile Section */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all group">
          <div className="flex items-center gap-3">
            <div className="relative">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-200 shadow-xs"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-base shadow-md ring-2 ring-slate-200">
                  {getInitials(user?.name)}
                </div>
              )}
              {/* NeedMCP Active / Online Badge */}
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#ff8a65] text-white ring-2 ring-white shadow-xs">
                {user?.role === 'guru' ? 'Guru' : 'Aktif'}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                {user?.name || 'Pengguna'}
              </h4>
              <p className="text-[11px] text-slate-500 truncate">
                {user?.email || (user?.role === 'guru' ? 'guru@smk.sch.id' : 'siswa@smk.sch.id')}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {user?.role === 'guru' ? (
                    <>
                      <ShieldCheck className="w-3 h-3 text-indigo-600" />
                      Pengajar
                    </>
                  ) : (
                    <>
                      <GraduationCap className="w-3 h-3 text-emerald-600" />
                      {user?.rombel || 'Siswa SMK'}
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div>
          <div className="px-3 pb-2 flex items-center justify-between text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            <span>Menu Utama</span>
            <span className="text-[10px] lowercase text-indigo-600 font-normal">v2.4</span>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      isActive
                        ? 'bg-[#1e1b4b] text-white shadow-md shadow-indigo-100 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info & Dapodik Sync Status */}
      <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
        <div className="flex items-center justify-between text-[10px] text-slate-600 font-medium">
          <span>Sinkron Dapodik</span>
          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Terhubung
          </span>
        </div>
        <p className="font-semibold text-slate-700">PEDIA LMS SMK • Al-Azhar</p>
        <p className="text-slate-400">© 2026 Kurikulum Merdeka</p>
      </div>
    </aside>
  );
};
