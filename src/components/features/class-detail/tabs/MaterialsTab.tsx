import React from 'react';
import { Plus, BookOpen, Download, FileText, Trash2 } from 'lucide-react';
import { Material } from '../../../../types';

interface MaterialsTabProps {
  materials: Material[];
  isTeacher: boolean;
  onOpenUploadModal: () => void;
  onDeleteMaterial: (id: string) => Promise<void>;
}

export const MaterialsTab: React.FC<MaterialsTabProps> = ({
  materials,
  isTeacher,
  onOpenUploadModal,
  onDeleteMaterial,
}) => {
  return (
    <div className="space-y-6">
      {isTeacher && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onOpenUploadModal}
            className="px-5 py-2.5 bg-[#1e1b4b] hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-indigo-100 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Unggah Modul / Materi
          </button>
        </div>
      )}

      {materials.length === 0 ? (
        <div className="bg-white p-10 text-center text-slate-500 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="font-bold text-slate-700 text-sm">Belum ada materi pembelajaran</p>
          <p className="text-xs text-slate-400">Guru pengajar belum mengunggah berkas modul untuk kelas ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {materials.map((mat) => (
            <div
              key={mat.id}
              className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3.5 flex flex-col justify-between hover:shadow-md transition group"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm truncate">{mat.title}</h3>
                      <span className="text-[10px] text-slate-400">
                        {new Date(mat.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {isTeacher && (
                    <button
                      type="button"
                      onClick={() => onDeleteMaterial(mat.id)}
                      title="Hapus Materi"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition opacity-80 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {mat.description && (
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                    {mat.description}
                  </p>
                )}
              </div>

              {mat.file_url ? (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    {mat.file_name || 'Dokumen Materi'}
                  </span>
                  <a
                    href={mat.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition"
                  >
                    <Download className="w-3.5 h-3.5" /> Unduh
                  </a>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 italic">
                  Tidak ada lampiran berkas
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
