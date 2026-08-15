import React, { useState, useMemo } from 'react';
import { KeyRound, Shield, Eye, EyeOff, CheckCircle2, AlertCircle, Lock, ShieldAlert } from 'lucide-react';
import { User } from '../../../types';
import { api } from '../../../services';

interface ProfileSecurityTabProps {
  user: User | null;
}

export const ProfileSecurityTab: React.FC<ProfileSecurityTabProps> = ({ user }) => {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Real-time password strength computation
  const strengthInfo = useMemo(() => {
    if (!newPass) return { score: 0, label: 'Belum diisi', color: 'bg-slate-200', text: 'text-slate-400' };

    let score = 0;
    if (newPass.length >= 6) score += 1;
    if (newPass.length >= 10) score += 1;
    if (/[A-Z]/.test(newPass) || /[a-z]/.test(newPass)) score += 1;
    if (/[0-9]/.test(newPass)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPass)) score += 1;

    if (score <= 2) return { score: 1, label: 'Lemah', color: 'bg-rose-500', text: 'text-rose-600' };
    if (score <= 3) return { score: 2, label: 'Sedang', color: 'bg-amber-500', text: 'text-amber-600' };
    return { score: 3, label: 'Sangat Kuat', color: 'bg-emerald-500', text: 'text-emerald-600' };
  }, [newPass]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (newPass.length < 6) {
      setError('Kata sandi baru minimal 6 karakter.');
      return;
    }

    if (newPass !== confirmPass) {
      setError('Konfirmasi kata sandi baru tidak cocok dengan kata sandi baru.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.changePassword(currentPass, newPass);
      setMessage(res.message || 'Kata sandi berhasil diperbarui dengan aman.');
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } catch (err: any) {
      setError(err.message || 'Gagal mengubah kata sandi. Periksa kata sandi saat ini.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Banners */}
      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-emerald-700 hover:text-emerald-900">×</button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-700 hover:text-rose-900">×</button>
        </div>
      )}

      {/* Initial password warning if applicable */}
      {user?.is_initial_password && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Akun Anda Masih Menggunakan Kata Sandi Bawaan Dapodik</p>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              Demi keamanan data akademik dan privasi akun Anda, sangat disarankan untuk mengganti kata sandi dengan kombinasi unik sekarang.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="pb-4 border-b border-slate-100">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-indigo-600" />
            Perbarui Kata Sandi Akun
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Gunakan kombinasi minimal 6 karakter yang tidak mudah ditebak oleh orang lain.
          </p>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-5">
          {/* Kata Sandi Saat Ini */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Kata Sandi Saat Ini
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
              <input
                type={showCurrentPass ? 'text' : 'password'}
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                required
                placeholder="Masukkan kata sandi lama Anda"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs text-slate-900 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 focus:outline-none transition shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1 z-10"
                title={showCurrentPass ? 'Sembunyikan' : 'Tampilkan'}
              >
                {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Kata Sandi Baru */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Kata Sandi Baru
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                <input
                  type={showNewPass ? 'text' : 'password'}
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  required
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs text-slate-900 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 focus:outline-none transition shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1 z-10"
                  title={showNewPass ? 'Sembunyikan' : 'Tampilkan'}
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {newPass && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-400">Kekuatan Sandi:</span>
                    <span className={strengthInfo.text}>{strengthInfo.label}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex gap-1">
                    <div className={`h-full flex-1 rounded-full ${strengthInfo.score >= 1 ? strengthInfo.color : 'bg-slate-200'}`}></div>
                    <div className={`h-full flex-1 rounded-full ${strengthInfo.score >= 2 ? strengthInfo.color : 'bg-slate-200'}`}></div>
                    <div className={`h-full flex-1 rounded-full ${strengthInfo.score >= 3 ? strengthInfo.color : 'bg-slate-200'}`}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Konfirmasi Kata Sandi Baru */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Konfirmasi Kata Sandi Baru
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  required
                  placeholder="Ulangi kata sandi baru"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs text-slate-900 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 focus:outline-none transition shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1 z-10"
                  title={showConfirmPass ? 'Sembunyikan' : 'Tampilkan'}
                >
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {confirmPass && confirmPass !== newPass && (
                <p className="text-[10px] text-rose-600 font-semibold pt-0.5">
                  Kata sandi konfirmasi tidak cocok.
                </p>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !currentPass || !newPass || newPass !== confirmPass}
              className="w-full sm:w-auto px-6 py-3 bg-[#1e1b4b] hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Memperbarui...' : 'Simpan Kata Sandi Baru'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
