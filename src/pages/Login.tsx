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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between items-center p-4 sm:p-6 relative overflow-hidden text-slate-800 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Background Decorative Ambient Blurs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-indigo-100/50 via-slate-100/20 to-transparent blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute -bottom-24 right-0 w-80 h-80 bg-violet-100/40 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Main Login Card Container */}
      <div className="w-full max-w-md my-auto py-6 space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center justify-center w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-white border border-slate-200/90 shadow-md p-1.5 mx-auto group hover:scale-105 transition-transform duration-200">
            <img
              src="/logo_smk_new.png"
              alt="SMK Al-Azhar"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="space-y-0.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              PEDIA <span className="text-indigo-600 font-black">LMS</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Portal Pembelajaran Digital Guru & Siswa SMK Al-Azhar
            </p>
          </div>
        </div>

        {/* Card Box */}
        <div className="bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-900/5 border border-slate-200/80 space-y-5">
          {/* Error Alert Banner */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p>{error}</p>
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-rose-600 hover:text-rose-900 font-bold cursor-pointer"
              >
                ×
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Identifier Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Email / NISN / NIP
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Akun Resmi SMK</span>
              </div>

              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  autoFocus
                  placeholder="email@smk.sch.id atau NISN/NIP"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl py-3 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Kata Sandi
                </label>
                <button
                  type="button"
                  onClick={() => setShowHelpModal(true)}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition cursor-pointer flex items-center gap-1"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>Bantuan Akses?</span>
                </button>
              </div>

              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl py-3 pl-10 pr-10 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1 z-10 transition-colors"
                  title={showPassword ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit CTA Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading || !identifier.trim() || !password}
                className="w-full py-3.5 px-4 bg-[#1e1b4b] hover:bg-slate-900 active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-100 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Memverifikasi Akun...</span>
                  </div>
                ) : (
                  <>
                    <span>Masuk ke Portal Pembelajaran</span>
                    <ArrowRight className="w-4 h-4 text-indigo-300" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Security & Dapodik Sync Footer */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <Lock className="w-3 h-3 text-emerald-600" />
            <span>Koneksi Aman Terenkripsi SSL • Dapodik Kemdikbud</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <footer className="w-full max-w-md pb-4 text-center text-[11px] text-slate-400">
        <p>© 2026 PEDIA LMS SMK • SMK Al-Azhar</p>
      </footer>

      {/* Bantuan Akses Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                Bantuan Akses Akun
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-indigo-900 space-y-1">
                <p className="font-bold">Siswa Kejuruan:</p>
                <p className="text-[11px] text-indigo-800">
                  Gunakan 10 digit NISN Dapodik Anda atau email resmi sekolah sebagai username dan kata sandi yang telah dibagikan wali kelas.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-emerald-900 space-y-1">
                <p className="font-bold">Guru & Tenaga Pendidik:</p>
                <p className="text-[11px] text-emerald-800">
                  Gunakan NIP/NIK terdaftar atau akun email sekolah resmi SMK Al-Azhar.
                </p>
              </div>

              <p className="text-[11px] text-slate-400 text-center pt-1">
                Jika lupa kata sandi atau mengalami kendala, hubungi <strong>Operator Dapodik / Tim IT Sekolah</strong>.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#1e1b4b] hover:bg-slate-900 text-white font-bold text-xs transition cursor-pointer"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
