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
        <h3 className="text-[11px] font-black uppercase tracking-widest text-m3-on-surface-variant flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-m3-primary" /> Guru Pengajar ({teachers.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {teachers.map((m) => (
            <div
              key={m.id}
              className="p-5 bg-m3-surface rounded-[1.5rem] border border-m3-outline-variant/30 shadow-m3-elevation-1 flex items-center gap-4 hover:shadow-m3-elevation-2 transition-all cursor-default"
            >
              <div className="w-12 h-12 rounded-[1rem] bg-m3-secondary-container text-m3-on-secondary-container font-black text-lg flex items-center justify-center shrink-0 shadow-sm">
                {m.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-m3-on-surface truncate">{m.name}</p>
                <p className="text-[10px] text-m3-on-surface-variant truncate font-medium">{m.email}</p>
                <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-m3-surface-container-highest text-m3-on-surface">
                  Guru
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Students Section */}
      <div className="space-y-3 pt-4">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-m3-on-surface-variant flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-m3-primary" /> Siswa Terdaftar ({students.length})
        </h3>
        {students.length === 0 ? (
          <div className="bg-m3-surface p-10 text-center text-m3-on-surface-variant rounded-[2rem] border border-m3-outline-variant/30 text-xs font-medium shadow-m3-elevation-1">
            Belum ada siswa yang bergabung di kelas ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {students.map((m) => (
              <div
                key={m.id}
                className="p-5 bg-m3-surface rounded-[1.5rem] border border-m3-outline-variant/30 shadow-m3-elevation-1 flex items-center gap-4 hover:shadow-m3-elevation-2 transition-all cursor-default"
              >
                <div className="w-12 h-12 rounded-[1rem] bg-m3-primary-container text-m3-on-primary-container font-black text-lg flex items-center justify-center shrink-0 shadow-sm">
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-m3-on-surface truncate">{m.name}</p>
                  <p className="text-[10px] text-m3-on-surface-variant truncate font-medium">{m.email}</p>
                  {m.nisn && (
                    <p className="text-[10px] text-m3-primary font-bold mt-0.5">NISN: {m.nisn}</p>
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
