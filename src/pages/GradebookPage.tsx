import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { GradebookEntry, GradeHistoryItem, ClassRoom } from '../types';
import { Award, BookOpen, CheckCircle, Clock, FileCheck } from 'lucide-react';

export const GradebookPage: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [teacherEntries, setTeacherEntries] = useState<GradebookEntry[]>([]);
  const [studentHistory, setStudentHistory] = useState<GradeHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isTeacher = user?.role === 'guru' || user?.role === 'admin';

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const clsData = await api.getClasses();
        setClasses(clsData);
        if (clsData.length > 0) {
          setSelectedClassId(clsData[0].id);
        }
      } catch (err) {
        console.error('Failed to load classes for gradebook:', err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!selectedClassId && classes.length > 0) return;
    const fetchGrades = async () => {
      setIsLoading(true);
      try {
        if (isTeacher) {
          if (selectedClassId) {
            const data = await api.getGradebook(selectedClassId);
            setTeacherEntries(data);
          }
        } else {
          const data = await api.getMyGradeHistory(selectedClassId || undefined);
          setStudentHistory(data);
        }
      } catch (err) {
        console.error('Failed to fetch grades:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGrades();
  }, [selectedClassId, isTeacher]);

  // Extract all unique assignment/quiz column names for Teacher Gradebook
  const gradeColumns = Array.from(
    new Set(teacherEntries.flatMap((e) => Object.keys(e.grades)))
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Award className="w-6 h-6 text-amber-400" />
            {isTeacher ? 'Rekap & Transkrip Nilai Siswa' : 'Riwayat & Transkrip Nilai Saya'}
          </h1>
          <p className="text-slate-400 text-sm">
            {isTeacher
              ? 'Daftar rekapitulasi nilai tugas dan kuis siswa yang tersimpan di database.'
              : 'Hasil evaluasi tugas, kuis, dan ujian semester yang telah dinilai.'}
          </p>
        </div>

        {/* Class Selector Dropdown */}
        {classes.length > 0 && (
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
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="p-12 text-center text-slate-400">
          <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p>Memuat rekapitulasi nilai dari database...</p>
        </div>
      )}

      {/* SISWA VIEW: Riwayat Nilai */}
      {!isLoading && !isTeacher && (
        <div className="space-y-6">
          {studentHistory.length === 0 ? (
            <div className="glass-panel p-8 text-center text-slate-400 rounded-3xl border border-slate-800">
              Belum ada riwayat tugas atau kuis yang dikerjakan pada kelas ini.
            </div>
          ) : (
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                Daftar Tugas & Ujian yang Diselesaikan
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-900/80 text-xs uppercase font-bold text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Nama Kegiatan</th>
                      <th className="p-3.5">Kategori</th>
                      <th className="p-3.5">Kelas</th>
                      <th className="p-3.5">Waktu Pengumpulan</th>
                      <th className="p-3.5">Nilai Perolehan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {studentHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-3.5 font-bold text-white">{item.title}</td>
                        <td className="p-3.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            item.type === 'quiz' ? 'bg-amber-500/20 text-amber-300' : 'bg-indigo-500/20 text-indigo-300'
                          }`}>
                            {item.type === 'quiz' ? 'Ujian Online' : 'Tugas Mandiri'}
                          </span>
                        </td>
                        <td className="p-3.5 text-xs text-slate-400">{item.class_name}</td>
                        <td className="p-3.5 text-xs text-slate-400">
                          {item.submitted_at || item.completed_at
                            ? new Date(item.submitted_at || item.completed_at!).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
                            : '-'}
                        </td>
                        <td className="p-3.5">
                          {item.score != null ? (
                            <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-xs">
                              {item.score} / {item.max_score}
                            </span>
                          ) : (
                            <span className="text-xs text-amber-400 font-medium">Menunggu Nilai</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* GURU VIEW: Rekap Nilai Rombel */}
      {!isLoading && isTeacher && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white">Daftar Nilai Rombel</h2>

          {teacherEntries.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">
              Belum ada data nilai atau siswa terdaftar di rombel kelas ini.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/80 text-xs uppercase font-bold text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Nama Siswa</th>
                    <th className="p-3.5">NISN</th>
                    {gradeColumns.map((col) => (
                      <th key={col} className="p-3.5 whitespace-nowrap">{col}</th>
                    ))}
                    <th className="p-3.5">Rata-Rata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {teacherEntries.map((entry) => (
                    <tr key={entry.student_id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3.5 font-bold text-white">{entry.student_name}</td>
                      <td className="p-3.5 text-slate-400 font-mono text-xs">{entry.nisn || '-'}</td>
                      {gradeColumns.map((col) => (
                        <td key={col} className="p-3.5 font-semibold text-slate-200">
                          {entry.grades[col] !== undefined ? String(entry.grades[col]) : '-'}
                        </td>
                      ))}
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
          )}
        </div>
      )}
    </div>
  );
};
