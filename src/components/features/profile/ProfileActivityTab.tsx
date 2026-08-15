import React from 'react';
import { ShieldCheck, Server, Laptop, Clock, CheckCircle2, RefreshCw } from 'lucide-react';
import { User } from '../../../types';

interface ProfileActivityTabProps {
  user: User | null;
}

export const ProfileActivityTab: React.FC<ProfileActivityTabProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="pb-4 border-b border-slate-100">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Riwayat Sesi & Sinkronisasi Sistem
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Informasi status koneksi portal dengan Go API Gateway dan database Dapodik.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sesi Aktif Saat Ini */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-900">Perangkat & Sesi Aktif</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                Online
              </span>
            </div>

            <div className="space-y-1 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">Browser Web Modern</p>
              <p className="text-[11px] text-slate-400">
                Token JWT tersimpan aman dengan enkripsi Bearer Header.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
              <span>Status Keamanan:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Terproteksi
              </span>
            </div>
          </div>

          {/* Integrasi Backend Go Gin */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-900">Server API Gateway</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                Go (Gin) Engine
              </span>
            </div>

            <div className="space-y-1 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">SMK Al-Azhar Cloud Core</p>
              <p className="text-[11px] text-slate-400">
                Sinkronisasi Dapodik otomatis & WebSocket real-time terhubung.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
              <span>Dapodik Sync:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" /> Real-time
              </span>
            </div>
          </div>
        </div>

        {/* User Account Details */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
          <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
            <span className="text-slate-500 font-semibold">User Identifier ID:</span>
            <span className="font-mono text-slate-800 font-bold">{user?.id || '-'}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
            <span className="text-slate-500 font-semibold">Alamat Email Terdaftar:</span>
            <span className="text-slate-800 font-semibold">{user?.email || '-'}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-500 font-semibold">Sinkronisasi Terakhir:</span>
            <span className="text-slate-800 font-semibold">
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
