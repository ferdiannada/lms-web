import { useEffect, useState } from '@lynx-js/react';
import './App.css';
import { authService } from './services/authService';
import { classService } from './services/classService';
import { getToken } from './services/api';
import type { User, ClassModel } from './types';
import { LoginView } from './views/LoginView';
import { ChangePasswordView } from './views/ChangePasswordView';
import { DashboardView } from './views/DashboardView';
import { ClassDetailView } from './views/ClassDetailView';
import { NotificationsView } from './views/NotificationsView';
import { ProfileView } from './views/ProfileView';
import { RiwayatNilaiView } from './views/RiwayatNilaiView';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'classes' | 'notifications' | 'profile' | 'nilai'
  >('dashboard');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [classesList, setClassesList] = useState<ClassModel[]>([]);

  // Responsive Viewport Detection for PC/Laptop (>=1024px) vs Mobile (<1024px)
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && typeof window.innerWidth === 'number') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      const handleResize = () => {
        if (typeof window !== 'undefined' && typeof window.innerWidth === 'number') {
          setIsDesktop(window.innerWidth >= 1024);
        }
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const fetchUnread = async () => {
    try {
      const res = await classService.getUnreadCount();
      setUnreadCount(res.unread_count || 0);
    } catch {
      // Ignore
    }
  };

  const fetchClassesList = async () => {
    try {
      const data = await classService.getClasses();
      setClassesList(data || []);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const user = await authService.getMe();
        setCurrentUser(user);
        fetchUnread();
        fetchClassesList();
      } catch (err) {
        console.warn('Session expired or invalid:', err);
        removeToken();
        setCurrentUser(null);
      }
    };

    checkSession();
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setSelectedClassId(null);
    setActiveTab('dashboard');
  };

  if (!currentUser) {
    return (
      <LoginView
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          fetchUnread();
          fetchClassesList();
        }}
      />
    );
  }

  if (currentUser.isInitialPassword) {
    return (
      <ChangePasswordView
        onSuccess={() =>
          setCurrentUser({ ...currentUser, isInitialPassword: false })
        }
      />
    );
  }

  return (
    <view className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* DESKTOP SIDEBAR */}
      <view className="desktop-sidebar flex flex-col fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-slate-200/80 z-30 justify-between p-4 shadow-sm">
        <view className="flex flex-col gap-6">
          {/* Brand Logo */}
          <view
            className="flex items-center gap-3 px-2 py-2 cursor-pointer group"
            bindtap={() => {
              setSelectedClassId(null);
              setActiveTab('dashboard');
            }}
          >
            <view className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <text>🎓</text>
            </view>
            <view className="flex flex-col">
              <text className="font-extrabold text-base text-slate-900 tracking-tight leading-tight">
                PEDIA LMS
              </text>
              <text className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                SMK Al-Azhar
              </text>
            </view>
          </view>

          {/* Navigation Links */}
          <view className="flex flex-col gap-1.5">
            <view
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm cursor-pointer transition-all ${
                activeTab === 'dashboard' && !selectedClassId
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              bindtap={() => {
                setSelectedClassId(null);
                setActiveTab('dashboard');
              }}
            >
              <text className="text-base">🏠</text>
              <text>Dashboard</text>
            </view>

            {currentUser.role === 'siswa' && (
              <view
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm cursor-pointer transition-all ${
                  activeTab === 'nilai' && !selectedClassId
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                bindtap={() => {
                  setSelectedClassId(null);
                  setActiveTab('nilai');
                }}
              >
                <text className="text-base">📊</text>
                <text>Riwayat Nilai</text>
              </view>
            )}

            <view
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm cursor-pointer transition-all ${
                activeTab === 'notifications' && !selectedClassId
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              bindtap={() => {
                setSelectedClassId(null);
                setActiveTab('notifications');
                fetchUnread();
              }}
            >
              <view className="flex items-center gap-3">
                <text className="text-base">🔔</text>
                <text>Notifikasi</text>
              </view>
              {unreadCount > 0 && (
                <view className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  <text>{unreadCount}</text>
                </view>
              )}
            </view>

            <view
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm cursor-pointer transition-all ${
                activeTab === 'profile' && !selectedClassId
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              bindtap={() => {
                setSelectedClassId(null);
                setActiveTab('profile');
              }}
            >
              <text className="text-base">👤</text>
              <text>Profil Saya</text>
            </view>
          </view>

          {/* Quick Classes List */}
          {classesList.length > 0 && (
            <view className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <text className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3">
                Kelas Cepat
              </text>
              <view className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
                {classesList.slice(0, 5).map((cls) => (
                  <view
                    key={cls.id}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer truncate transition-colors ${
                      selectedClassId === cls.id
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                    bindtap={() => {
                      setSelectedClassId(cls.id);
                    }}
                  >
                    <view className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    <text className="truncate">{cls.name}</text>
                  </view>
                ))}
              </view>
            </view>
          )}
        </view>

        {/* User Profile Card Footer */}
        <view className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between">
          <view
            className="flex items-center gap-2.5 cursor-pointer truncate"
            bindtap={() => {
              setSelectedClassId(null);
              setActiveTab('profile');
            }}
          >
            <view className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm shrink-0">
              <text>{currentUser.name[0]?.toUpperCase()}</text>
            </view>
            <view className="flex flex-col truncate">
              <text className="font-bold text-xs text-slate-800 truncate">
                {currentUser.name}
              </text>
              <text className="text-[10px] font-semibold text-slate-400 uppercase">
                {currentUser.role}
              </text>
            </view>
          </view>
          <view
            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
            bindtap={handleLogout}
            title="Keluar"
          >
            <text className="text-sm">🚪</text>
          </view>
        </view>
      </view>

      {/* MOBILE TOP HEADER */}
      <view className="mobile-top-header sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-200 z-40 px-4 py-3 flex items-center justify-between shadow-xs">
        <view
          className="flex items-center gap-2.5 cursor-pointer"
          bindtap={() => {
            setSelectedClassId(null);
            setActiveTab('dashboard');
          }}
        >
          <view className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            <text>🎓</text>
          </view>
          <view className="flex flex-col">
            <text className="font-extrabold text-sm text-slate-900 leading-tight">
              PEDIA LMS
            </text>
            <text className="text-[9px] font-bold text-blue-600 uppercase">
              SMK Al-Azhar
            </text>
          </view>
        </view>

        <view className="flex items-center gap-2">
          <view
            className="relative p-2 rounded-xl bg-slate-100 text-slate-600 cursor-pointer"
            bindtap={() => {
              setSelectedClassId(null);
              setActiveTab('notifications');
              fetchUnread();
            }}
          >
            <text className="text-sm">🔔</text>
            {unreadCount > 0 && (
              <view className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                <text>{unreadCount}</text>
              </view>
            )}
          </view>

          <view
            className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs cursor-pointer"
            bindtap={() => {
              setSelectedClassId(null);
              setActiveTab('profile');
            }}
          >
            <text>{currentUser.name[0]?.toUpperCase()}</text>
          </view>
        </view>
      </view>

      {/* MAIN CONTENT ROUTER AREA */}
      <view className="main-content-layout flex-1 p-4 md:p-8 min-h-screen">
        {selectedClassId ? (
          <ClassDetailView
            classId={selectedClassId}
            user={currentUser}
            onBack={() => setSelectedClassId(null)}
          />
        ) : activeTab === 'notifications' ? (
          <NotificationsView />
        ) : activeTab === 'profile' ? (
          <ProfileView
            user={currentUser}
            onUpdateUser={(updated) => setCurrentUser(updated)}
            onLogout={handleLogout}
          />
        ) : activeTab === 'nilai' && currentUser.role === 'siswa' ? (
          <RiwayatNilaiView />
        ) : (
          <DashboardView
            user={currentUser}
            onSelectClass={(classId) => setSelectedClassId(classId)}
          />
        )}
      </view>

      {/* MOBILE STICKY BOTTOM NAVIGATION BAR */}
      <view className="mobile-bottom-nav fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 z-50 flex items-center justify-around px-2 shadow-lg">
        <view
          className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl cursor-pointer transition-all ${
            activeTab === 'dashboard' && !selectedClassId
              ? 'text-blue-600 font-bold'
              : 'text-slate-400'
          }`}
          bindtap={() => {
            setSelectedClassId(null);
            setActiveTab('dashboard');
          }}
        >
          <text className="text-lg">🏠</text>
          <text className="text-[10px] mt-0.5">Home</text>
        </view>

        {currentUser.role === 'siswa' && (
          <view
            className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl cursor-pointer transition-all ${
              activeTab === 'nilai' && !selectedClassId
                ? 'text-blue-600 font-bold'
                : 'text-slate-400'
            }`}
            bindtap={() => {
              setSelectedClassId(null);
              setActiveTab('nilai');
            }}
          >
            <text className="text-lg">📊</text>
            <text className="text-[10px] mt-0.5">Nilai</text>
          </view>
        )}

        <view
          className={`relative flex flex-col items-center justify-center w-14 h-12 rounded-xl cursor-pointer transition-all ${
            activeTab === 'notifications' && !selectedClassId
              ? 'text-blue-600 font-bold'
              : 'text-slate-400'
          }`}
          bindtap={() => {
            setSelectedClassId(null);
            setActiveTab('notifications');
            fetchUnread();
          }}
        >
          <text className="text-lg">🔔</text>
          <text className="text-[10px] mt-0.5">Notif</text>
          {unreadCount > 0 && (
            <view className="absolute top-1 right-3 bg-rose-500 w-2 h-2 rounded-full" />
          )}
        </view>

        <view
          className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl cursor-pointer transition-all ${
            activeTab === 'profile' && !selectedClassId
              ? 'text-blue-600 font-bold'
              : 'text-slate-400'
          }`}
          bindtap={() => {
            setSelectedClassId(null);
            setActiveTab('profile');
          }}
        >
          <text className="text-lg">👤</text>
          <text className="text-[10px] mt-0.5">Profil</text>
        </view>
      </view>
    </view>
  );
}
