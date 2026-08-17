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

    if (newPass.length < 10) {
      setError('Kata sandi baru minimal 10 karakter.');
      return;
    }

    if (!/[A-Z]/.test(newPass) || !/[a-z]/.test(newPass) || !/[0-9]/.test(newPass) || !/[^A-Za-z0-9]/.test(newPass)) {
      setError('Kata sandi harus mengandung huruf besar, huruf kecil, angka, serta simbol.');
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
      
      if (res.token) {
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      }
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
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">×</button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-m3-error-container/20 border border-m3-error-container/50 text-m3-error text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-m3-error shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-m3-error hover:text-m3-error/80 cursor-pointer">×</button>
        </div>
      )}

      {/* Initial password warning if applicable */}
      {user?.is_initial_password && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-extrabold text-amber-800">Akun Anda Masih Menggunakan Kata Sandi Bawaan Dapodik</p>
            <p className="text-amber-800/80 text-[11px] leading-relaxed font-medium">
              Demi keamanan data akademik dan privasi akun Anda, sangat disarankan untuk mengganti kata sandi dengan kombinasi unik sekarang.
            </p>
          </div>
        </div>
      )}

      <div className="bg-m3-surface p-6 sm:p-8 rounded-[2rem] border border-m3-outline-variant/30 shadow-m3-elevation-1 space-y-6 transition-all duration-300">
        <div className="pb-5 border-b border-m3-outline-variant/30">
          <h2 className="text-lg font-extrabold text-m3-on-surface flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-m3-primary" />
            Perbarui Kata Sandi Akun
          </h2>
          <p className="text-xs font-medium text-m3-on-surface-variant mt-1">
            Gunakan kombinasi minimal 10 karakter yang terdiri dari huruf besar, huruf kecil, angka, dan simbol.
          </p>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-5">
          {/* Kata Sandi Saat Ini */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-m3-on-surface-variant uppercase tracking-wider">
              Kata Sandi Saat Ini
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-m3-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
              <input
                type={showCurrentPass ? 'text' : 'password'}
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                required
                placeholder="Masukkan kata sandi lama Anda"
                className="w-full pl-10 pr-10 py-3 rounded-xl text-xs font-bold text-m3-on-surface bg-m3-surface-container border border-m3-outline focus:border-m3-primary focus:ring-1 focus:ring-m3-primary focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-m3-on-surface-variant hover:text-m3-on-surface cursor-pointer p-1 z-10 transition-colors"
                title={showCurrentPass ? 'Sembunyikan' : 'Tampilkan'}
              >
                {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Kata Sandi Baru */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-m3-on-surface-variant uppercase tracking-wider">
                Kata Sandi Baru
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-m3-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                <input
                  type={showNewPass ? 'text' : 'password'}
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  required
                  placeholder="Minimal 10 karakter"
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-xs font-bold text-m3-on-surface bg-m3-surface-container border border-m3-outline focus:border-m3-primary focus:ring-1 focus:ring-m3-primary focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-m3-on-surface-variant hover:text-m3-on-surface cursor-pointer p-1 z-10 transition-colors"
                  title={showNewPass ? 'Sembunyikan' : 'Tampilkan'}
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {newPass && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-m3-on-surface-variant">Kekuatan Sandi:</span>
                    <span className={strengthInfo.text}>{strengthInfo.label}</span>
                  </div>
                  <div className="w-full bg-m3-surface-container h-1.5 rounded-full overflow-hidden flex gap-1">
                    <div className={`h-full flex-1 rounded-full transition-colors ${strengthInfo.score >= 1 ? strengthInfo.color : 'bg-m3-surface-container-high'}`}></div>
                    <div className={`h-full flex-1 rounded-full transition-colors ${strengthInfo.score >= 2 ? strengthInfo.color : 'bg-m3-surface-container-high'}`}></div>
                    <div className={`h-full flex-1 rounded-full transition-colors ${strengthInfo.score >= 3 ? strengthInfo.color : 'bg-m3-surface-container-high'}`}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Konfirmasi Kata Sandi Baru */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-m3-on-surface-variant uppercase tracking-wider">
                Konfirmasi Kata Sandi Baru
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-m3-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  required
                  placeholder="Ulangi kata sandi baru"
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-xs font-bold text-m3-on-surface bg-m3-surface-container border border-m3-outline focus:border-m3-primary focus:ring-1 focus:ring-m3-primary focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-m3-on-surface-variant hover:text-m3-on-surface cursor-pointer p-1 z-10 transition-colors"
                  title={showConfirmPass ? 'Sembunyikan' : 'Tampilkan'}
                >
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {confirmPass && confirmPass !== newPass && (
                <p className="text-[10px] text-m3-error font-bold pt-0.5">
                  Kata sandi konfirmasi tidak cocok.
                </p>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-m3-outline-variant/30 flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !currentPass || !newPass || newPass !== confirmPass}
              className="w-full sm:w-auto px-6 py-3 bg-m3-primary hover:bg-m3-primary/90 text-m3-on-primary font-bold text-xs rounded-full shadow-m3-elevation-1 transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:active:scale-100"
            >
              {isLoading ? 'Memperbarui...' : 'Simpan Kata Sandi Baru'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
