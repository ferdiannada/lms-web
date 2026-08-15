import React, { useState } from 'react';
import { Volume2, Bell, Sparkles, CheckCircle2, Sliders, Play, Laptop } from 'lucide-react';
import { useAudioNotification } from '../../../hooks';

export const ProfilePreferencesTab: React.FC = () => {
  const { playNotificationChime } = useAudioNotification();
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('pedia_sound_notifications') !== 'false';
  });
  const [browserNotifStatus, setBrowserNotifStatus] = useState<'granted' | 'denied' | 'default'>(() => {
    return 'Notification' in window ? Notification.permission : 'default';
  });

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('pedia_sound_notifications', String(next));
  };

  const handleRequestBrowserNotif = async () => {
    if (!('Notification' in window)) {
      alert('Browser Anda tidak mendukung push notifications.');
      return;
    }
    const perm = await Notification.requestPermission();
    setBrowserNotifStatus(perm);
    if (perm === 'granted') {
      new Notification('🔔 Notifikasi Aktif', {
        body: 'Notifikasi browser untuk aktivitas LMS berhasil diaktifkan.',
        icon: '/logo_smk_new.png',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="pb-4 border-b border-slate-100">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600" />
            Preferensi Aplikasi & Notifikasi
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Atur pengalaman interaktif, audio alert, dan pemberitahuan aktivitas belajar.
          </p>
        </div>

        <div className="space-y-4">
          {/* 1. Suara Notifikasi */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-100/70 text-indigo-700 shrink-0">
                <Volume2 className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-900">Audio Chime Notifikasi Interaktif</p>
                <p className="text-[11px] text-slate-500 max-w-md leading-relaxed">
                  Memainkan nada halus Web Audio API saat ada tugas baru, balasan komentar forum, atau pengumuman kelas.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={playNotificationChime}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center gap-1.5 transition cursor-pointer"
                title="Coba Nada Suara"
              >
                <Play className="w-3 h-3 text-indigo-600" /> Uji Suara
              </button>
              <button
                type="button"
                onClick={handleToggleSound}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  soundEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                    soundEnabled ? 'right-1' : 'left-1'
                  }`}
                ></span>
              </button>
            </div>
          </div>

          {/* 2. Notifikasi Browser */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100/70 text-emerald-700 shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-slate-900">Notifikasi Desktop / Browser</p>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      browserNotifStatus === 'granted'
                        ? 'bg-emerald-100 text-emerald-700'
                        : browserNotifStatus === 'denied'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {browserNotifStatus === 'granted'
                      ? 'Diizinkan'
                      : browserNotifStatus === 'denied'
                      ? 'Diblokir'
                      : 'Belum Diatur'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 max-w-md leading-relaxed">
                  Menampilkan banner notifikasi di layar saat Anda sedang membuka tab aplikasi lain.
                </p>
              </div>
            </div>

            {browserNotifStatus !== 'granted' && (
              <button
                type="button"
                onClick={handleRequestBrowserNotif}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition cursor-pointer self-start sm:self-center"
              >
                Izinkan Notifikasi
              </button>
            )}
          </div>

          {/* 3. Antarmuka Tema */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100/70 text-amber-700 shrink-0">
              <Laptop className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-slate-900">Tema Desain Sistem</p>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  Glassmorphism Modern
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Antarmuka disesuaikan dengan standar desain Kurikulum Merdeka SMK Al-Azhar (Tailwind v4, Glassmorphism, & NeedMCP signature palettes).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
