import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, User as UserIcon, Sparkles } from 'lucide-react';
import { User as UserType } from '../../types';
import { useClickOutside } from '../../hooks';

interface ProfileDropdownProps {
  user: UserType | null;
  logout: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, logout }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false), isOpen);

  const getRoleBadge = (role?: string) => {
    if (role === 'guru') {
      return (
        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
          Guru Pengajar
        </span>
      );
    }
    return (
      <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
        Siswa SMK
      </span>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl hover:bg-slate-100/80 transition-all cursor-pointer border border-transparent hover:border-slate-200 group"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1e1b4b] to-indigo-600 text-white font-bold flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform text-xs">
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="text-left hidden md:block">
          <p className="text-xs font-bold text-slate-800 line-clamp-1">{user?.name}</p>
          <p className="text-[10px] text-slate-400 font-medium capitalize">{user?.role || 'Siswa'}</p>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl p-3 shadow-2xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* User Info */}
          <div className="p-3 border-b border-slate-100 flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 font-bold text-lg flex items-center justify-center shrink-0 border border-indigo-100">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate mb-1.5">{user?.email}</p>
              {getRoleBadge(user?.role)}
            </div>
          </div>

          {/* Academic Info */}
          <div className="p-3 bg-slate-50 rounded-2xl my-2 space-y-1.5 text-xs text-slate-600 border border-slate-100">
            {user?.rombel && (
              <div className="flex justify-between">
                <span className="text-slate-400">Rombel:</span>
                <span className="font-semibold text-slate-800">{user.rombel}</span>
              </div>
            )}
            {user?.nisn && (
              <div className="flex justify-between">
                <span className="text-slate-400">NISN:</span>
                <span className="font-semibold text-slate-800 font-mono">{user.nisn}</span>
              </div>
            )}
            {user?.nip && (
              <div className="flex justify-between">
                <span className="text-slate-400">NIP/NIK:</span>
                <span className="font-semibold text-slate-800 font-mono">{user.nip}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Dapodik Sync
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                Terhubung
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-1 pt-1">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition cursor-pointer"
            >
              <UserIcon className="w-4 h-4 text-slate-400" />
              Pengaturan Akun & Profil
            </Link>

            <button
              onClick={() => {
                setIsOpen(false);
                logout();
                navigate('/login');
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              Keluar dari Sistem
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
