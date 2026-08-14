import { useEffect, useState } from '@lynx-js/react';
import { classService } from '../services/classService';
import type { GradeHistoryItem } from '../types';

export function RiwayatNilaiView() {
  const [grades, setGrades] = useState<GradeHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setLoading(true);
        const data = await classService.getMyGradeHistory();
        setGrades(data || []);
      } catch (err) {
        console.error('Failed to load grade history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, []);

  return (
    <view className="max-w-4xl mx-auto space-y-6">
      <view className="space-y-1">
        <text className="text-xl md:text-2xl font-black text-slate-900 tracking-tight block">
          📊 Riwayat Nilai Saya
        </text>
        <text className="text-xs text-slate-500 font-medium block">
          Daftar perolehan nilai tugas dan kuis interaktif dari seluruh mata
          pelajaran.
        </text>
      </view>

      {loading ? (
        <view className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-400 shadow-sm animate-pulse">
          <text className="text-sm font-semibold">Memuat riwayat nilai...</text>
        </view>
      ) : grades.length === 0 ? (
        <view className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center shadow-sm space-y-2">
          <text className="text-4xl block mb-2">🎓</text>
          <text className="text-base font-extrabold text-slate-800 block">
            Belum Ada Nilai Terpublikasi
          </text>
          <text className="text-xs text-slate-500 block">
            Nilai dari tugas dan kuis yang telah diperiksa guru akan muncul di
            sini.
          </text>
        </view>
      ) : (
        <view className="space-y-3">
          {grades.map((item) => (
            <view
              key={item.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between gap-4 hover:border-slate-300 transition-all"
            >
              <view className="space-y-1">
                <view className="inline-flex px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold">
                  <text>{item.className}</text>
                </view>
                <text className="font-extrabold text-base text-slate-900 block">
                  {item.itemTitle}
                </text>
                <text className="text-xs text-slate-400 font-medium block">
                  {item.itemType === 'quiz'
                    ? '⏱️ Kuis Interaktif'
                    : '📝 Tugas Kelas'}{' '}
                  • Dinilai pada {item.gradedAt}
                </text>
              </view>

              <view className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl text-center shrink-0">
                <text className="text-lg font-black text-emerald-700 block">
                  {item.score} / {item.maxScore}
                </text>
                <text className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider block">
                  Nilai Akhir
                </text>
              </view>
            </view>
          ))}
        </view>
      )}
    </view>
  );
}
