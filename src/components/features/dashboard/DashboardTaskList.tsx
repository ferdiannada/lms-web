import React from 'react';
import {
  FileText,
  HelpCircle,
  Clock,
  CheckCircle2,
  Calendar,
  Search,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export interface DashboardTaskItem {
  id: string;
  title: string;
  className: string;
  classId: string;
  dueDate: string;
  type: 'assignment' | 'quiz';
  isCompleted: boolean;
  priority?: 'high' | 'medium' | 'low';
  score?: number | null;
  maxScore?: number | null;
}

interface DashboardTaskListProps {
  tasks: DashboardTaskItem[];
  filter: 'all' | 'pending' | 'completed';
  searchQuery: string;
  onFilterChange: (filter: 'all' | 'pending' | 'completed') => void;
  onSearchChange: (query: string) => void;
  onToggleTask: (taskId: string) => void;
}

export const DashboardTaskList: React.FC<DashboardTaskListProps> = ({
  tasks,
  filter,
  searchQuery,
  onFilterChange,
  onSearchChange,
  onToggleTask,
}) => {
  return (
    <div className="bg-white p-5 lg:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Daftar Tugas & Evaluasi Siswa</h2>
          <p className="text-xs text-slate-400">
            Tandai selesai untuk mengatur manajemen belajar mandiri Anda.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => onFilterChange('all')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
              filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('pending')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
              filter === 'pending'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Belum Selesai
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('completed')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
              filter === 'completed'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Selesai
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari nama tugas atau mata pelajaran..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition shadow-2xs"
        />
      </div>

      {/* Task List Items */}
      {tasks.length === 0 ? (
        <div className="py-10 text-center text-slate-400 text-xs space-y-1">
          <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300 mb-1" />
          <p className="font-semibold text-slate-700">Tidak ada tugas dalam kategori ini.</p>
          <p className="text-[11px] text-slate-400">Semua target tugas telah tercapai atau filter tidak cocok.</p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`p-3.5 rounded-2xl border transition flex items-start justify-between gap-3 ${
                task.isCompleted
                  ? 'bg-slate-50/70 border-slate-200/80 opacity-75'
                  : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <input
                  type="checkbox"
                  checked={task.isCompleted}
                  onChange={() => onToggleTask(task.id)}
                  className="mt-0.5 w-4 h-4 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500 cursor-pointer shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        task.type === 'assignment'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {task.type === 'assignment' ? 'Tugas Praktik' : 'Kuis CBT'}
                    </span>
                    <span className="text-[10px] text-indigo-600 font-semibold">{task.className}</span>
                  </div>

                  <p
                    className={`text-xs mt-1 font-bold truncate ${
                      task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'
                    }`}
                  >
                    {task.title}
                  </p>

                  <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Tenggat:{' '}
                      {new Date(task.dueDate).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                    {task.score != null && (
                      <span className="font-bold text-emerald-600">
                        Nilai: {task.score}/{task.maxScore || 100}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Link
                to={task.type === 'quiz' ? `/quiz/${task.id}` : `/classes/${task.classId}`}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition shrink-0"
                title="Buka Halaman Tugas"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
