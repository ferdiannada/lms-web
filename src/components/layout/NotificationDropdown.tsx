import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  ChevronRight,
  Sparkles,
  FileText,
  HelpCircle,
  BookOpen,
  MessageSquare,
} from 'lucide-react';
import { AppNotification } from '../../types';
import { useNotifications, useClickOutside } from '../../hooks';

interface NotificationDropdownProps {
  userExists: boolean;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ userExists }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    isLoading,
    loadNotifications,
    markAllAsRead,
    markAsRead,
  } = useNotifications(userExists);

  useClickOutside(dropdownRef, () => setIsOpen(false), isOpen);

  const handleToggleOpen = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      loadNotifications(1, 20);
    }
  };

  const handleNotificationClick = (notif: AppNotification) => {
    setIsOpen(false);
    if (!notif.read_at) {
      markAsRead(notif.id);
    }

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
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggleOpen}
        className={`relative p-2.5 rounded-xl transition-all cursor-pointer ${
          isOpen
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

      {isOpen && (
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
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Tandai Semua Dibaca
              </button>
            )}
          </div>

          {/* Tabs Filter */}
          <div className="flex items-center gap-2 px-2 pt-2 pb-1">
            <button
              type="button"
              onClick={() => setNotifFilter('all')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                notifFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setNotifFilter('unread')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                notifFilter === 'unread'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Belum Dibaca
            </button>
          </div>

          {/* List Content */}
          <div className="mt-2 max-h-80 overflow-y-auto divide-y divide-slate-100">
            {isLoading ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <div className="inline-block w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-1.5"></div>
                <p>Memuat notifikasi...</p>
              </div>
            ) : displayedNotifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs space-y-1">
                <Sparkles className="w-6 h-6 mx-auto text-slate-300 mb-1" />
                <p className="font-semibold text-slate-700">Tidak ada notifikasi</p>
                <p className="text-[10px] text-slate-400">
                  {notifFilter === 'unread'
                    ? 'Semua notifikasi telah Anda baca.'
                    : 'Aktivitas terbaru akan muncul di sini.'}
                </p>
              </div>
            ) : (
              displayedNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3 rounded-2xl flex items-start gap-3 transition-colors cursor-pointer group ${
                    !n.read_at ? 'bg-indigo-50/50 hover:bg-indigo-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center shrink-0 mt-0.5">
                    {getNotificationIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={`text-xs truncate ${
                          !n.read_at ? 'font-bold text-slate-900' : 'font-medium text-slate-700'
                        }`}
                      >
                        {n.title}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatRelativeTime(n.created_at)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                      {n.body}
                    </p>
                  </div>
                  {!n.read_at && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 self-center"></span>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/assignments');
              }}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 py-1 inline-flex items-center gap-1 cursor-pointer"
            >
              Lihat Seluruh Aktivitas <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
