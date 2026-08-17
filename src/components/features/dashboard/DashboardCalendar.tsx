import React, { useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface CalendarTaskItem {
  id: string;
  title: string;
  className: string;
  classId: string;
  dueDate: string;
  type: 'assignment' | 'quiz';
  isCompleted: boolean;
}

interface DashboardCalendarProps {
  currentDate: Date;
  selectedDate: Date | null;
  tasks: CalendarTaskItem[];
  onDateSelect: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export const DashboardCalendar: React.FC<DashboardCalendarProps> = ({
  currentDate,
  selectedDate,
  tasks,
  onDateSelect,
  onPrevMonth,
  onNextMonth,
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(
    currentDate
  );

  // Pre-index task dates for instant O(1) lookup without linear scanning and allocations inside loop
  const { eventDateSet, tasksByDateKey } = useMemo(() => {
    const dateSet = new Set<string>();
    const taskMap = new Map<string, CalendarTaskItem[]>();

    tasks.forEach((t) => {
      if (!t.dueDate) return;
      try {
        const d = new Date(t.dueDate);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        dateSet.add(key);
        if (!taskMap.has(key)) {
          taskMap.set(key, []);
        }
        taskMap.get(key)!.push(t);
      } catch {}
    });

    return { eventDateSet: dateSet, tasksByDateKey: taskMap };
  }, [tasks]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startingDay = firstDay.getDay() - 1;
    if (startingDay === -1) startingDay = 6;

    const totalDays = lastDay.getDate();
    const days: Array<{ date: Date; isCurrentMonth: boolean; hasEvent: boolean }> = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
        hasEvent: false,
      });
    }

    for (let i = 1; i <= totalDays; i++) {
      const dayDate = new Date(year, month, i);
      const dayKey = `${year}-${month}-${i}`;
      const hasEvent = eventDateSet.has(dayKey);

      days.push({
        date: dayDate,
        isCurrentMonth: true,
        hasEvent,
      });
    }

    return days;
  }, [year, month, eventDateSet]);

  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return [];
    const selectedKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;
    return tasksByDateKey.get(selectedKey) || [];
  }, [selectedDate, tasksByDateKey]);

  const isToday = (d: Date) => {
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (d: Date) => {
    if (!selectedDate) return false;
    return (
      d.getDate() === selectedDate.getDate() &&
      d.getMonth() === selectedDate.getMonth() &&
      d.getFullYear() === selectedDate.getFullYear()
    );
  };

  return (
    <div className="bg-m3-surface p-6 lg:p-8 rounded-[2rem] border border-m3-outline-variant/30 shadow-m3-elevation-1 space-y-5 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <CalendarIcon className="w-5 h-5 text-m3-primary" />
          <h2 className="text-sm font-extrabold text-m3-on-surface capitalize tracking-tight">{monthName}</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onPrevMonth}
            className="p-2 rounded-full hover:bg-m3-surface-variant text-m3-on-surface-variant transition-colors cursor-pointer"
            title="Bulan Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            className="p-2 rounded-full hover:bg-m3-surface-variant text-m3-on-surface-variant transition-colors cursor-pointer"
            title="Bulan Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1.5 text-center">
        {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day, idx) => (
          <span key={idx} className="text-[10px] font-extrabold text-m3-on-surface-variant uppercase py-1">
            {day}
          </span>
        ))}
      </div>

      {/* Day grids */}
      <div className="grid grid-cols-7 gap-1.5">
        {calendarDays.map((item, idx) => {
          const selected = isSelected(item.date);
          const today = isToday(item.date);

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onDateSelect(item.date)}
              className={`h-10 rounded-2xl flex flex-col items-center justify-center text-xs relative transition-all duration-300 ease-out cursor-pointer ${
                selected
                  ? 'bg-[#1e1b4b] text-white shadow-m3-elevation-1 font-bold scale-105'
                  : today
                  ? 'bg-m3-primary/10 text-m3-primary font-black border border-m3-primary/20'
                  : item.isCurrentMonth
                  ? 'text-m3-on-surface font-semibold hover:bg-m3-surface-container-high'
                  : 'text-m3-on-surface-variant/40 font-medium hover:bg-m3-surface-container'
              }`}
            >
              <span>{item.date.getDate()}</span>
              {item.hasEvent && (
                <span
                  className={`w-1.5 h-1.5 rounded-full absolute bottom-1.5 ${
                    selected ? 'bg-amber-400 shadow-xs' : 'bg-m3-primary'
                  }`}
                ></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Agenda */}
      {selectedDate && (
        <div className="pt-4 border-t border-m3-outline-variant/30 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-m3-on-surface">
              Agenda:{' '}
              {selectedDate.toLocaleDateString('id-ID', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}
            </span>
            <span className="text-[10px] font-bold text-m3-on-surface-variant bg-m3-surface-container px-2 py-0.5 rounded-md">
              {selectedDateTasks.length} Agenda
            </span>
          </div>

          {selectedDateTasks.length === 0 ? (
            <p className="text-[11px] font-medium text-m3-on-surface-variant/70 italic py-2 text-center bg-m3-surface-container/30 rounded-xl border border-m3-outline-variant/30 border-dashed">
              Tidak ada tenggat tugas atau jadwal ujian pada tanggal ini.
            </p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
              {selectedDateTasks.map((t) => (
                <Link
                  key={t.id}
                  to={`/classes/${t.classId}`}
                  className="p-3 rounded-xl bg-m3-surface-container hover:bg-m3-surface-container-high border border-m3-outline-variant/30 flex items-center justify-between gap-3 text-xs transition-colors group"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-m3-on-surface truncate group-hover:text-m3-primary transition-colors">
                      {t.title}
                    </p>
                    <p className="text-[10px] font-medium text-m3-on-surface-variant truncate mt-0.5">{t.className}</p>
                  </div>
                  <span
                    className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full shrink-0 ${
                      t.isCompleted
                        ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-700 border border-rose-500/20'
                    }`}
                  >
                    {t.isCompleted ? 'Selesai' : 'Belum Selesai'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
