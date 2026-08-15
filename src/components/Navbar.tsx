import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AppNotification } from '../types';
import {
  LogOut,
  User as UserIcon,
  Bell,
  BookOpen,
  FileText,
  HelpCircle,
  MessageSquare,
  CheckCheck,
  ChevronRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isNotifLoading, setIsNotifLoading] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all');

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Load notification unread count on mount
  useEffect(() => {
    if (!user) return;
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 45000); // poll every 45s
    return () => clearInterval(interval);
  }, [user]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const count = await api.getUnreadNotificationCount();
      setUnreadCount(count);
    } catch {
      // fallback
    }
  };

  const handleOpenNotifications = async () => {
    const nextState = !showNotifDropdown;
    setShowNotifDropdown(nextState);
    if (nextState) {
      setShowProfileDropdown(false);
      setIsNotifLoading(true);
      try {
        const notifList = await api.getNotifications(1, 20);
        setNotifications(notifList);
        // Calculate unread
        const unread = notifList.filter((n) => !n.read_at).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      } finally {
        setIsNotifLoading(false);
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleNotificationClick = async (notif: AppNotification) => {
    setShowNotifDropdown(false);

    // Mark as read in state & backend
    if (!notif.read_at) {
      api.markNotificationRead(notif.id).catch(() => {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    // Determine target URL based on notification type
    if (notif.type === 'assignment') {
      navigate('/assignments');
    } else if (notif.type === 'quiz') {
      if (notif.post_id) {
        navigate(`/quiz/${notif.post_id}`);
      } else {
        navigate('/quizzes');
      }
    } else if (notif.type === 'material') {
      navigate('/assignments');
    } else if (notif.class_id) {
      navigate(`/classes/${notif.class_id}`);
    } else {
      navigate('/');
    }
  };

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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return <FileText className="w-4 h-4 text-emerald-600" />;
      case 'quiz':
        return <HelpCircle className="w-4 h-4 text-amber-600" />;
      case 'material':
        return <BookOpen className="w-4 h-4 text-cyan-600" />;
      case 'forum_mention':
      case 'forum_reply':
      case 'forum_comment':
        return <MessageSquare className="w-4 h-4 text-indigo-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-violet-600" />;
    }
  };

  const formatRelativeTime = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const diffMs = Date.now() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);

      if (diffSec < 60) return 'Baru saja';
      if (diffMin < 60) return `${diffMin} mnt lalu`;
      if (diffHour < 24) return `${diffHour} jam lalu`;
      if (diffDay < 7) return `${diffDay} hari lalu`;
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  const displayedNotifications = notifications.filter((n) =>
    notifFilter === 'unread' ? !n.read_at : true
  );

  return (
    <header className="h-16 shrink-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3 flex items-center justify-between shadow-xs">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 p-1 shadow-sm group-hover:scale-105 transition-transform overflow-hidden flex items-center justify-center">
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
        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={handleOpenNotifications}
            className={`relative p-2.5 rounded-xl transition-all cursor-pointer ${
              showNotifDropdown
                ? 'bg-[#1e1b4b] text-white shadow-md'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 border border-slate-200/80'
            }`}
            title="Pemberitahuan & Notifikasi"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white shadow-md animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Popover Menu */}
          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl p-3 shadow-2xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="flex items-center justify-between p-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-slate-900">Notifikasi</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold">
                      {unreadCount} Baru
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Tandai Semua Dibaca
                  </button>
                )}
              </div>

              {/* Subtabs Filter */}
              <div className="flex items-center gap-1 pt-2 pb-1 border-b border-slate-100 px-1">
                <button
                  onClick={() => setNotifFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    notifFilter === 'all'
                      ? 'bg-[#1e1b4b] text-white'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Semua ({notifications.length})
                </button>
                <button
                  onClick={() => setNotifFilter('unread')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    notifFilter === 'unread'
                      ? 'bg-[#1e1b4b] text-white'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Belum Dibaca ({unreadCount})
                </button>
              </div>

              {/* Notifications List */}
              <div className="max-h-[380px] overflow-y-auto py-2 space-y-1.5 custom-scrollbar">
                {isNotifLoading ? (
                  <div className="py-12 text-center text-slate-500 space-y-2">
                    <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs">Memuat notifikasi...</p>
                  </div>
                ) : displayedNotifications.length === 0 ? (
                  <div className="py-12 px-4 text-center text-slate-500 space-y-2">
                    <Bell className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs font-semibold text-slate-700">
                      {notifFilter === 'unread'
                        ? 'Semua notifikasi sudah dibaca.'
                        : 'Belum ada notifikasi baru saat ini.'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Pemberitahuan tugas, modul, ujian, dan forum kelas akan muncul di sini.
                    </p>
                  </div>
                ) : (
                  displayedNotifications.map((notif) => {
                    const isUnread = !notif.read_at;
                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer group flex items-start gap-3 ${
                          isUnread
                            ? 'bg-indigo-50/70 border-indigo-200/80 hover:border-indigo-300'
                            : 'bg-slate-50/70 border-slate-200/70 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        {/* Type Icon */}
                        <div
                          className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                            isUnread ? 'bg-white shadow-xs' : 'bg-white shadow-xs'
                          }`}
                        >
                          {getNotificationIcon(notif.type)}
                        </div>

                        {/* Text Content */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4
                              className={`text-xs font-bold truncate ${
                                isUnread ? 'text-indigo-950 font-extrabold' : 'text-slate-800'
                              }`}
                            >
                              {notif.title}
                            </h4>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {formatRelativeTime(notif.created_at)}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                            {notif.body}
                          </p>

                          {notif.actor && (
                            <p className="text-[10px] text-indigo-600 font-semibold">
                              Oleh: {notif.actor.name}
                            </p>
                          )}
                        </div>

                        {/* Unread Indicator or Action Arrow */}
                        <div className="shrink-0 pt-1">
                          {isUnread ? (
                            <span className="w-2 h-2 rounded-full bg-indigo-600 block animate-pulse"></span>
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-2 border-t border-slate-100 text-center">
                <Link
                  to="/assignments"
                  onClick={() => setShowNotifDropdown(false)}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center justify-center gap-1 py-1"
                >
                  Lihat Semua Modul & Tugas <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Popover */}
        {user && (
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setShowProfileDropdown(!showProfileDropdown);
                setShowNotifDropdown(false);
              }}
              className="flex items-center gap-3 p-1.5 pl-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer shadow-xs"
            >
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-slate-800">{user.name}</div>
                <div className="flex justify-end">{getRoleBadge(user.role)}</div>
              </div>
              <img
                src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                alt={user.name}
                className="w-9 h-9 rounded-lg object-cover ring-2 ring-indigo-500/30 shadow-xs"
              />
            </button>

            {/* Dropdown Menu */}
            {showProfileDropdown && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white rounded-2xl p-2 shadow-2xl border border-slate-200 z-50 animate-in fade-in zoom-in-95"
              >
                <div className="p-3 border-b border-slate-100">
                  <p className="text-sm font-bold text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  {user.nisn && <p className="text-[11px] text-indigo-600 font-semibold mt-1">NISN: {user.nisn}</p>}
                  {user.nip && <p className="text-[11px] text-emerald-600 font-semibold mt-1">NIP: {user.nip}</p>}
                  {user.rombel && <p className="text-[11px] text-slate-500 mt-0.5">Rombel: {user.rombel}</p>}
                </div>
                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setShowProfileDropdown(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors font-medium"
                  >
                    <UserIcon className="w-4 h-4 text-indigo-600" />
                    Profil Saya & Pengaturan
                  </Link>
                </div>
                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer font-medium"
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
