import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { GradebookEntry, ClassRoom } from '../types';
import { Award, BookOpen, CheckCircle, Clock } from 'lucide-react';

export const GradebookPage: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [entries, setEntries] = useState<GradebookEntry[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        const clsData = await api.getClasses();
        setClasses(clsData);
        if (clsData.length > 0) {
          setSelectedClassId(clsData[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!selectedClassId) return;
    const fetchGrades = async () => {
      try {
        const data = await api.getGradebook(selectedClassId);
        setEntries(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchGrades();
  }, [selectedClassId]);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Award className="w-6 h-6 text-amber-400" />
            {user?.role === 'guru' ? 'Rekap & Transkrip Nilai Siswa' : 'Riwayat & Transkrip Nilai Saya'}
          </h1>
          <p className="text-slate-400 text-sm">
            {user?.role === 'guru'
              ? 'Daftar rekapitulasi nilai tugas dan kuis siswa per rombel.'
              : 'Hasil evaluasi tugas, kuis, dan ujian semester.'}
          </p>
        </div>

        {/* Class Selector Dropdown */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-2xl">
          <BookOpen className="w-4 h-4 text-indigo-400 ml-2" />
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="bg-transparent text-sm font-bold text-slate-100 focus:outline-none pr-4 cursor-pointer"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-900 text-slate-100">
                {c.rombel} - {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Siswa View: Personal Summary Cards */}
      {user?.role === 'siswa' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold uppercase text-slate-400">Rata-Rata Nilai</span>
            <div className="text-3xl font-extrabold text-emerald-400">90.0</div>
            <p className="text-xs text-slate-400">Predikat: A (Sangat Memuaskan)</p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold uppercase text-slate-400">Tugas Terkumpul</span>
            <div className="text-3xl font-extrabold text-indigo-400">5 / 5</div>
            <p className="text-xs text-emerald-400 font-semibold">100% tepat waktu</p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold uppercase text-slate-400">Hasil UTS Web</span>
            <div className="text-3xl font-extrabold text-amber-400">85 / 100</div>
            <p className="text-xs text-slate-400">Peringkat 3 di kelas</p>
          </div>
        </div>
      )}

      {/* Table: Gradebook Entries */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white">
          {user?.role === 'guru' ? 'Daftar Nilai Rombel' : 'Detail Komponen Nilai'}
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5">Nama Siswa</th>
                <th className="p-3.5">NISN</th>
                <th className="p-3.5">Tugas 1</th>
                <th className="p-3.5">Tugas 2</th>
                <th className="p-3.5">UTS PWPB</th>
                <th className="p-3.5">Rata-Rata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {entries.map((entry) => (
                <tr key={entry.student_id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-3.5 font-bold text-white">{entry.student_name}</td>
                  <td className="p-3.5 text-slate-400 font-mono text-xs">{entry.nisn}</td>
                  <td className="p-3.5 font-semibold text-slate-200">{entry.grades['Tugas 1'] || '-'}</td>
                  <td className="p-3.5 font-semibold text-slate-200">{entry.grades['Tugas 2'] || '-'}</td>
                  <td className="p-3.5 font-semibold text-slate-200">{entry.grades['UTS PWPB'] || '-'}</td>
                  <td className="p-3.5">
                    <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-xs">
                      {entry.average_score}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
