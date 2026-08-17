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
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-[2rem] bg-m3-primary border border-m3-outline-variant/20 p-6 lg:p-8 shadow-lg group">
        {/* M3 Ambient Blurs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 left-20 w-72 h-72 bg-m3-secondary/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Decorative Floating Icons */}
        <div className="absolute top-4 right-16 w-20 h-20 opacity-20 group-hover:opacity-40 transition-opacity duration-700 animate-[spin_15s_linear_infinite] [animation-play-state:paused] group-hover:[animation-play-state:running] pointer-events-none">
          <Award className="w-full h-full text-white" />
        </div>
        <div className="absolute -bottom-8 right-40 w-32 h-32 opacity-10 group-hover:opacity-30 transition-opacity duration-700 animate-[bounce_8s_infinite] [animation-play-state:paused] group-hover:[animation-play-state:running] pointer-events-none">
          <Layers className="w-full h-full text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-m3-on-primary/10 backdrop-blur-md border border-m3-on-primary/15 text-m3-on-primary text-xs font-semibold">
              <Layers className="w-3.5 h-3.5" />
              Buku Nilai (Gradebook)
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-m3-on-primary tracking-tight">
              {isTeacher ? 'Rekap & Transkrip Nilai Siswa' : 'Riwayat & Transkrip Nilai Saya'}
            </h1>
            <p className="text-indigo-200/90 text-sm max-w-xl leading-relaxed">
              {isTeacher
                ? 'Daftar rekapitulasi nilai tugas dan kuis siswa yang tersimpan di database secara otomatis.'
                : 'Hasil evaluasi tugas, kuis, dan ujian semester yang telah dinilai dan direkapitulasi.'}
            </p>
          </div>
        </div>
      </div>

      {/* Modern Class & Subject Selection / Filter Bar */}
      {classes.length > 0 && (
        <div className="bg-m3-surface p-4 rounded-[1.5rem] border border-m3-outline-variant/30 shadow-m3-elevation-1 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-sm font-bold text-m3-on-surface flex items-center gap-2 px-2">
              <BookOpen className="w-4 h-4 text-m3-primary" />
              Filter Mata Pelajaran
            </span>
          </div>
          
          <div className="w-full md:w-96 shrink-0 relative z-20">
            <SearchableSelect
              options={classOptions}
              value={selectedClassId}
              onChange={(val) => setSelectedClassId(val)}
              placeholder="Pilih atau cari kelas..."
              searchPlaceholder="Ketik nama mapel atau rombel..."
              icon={<BookOpen className="w-4 h-4 text-m3-primary shrink-0" />}
              footerLabel="Kelas & Mapel"
              emptyText="Tidak ada kelas yang cocok"
              emptySubText="Coba cari dengan nama mapel atau kode kelas"
            />
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="p-16 text-center text-m3-on-surface-variant">
          <div className="inline-block w-8 h-8 border-4 border-[#1e1b4b] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-bold">Memuat rekapitulasi nilai dari database...</p>
        </div>
      )}

      {/* SISWA VIEW: Riwayat Nilai */}
      {!isLoading && !isTeacher && (
        <div className="space-y-6">
          {studentHistory.length === 0 ? (
            <div className="bg-m3-surface p-12 text-center text-m3-on-surface-variant rounded-[2rem] border border-m3-outline-variant/30 shadow-m3-elevation-1">
              <p className="text-sm font-bold">Belum ada riwayat tugas atau kuis yang dikerjakan pada kelas ini.</p>
            </div>
          ) : (
            <div className="bg-m3-surface p-8 rounded-[2rem] border border-m3-outline-variant/30 shadow-m3-elevation-1 space-y-5">
              <h2 className="text-xl font-extrabold text-m3-on-surface flex items-center gap-2">
                <FileCheck className="w-6 h-6 text-emerald-500" />
                Daftar Tugas & Ujian yang Diselesaikan
              </h2>

              <div className="overflow-x-auto custom-scrollbar pb-2">
                <table className="w-full text-left text-sm text-m3-on-surface">
                  <thead className="bg-m3-surface-container text-[11px] uppercase font-extrabold text-m3-on-surface-variant border-y border-m3-outline-variant/50">
                    <tr>
                      <th className="p-4 rounded-tl-xl">Nama Kegiatan</th>
                      <th className="p-4">Kategori</th>
                      <th className="p-4">Kelas</th>
                      <th className="p-4">Waktu Pengumpulan</th>
                      <th className="p-4 rounded-tr-xl">Nilai Perolehan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-m3-outline-variant/30">
                    {studentHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-m3-surface-container-high/50 transition-colors">
                        <td className="p-4 font-bold">{item.title}</td>
                        <td className="p-4">
                          <span className={`inline-flex text-[10px] font-bold px-3 py-1 rounded-full uppercase ${
                            item.type === 'quiz' ? 'bg-amber-500/10 text-amber-700 border border-amber-500/20' : 'bg-m3-primary/10 text-m3-primary border border-m3-primary/20'
                          }`}>
                            {item.type === 'quiz' ? 'Ujian Online' : 'Tugas Mandiri'}
                          </span>
                        </td>
                        <td className="p-4 text-xs font-semibold text-m3-on-surface-variant">{item.class_name}</td>
                        <td className="p-4 text-xs font-semibold text-m3-on-surface-variant">
                          {item.submitted_at || item.completed_at
                            ? new Date(item.submitted_at || item.completed_at!).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
                            : '-'}
                        </td>
                        <td className="p-4">
                          {item.score != null ? (
                            <span className="inline-block px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 font-extrabold text-xs shadow-sm">
                              {item.score} / {item.max_score}
                            </span>
                          ) : (
                            <span className="text-xs text-amber-600 font-bold bg-amber-500/10 px-3 py-1 rounded-full">Menunggu Nilai</span>
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
        <div className="bg-m3-surface p-8 rounded-[2rem] border border-m3-outline-variant/30 shadow-m3-elevation-1 space-y-5">
          <h2 className="text-xl font-extrabold text-m3-on-surface flex items-center gap-2">
            Daftar Nilai Rombel
          </h2>

          {teacherEntries.length === 0 ? (
            <p className="text-sm font-bold text-m3-on-surface-variant text-center py-10 bg-m3-surface-container/30 rounded-3xl border border-m3-outline-variant/30 border-dashed">
              Belum ada data nilai atau siswa terdaftar di rombel kelas ini.
            </p>
          ) : (
            <div className="overflow-x-auto custom-scrollbar pb-2">
              <table className="w-full text-left text-sm text-m3-on-surface">
                <thead className="bg-m3-surface-container text-[11px] uppercase font-extrabold text-m3-on-surface-variant border-y border-m3-outline-variant/50">
                  <tr>
                    <th className="p-4 rounded-tl-xl">Nama Siswa</th>
                    <th className="p-4">NISN</th>
                    {gradeColumns.map((col) => (
                      <th key={col} className="p-4 whitespace-nowrap">{col}</th>
                    ))}
                    <th className="p-4 rounded-tr-xl">Rata-Rata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-m3-outline-variant/30">
                  {teacherEntries.map((entry) => (
                    <tr key={entry.student_id} className="hover:bg-m3-surface-container-high/50 transition-colors">
                      <td className="p-4 font-bold">{entry.student_name}</td>
                      <td className="p-4 font-mono text-xs font-semibold text-m3-on-surface-variant">{entry.nisn || '-'}</td>
                      {gradeColumns.map((col) => (
                        <td key={col} className="p-4 font-bold">
                          {entry.grades[col] !== undefined ? String(entry.grades[col]) : '-'}
                        </td>
                      ))}
                      <td className="p-4">
                        <span className="inline-block px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 font-extrabold text-xs shadow-sm">
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
