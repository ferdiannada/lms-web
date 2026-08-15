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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center p-4 relative overflow-hidden text-slate-800">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-100/70 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-orange-100/60 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Heading */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm p-1.5 mb-2 overflow-hidden">
            <img
              src="/logo_smk_new.png"
              alt="SMK Al-Azhar"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            PEDIA <span className="text-indigo-600">LMS</span>
          </h1>
          <p className="text-slate-500 text-sm">
            Portal Pembelajaran Digital Guru & Siswa SMK Al-Azhar
          </p>
        </div>

        {/* Quick Demo Login Preset Buttons */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
              Pilih Akun Dapodik / Database
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live DB
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleQuickLogin('siswa')}
              className="flex flex-col items-start gap-1 p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/80 hover:border-indigo-200 text-xs font-semibold text-slate-800 transition-colors text-left cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-1.5 text-indigo-600 font-bold">
                <GraduationCap className="w-4 h-4" />
                <span>Siswa SMK</span>
              </div>
              <span className="text-[10px] text-slate-500 font-normal truncate w-full">Fahrunisa (XI TKJ)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('guru')}
              className="flex flex-col items-start gap-1 p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-200 text-xs font-semibold text-slate-800 transition-colors text-left cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <UserCheck className="w-4 h-4" />
                <span>Guru Pengajar</span>
              </div>
              <span className="text-[10px] text-slate-500 font-normal truncate w-full">Ahmad Naim (Guru)</span>
            </button>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Email / NIP / NISN Akun SMK
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  placeholder="email@smk.sch.id atau NISN/NIP"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all shadow-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Kata Sandi</label>
              </div>
              <div className="relative">
                <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all shadow-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 bg-[#1e1b4b] hover:bg-slate-900 text-white font-bold rounded-xl shadow-md shadow-indigo-100 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
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

          <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <Server className="w-3.5 h-3.5 text-emerald-600" />
            <span>Terhubung ke Backend Go Gin & PostgreSQL</span>
          </div>
        </div>
      </div>
    </div>
  );
};
