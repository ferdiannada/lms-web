import React, { useState } from 'react';
import { User as UserIcon, Phone, Mail, GraduationCap, Building2, Lock, Save, Edit3, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { User } from '../../../types';
import { api } from '../../../services';

interface ProfileBioTabProps {
  user: User | null;
  isTeacher: boolean;
  onUserUpdated: (updated: User) => void;
}

export const ProfileBioTab: React.FC<ProfileBioTabProps> = ({ user, isTeacher, onUserUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const updated = await api.updateProfile({
        name: name.trim(),
        phone: phone.trim(),
      });
      onUserUpdated(updated);
      setSuccessMsg('Profil biodata berhasil diperbarui.');
      setIsEditing(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memperbarui profil.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setIsEditing(false);
    setErrorMsg(null);
  };

  return (
    <div className="space-y-6">
      {/* Alert Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900">×</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-700 hover:text-rose-900">×</button>
        </div>
      )}

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-indigo-600" />
              Informasi Pribadi & Data Pokok Pendidikan (Dapodik)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Data akademik disinkronkan langsung dari server pusat Dapodik SMK Al-Azhar.
            </p>
          </div>

          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-bold text-xs transition cursor-pointer self-start sm:self-auto"
            >
              <Edit3 className="w-4 h-4 text-indigo-600" />
              <span>Edit Biodata</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleCancel}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1e1b4b] hover:bg-slate-900 text-white font-bold text-xs shadow-md shadow-indigo-100 transition cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1. Nama Lengkap */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Nama Lengkap
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isEditing}
                required
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs text-slate-900 font-semibold border transition ${
                  isEditing
                    ? 'bg-white border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100'
                    : 'bg-slate-50 border-slate-200 cursor-not-allowed opacity-90'
                }`}
              />
            </div>
          </div>

          {/* 2. Nomor WhatsApp / Telepon */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Nomor WhatsApp / Telepon
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!isEditing}
                placeholder="Contoh: 081234567890"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs text-slate-900 font-semibold border transition ${
                  isEditing
                    ? 'bg-white border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100'
                    : 'bg-slate-50 border-slate-200 cursor-not-allowed opacity-90'
                }`}
              />
            </div>
          </div>

          {/* 3. Email Resmi Sekolah (Locked) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Email Akun LMS
              </label>
              <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Akun Utama
              </span>
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs text-slate-700 bg-slate-50 border border-slate-200 cursor-not-allowed font-medium"
              />
            </div>
          </div>

          {/* 4. NISN / NIP (Dapodik Locked) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {isTeacher ? 'Nomor Induk Pegawai (NIP/NIK)' : 'Nomor Induk Siswa Nasional (NISN)'}
              </label>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Terverifikasi
              </span>
            </div>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
              <input
                type="text"
                value={user?.nip_nik_nisn || user?.nisn || user?.nip || '-'}
                disabled
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs text-slate-900 bg-slate-50 border border-slate-200 cursor-not-allowed font-mono font-bold"
              />
            </div>
          </div>

          {/* 5. Rombongan Belajar (Rombel) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Rombongan Belajar Terdaftar
            </label>
            <div className="relative">
              <GraduationCap className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
              <input
                type="text"
                value={user?.rombel || 'Semua Rombel'}
                disabled
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs text-slate-900 bg-slate-50 border border-slate-200 cursor-not-allowed font-semibold"
              />
            </div>
          </div>

          {/* 6. Peran Pengguna (Role) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Hak Akses Portal
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
              <input
                type="text"
                value={isTeacher ? 'Guru Pengajar (Pendidik)' : 'Siswa (Peserta Didik)'}
                disabled
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs text-slate-900 bg-slate-50 border border-slate-200 cursor-not-allowed font-semibold"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
