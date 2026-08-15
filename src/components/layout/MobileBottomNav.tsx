import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpenCheck,
  FileText,
  HelpCircle,
  Award,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MobileBottomNav: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { to: '/', label: 'Beranda', icon: LayoutDashboard },
    { to: '/classes', label: 'Kelas', icon: BookOpenCheck },
    { to: '/assignments', label: 'Tugas', icon: FileText },
    { to: '/quizzes', label: 'Kuis', icon: HelpCircle },
    { to: '/grades', label: user?.role === 'guru' ? 'Rekap' : 'Nilai', icon: Award },
    { to: '/profile', label: 'Profil', icon: UserIcon },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-2 py-1.5 shadow-lg shadow-slate-900/10">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 min-w-[50px] ${
                  isActive
                    ? 'text-indigo-600 font-bold scale-105'
                    : 'text-slate-500 hover:text-slate-800 font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`p-1 rounded-xl transition-colors ${
                      isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] tracking-tight mt-0.5 leading-none">
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="w-1 h-1 rounded-full bg-indigo-600 mt-0.5"></span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
