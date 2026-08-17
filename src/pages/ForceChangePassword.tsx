import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Navigate } from 'react-router-dom';
import { ShieldAlert, Lock, Eye, EyeOff, Check, X, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

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
      { id: 'symbol', label: 'Simbol (@, #, !, dll)', isValid: /[^A-Za-z0-9]/.test(newPass) },
    ];
  }, [newPass]);

  const allRequirementsMet = requirements.every(req => req.isValid);
  const passwordsMatch = newPass && confirmPass && newPass === confirmPass;

  // If somehow they land here but don't need to change password
  if (user && !user.is_initial_password) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!allRequirementsMet) {
      setError('Harap penuhi semua persyaratan keamanan kata sandi.');
      return;
    }
    if (!passwordsMatch) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.changePassword(currentPass, newPass);
      setMessage('Luar biasa! Kata sandi Anda berhasil diperbarui.');
      
      // Delay to show success animation
      if (res.token) {
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mengubah kata sandi. Pastikan kata sandi lama Anda benar.');
      setIsLoading(false);
    }
  };

  if (message) {
    return (
      <div className="min-h-screen bg-m3-surface-container flex items-center justify-center p-4 z-50 fixed inset-0 animate-in fade-in duration-500">
        <div className="max-w-md w-full bg-m3-surface rounded-[2rem] p-8 shadow-m3-elevation-3 flex flex-col items-center text-center space-y-6">
          <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center animate-in zoom-in duration-500 delay-150">
            <ShieldCheck className="w-12 h-12 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-m3-on-surface mb-2">Akses Terbuka!</h2>
            <p className="text-sm text-m3-on-surface-variant font-medium leading-relaxed">
              {message} Mengarahkan Anda ke dasbor dalam beberapa detik...
            </p>
          </div>
          <div className="w-8 h-8 border-4 border-m3-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-m3-surface-container flex flex-col md:flex-row z-50 fixed inset-0 overflow-hidden">
      
      {/* Left Pane - Visual & Context */}
      <div className="hidden md:flex md:w-5/12 lg:w-1/3 bg-m3-primary/5 flex-col justify-between p-10 lg:p-12 border-r border-m3-outline-variant/30 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-m3-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/20 flex items-center justify-center shadow-inner border border-amber-500/20">
            <ShieldAlert className="w-10 h-10 text-amber-600" />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-m3-on-surface leading-tight">
              Pembaruan Keamanan Wajib
            </h1>
            <p className="text-sm font-medium text-m3-on-surface-variant leading-relaxed">
              Akun Anda saat ini masih menggunakan kata sandi bawaan (default) dari sistem. 
              Demi melindungi data akademik dan privasi Anda, kami mewajibkan Anda untuk mengatur kata sandi baru yang kuat.
            </p>
          </div>
        </div>
        
        <div className="relative z-10 flex items-center gap-4 text-xs font-semibold text-m3-on-surface-variant">
          <Lock className="w-4 h-4" />
          <span>Keamanan Data Terenkripsi Ujung-ke-Ujung</span>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="flex-1 overflow-y-auto w-full bg-m3-surface flex items-center justify-center p-6 sm:p-12 relative">
        <div className="max-w-md w-full animate-in slide-in-from-bottom-8 fade-in duration-700 ease-out">
          
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="md:hidden flex flex-col items-center text-center space-y-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-m3-on-surface">Pembaruan Keamanan</h1>
              <p className="text-xs font-medium text-m3-on-surface-variant mt-2 px-4">
                Silakan ganti kata sandi bawaan Anda untuk melanjutkan.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 animate-in fade-in zoom-in-95">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-rose-700 leading-relaxed">{error}</p>
              </div>
            )}

            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-m3-on-surface-variant uppercase tracking-wider ml-1">
                Kata Sandi Saat Ini
              </label>
              <div className="relative group">
                <Lock className="w-4 h-4 text-m3-on-surface-variant absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none transition-colors group-focus-within:text-m3-primary" />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  required
                  placeholder="Masukkan kata sandi lama Anda"
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl text-sm font-bold text-m3-on-surface bg-m3-surface-container-highest border-2 border-transparent focus:border-m3-primary focus:bg-m3-surface transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-m3-on-surface-variant hover:text-m3-on-surface p-1 transition-colors"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="h-px w-full bg-m3-outline-variant/30 my-6"></div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-m3-on-surface-variant uppercase tracking-wider ml-1">
                Kata Sandi Baru
              </label>
              <div className="relative group">
                <Lock className="w-4 h-4 text-m3-on-surface-variant absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none transition-colors group-focus-within:text-m3-primary" />
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  required
                  placeholder="Buat kata sandi yang kuat"
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl text-sm font-bold text-m3-on-surface bg-m3-surface-container-highest border-2 border-transparent focus:border-m3-primary focus:bg-m3-surface transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-m3-on-surface-variant hover:text-m3-on-surface p-1 transition-colors"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Interactive Checklist */}
            <div className="bg-m3-surface-container p-4 rounded-2xl border border-m3-outline-variant/30">
              <p className="text-[11px] font-extrabold text-m3-on-surface-variant uppercase tracking-wider mb-3">
                Persyaratan Keamanan
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                {requirements.map((req) => (
                  <div key={req.id} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${req.isValid ? 'bg-emerald-500 text-white' : 'bg-m3-outline-variant/30 text-m3-on-surface-variant'}`}>
                      {req.isValid ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                    </div>
                    <span className={`text-xs font-semibold transition-colors duration-300 ${req.isValid ? 'text-m3-on-surface' : 'text-m3-on-surface-variant'}`}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-m3-on-surface-variant uppercase tracking-wider ml-1">
                Konfirmasi Kata Sandi
              </label>
              <div className="relative group">
                <Lock className="w-4 h-4 text-m3-on-surface-variant absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none transition-colors group-focus-within:text-m3-primary" />
                <input
                  type={showNew ? 'text' : 'password'}
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  required
                  placeholder="Ulangi kata sandi baru"
                  className={`w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm font-bold text-m3-on-surface bg-m3-surface-container-highest border-2 focus:bg-m3-surface transition-all outline-none
                    ${confirmPass && !passwordsMatch ? 'border-rose-500 focus:border-rose-500' : 'border-transparent focus:border-m3-primary'}
                    ${confirmPass && passwordsMatch ? 'border-emerald-500 focus:border-emerald-500' : ''}
                  `}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !allRequirementsMet || !passwordsMatch || !currentPass}
              className="w-full relative group overflow-hidden bg-m3-primary text-m3-on-primary font-bold text-sm py-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:shadow-m3-primary/30"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    Simpan Kata Sandi & Lanjutkan
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
            
          </form>
        </div>
      </div>
    </div>
  );
};
