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
      <div className="bg-m3-surface p-6 sm:p-8 rounded-[2rem] border border-m3-outline-variant/30 shadow-m3-elevation-1 space-y-6 transition-all duration-300">
        <div className="pb-5 border-b border-m3-outline-variant/30">
          <h2 className="text-lg font-extrabold text-m3-on-surface flex items-center gap-2">
            <Sliders className="w-5 h-5 text-m3-primary" />
            Preferensi Aplikasi & Notifikasi
          </h2>
          <p className="text-xs font-medium text-m3-on-surface-variant mt-1">
            Atur pengalaman interaktif, audio alert, dan pemberitahuan aktivitas belajar.
          </p>
        </div>

        <div className="space-y-4">
          {/* 1. Suara Notifikasi */}
          <div className="p-5 sm:p-6 rounded-[1.5rem] bg-m3-surface-container/50 border border-m3-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-colors hover:bg-m3-surface-container">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-m3-primary/10 text-m3-primary shrink-0">
                <Volume2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-extrabold text-m3-on-surface">Audio Chime Notifikasi Interaktif</p>
                <p className="text-[11px] font-medium text-m3-on-surface-variant max-w-md leading-relaxed">
                  Memainkan nada halus Web Audio API saat ada tugas baru, balasan komentar forum, atau pengumuman kelas.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={playNotificationChime}
                className="px-4 py-2 rounded-full bg-m3-surface border border-m3-outline-variant/30 hover:bg-m3-surface-variant text-m3-on-surface font-bold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
                title="Coba Nada Suara"
              >
                <Play className="w-3 h-3 text-m3-primary" /> Uji Suara
              </button>
              <button
                type="button"
                onClick={handleToggleSound}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  soundEnabled ? 'bg-m3-primary' : 'bg-m3-surface-container-high'
                }`}
              >
                <span
                  className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform shadow-sm ${
                    soundEnabled ? 'right-1' : 'left-1'
                  }`}
                ></span>
              </button>
            </div>
          </div>

          {/* 2. Notifikasi Browser */}
          <div className="p-5 sm:p-6 rounded-[1.5rem] bg-m3-surface-container/50 border border-m3-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-colors hover:bg-m3-surface-container">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-700 shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-extrabold text-m3-on-surface">Notifikasi Desktop / Browser</p>
                  <span
                    className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      browserNotifStatus === 'granted'
                        ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
                        : browserNotifStatus === 'denied'
                        ? 'bg-rose-500/10 text-rose-700 border border-rose-500/20'
                        : 'bg-m3-surface-variant text-m3-on-surface-variant'
                    }`}
                  >
                    {browserNotifStatus === 'granted'
                      ? 'Diizinkan'
                      : browserNotifStatus === 'denied'
                      ? 'Diblokir'
                      : 'Belum Diatur'}
                  </span>
                </div>
                <p className="text-[11px] font-medium text-m3-on-surface-variant max-w-md leading-relaxed">
                  Menampilkan banner notifikasi di layar saat Anda sedang membuka tab aplikasi lain.
                </p>
              </div>
            </div>

            {browserNotifStatus !== 'granted' && (
              <button
                type="button"
                onClick={handleRequestBrowserNotif}
                className="px-5 py-2.5 rounded-full bg-m3-primary hover:bg-m3-primary/90 text-m3-on-primary font-bold text-xs shadow-m3-elevation-1 transition-all active:scale-95 cursor-pointer self-start sm:self-center shrink-0"
              >
                Izinkan Notifikasi
              </button>
            )}
          </div>

          {/* 3. Antarmuka Tema */}
          <div className="p-5 sm:p-6 rounded-[1.5rem] bg-m3-surface-container/50 border border-m3-outline-variant/30 flex items-start gap-4 transition-colors hover:bg-m3-surface-container">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-700 shrink-0">
              <Laptop className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <p className="text-xs font-extrabold text-m3-on-surface">Tema Desain Sistem</p>
                <span className="text-[9px] font-extrabold px-2.5 py-0.5 rounded-full bg-m3-primary/10 text-m3-primary border border-m3-primary/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Material Design 3
                </span>
              </div>
              <p className="text-[11px] font-medium text-m3-on-surface-variant leading-relaxed">
                Antarmuka disesuaikan dengan standar desain Kurikulum Merdeka SMK Al-Azhar, menggunakan bahasa desain Material Design 3 dari Google untuk pengalaman yang lebih modern, bersih, dan intuitif.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
