import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Navigate } from 'react-router-dom';
import { ShieldCheck, Lock, Eye, EyeOff, Check, AlertCircle, Loader2 } from 'lucide-react';

export const ForceChangePassword: React.FC = () => {
  const { user } = useAuth();
  
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Requirements checklist
  const requirements = useMemo(() => {
    return [
      { id: 'length', label: 'Minimal 6 karakter', isValid: newPass.length >= 6 },
      { id: 'upper', label: 'Huruf besar (A-Z)', isValid: /[A-Z]/.test(newPass) },
      { id: 'lower', label: 'Huruf kecil (a-z)', isValid: /[a-z]/.test(newPass) },
      { id: 'number', label: 'Angka (0-9)', isValid: /[0-9]/.test(newPass) },
      { id: 'symbol', label: 'Simbol (@, #, dll)', isValid: /[^A-Za-z0-9]/.test(newPass) },
    ];
  }, [newPass]);

  const allRequirementsMet = requirements.every(req => req.isValid);
  const passwordsMatch = newPass && confirmPass && newPass === confirmPass;

  if (user && !user.is_initial_password) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!allRequirementsMet) {
      setError('Pastikan semua persyaratan kata sandi terpenuhi.');
      return;
    }
    if (!passwordsMatch) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.changePassword(currentPass, newPass);
      setMessage('Kata sandi berhasil diperbarui.');
      
      if (res.token) {
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mengubah kata sandi. Pastikan kata sandi saat ini benar.');
      setIsLoading(false);
    }
  };

  if (message) {
    return (
      <div className="min-h-screen bg-m3-surface-container flex items-center justify-center p-4 z-50 fixed inset-0">
        <div className="max-w-sm w-full bg-m3-surface rounded-3xl p-8 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-m3-on-surface">Berhasil</h2>
          <p className="text-sm text-m3-on-surface-variant">
            {message} Mengalihkan...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-m3-surface-container flex items-center justify-center p-4 z-50 fixed inset-0">
      <div className="max-w-md w-full bg-m3-surface rounded-3xl p-6 sm:p-8 shadow-sm border border-m3-outline-variant/50">
        
        <div className="mb-6 space-y-2">
          <h1 className="text-xl font-bold text-m3-on-surface">
            Ganti Kata Sandi
          </h1>
          <p className="text-sm text-m3-on-surface-variant leading-relaxed">
            Akun Anda menggunakan kata sandi bawaan. Silakan buat kata sandi baru untuk melanjutkan penggunaan aplikasi.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-700 text-sm font-medium flex gap-2 items-start">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Current Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-m3-on-surface-variant">
              Kata Sandi Saat Ini
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm text-m3-on-surface bg-transparent border border-m3-outline focus:border-m3-primary focus:ring-1 focus:ring-m3-primary transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-m3-on-surface-variant hover:text-m3-on-surface p-1"
                aria-label="Toggle password visibility"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold text-m3-on-surface-variant">
              Kata Sandi Baru
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm text-m3-on-surface bg-transparent border border-m3-outline focus:border-m3-primary focus:ring-1 focus:ring-m3-primary transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-m3-on-surface-variant hover:text-m3-on-surface p-1"
                aria-label="Toggle password visibility"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Interactive Checklist */}
          <div className="space-y-2 py-2">
            <p className="text-[11px] font-semibold text-m3-on-surface-variant uppercase tracking-wider">
              Persyaratan
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-2">
              {requirements.map((req) => (
                <div key={req.id} className="flex items-center gap-2">
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 transition-colors ${req.isValid ? 'bg-emerald-500 text-white' : 'bg-m3-outline-variant/30 text-transparent'}`}>
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className={`text-xs ${req.isValid ? 'text-m3-on-surface' : 'text-m3-on-surface-variant'}`}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5 pb-2">
            <label className="text-xs font-semibold text-m3-on-surface-variant">
              Konfirmasi Kata Sandi
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                required
                className={`w-full px-4 py-2.5 rounded-xl text-sm text-m3-on-surface bg-transparent border transition-all outline-none
                  ${confirmPass && !passwordsMatch ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500' : 'border-m3-outline focus:border-m3-primary focus:ring-1 focus:ring-m3-primary'}
                `}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !allRequirementsMet || !passwordsMatch || !currentPass}
            className="w-full flex items-center justify-center gap-2 bg-m3-primary text-m3-on-primary font-semibold text-sm py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-m3-primary/90 transition-colors"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Simpan dan Lanjutkan
          </button>
          
        </form>
      </div>
    </div>
  );
};
