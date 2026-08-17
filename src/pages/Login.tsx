import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  KeyRound,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  HelpCircle,
  AlertCircle,
  Lock,
  X,
} from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) return;

    setIsLoading(true);
    setError(null);
    try {
      await login(identifier.trim(), password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login gagal. Periksa kembali Email / NISN / NIP dan kata sandi Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-m3-surface-container flex flex-col justify-center items-center p-4 sm:p-8 relative text-m3-on-surface selection:bg-m3-primary-container selection:text-m3-on-primary-container">
      {/* Decorative Top Bar for Professional Look */}
      <div className="absolute top-0 left-0 w-full h-2 bg-m3-primary"></div>

      {/* Main Login Card Container */}
      <div className="w-full max-w-[440px] bg-m3-surface rounded-[32px] shadow-m3-elevation-2 p-8 sm:p-10 space-y-8 relative z-10 animate-m3-enter opacity-0 [animation-delay:50ms] fill-mode-forwards">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-m3-surface-container-high shadow-m3-elevation-1 p-2 flex items-center justify-center">
            <img
              src="/logo_smk_new.png"
              alt="SMK Al-Azhar"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-m3-on-surface tracking-tight">
              PEDIA <span className="text-m3-primary">LMS</span>
            </h1>
            <p className="text-sm text-m3-on-surface-variant font-medium mt-1">
              Portal Pembelajaran Digital SMK Al-Azhar
            </p>
          </div>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-m3-error-container text-m3-on-error-container text-sm font-medium flex items-start gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p>{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-m3-on-error-container hover:bg-white/20 p-1 rounded-full font-bold cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Identifier Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-bold text-m3-on-surface-variant uppercase tracking-wider">
                Email / NISN / NIP
              </label>
            </div>
            <div className="relative group">
              <Mail className="w-5 h-5 text-m3-outline absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none group-focus-within:text-m3-primary transition-colors" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoFocus
                placeholder="Masukkan akun resmi..."
                className="w-full bg-transparent border-2 border-m3-outline focus:border-m3-primary rounded-xl py-3.5 pl-12 pr-4 text-sm text-m3-on-surface placeholder-m3-outline-variant focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-bold text-m3-on-surface-variant uppercase tracking-wider">
                Kata Sandi
              </label>
              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="text-[11px] font-bold text-m3-primary hover:text-m3-on-primary-container hover:bg-m3-primary-container px-2 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Bantuan
              </button>
            </div>

            <div className="relative group">
              <KeyRound className="w-5 h-5 text-m3-outline absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none group-focus-within:text-m3-primary transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-transparent border-2 border-m3-outline focus:border-m3-primary rounded-xl py-3.5 pl-12 pr-12 text-sm text-m3-on-surface placeholder-m3-outline-variant focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-m3-outline hover:text-m3-on-surface hover:bg-m3-surface-variant cursor-pointer p-2 rounded-full z-10 transition-colors"
                title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit CTA Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading || !identifier.trim() || !password}
              className="w-full py-4 px-6 bg-m3-primary hover:bg-m3-primary/90 active:scale-[0.98] text-m3-on-primary font-bold text-sm rounded-full shadow-m3-elevation-1 hover:shadow-m3-elevation-2 flex items-center justify-center gap-2 transition-all duration-300 ease-m3-standard cursor-pointer disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-m3-on-primary border-t-transparent rounded-full animate-spin"></div>
                  <span>Memverifikasi...</span>
                </div>
              ) : (
                <>
                  <span>Masuk ke Portal</span>
                  <ArrowRight className="w-5 h-5 text-m3-primary-container" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Security Footer inside Card */}
        <div className="pt-2">
          <div className="flex items-center justify-center gap-2 text-xs text-m3-on-surface-variant font-medium">
            <Lock className="w-3.5 h-3.5 text-m3-primary" />
            <span>Koneksi Aman Terenkripsi SSL</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer outside Card */}
      <footer className="mt-8 text-center text-xs text-m3-on-surface-variant font-medium">
        <p>© 2026 PEDIA LMS • Terhubung dengan Dapodik</p>
      </footer>

      {/* Bantuan Akses Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm bg-m3-surface-container-high rounded-[28px] p-6 sm:p-8 shadow-m3-elevation-3 border-none space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-m3-outline-variant/30">
              <h3 className="text-base font-bold text-m3-on-surface flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-m3-primary" />
                Bantuan Akses
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-variant p-2 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-m3-on-surface-variant leading-relaxed">
              <div className="p-4 rounded-2xl bg-m3-secondary-container text-m3-on-secondary-container space-y-1">
                <p className="font-bold">Siswa Kejuruan:</p>
                <p className="text-xs">
                  Gunakan 10 digit NISN Dapodik Anda atau email resmi sekolah sebagai username.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-m3-primary-container text-m3-on-primary-container space-y-1">
                <p className="font-bold">Guru & Tenaga Pendidik:</p>
                <p className="text-xs">
                  Gunakan NIP/NIK terdaftar atau akun email sekolah resmi.
                </p>
              </div>

              <p className="text-xs text-center pt-2">
                Jika mengalami kendala, silakan hubungi <strong className="text-m3-on-surface">Operator Dapodik Sekolah</strong>.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full py-3 rounded-full bg-m3-primary hover:bg-m3-primary/90 text-m3-on-primary font-bold text-sm transition-all cursor-pointer shadow-m3-elevation-1"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
