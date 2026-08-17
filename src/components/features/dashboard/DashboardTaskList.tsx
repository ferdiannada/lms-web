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
    <div className="bg-m3-surface-container-low p-5 lg:p-6 rounded-[28px] shadow-m3-elevation-1 space-y-5 animate-m3-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-m3-on-surface">Daftar Tugas & Evaluasi</h2>
          <p className="text-xs text-m3-on-surface-variant mt-0.5">
            Pantau dan selesaikan tanggung jawab belajar Anda.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-m3-surface p-1.5 rounded-[1.25rem] border border-m3-outline-variant/30 shadow-sm shrink-0 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <button
            type="button"
            onClick={() => onFilterChange('all')}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all duration-300 ease-out cursor-pointer shrink-0 ${
              filter === 'all'
                ? 'bg-[#1e1b4b] text-white shadow-md scale-105'
                : 'text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-variant'
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('pending')}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all duration-300 ease-out cursor-pointer shrink-0 ${
              filter === 'pending'
                ? 'bg-[#1e1b4b] text-white shadow-md scale-105'
                : 'text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-variant'
            }`}
          >
            Belum Selesai
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('completed')}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all duration-300 ease-out cursor-pointer shrink-0 ${
              filter === 'completed'
                ? 'bg-[#1e1b4b] text-white shadow-md scale-105'
                : 'text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-variant'
            }`}
          >
            Selesai
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search className="w-5 h-5 text-m3-outline absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-m3-primary transition-colors" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari tugas atau mata pelajaran..."
          className="w-full bg-m3-surface border-2 border-m3-outline rounded-2xl pl-12 pr-4 py-3 text-sm text-m3-on-surface placeholder-m3-outline-variant focus:outline-none focus:border-m3-primary transition-all duration-300 ease-m3-standard"
        />
      </div>

      {/* Task List Items */}
      {tasks.length === 0 ? (
        <div className="py-12 text-center text-m3-on-surface-variant text-sm space-y-2">
          <CheckCircle2 className="w-10 h-10 mx-auto text-m3-outline-variant mb-2" />
          <p className="font-bold text-m3-on-surface">Tidak ada tugas dalam kategori ini.</p>
          <p className="text-xs">Semua target tugas telah tercapai atau filter tidak cocok.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-[24px] border transition-all duration-300 ease-m3-standard flex items-start justify-between gap-4 ${
                task.isCompleted
                  ? 'bg-m3-surface-container border-transparent opacity-75'
                  : 'bg-m3-surface border-m3-outline-variant/30 hover:border-m3-primary hover:shadow-m3-elevation-1'
              }`}
            >
              <div className="flex items-start gap-4 min-w-0">
                <input
                  type="checkbox"
                  checked={task.isCompleted}
                  onChange={() => onToggleTask(task.id)}
                  className="mt-1 w-5 h-5 accent-m3-primary rounded border-m3-outline focus:ring-m3-primary cursor-pointer shrink-0 transition-all duration-300 ease-m3-standard hover:scale-110"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        task.type === 'assignment'
                          ? 'bg-m3-tertiary-container text-m3-on-tertiary-container'
                          : 'bg-m3-secondary-container text-m3-on-secondary-container'
                      }`}
                    >
                      {task.type === 'assignment' ? 'Tugas Praktik' : 'Kuis CBT'}
                    </span>
                    <span className="text-[11px] text-m3-primary font-bold">{task.className}</span>
                  </div>

                  <p
                    className={`text-sm mt-1.5 font-bold truncate ${
                      task.isCompleted ? 'text-m3-on-surface-variant line-through' : 'text-m3-on-surface'
                    }`}
                  >
                    {task.title}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-m3-on-surface-variant mt-1.5">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Tenggat:{' '}
                      {new Date(task.dueDate).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                    {task.score != null && (
                      <span className="font-bold text-m3-primary">
                        Nilai: {task.score}/{task.maxScore || 100}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Link
                to={task.type === 'quiz' ? `/quiz/${task.id}` : `/classes/${task.classId}`}
                className="p-2 text-m3-on-surface-variant hover:text-m3-primary hover:bg-m3-surface-variant rounded-full transition-all duration-300 ease-m3-standard shrink-0"
                title="Buka Halaman Tugas"
              >
                <ExternalLink className="w-5 h-5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
