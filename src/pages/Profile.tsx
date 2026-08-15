import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User, KeyRound, Shield, CheckCircle2, Phone, Mail, GraduationCap, UserCheck, AlertCircle } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (newPass.length < 6) {
      setError('Kata sandi baru minimal 6 karakter.');
      return;
    }

    if (newPass !== confirmPass) {
      setError('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.changePassword(currentPass, newPass);
      setMessage(res.message || 'Kata sandi berhasil diperbarui.');
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } catch (err: any) {
      setError(err.message || 'Gagal mengubah kata sandi.');
    } finally {
      setIsLoading(false);
    }
  };

  const isTeacher = user?.role === 'guru' || user?.role === 'admin';

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in">
      {/* Profile Info Card */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 p-0.5 shadow-xl flex items-center justify-center text-2xl font-extrabold text-white">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                {isTeacher ? 'Guru Pengajar SMK' : 'Siswa SMK'}
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Akun Terverifikasi Dapodik
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white mt-1.5">{user?.name}</h1>
            <p className="text-sm text-slate-400">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-sm">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-500 uppercase font-bold">
              {isTeacher ? 'Nomor Induk Pegawai (NIP/NIK)' : 'Nomor Induk Siswa Nasional (NISN)'}
            </span>
            <p className="font-bold text-slate-200 mt-1 font-mono">{user?.nip_nik_nisn || user?.nisn || user?.nip || '-'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-500 uppercase font-bold">Rombongan Belajar (Rombel)</span>
            <p className="font-bold text-slate-200 mt-1">{user?.rombel || 'Semua Rombel'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-500 uppercase font-bold">Nomor Telepon / WhatsApp</span>
            <p className="font-bold text-slate-200 mt-1">{user?.phone || '-'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-500 uppercase font-bold">Status Kata Sandi</span>
            <p className="font-bold text-slate-200 mt-1">
              {user?.is_initial_password ? (
                <span className="text-amber-400">Password Bawaan (Disarankan Ubah)</span>
              ) : (
                <span className="text-emerald-400">Telah Diperbarui</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-indigo-400" />
          Ubah Kata Sandi Akun
        </h2>

        {message && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            {message}
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase">Kata Sandi Saat Ini</label>
            <input
              type="password"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-sm text-slate-100 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase">Kata Sandi Baru</label>
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                required
                placeholder="Minimal 10 karakter"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-sm text-slate-100 focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase">Konfirmasi Kata Sandi Baru</label>
              <input
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                required
                placeholder="Ulangi kata sandi baru"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-sm text-slate-100 focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Memperbarui...' : 'Simpan Kata Sandi Baru'}
          </button>
        </form>
      </div>
    </div>
  );
};
