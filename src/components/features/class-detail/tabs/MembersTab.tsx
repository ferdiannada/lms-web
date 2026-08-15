import React from 'react';
import { Users, GraduationCap, ShieldCheck } from 'lucide-react';
import { ClassMember } from '../../../../types';

interface MembersTabProps {
  members: ClassMember[];
}

export const MembersTab: React.FC<MembersTabProps> = ({ members }) => {
  const teachers = members.filter((m) => m.role === 'guru' || m.role === 'admin');
  const students = members.filter((m) => m.role === 'siswa');

  return (
    <div className="space-y-6">
      {/* Teachers Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> Guru Pengajar ({teachers.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {teachers.map((m) => (
            <div
              key={m.id}
              className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center border border-emerald-100 shrink-0">
                {m.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs text-slate-900 truncate">{m.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{m.email}</p>
                <span className="inline-block mt-0.5 text-[9px] font-bold px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Guru
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Students Section */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-indigo-600" /> Siswa Terdaftar ({students.length})
        </h3>
        {students.length === 0 ? (
          <div className="bg-white p-8 text-center text-slate-400 rounded-2xl border border-slate-200 text-xs">
            Belum ada siswa yang bergabung di kelas ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {students.map((m) => (
              <div
                key={m.id}
                className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center border border-indigo-100 shrink-0">
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs text-slate-900 truncate">{m.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{m.email}</p>
                  {m.nisn && (
                    <p className="text-[10px] text-indigo-600 font-medium">NISN: {m.nisn}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
