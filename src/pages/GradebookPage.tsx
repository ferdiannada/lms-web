import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { GradebookEntry, GradeHistoryItem, ClassRoom } from '../types';
import { Award, BookOpen, CheckCircle, Clock, FileCheck, Layers } from 'lucide-react';
import { SearchableSelect, SelectOption } from '../components/SearchableSelect';

export const GradebookPage: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [teacherEntries, setTeacherEntries] = useState<GradebookEntry[]>([]);
  const [studentHistory, setStudentHistory] = useState<GradeHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isTeacher = user?.role === 'guru' || user?.role === 'admin';

  useEffect(() => {
    const controller = new AbortController();
    const init = async () => {
      setIsLoading(true);
      try {
        const clsData = await api.getClasses();
        if (controller.signal.aborted) return;
        setClasses(clsData);
        if (clsData.length > 0) {
          setSelectedClassId((prev) => prev || clsData[0].id);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Failed to load classes for gradebook:', err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };
    init();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!selectedClassId && classes.length > 0 && isTeacher) return;
    const controller = new AbortController();

    const fetchGrades = async () => {
      setIsLoading(true);
      try {
        if (isTeacher) {
          if (selectedClassId) {
            const data = await api.getGradebook(selectedClassId);
            if (controller.signal.aborted) return;
            setTeacherEntries(data);
          }
        } else {
          const data = await api.getMyGradeHistory(selectedClassId || undefined);
          if (controller.signal.aborted) return;
          setStudentHistory(data);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Failed to fetch grades:', err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };
    fetchGrades();

    return () => {
      controller.abort();
    };
  }, [selectedClassId, isTeacher, classes.length]);

  // Options for modern class & subject selector
  const classOptions: SelectOption[] = useMemo(() => {
    if (isTeacher) {
      return classes.map((c) => ({
        value: c.id,
        label: c.name,
        badge: c.rombel || 'SMK',
        subLabel: c.student_count !== undefined ? `${c.student_count} Siswa` : (c.teacher_name || undefined),
      }));
    }

    return [
      {
        value: '',
        label: 'Semua Kelas & Mapel',
        badge: 'SEMUA',
        subLabel: `${classes.length} Kelas Terdaftar`,
      },
      ...classes.map((c) => ({
        value: c.id,
        label: c.name,
        badge: c.rombel || 'SMK',
        subLabel: c.teacher_name || (c.student_count !== undefined ? `${c.student_count} Siswa` : undefined),
      })),
    ];
  }, [classes, isTeacher]);

  // Extract all unique assignment/quiz column names for Teacher Gradebook
  const gradeColumns = Array.from(
    new Set(teacherEntries.flatMap((e) => Object.keys(e.grades)))
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <Award className="w-6 h-6 text-amber-500" />
            {isTeacher ? 'Rekap & Transkrip Nilai Siswa' : 'Riwayat & Transkrip Nilai Saya'}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {isTeacher
              ? 'Daftar rekapitulasi nilai tugas dan kuis siswa yang tersimpan di database.'
              : 'Hasil evaluasi tugas, kuis, dan ujian semester yang telah dinilai.'}
          </p>
        </div>

        {/* Modern Class & Subject Selection */}
        {classes.length > 0 && (
          <div className="w-full lg:w-88 shrink-0">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Pilih Ruang Kelas & Mata Pelajaran
            </label>
            <SearchableSelect
              options={classOptions}
              value={selectedClassId}
              onChange={(val) => setSelectedClassId(val)}
              placeholder="Pilih atau cari kelas..."
              searchPlaceholder="Ketik nama mapel atau rombel..."
              icon={<BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />}
              footerLabel="Kelas & Mapel"
              emptyText="Tidak ada kelas yang cocok"
              emptySubText="Coba cari dengan nama mapel atau kode kelas"
            />
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="p-12 text-center text-slate-500">
          <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p>Memuat rekapitulasi nilai dari database...</p>
        </div>
      )}

      {/* SISWA VIEW: Riwayat Nilai */}
      {!isLoading && !isTeacher && (
        <div className="space-y-6">
          {studentHistory.length === 0 ? (
            <div className="bg-white p-8 text-center text-slate-500 rounded-3xl border border-slate-200 shadow-sm">
              Belum ada riwayat tugas atau kuis yang dikerjakan pada kelas ini.
            </div>
          ) : (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                Daftar Tugas & Ujian yang Diselesaikan
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Nama Kegiatan</th>
                      <th className="p-3.5">Kategori</th>
                      <th className="p-3.5">Kelas</th>
                      <th className="p-3.5">Waktu Pengumpulan</th>
                      <th className="p-3.5">Nilai Perolehan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900">{item.title}</td>
                        <td className="p-3.5">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                            item.type === 'quiz' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}>
                            {item.type === 'quiz' ? 'Ujian Online' : 'Tugas Mandiri'}
                          </span>
                        </td>
                        <td className="p-3.5 text-xs text-slate-500">{item.class_name}</td>
                        <td className="p-3.5 text-xs text-slate-500">
                          {item.submitted_at || item.completed_at
                            ? new Date(item.submitted_at || item.completed_at!).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
                            : '-'}
                        </td>
                        <td className="p-3.5">
                          {item.score != null ? (
                            <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-xs">
                              {item.score} / {item.max_score}
                            </span>
                          ) : (
                            <span className="text-xs text-amber-600 font-medium">Menunggu Nilai</span>
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
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Daftar Nilai Rombel</h2>

          {teacherEntries.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">
              Belum ada data nilai atau siswa terdaftar di rombel kelas ini.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Nama Siswa</th>
                    <th className="p-3.5">NISN</th>
                    {gradeColumns.map((col) => (
                      <th key={col} className="p-3.5 whitespace-nowrap">{col}</th>
                    ))}
                    <th className="p-3.5">Rata-Rata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teacherEntries.map((entry) => (
                    <tr key={entry.student_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">{entry.student_name}</td>
                      <td className="p-3.5 text-slate-500 font-mono text-xs">{entry.nisn || '-'}</td>
                      {gradeColumns.map((col) => (
                        <td key={col} className="p-3.5 font-semibold text-slate-800">
                          {entry.grades[col] !== undefined ? String(entry.grades[col]) : '-'}
                        </td>
                      ))}
                      <td className="p-3.5">
                        <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-xs">
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
