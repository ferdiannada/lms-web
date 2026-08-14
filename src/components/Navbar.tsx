import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Bell, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const getRoleBadge = (role?: string) => {
    if (role === 'guru') {
      return (
        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-2.5 py-0.5 rounded-full font-semibold">
          Guru Pengajar
        </span>
      );
    }
    return (
      <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs px-2.5 py-0.5 rounded-full font-semibold">
        Siswa SMK
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3.5 flex items-center justify-between">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200 tracking-tight">
              PEDIA <span className="text-indigo-400 font-extrabold">LMS</span>
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Portal Guru & Siswa • SMK Al-Azhar
            </div>
          </div>
        </Link>
      </div>

      {/* User Actions & Profile */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button className="relative p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-slate-950 animate-ping"></span>
        </button>

        {/* User Profile Popover */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 p-1.5 pl-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 transition-all cursor-pointer"
            >
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-slate-100">{user.name}</div>
                <div className="flex justify-end">{getRoleBadge(user.role)}</div>
              </div>
              <img
                src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                alt={user.name}
                className="w-9 h-9 rounded-lg object-cover ring-2 ring-indigo-500/40"
              />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div
                className="absolute right-0 mt-2 w-64 glass-panel rounded-2xl p-2 shadow-2xl border border-slate-700/80 z-50 animate-in fade-in zoom-in-95"
                onMouseLeave={() => setShowDropdown(false)}
              >
                <div className="p-3 border-b border-slate-800">
                  <p className="text-sm font-bold text-slate-100">{user.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  {user.nisn && <p className="text-[11px] text-indigo-400 mt-1">NISN: {user.nisn}</p>}
                  {user.nip && <p className="text-[11px] text-emerald-400 mt-1">NIP: {user.nip}</p>}
                  {user.rombel && <p className="text-[11px] text-slate-400 mt-0.5">Rombel: {user.rombel}</p>}
                </div>
                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-indigo-600/20 rounded-xl transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-indigo-400" />
                    Profil Saya & Pengaturan
                  </Link>
                </div>
                <div className="pt-1 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Keluar (Logout)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
