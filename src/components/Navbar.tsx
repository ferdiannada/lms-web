import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { NotificationDropdown } from './layout/NotificationDropdown';
import { ProfileDropdown } from './layout/ProfileDropdown';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 shrink-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3 flex items-center justify-between shadow-xs">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 p-1 shadow-xs group-hover:scale-105 transition-transform overflow-hidden flex items-center justify-center">
            <img
              src="/logo_smk_new.png"
              alt="SMK Al-Azhar"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              PEDIA <span className="text-indigo-600 font-black">LMS</span>
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Portal Guru & Siswa • SMK Al-Azhar
            </div>
          </div>
        </Link>
      </div>

      {/* User Actions & Profile */}
      <div className="flex items-center gap-3">
        <NotificationDropdown userExists={!!user} />
        <ProfileDropdown user={user} logout={logout} />
      </div>
    </header>
  );
};
