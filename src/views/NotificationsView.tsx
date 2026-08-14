import { useEffect, useState } from '@lynx-js/react';
import { classService } from '../services/classService';
import type { NotificationModel } from '../types';

export function NotificationsView() {
  const [notifications, setNotifications] = useState<NotificationModel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const data = await classService.getNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await classService.markAllNotificationsRead();
      fetchNotifs();
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await classService.markNotificationRead(id);
      fetchNotifs();
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  return (
    <view className="max-w-3xl mx-auto space-y-6">
      <view className="flex items-center justify-between">
        <view className="space-y-1">
          <text className="text-xl md:text-2xl font-black text-slate-900 tracking-tight block">
            🔔 Notifikasi Saya
          </text>
          <text className="text-xs text-slate-500 font-medium block">
            Pemberitahuan tugas baru, pengumuman kelas, dan hasil kuis.
          </text>
        </view>

        {notifications.some((n) => !n.isRead) && (
          <view
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-extrabold text-xs shadow-xs hover:bg-slate-50 cursor-pointer transition-all"
            bindtap={handleMarkAllRead}
          >
            <text>✓ Tandai Semua Dibaca</text>
          </view>
        )}
      </view>

      {loading ? (
        <view className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-400 shadow-sm animate-pulse">
          <text className="text-sm font-semibold">Memuat notifikasi...</text>
        </view>
      ) : notifications.length === 0 ? (
        <view className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center shadow-sm space-y-2">
          <text className="text-4xl block mb-2">🔕</text>
          <text className="text-base font-extrabold text-slate-800 block">
            Belum Ada Notifikasi
          </text>
          <text className="text-xs text-slate-500 block">
            Pemberitahuan aktivitas kelas Anda akan muncul di sini.
          </text>
        </view>
      ) : (
        <view className="space-y-3">
          {notifications.map((n) => (
            <view
              key={n.id}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                n.isRead
                  ? 'bg-white border-slate-200/80 text-slate-600 shadow-xs'
                  : 'bg-blue-50/70 border-blue-200 text-slate-900 shadow-sm'
              }`}
              bindtap={() => handleMarkRead(n.id)}
            >
              <view
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                  n.isRead
                    ? 'bg-slate-100 text-slate-500'
                    : 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                }`}
              >
                <text>🔔</text>
              </view>

              <view className="flex-1 space-y-1">
                <view className="flex items-center justify-between gap-2">
                  <text className="font-extrabold text-sm text-slate-900 block">
                    {n.title}
                  </text>
                  <text className="text-[10px] font-semibold text-slate-400 shrink-0">
                    {n.createdAt}
                  </text>
                </view>
                <text className="text-xs text-slate-600 leading-relaxed block">
                  {n.body}
                </text>
              </view>
            </view>
          ))}
        </view>
      )}
    </view>
  );
}
