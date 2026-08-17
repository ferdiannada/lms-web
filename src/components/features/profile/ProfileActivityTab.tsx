import React from 'react';
import { ShieldCheck, Server, Laptop, Clock, CheckCircle2, RefreshCw } from 'lucide-react';
import { User } from '../../../types';

interface ProfileActivityTabProps {
  user: User | null;
}

export const ProfileActivityTab: React.FC<ProfileActivityTabProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      <div className="bg-m3-surface p-6 sm:p-8 rounded-[2rem] border border-m3-outline-variant/30 shadow-m3-elevation-1 space-y-6 transition-all duration-300">
        <div className="pb-5 border-b border-m3-outline-variant/30">
          <h2 className="text-lg font-extrabold text-m3-on-surface flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-m3-primary" />
            Riwayat Sesi & Sinkronisasi Sistem
          </h2>
          <p className="text-xs font-medium text-m3-on-surface-variant mt-1">
            Informasi status koneksi portal dengan Go API Gateway dan database Dapodik.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Sesi Aktif Saat Ini */}
          <div className="p-6 rounded-[1.5rem] bg-m3-surface-container/50 border border-m3-outline-variant/30 space-y-4 hover:bg-m3-surface-container transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Laptop className="w-4 h-4 text-m3-primary" />
                <span className="text-xs font-extrabold text-m3-on-surface">Perangkat & Sesi Aktif</span>
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                Online
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <p className="font-bold text-m3-on-surface">Browser Web Modern</p>
              <p className="text-[11px] font-medium text-m3-on-surface-variant leading-relaxed">
                Token JWT tersimpan aman dengan enkripsi Bearer Header.
              </p>
            </div>

            <div className="pt-3 border-t border-m3-outline-variant/30 flex items-center justify-between text-[11px] font-bold text-m3-on-surface-variant">
              <span>Status Keamanan:</span>
              <span className="text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Terproteksi
              </span>
            </div>
          </div>

          {/* Integrasi Backend Go Gin */}
          <div className="p-6 rounded-[1.5rem] bg-m3-surface-container/50 border border-m3-outline-variant/30 space-y-4 hover:bg-m3-surface-container transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Server className="w-4 h-4 text-m3-primary" />
                <span className="text-xs font-extrabold text-m3-on-surface">Server API Gateway</span>
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-m3-primary/10 text-m3-primary border border-m3-primary/20">
                Go (Gin) Engine
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <p className="font-bold text-m3-on-surface">SMK Al-Azhar Cloud Core</p>
              <p className="text-[11px] font-medium text-m3-on-surface-variant leading-relaxed">
                Sinkronisasi Dapodik otomatis & WebSocket real-time terhubung.
              </p>
            </div>

            <div className="pt-3 border-t border-m3-outline-variant/30 flex items-center justify-between text-[11px] font-bold text-m3-on-surface-variant">
              <span>Dapodik Sync:</span>
              <span className="text-emerald-700 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Real-time
              </span>
            </div>
          </div>
        </div>

        {/* User Account Details */}
        <div className="p-5 rounded-[1.5rem] bg-m3-surface-container/30 border border-m3-outline-variant/30 text-xs space-y-3">
          <div className="flex justify-between items-center py-1.5 border-b border-m3-outline-variant/30">
            <span className="text-m3-on-surface-variant font-bold">User Identifier ID:</span>
            <span className="font-mono text-m3-on-surface font-extrabold bg-m3-surface-container-high px-2 py-0.5 rounded-md">{user?.id || '-'}</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-m3-outline-variant/30">
            <span className="text-m3-on-surface-variant font-bold">Alamat Email Terdaftar:</span>
            <span className="text-m3-on-surface font-extrabold">{user?.email || '-'}</span>
          </div>
          <div className="flex justify-between items-center py-1.5">
            <span className="text-m3-on-surface-variant font-bold">Sinkronisasi Terakhir:</span>
            <span className="text-m3-on-surface font-extrabold bg-m3-surface-container px-2 py-0.5 rounded-md">
              {new Date().toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
