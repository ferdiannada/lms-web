import React from 'react';
import { BookOpen, FileText, HelpCircle, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardStatsCardsProps {
  stats: {
    classesCount: number;
    pendingAssignmentsCount: number;
    activeQuizzesCount: number;
    materialsCount: number;
  };
  isTeacher: boolean;
}

export const DashboardStatsCards: React.FC<DashboardStatsCardsProps> = ({ stats, isTeacher }) => {
  const cards = [
    {
      title: 'Ruang Kelas Aktif',
      count: stats.classesCount,
      subtitle: isTeacher ? 'Kelas Diampu' : 'Kelas Diikuti',
      icon: <GraduationCap className="w-6 h-6 text-indigo-600" />,
      bg: 'bg-indigo-50/70',
      link: '/classes',
    },
    {
      title: 'Tugas Belajar',
      count: stats.pendingAssignmentsCount,
      subtitle: isTeacher ? 'Penugasan Diterbitkan' : 'Tugas Terdaftar',
      icon: <FileText className="w-6 h-6 text-amber-600" />,
      bg: 'bg-amber-50/70',
      link: '/assignments',
    },
    {
      title: 'Kuis & Ujian CBT',
      count: stats.activeQuizzesCount,
      subtitle: isTeacher ? 'Kuis Aktif' : 'Evaluasi Online',
      icon: <HelpCircle className="w-6 h-6 text-emerald-600" />,
      bg: 'bg-emerald-50/70',
      link: '/quizzes',
    },
    {
      title: 'Bahan Ajar & Modul',
      count: stats.materialsCount,
      subtitle: 'Modul Pembelajaran',
      icon: <BookOpen className="w-6 h-6 text-cyan-600" />,
      bg: 'bg-cyan-50/70',
      link: '/assignments',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card, idx) => (
        <Link
          key={idx}
          to={card.link}
          className="p-5 rounded-[28px] bg-m3-surface border border-m3-outline-variant/30 shadow-m3-elevation-1 hover:shadow-m3-elevation-2 transition-all duration-300 ease-m3-standard flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-m3-on-surface-variant">{card.title}</span>
            <div className={`p-2.5 rounded-2xl ${card.bg} group-hover:scale-110 transition-transform duration-300 ease-m3-standard`}>
              {card.icon}
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl lg:text-3xl font-black text-m3-on-surface">{card.count}</span>
            <p className="text-[11px] text-m3-on-surface-variant font-medium mt-1">{card.subtitle}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};
