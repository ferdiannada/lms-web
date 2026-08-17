import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpenCheck,
  FileText,
  HelpCircle,
  Award,
  User as UserIcon,
  ShieldCheck,
  GraduationCap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    <aside 
      className={`relative z-50 bg-gradient-to-b from-m3-surface via-m3-surface to-indigo-50/30 border-r border-m3-outline-variant/30 h-full overflow-visible flex flex-col justify-between hidden md:flex shrink-0 transition-all duration-300 ease-out ${
        isCollapsed ? 'w-20 px-3 pb-4 pt-6' : 'w-64 px-4 pb-4 pt-6'
      }`}
    >
      {/* Decorative Background Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-indigo-100/20 to-transparent pointer-events-none -z-10"></div>
      <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-24 -right-4 z-50 w-8 h-8 bg-m3-primary text-m3-on-primary hover:scale-110 rounded-full flex items-center justify-center shadow-m3-elevation-3 transition-all duration-300 ease-out cursor-pointer"
        title={isCollapsed ? 'Perluas Sidebar' : 'Minimalkan Sidebar'}
      >
        {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>

      <div className="space-y-5 relative z-10">
        {/* Brand & Logo */}
        <div className={`flex items-center px-1 mb-6 transition-all duration-300 ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <Link to="/" className={`flex items-center gap-3 group ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 shrink-0 rounded-xl bg-m3-surface-variant p-1 shadow-xs group-hover:scale-105 transition-transform overflow-hidden flex items-center justify-center">
              <img
                src="/logo_smk_new.png"
                alt="SMK Al-Azhar"
                className="w-full h-full object-contain"
              />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 transition-opacity duration-300">
                <span className="text-xl font-bold text-m3-on-surface tracking-tight whitespace-nowrap block truncate">
                  PEDIA <span className="text-m3-primary font-black">LMS</span>
                </span>
                <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-medium truncate">
                  <span className="inline-block shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="truncate">Portal Guru & Siswa • SMK Al-Azhar</span>
                </div>
              </div>
            )}
          </Link>
        </div>

        {/* Profile Section */}
        <div className={`p-3 rounded-2xl bg-m3-surface-container-low border border-m3-outline-variant/30 hover:border-m3-primary transition-all group flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="relative shrink-0">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-m3-surface shadow-xs"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-m3-primary flex items-center justify-center text-m3-on-primary font-bold text-sm shadow-md ring-2 ring-m3-surface">
                {getInitials(user?.name)}
              </div>
            )}
            {!isCollapsed && (
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#ff8a65] text-white ring-2 ring-m3-surface shadow-xs">
                {user?.role === 'guru' ? 'Guru' : 'Aktif'}
              </span>
            )}
          </div>

          {!isCollapsed && (
            <div className="flex-1 min-w-0 transition-opacity duration-300">
              <h4 className="text-sm font-bold text-m3-on-surface truncate group-hover:text-m3-primary transition-colors">
                {user?.name || 'Pengguna'}
              </h4>
              <p className="text-[10px] text-m3-on-surface-variant truncate">
                {user?.email || (user?.role === 'guru' ? 'guru@smk.sch.id' : 'siswa@smk.sch.id')}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md bg-m3-secondary-container text-m3-on-secondary-container">
                  {user?.role === 'guru' ? (
                    <>
                      <ShieldCheck className="w-3 h-3" />
                      Pengajar
                    </>
                  ) : (
                    <>
                      <GraduationCap className="w-3 h-3" />
                      {user?.rombel || 'Siswa'}
                    </>
                  )}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <div>
          {!isCollapsed && (
            <div className="px-3 pb-2 flex items-center justify-between text-[11px] font-bold tracking-wider text-m3-on-surface-variant uppercase transition-opacity duration-300">
              <span>Menu Utama</span>
            </div>
          )}
          <nav className="space-y-1.5 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `group relative flex items-center rounded-full font-medium transition-all duration-300 ease-out active:scale-95 ${
                      isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3 text-sm'
                    } ${
                      isActive
                        ? `bg-[#1e1b4b] text-white font-bold shadow-m3-elevation-1 ${!isCollapsed ? 'translate-x-1' : 'scale-110'}`
                        : `text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-container-low ${!isCollapsed ? 'hover:translate-x-0.5' : 'hover:scale-110'}`
                    }`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span className="truncate whitespace-nowrap">{item.label}</span>}
                  
                  {/* Modern Tooltip for Mini Sidebar */}
                  {isCollapsed && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3.5 py-2 bg-[#1e1b4b] border border-[#1e1b4b] rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap z-50 flex items-center">
                      <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#1e1b4b] rotate-45 rounded-sm"></div>
                      <span className="relative z-10 text-[11px] font-extrabold tracking-wide text-white uppercase">{item.label}</span>
                    </div>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info */}
      {!isCollapsed && (
        <div className="pt-4 border-t border-m3-outline-variant/30 text-[11px] text-m3-on-surface-variant space-y-1.5 transition-opacity duration-300">
          <div className="flex items-center justify-between font-bold">
            <span>Dapodik Sync</span>
            <span className="flex items-center gap-1.5 text-m3-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-m3-primary animate-pulse"></span> Aktif
            </span>
          </div>
          <p className="font-bold text-m3-on-surface">PEDIA LMS SMK</p>
          <p className="text-[10px]">© 2026 Kurikulum Merdeka</p>
        </div>
      )}
    </aside>
  );
};
