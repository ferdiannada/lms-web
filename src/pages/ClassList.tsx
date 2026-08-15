import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ClassRoom, Rombel } from '../types';
import { BookOpen, Plus, UserPlus, Search, ArrowRight, Users, FileText, HelpCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Modal } from '../components/Modal';

const BANNER_COLORS = [
  'from-indigo-600 to-violet-700',
  'from-emerald-600 to-teal-700',
  'from-blue-600 to-cyan-700',
  'from-amber-600 to-orange-700',
  'from-rose-600 to-pink-700',
  'from-purple-600 to-indigo-800',
];

export const ClassList: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [rombels, setRombels] = useState<Rombel[]>([]);
  const [search, setSearch] = useState('');
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [joinCode, setJoinCode] = useState('');
  const [className, setClassName] = useState('');
  const [selectedRombelId, setSelectedRombelId] = useState('');
  const [description, setDescription] = useState('');
  const [coverColor, setCoverColor] = useState(BANNER_COLORS[0]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchClasses();
    if (user?.role === 'guru' || user?.role === 'admin') {
      fetchRombels();
    }
  }, [user]);

  const fetchClasses = async () => {
    setIsLoading(true);
    try {
      const data = await api.getClasses();
      setClasses(data);
    } catch (err: any) {
      console.error('Failed to fetch classes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRombels = async () => {
    try {
      const data = await api.getRombels();
      setRombels(data);
      if (data.length > 0 && !selectedRombelId) {
        setSelectedRombelId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch rombels:', err);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await api.joinClass(joinCode);
      setIsJoinOpen(false);
      setJoinCode('');
      await fetchClasses();
    } catch (err: any) {
      setError(err.message || 'Gagal bergabung ke kelas.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRombelId) {
      setError('Pilih rombongan belajar (rombel) terlebih dahulu.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await api.createClass({
        name: className,
        description,
        rombel_id: selectedRombelId,
        cover_color: coverColor,
      });
      setIsCreateOpen(false);
      setClassName('');
      setDescription('');
      await fetchClasses();
    } catch (err: any) {
      setError(err.message || 'Gagal membuat kelas baru.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredClasses = classes.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.subject && c.subject.toLowerCase().includes(search.toLowerCase())) ||
      (c.rombel && c.rombel.toLowerCase().includes(search.toLowerCase())) ||
      (c.code && c.code.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            Ruang Kelas Pembelajaran
          </h1>
          <p className="text-slate-400 text-sm">
            Daftar ruang kelas virtual dan rombel yang terhubung ke database
          </p>
        </div>

        <div className="flex items-center gap-3">
          {user?.role === 'siswa' && (
            <button
              onClick={() => {
                setError(null);
                setIsJoinOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Gabung Kelas (Kode)
            </button>
          )}

          {(user?.role === 'guru' || user?.role === 'admin') && (
            <button
              onClick={() => {
                setError(null);
                setIsCreateOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Buat Kelas Baru
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari berdasarkan nama kelas, mata pelajaran, atau kode rombel..."
          className="w-full bg-slate-900/80 border border-slate-800 focus:border-indigo-500 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-12 text-center text-slate-400">
          <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p>Memuat daftar kelas dari database...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredClasses.length === 0 && (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Belum Ada Ruang Kelas</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              {user?.role === 'guru'
                ? 'Klik tombol "Buat Kelas Baru" untuk membuat ruang pembelajaran virtual untuk siswa.'
                : 'Gunakan tombol "Gabung Kelas" untuk memasukkan kode unik kelas dari Guru pengajar.'}
            </p>
          </div>
        </div>
      )}

      {/* Classes Grid */}
      {!isLoading && filteredClasses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => (
            <Link
              key={cls.id}
              to={`/classes/${cls.id}`}
              className="glass-card rounded-3xl overflow-hidden border border-slate-800 hover:border-indigo-500/40 transition-all group flex flex-col justify-between"
            >
              {/* Header Banner */}
              <div className={`p-6 bg-gradient-to-r ${cls.banner_color || 'from-indigo-600 to-violet-700'} space-y-2`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-100 bg-white/10 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20">
                    {cls.rombel}
                  </span>
                  <span className="text-xs font-mono font-bold text-indigo-100 bg-black/20 px-2 py-0.5 rounded-md">
                    {cls.code}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-100 transition-colors line-clamp-1">
                  {cls.name}
                </h3>
              </div>

              {/* Content Body */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-400 line-clamp-3">
                  {cls.description || 'Tidak ada deskripsi tambahan.'}
                </p>

                {/* Counts Bar */}
                <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{cls.student_count || 0} Siswa</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 border-x border-slate-800">
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{cls.material_count || 0} Modul</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>{cls.assignment_count || 0} Tugas</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-slate-500">Pengajar:</p>
                    <p className="text-xs font-bold text-slate-200">{cls.teacher_name}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Join Class Modal */}
      <Modal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} title="Gabung ke Kelas Virtual">
        <form onSubmit={handleJoin} className="space-y-4">
          {error && <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">{error}</div>}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase">Kode Kelas (Diberikan Guru)</label>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              required
              placeholder="Contoh: 4DLVVH"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 font-mono uppercase tracking-widest focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Memproses...' : 'Gabung Kelas Sekarang'}
          </button>
        </form>
      </Modal>

      {/* Create Class Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Buat Ruang Kelas Baru">
        <form onSubmit={handleCreate} className="space-y-4">
          {error && <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">{error}</div>}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase">Nama Mata Pelajaran / Kelas</label>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              required
              placeholder="Contoh: Pemrograman Web & Perangkat Bergerak"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:border-indigo-500"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase">Pilih Rombongan Belajar (Dapodik)</label>
            <select
              value={selectedRombelId}
              onChange={(e) => setSelectedRombelId(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:border-indigo-500 cursor-pointer"
            >
              {rombels.map((r) => (
                <option key={r.id} value={r.id} className="bg-slate-900 text-slate-100">
                  {r.name} (Tingkat {r.tingkat})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase">Deskripsi Ringkas</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Silabus dan target kompetensi pembelajaran..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase">Warna Tema Banner</label>
            <div className="flex items-center gap-2">
              {BANNER_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setCoverColor(color)}
                  className={`w-8 h-8 rounded-full bg-gradient-to-r ${color} cursor-pointer transition-all ${
                    coverColor === color ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan & Terbitkan Kelas'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
