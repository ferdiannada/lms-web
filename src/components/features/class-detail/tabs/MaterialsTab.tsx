import React, { useState } from 'react';
import { Plus, BookOpen, Download, FileText, Trash2, Eye } from 'lucide-react';
import { Material } from '../../../../types';
import { sanitizeUrl } from '../../../../utils/security';
import { MaterialViewerModal } from '../../materials/MaterialViewerModal';

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
  const [viewerMaterial, setViewerMaterial] = useState<Material | null>(null);

  return (
    <div className="space-y-6">
      {isTeacher && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onOpenUploadModal}
            className="px-6 py-3 bg-m3-primary hover:bg-m3-primary/90 text-m3-on-primary font-bold text-xs rounded-full flex items-center gap-2 shadow-m3-elevation-2 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Unggah Modul / Materi
          </button>
        </div>
      )}

      {materials.length === 0 ? (
        <div className="bg-m3-surface p-12 text-center text-m3-on-surface-variant rounded-[2rem] border border-m3-outline-variant/30 shadow-m3-elevation-1 space-y-2">
          <BookOpen className="w-12 h-12 mx-auto text-m3-outline-variant mb-3 opacity-50" />
          <p className="font-bold text-m3-on-surface text-sm">Belum ada materi pembelajaran</p>
          <p className="text-xs text-m3-on-surface-variant">Guru pengajar belum mengunggah berkas modul untuk kelas ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {materials.map((mat) => (
            <div
              key={mat.id}
              className="p-6 rounded-[1.5rem] bg-m3-surface border border-m3-outline-variant/30 shadow-m3-elevation-1 space-y-4 flex flex-col justify-between hover:shadow-m3-elevation-2 transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-[1rem] bg-m3-primary-container text-m3-on-primary-container flex items-center justify-center shrink-0">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-m3-on-surface text-sm truncate leading-tight">{mat.title}</h3>
                      <span className="text-[10px] text-m3-on-surface-variant font-medium">
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
                      className="p-2 rounded-xl text-m3-on-surface-variant hover:text-rose-600 hover:bg-rose-50 transition opacity-80 group-hover:opacity-100 cursor-pointer active:scale-90"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {mat.description && (
                  <p className="text-xs text-m3-on-surface-variant line-clamp-3 leading-relaxed whitespace-pre-wrap">
                    {mat.description}
                  </p>
                )}
              </div>

              {mat.file_url ? (
                <div className="pt-3 border-t border-m3-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-m3-on-surface-variant truncate pr-2">
                    <FileText className="w-3.5 h-3.5 text-m3-primary shrink-0" />
                    <span className="truncate">{mat.file_name || 'Dokumen Materi'}</span>
                  </span>
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => setViewerMaterial(mat)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-m3-primary hover:bg-m3-primary/90 rounded-full transition-all active:scale-95 shadow-sm cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Buka
                    </button>
                    <a
                      href={sanitizeUrl(mat.file_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-m3-on-primary-container bg-m3-primary-container hover:bg-m3-primary/15 rounded-full transition-all active:scale-95 shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" /> Unduh
                    </a>
                  </div>
                </div>
              ) : (
                <div className="pt-3 border-t border-m3-outline-variant/20 text-[11px] text-m3-on-surface-variant italic">
                  Tidak ada lampiran berkas
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {viewerMaterial && viewerMaterial.file_url && (
        <MaterialViewerModal
          isOpen={!!viewerMaterial}
          onClose={() => setViewerMaterial(null)}
          title={viewerMaterial.title}
          fileUrl={viewerMaterial.file_url}
        />
      )}
    </div>
  );
};
