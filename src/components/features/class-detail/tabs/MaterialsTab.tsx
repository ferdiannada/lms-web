import React, { useState, useEffect, useCallback } from 'react';
import { Plus, BookOpen, Download, FileText, Trash2, Eye } from 'lucide-react';
import { Material } from '../../../../types';
import { sanitizeUrl } from '../../../../utils/security';
import { MaterialViewerModal } from '../../materials/MaterialViewerModal';
import { MaterialUploadModal } from '../../materials/MaterialUploadModal';
import { api } from '../../../../services/api';

interface MaterialsTabProps {
  classId: string;
  isTeacher: boolean;
}

export const MaterialsTab: React.FC<MaterialsTabProps> = ({ classId, isTeacher }) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [viewerMaterial, setViewerMaterial] = useState<Material | null>(null);

  const fetchMaterials = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    try {
      const data = await api.getMaterials(classId, { signal });
      if (!signal?.aborted) setMaterials(data);
    } catch (err: any) {
      if (err.name !== 'AbortError') console.error('Failed to load materials:', err);
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    const controller = new AbortController();
    fetchMaterials(controller.signal);
    return () => controller.abort();
  }, [fetchMaterials]);

  const handleDeleteMaterial = async (matId: string) => {
    if (!confirm('Yakin ingin menghapus materi ini?')) return;
    try {
      await api.deleteMaterial(matId);
      setMaterials((prev) => prev.filter((m) => m.id !== matId));
    } catch (err) {
      alert('Gagal menghapus materi.');
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-3">
        <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold">Memuat materi...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isTeacher && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
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
        <div className="flex flex-wrap gap-4 items-stretch">
          {materials.map((mat) => (
            <div
              key={mat.id}
              className="w-full sm:w-[380px] p-4 sm:p-5 rounded-2xl bg-m3-surface border border-m3-outline-variant/30 shadow-m3-elevation-1 space-y-3 flex flex-col justify-between hover:shadow-m3-elevation-2 transition-all group"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-m3-primary-container text-m3-on-primary-container flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
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
                      onClick={() => handleDeleteMaterial(mat.id)}
                      title="Hapus Materi"
                      className="p-1.5 sm:p-2 rounded-xl text-m3-on-surface-variant hover:text-rose-600 hover:bg-rose-50 transition opacity-80 group-hover:opacity-100 cursor-pointer active:scale-90 shrink-0"
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
                      className="inline-flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-bold text-white bg-m3-primary hover:bg-m3-primary/90 rounded-full transition-all active:scale-95 shadow-sm cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Buka
                    </button>
                    <a
                      href={sanitizeUrl(mat.file_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-bold text-m3-on-primary-container bg-m3-primary-container hover:bg-m3-primary/15 rounded-full transition-all active:scale-95 shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" /> Unduh
                    </a>
                  </div>
                </div>
              ) : (
                <div className="pt-2 sm:pt-3 border-t border-m3-outline-variant/20 text-[11px] text-m3-on-surface-variant italic">
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

      {isUploadModalOpen && (
        <MaterialUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          defaultClassId={classId}
          onSuccess={() => {
            fetchMaterials();
          }}
        />
      )}
    </div>
  );
};
