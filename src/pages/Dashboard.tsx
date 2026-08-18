import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { DashboardGreeting } from '../components/features/dashboard/DashboardGreeting';
import { DashboardStatsCards } from '../components/features/dashboard/DashboardStatsCards';
import { DashboardRecentClasses } from '../components/features/dashboard/DashboardRecentClasses';
import { DashboardTaskList } from '../components/features/dashboard/DashboardTaskList';
import { DashboardCalendar } from '../components/features/dashboard/DashboardCalendar';
import { useDashboardData } from '../hooks/useDashboardData';
import { useDashboardStats } from '../hooks/useDashboardStats';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'guru' || user?.role === 'admin';

  // 1. Fetch Data
  const { classes, assignments, quizzes, materials, isLoading } = useDashboardData();

  // 2. Compute Stats and Metrics
  const {
    classProgressMap,
    allTasks,
    filteredTasks,
    topClasses,
    totalPendingCount,
    searchQuery,
    setSearchQuery,
    taskFilter,
    setTaskFilter,
    toggleTaskCompletion,
  } = useDashboardStats({ classes, assignments, quizzes, materials, user });

  // 3. UI State (Calendar)
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(new Date());

  const formattedToday = useMemo(() => {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  }, []);

  if (isLoading) {
    return (
      <div className="p-16 text-center text-slate-500 space-y-3 animate-in fade-in">
        <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold">Memuat beranda aktivitas LMS...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* 1. Greeting & Hero Banner */}
      <DashboardGreeting
        user={user}
        formattedToday={formattedToday}
        totalPendingCount={totalPendingCount}
      />

      {/* 2. Overview Stats Cards */}
      <DashboardStatsCards
        stats={{
          classesCount: classes.length,
          pendingAssignmentsCount: assignments.length,
          activeQuizzesCount: quizzes.length,
          materialsCount: materials.length,
        }}
        isTeacher={isTeacher}
      />

      {/* 3. Top Classes Section */}
      <DashboardRecentClasses classes={topClasses} progressMap={classProgressMap} />

      {/* 4. Two-Column Layout: Task List & Calendar / Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Interactive Task List */}
        <div className="lg:col-span-2">
          <DashboardTaskList
            tasks={filteredTasks}
            filter={taskFilter}
            searchQuery={searchQuery}
            onFilterChange={setTaskFilter}
            onSearchChange={setSearchQuery}
            onToggleTask={toggleTaskCompletion}
          />
        </div>

        {/* Right Column (1 span): Interactive Mini-Calendar */}
        <div className="space-y-6">
          <DashboardCalendar
            currentDate={currentCalendarDate}
            selectedDate={selectedCalendarDate}
            tasks={allTasks}
            onDateSelect={setSelectedCalendarDate}
            onPrevMonth={() =>
              setCurrentCalendarDate(
                new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1)
              )
            }
            onNextMonth={() =>
              setCurrentCalendarDate(
                new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1)
              )
            }
          />
        </div>
      </div>
    </div>
  );
};
