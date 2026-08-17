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
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">×</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-m3-error-container/20 border border-m3-error-container/50 text-m3-error text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-m3-error shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-m3-error hover:text-m3-error/80 cursor-pointer">×</button>
        </div>
      )}

      <div className="bg-m3-surface p-6 sm:p-8 rounded-[2rem] border border-m3-outline-variant/30 shadow-m3-elevation-1 space-y-6 transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-m3-outline-variant/30">
          <div>
            <h2 className="text-lg font-extrabold text-m3-on-surface flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-m3-primary" />
              Informasi Pribadi & Data Pokok Pendidikan (Dapodik)
            </h2>
            <p className="text-xs font-medium text-m3-on-surface-variant mt-1">
              Data akademik disinkronkan langsung dari server pusat Dapodik SMK Al-Azhar.
            </p>
          </div>

          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-m3-surface-container hover:bg-m3-surface-variant text-m3-on-surface font-bold text-xs transition-colors cursor-pointer self-start sm:self-auto shrink-0"
            >
              <Edit3 className="w-4 h-4 text-m3-primary" />
              <span>Edit Biodata</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-m3-on-surface-variant hover:bg-m3-surface-container transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-m3-primary hover:bg-m3-primary/90 text-m3-on-primary font-bold text-xs shadow-m3-elevation-1 transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:active:scale-100"
              >
                <Save className="w-4 h-4" />
                <span>{isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1. Nama Lengkap */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-m3-on-surface-variant uppercase tracking-wider">
              Nama Lengkap
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-m3-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isEditing}
                required
                className={`w-full pl-10 pr-4 py-3 rounded-xl text-xs font-bold transition-all outline-none ${
                  isEditing
                    ? 'bg-m3-surface-container border border-m3-outline focus:border-m3-primary focus:ring-1 focus:ring-m3-primary text-m3-on-surface'
                    : 'bg-m3-surface-container/50 border border-m3-outline-variant/30 cursor-not-allowed opacity-80 text-m3-on-surface-variant'
                }`}
              />
            </div>
          </div>

          {/* 2. Nomor WhatsApp / Telepon */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-m3-on-surface-variant uppercase tracking-wider">
              Nomor WhatsApp / Telepon
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-m3-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!isEditing}
                placeholder="Contoh: 081234567890"
                className={`w-full pl-10 pr-4 py-3 rounded-xl text-xs font-bold transition-all outline-none ${
                  isEditing
                    ? 'bg-m3-surface-container border border-m3-outline focus:border-m3-primary focus:ring-1 focus:ring-m3-primary text-m3-on-surface'
                    : 'bg-m3-surface-container/50 border border-m3-outline-variant/30 cursor-not-allowed opacity-80 text-m3-on-surface-variant'
                }`}
              />
            </div>
          </div>

          {/* 3. Email Resmi Sekolah (Locked) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-extrabold text-m3-on-surface-variant uppercase tracking-wider">
                Email Akun LMS
              </label>
              <span className="text-[10px] font-bold text-m3-on-surface-variant bg-m3-surface-container px-2 py-0.5 rounded-md flex items-center gap-1">
                <Lock className="w-3 h-3" /> Akun Utama
              </span>
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 text-m3-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full pl-10 pr-4 py-3 rounded-xl text-xs font-bold bg-m3-surface-container/50 border border-m3-outline-variant/30 text-m3-on-surface-variant cursor-not-allowed"
              />
            </div>
          </div>

          {/* 4. NISN / NIP (Dapodik Locked) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-extrabold text-m3-on-surface-variant uppercase tracking-wider">
                {isTeacher ? 'Nomor Induk Pegawai (NIP/NIK)' : 'Nomor Induk Siswa Nasional (NISN)'}
              </label>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Terverifikasi
              </span>
            </div>
            <div className="relative">
              <Building2 className="w-4 h-4 text-m3-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
              <input
                type="text"
                value={user?.nip_nik_nisn || user?.nisn || user?.nip || '-'}
                disabled
                className="w-full pl-10 pr-4 py-3 rounded-xl text-xs font-mono font-bold bg-m3-surface-container/50 border border-m3-outline-variant/30 text-m3-on-surface-variant cursor-not-allowed"
              />
            </div>
          </div>

          {/* 5. Rombongan Belajar (Rombel) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-m3-on-surface-variant uppercase tracking-wider">
              Rombongan Belajar Terdaftar
            </label>
            <div className="relative">
              <GraduationCap className="w-4 h-4 text-m3-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
              <input
                type="text"
                value={user?.rombel || 'Semua Rombel'}
                disabled
                className="w-full pl-10 pr-4 py-3 rounded-xl text-xs font-bold bg-m3-surface-container/50 border border-m3-outline-variant/30 text-m3-on-surface-variant cursor-not-allowed"
              />
            </div>
          </div>

          {/* 6. Peran Pengguna (Role) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-m3-on-surface-variant uppercase tracking-wider">
              Hak Akses Portal
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-m3-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
              <input
                type="text"
                value={isTeacher ? 'Guru Pengajar (Pendidik)' : 'Siswa (Peserta Didik)'}
                disabled
                className="w-full pl-10 pr-4 py-3 rounded-xl text-xs font-bold bg-m3-surface-container/50 border border-m3-outline-variant/30 text-m3-on-surface-variant cursor-not-allowed"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
