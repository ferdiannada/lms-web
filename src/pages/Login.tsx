import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, KeyRound, Mail, ArrowRight, UserCheck, GraduationCap, Server } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('fahrunisa.wulandari@siswa.smk.sch.id');
  const [password, setPassword] = useState('0103478320');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(identifier, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login gagal. Periksa kembali email / NISN / NIP dan password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (role: 'siswa' | 'guru') => {
    if (role === 'guru') {
      setIdentifier('ahmad.naim@smk.sch.id');
      setPassword('3510210608870009');
    } else {
      setIdentifier('fahrunisa.wulandari@siswa.smk.sch.id');
      setPassword('0103478320');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Heading */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 p-0.5 shadow-xl shadow-indigo-500/30 mb-2">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            PEDIA <span className="text-indigo-400">LMS</span>
          </h1>
          <p className="text-slate-400 text-sm">
            Portal Pembelajaran Digital Guru & Siswa SMK Al-Azhar
          </p>
        </div>

        {/* Quick Demo Login Preset Buttons */}
        <div className="glass-panel p-3.5 rounded-2xl border border-indigo-500/20 space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold uppercase text-indigo-300 tracking-wider">
              Pilih Akun Dapodik / Database
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live DB
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleQuickLogin('siswa')}
              className="flex flex-col items-start gap-1 p-3 rounded-xl bg-slate-800/80 hover:bg-indigo-600/20 border border-slate-700 hover:border-indigo-500/40 text-xs font-semibold text-slate-200 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-indigo-400">
                <GraduationCap className="w-4 h-4" />
                <span>Siswa SMK</span>
              </div>
              <span className="text-[10px] text-slate-400 font-normal truncate w-full">Fahrunisa (XI TKJ)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('guru')}
              className="flex flex-col items-start gap-1 p-3 rounded-xl bg-slate-800/80 hover:bg-emerald-600/20 border border-slate-700 hover:border-emerald-500/40 text-xs font-semibold text-slate-200 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-emerald-400">
                <UserCheck className="w-4 h-4" />
                <span>Guru Pengajar</span>
              </div>
              <span className="text-[10px] text-slate-400 font-normal truncate w-full">Ahmad Naim (Guru)</span>
            </button>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="glass-panel p-8 rounded-3xl shadow-2xl border border-slate-800 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Email / NIP / NISN Akun SMK
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  placeholder="email@smk.sch.id atau NISN/NIP"
                  className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-indigo-500 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Kata Sandi</label>
              </div>
              <div className="relative">
                <KeyRound className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-indigo-500 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Menghubungkan ke Database...</span>
              ) : (
                <>
                  <span>Masuk ke Portal LMS</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span>Terhubung ke Backend Go Gin & PostgreSQL</span>
          </div>
        </div>
      </div>
    </div>
  );
};
