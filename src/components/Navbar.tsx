import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { NotificationDropdown } from './layout/NotificationDropdown';
import { ProfileDropdown } from './layout/ProfileDropdown';

interface NavbarProps {
  isScrolled?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ isScrolled = false }) => {
  const { user, logout } = useAuth();

  return (
    <div className={`absolute top-0 left-0 right-0 z-[60] flex justify-center pointer-events-none transition-all duration-300 ease-out ${
      isScrolled ? 'pt-3 px-3 sm:px-6' : 'pt-0 px-0'
    }`}>
      <header 
        className={`pointer-events-auto flex items-center justify-between text-m3-on-surface transition-all duration-300 ease-out ${
          isScrolled 
            ? 'h-14 w-full px-6 py-2 rounded-full bg-white/60 backdrop-blur-xl backdrop-saturate-200 shadow-lg border border-white/40' 
            : 'h-16 w-full px-4 lg:px-8 py-3 bg-m3-surface shadow-none border-b border-m3-outline-variant/20 rounded-none'
        }`}
      >
        {/* Greeting & Date Area (Left) */}
        <div className={`transition-all duration-300 ${isScrolled ? 'hidden md:flex flex-col' : 'flex flex-col'}`}>
          <span className="text-sm font-bold text-m3-on-surface tracking-tight">
            Halo, <span className="text-m3-primary">{user?.name?.split(' ')[0] || 'Pengguna'}</span> 👋
          </span>
          <span className="text-[10px] text-m3-on-surface-variant font-medium">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>

        {/* User Actions & Profile (Right) */}
        <div className="flex items-center gap-3">
          <NotificationDropdown userExists={!!user} />
          <ProfileDropdown user={user} logout={logout} />
        </div>
      </header>
    </div>
  );
};
