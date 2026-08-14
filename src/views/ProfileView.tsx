import { useState } from '@lynx-js/react';
import { classService } from '../services/classService';
import type { User } from '../types';

interface ProfileViewProps {
  user: User;
  onUpdateUser: (updated: User) => void;
  onLogout: () => void;
}

export function ProfileView({
  user,
  onUpdateUser,
  onLogout,
}: ProfileViewProps) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '');
  const [saving, setSaving] = useState(false);

  const getInputValue = (e: any): string => {
    if (e?.detail?.value !== undefined) return e.detail.value;
    if (e?.target?.value !== undefined) return e.target.value;
    if (e?.currentTarget?.value !== undefined) return e.currentTarget.value;
    return '';
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      setSaving(true);
      await classService.updateProfile(name, phone);
      alert('Profil berhasil diperbarui!');
      onUpdateUser({ ...user, name, phone });
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui profil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <view className="max-w-xl mx-auto space-y-6">
      <view className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        {/* Profile Card Header */}
        <view className="text-center space-y-3 pb-6 border-b border-slate-100">
          <view className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25">
            <text>{user.name[0]?.toUpperCase()}</text>
          </view>
          <view className="space-y-1">
            <text className="text-xl font-extrabold text-slate-900 block">
              {user.name}
            </text>
            <text className="text-xs text-slate-400 font-medium block">
              {user.email}
            </text>
          </view>
          <view className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/80 uppercase">
            <text>{user.role}</text>
          </view>
        </view>

        {/* Input Fields */}
        <view className="space-y-4">
          <view className="space-y-1.5">
            <text className="text-xs font-bold text-slate-700 block">
              Nama Lengkap
            </text>
            <input
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all"
              type="text"
              placeholder={user.name}
              bindinput={(e: any) => setName(getInputValue(e))}
              onInput={(e: any) => setName(getInputValue(e))}
              onChange={(e: any) => setName(getInputValue(e))}
              value={name}
            />
          </view>

          <view className="space-y-1.5">
            <text className="text-xs font-bold text-slate-700 block">
              NIP / NIK / NISN
            </text>
            <input
              className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-500 font-mono outline-none cursor-not-allowed opacity-80"
              type="text"
              placeholder={user.nipNikNisn || 'Tidak diisi'}
              disabled
            />
          </view>

          <view className="space-y-1.5">
            <text className="text-xs font-bold text-slate-700 block">
              Nomor Telepon / WhatsApp
            </text>
            <input
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all"
              type="text"
              placeholder="081234567890"
              bindinput={(e: any) => setPhone(getInputValue(e))}
              onInput={(e: any) => setPhone(getInputValue(e))}
              onChange={(e: any) => setPhone(getInputValue(e))}
              value={phone}
            />
          </view>
        </view>

        {/* Action Buttons */}
        <view className="space-y-3 pt-2">
          <view
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-extrabold text-xs text-center cursor-pointer shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-[0.99]"
            bindtap={handleSave}
          >
            <text>{saving ? 'Simpan...' : 'Simpan Perubahan'}</text>
          </view>

          <view
            className="w-full py-3 rounded-xl bg-rose-50 text-rose-700 font-extrabold text-xs text-center border border-rose-200 cursor-pointer hover:bg-rose-100 transition-all active:scale-[0.99]"
            bindtap={onLogout}
          >
            <text>🚪 Keluar dari Akun</text>
          </view>
        </view>
      </view>
    </view>
  );
}
