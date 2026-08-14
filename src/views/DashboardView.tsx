import { useEffect, useState } from '@lynx-js/react';
import { classService } from '../services/classService';
import type { ClassModel, User } from '../types';

interface DashboardViewProps {
  user: User;
  onSelectClass: (classId: string) => void;
}

export function DashboardView({ user, onSelectClass }: DashboardViewProps) {
  const [classes, setClasses] = useState<ClassModel[]>([]);
  const [loading, setLoading] = useState(true);

  const getInputValue = (e: any): string => {
    if (e?.detail?.value !== undefined) return e.detail.value;
    if (e?.target?.value !== undefined) return e.target.value;
    if (e?.currentTarget?.value !== undefined) return e.currentTarget.value;
    return '';
  };

  // Modal states
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);

  // Create class states
  const [newClassName, setNewClassName] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await classService.getClasses();
      setClasses(data || []);
    } catch (err) {
      console.error('Failed to load classes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleJoinClass = async () => {
    if (!joinCode.trim()) return;
    try {
      setJoining(true);
      await classService.joinClass(joinCode);
      alert('Berhasil bergabung ke kelas!');
      setJoinCode('');
      setShowJoinModal(false);
      fetchClasses();
    } catch (err: any) {
      alert(
        err.message || 'Gagal bergabung ke kelas. Periksa kembali kode kelas.',
      );
    } finally {
      setJoining(false);
    }
  };

  const handleCreateClass = async () => {
    if (!newClassName.trim()) return;
    try {
      setCreating(true);
      await classService.createClass(newClassName);
      alert('Berhasil membuat kelas baru!');
      setNewClassName('');
      setShowCreateModal(false);
      fetchClasses();
    } catch (err: any) {
      alert(err.message || 'Gagal membuat kelas');
    } finally {
      setCreating(false);
    }
  };

  return (
    <view className="max-w-6xl mx-auto space-y-6">
      {/* Welcome Hero Banner */}
      <view className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-blue-500/15 relative overflow-hidden">
        <view className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <view className="space-y-1.5 max-w-xl">
            <view className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold tracking-wide">
              <text>👋 Selamat Datang</text>
            </view>
            <text className="text-2xl md:text-3xl font-extrabold block tracking-tight">
              {user.name}
            </text>
            <text className="text-blue-100 text-xs md:text-sm block leading-relaxed">
              {user.role === 'guru'
                ? 'Kelola kelas virtual, buat materi, tugas, dan kuis interaktif untuk siswa Anda.'
                : 'Akses materi pembelajaran, kirim tugas, ikuti kuis, dan berdiskusi di kelas Anda.'}
            </text>
          </view>

          <view className="flex flex-wrap items-center gap-3">
            {user.role === 'siswa' ? (
              <view
                className="px-4 py-2.5 rounded-xl bg-white text-blue-700 font-extrabold text-xs md:text-sm shadow-md hover:bg-blue-50 cursor-pointer transition-transform active:scale-95 flex items-center gap-2"
                bindtap={() => setShowJoinModal(true)}
              >
                <text>🔑 Gabung Kelas</text>
              </view>
            ) : (
              <view
                className="px-4 py-2.5 rounded-xl bg-white text-blue-700 font-extrabold text-xs md:text-sm shadow-md hover:bg-blue-50 cursor-pointer transition-transform active:scale-95 flex items-center gap-2"
                bindtap={() => setShowCreateModal(true)}
              >
                <text>➕ Buat Kelas Baru</text>
              </view>
            )}
          </view>
        </view>
      </view>

      {/* Quick Overview Stats Cards */}
      <view className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <view className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <view className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
            <text>📚</text>
          </view>
          <view className="flex flex-col">
            <text className="text-xl font-extrabold text-slate-800">
              {classes.length}
            </text>
            <text className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Kelas
            </text>
          </view>
        </view>

        <view className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <view className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
            <text>📝</text>
          </view>
          <view className="flex flex-col">
            <text className="text-xl font-extrabold text-slate-800">Aktif</text>
            <text className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Semester Ini
            </text>
          </view>
        </view>

        <view className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <view className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
            <text>⏱️</text>
          </view>
          <view className="flex flex-col">
            <text className="text-xl font-extrabold text-slate-800">
              Kuis & Ujian
            </text>
            <text className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Interaktif
            </text>
          </view>
        </view>

        <view className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <view className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
            <text>💬</text>
          </view>
          <view className="flex flex-col">
            <text className="text-xl font-extrabold text-slate-800">Forum</text>
            <text className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Diskusi Kelas
            </text>
          </view>
        </view>
      </view>

      {/* Class Section Header */}
      <view className="flex items-center justify-between pt-2">
        <view className="flex items-center gap-2">
          <text className="text-lg md:text-xl font-extrabold text-slate-800 tracking-tight">
            Daftar Kelas Saya
          </text>
          <view className="bg-slate-200/70 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
            <text>{classes.length}</text>
          </view>
        </view>
      </view>

      {/* Class Cards Grid */}
      {loading ? (
        <view className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-400 shadow-sm animate-pulse">
          <text className="text-sm font-semibold">Memuat daftar kelas...</text>
        </view>
      ) : classes.length === 0 ? (
        <view className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center shadow-sm max-w-md mx-auto my-6 space-y-3">
          <text className="text-4xl block mb-2">📚</text>
          <text className="text-base font-extrabold text-slate-800 block">
            Belum Ada Kelas
          </text>
          <text className="text-xs text-slate-500 block leading-relaxed">
            {user.role === 'siswa'
              ? 'Anda belum terdaftar di kelas manapun. Mintalah kode kelas unik kepada guru Anda lalu klik Gabung Kelas.'
              : 'Anda belum memiliki kelas. Buat kelas baru untuk memulai pembelajaran.'}
          </text>
          <view className="pt-2">
            {user.role === 'siswa' ? (
              <view
                className="inline-flex px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer shadow-md shadow-blue-500/20"
                bindtap={() => setShowJoinModal(true)}
              >
                <text>🔑 Gabung Kelas Sekarang</text>
              </view>
            ) : (
              <view
                className="inline-flex px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer shadow-md shadow-blue-500/20"
                bindtap={() => setShowCreateModal(true)}
              >
                <text>➕ Buat Kelas Sekarang</text>
              </view>
            )}
          </view>
        </view>
      ) : (
        <view className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {classes.map((cls) => (
            <view
              key={cls.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-card-hover hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between group"
              bindtap={() => onSelectClass(cls.id)}
            >
              <view className="space-y-3">
                {/* Header Color Accent Bar */}
                <view
                  className="h-2 rounded-full w-full"
                  style={{ backgroundColor: cls.coverColor || '#2563eb' }}
                />

                <view className="space-y-1">
                  <text className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors block line-clamp-1">
                    {cls.name}
                  </text>
                  <text className="text-xs text-slate-500 font-medium block">
                    {cls.subjectName ? `${cls.subjectName} • ` : ''}Rombel:{' '}
                    {cls.rombelName || 'Umum'}
                  </text>
                </view>

                <view className="flex items-center gap-2 pt-1 text-xs text-slate-600">
                  <view className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0">
                    <text>👤</text>
                  </view>
                  <text className="truncate font-medium">
                    {cls.teacherName || 'Pengajar'}
                  </text>
                </view>
              </view>

              <view className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <text className="font-extrabold text-blue-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  Masuk Kelas ➔
                </text>
                {cls.studentCount !== undefined && (
                  <view className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md text-[11px] font-semibold text-slate-600">
                    <text>👥 {cls.studentCount} Siswa</text>
                  </view>
                )}
              </view>
            </view>
          ))}
        </view>
      )}

      {/* JOIN CLASS MODAL */}
      {showJoinModal && (
        <view className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <view className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-4">
            <view className="flex items-center justify-between">
              <text className="text-lg font-extrabold text-slate-900">
                🔑 Gabung Kelas Baru
              </text>
              <view
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold cursor-pointer hover:bg-slate-200"
                bindtap={() => setShowJoinModal(false)}
              >
                <text>✕</text>
              </view>
            </view>

            <text className="text-xs text-slate-500 block leading-relaxed">
              Masukkan Kode Kelas yang telah dibagikan oleh guru mata pelajaran
              Anda.
            </text>

            <view className="space-y-1.5">
              <text className="text-xs font-bold text-slate-700">
                Kode Unik Kelas
              </text>
              <input
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-mono font-bold tracking-wider outline-none focus:border-blue-500 focus:bg-white transition-all"
                type="text"
                placeholder="Contoh: KLS-89AB"
                bindinput={(e: any) => setJoinCode(getInputValue(e))}
                onInput={(e: any) => setJoinCode(getInputValue(e))}
                onChange={(e: any) => setJoinCode(getInputValue(e))}
              />
            </view>

            <view className="flex items-center justify-end gap-3 pt-2">
              <view
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs cursor-pointer hover:bg-slate-100"
                bindtap={() => setShowJoinModal(false)}
              >
                <text>Batal</text>
              </view>
              <view
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-extrabold text-xs cursor-pointer shadow-md shadow-blue-500/20 hover:bg-blue-700"
                bindtap={handleJoinClass}
              >
                <text>{joining ? 'Bergabung...' : 'Gabung Sekarang'}</text>
              </view>
            </view>
          </view>
        </view>
      )}

      {/* CREATE CLASS MODAL (Teacher/Admin) */}
      {showCreateModal && (
        <view className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <view className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-4">
            <view className="flex items-center justify-between">
              <text className="text-lg font-extrabold text-slate-900">
                ➕ Buat Kelas Baru
              </text>
              <view
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold cursor-pointer hover:bg-slate-200"
                bindtap={() => setShowCreateModal(false)}
              >
                <text>✕</text>
              </view>
            </view>

            <view className="space-y-1.5">
              <text className="text-xs font-bold text-slate-700">
                Nama Kelas / Mata Pelajaran
              </text>
              <input
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all"
                type="text"
                placeholder="Contoh: Pemrograman Web X RPL"
                bindinput={(e: any) => setNewClassName(getInputValue(e))}
                onInput={(e: any) => setNewClassName(getInputValue(e))}
                onChange={(e: any) => setNewClassName(getInputValue(e))}
              />
            </view>

            <view className="flex items-center justify-end gap-3 pt-2">
              <view
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs cursor-pointer hover:bg-slate-100"
                bindtap={() => setShowCreateModal(false)}
              >
                <text>Batal</text>
              </view>
              <view
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-extrabold text-xs cursor-pointer shadow-md shadow-blue-500/20 hover:bg-blue-700"
                bindtap={handleCreateClass}
              >
                <text>{creating ? 'Membuat...' : 'Buat Kelas'}</text>
              </view>
            </view>
          </view>
        </view>
      )}
    </view>
  );
}
