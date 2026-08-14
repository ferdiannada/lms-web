import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ClassRoom } from '../types';
import { BookOpen, Plus, UserPlus, Search, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Modal } from '../components/Modal';

export const ClassList: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [search, setSearch] = useState('');
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form states
  const [joinCode, setJoinCode] = useState('');
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('');
  const [rombel, setRombel] = useState('XII RPL 1');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const data = await api.getClasses();
      setClasses(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.joinClass(joinCode);
      setIsJoinOpen(false);
      setJoinCode('');
      fetchClasses();
    } catch (err: any) {
      setError(err.message || 'Gagal bergabung ke kelas.');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.createClass({
        name: className,
        subject,
        rombel,
        description,
      });
      setIsCreateOpen(false);
      setClassName('');
      setSubject('');
      setDescription('');
      fetchClasses();
    } catch (err: any) {
      setError(err.message || 'Gagal membuat kelas baru.');
    }
  };

  const filteredClasses = classes.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
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
            Daftar ruang kelas virtual yang diikuti pada semester ini
          </p>
        </div>

        <div className="flex items-center gap-3">
          {user?.role === 'siswa' && (
            <button
              onClick={() => setIsJoinOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Gabung Kelas (Kode)
            </button>
          )}

          {user?.role === 'guru' && (
            <button
              onClick={() => setIsCreateOpen(true)}
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

      {/* Classes Grid */}
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
                <span className="text-xs font-mono font-bold text-indigo-200">
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
              placeholder="Contoh: PWPB-XII-RPL1"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 font-mono focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-colors cursor-pointer"
          >
            Gabung Kelas Sekarang
          </button>
        </form>
      </Modal>

      {/* Create Class Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Buat Ruang Kelas Baru">
        <form onSubmit={handleCreate} className="space-y-4">
          {error && <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">{error}</div>}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase">Nama Kelas</label>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              required
              placeholder="Contoh: Pemrograman Web React & Go"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:border-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase">Mata Pelajaran</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                placeholder="PWPB"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase">Rombel Target</label>
              <input
                type="text"
                value={rombel}
                onChange={(e) => setRombel(e.target.value)}
                required
                placeholder="XII RPL 1"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase">Deskripsi Ringkas</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Silabus dan target kompetensi..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-colors cursor-pointer"
          >
            Simpan & Terbitkan Kelas
          </button>
        </form>
      </Modal>
    </div>
  );
};
