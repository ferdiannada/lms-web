import React from 'react';
import { MessageSquare, BookOpen, FileText, HelpCircle, Users } from 'lucide-react';

export type ClassTabType = 'forum' | 'materi' | 'tugas' | 'kuis' | 'anggota';

interface ClassTabsNavProps {
  activeTab: ClassTabType;
  onTabChange: (tab: ClassTabType) => void;
  counts: {
    materials: number;
    assignments: number;
    quizzes: number;
    members: number;
  };
}

export const ClassTabsNav: React.FC<ClassTabsNavProps> = ({ activeTab, onTabChange, counts }) => {
  return (
    <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
      <button
        onClick={() => onTabChange('forum')}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shrink-0 ${
          activeTab === 'forum'
            ? 'bg-[#1e1b4b] text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <MessageSquare className="w-4 h-4" /> Forum Diskusi
      </button>

      <button
        onClick={() => onTabChange('materi')}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shrink-0 ${
          activeTab === 'materi'
            ? 'bg-[#1e1b4b] text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <BookOpen className="w-4 h-4" /> Modul & Materi ({counts.materials})
      </button>

      <button
        onClick={() => onTabChange('tugas')}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shrink-0 ${
          activeTab === 'tugas'
            ? 'bg-[#1e1b4b] text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <FileText className="w-4 h-4" /> Tugas & Evaluasi ({counts.assignments})
      </button>

      <button
        onClick={() => onTabChange('kuis')}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shrink-0 ${
          activeTab === 'kuis'
            ? 'bg-[#1e1b4b] text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <HelpCircle className="w-4 h-4" /> Ujian & Kuis ({counts.quizzes})
      </button>

      <button
        onClick={() => onTabChange('anggota')}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shrink-0 ${
          activeTab === 'anggota'
            ? 'bg-[#1e1b4b] text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <Users className="w-4 h-4" /> Anggota Kelas ({counts.members})
      </button>
    </div>
  );
};
