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
    <div className="bg-white p-5 lg:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-indigo-600" />
          <h2 className="text-sm font-black text-slate-900 capitalize">{monthName}</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrevMonth}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition"
            title="Bulan Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition"
            title="Bulan Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day, idx) => (
          <span key={idx} className="text-[10px] font-bold text-slate-400 uppercase py-1">
            {day}
          </span>
        ))}
      </div>

      {/* Day grids */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((item, idx) => {
          const selected = isSelected(item.date);
          const today = isToday(item.date);

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onDateSelect(item.date)}
              className={`h-9 rounded-xl flex flex-col items-center justify-center text-xs font-semibold relative transition ${
                selected
                  ? 'bg-[#1e1b4b] text-white shadow-xs font-bold'
                  : today
                  ? 'bg-indigo-50 text-indigo-700 font-black border border-indigo-200'
                  : item.isCurrentMonth
                  ? 'text-slate-800 hover:bg-slate-100'
                  : 'text-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>{item.date.getDate()}</span>
              {item.hasEvent && (
                <span
                  className={`w-1 h-1 rounded-full absolute bottom-1 ${
                    selected ? 'bg-amber-400' : 'bg-indigo-600'
                  }`}
                ></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Agenda */}
      {selectedDate && (
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">
              Agenda:{' '}
              {selectedDate.toLocaleDateString('id-ID', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}
            </span>
            <span className="text-[10px] font-semibold text-slate-400">
              {selectedDateTasks.length} Agenda
            </span>
          </div>

          {selectedDateTasks.length === 0 ? (
            <p className="text-[11px] text-slate-400 italic py-1">
              Tidak ada tenggat tugas atau jadwal ujian pada tanggal ini.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {selectedDateTasks.map((t) => (
                <Link
                  key={t.id}
                  to={`/classes/${t.classId}`}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-100 flex items-center justify-between gap-2 text-xs transition group"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate group-hover:text-indigo-600">
                      {t.title}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{t.className}</p>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                      t.isCompleted
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
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
