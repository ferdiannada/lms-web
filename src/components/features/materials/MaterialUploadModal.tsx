import React, { useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Modal } from '../../Modal';
import { api } from '../../../services';
import { ClassRoom, Material } from '../../../types';

interface MaterialUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (material: Material) => void;
  classes?: ClassRoom[];
  defaultClassId?: string;
}

export const MaterialUploadModal: React.FC<MaterialUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  classes = [],
  defaultClassId = '',
}) => {
  const [targetClassId, setTargetClassId] = useState(defaultClassId);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync defaultClassId if targetClassId is empty
  React.useEffect(() => {
    if (defaultClassId && !targetClassId) {
      setTargetClassId(defaultClassId);
    }
  }, [defaultClassId, targetClassId]);

  const resetForm = () => {
    setTitle('');
    setDesc('');
    setFile(null);
    setErrorMsg(null);
    setIsUploading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeClassId = defaultClassId || targetClassId;
    if (!activeClassId) {
      setErrorMsg('Silakan pilih kelas terlebih dahulu.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Judul materi wajib diisi.');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);

    try {
      let fileUrl = '';
      if (file) {
        const MAX_SIZE = 25 * 1024 * 1024; // 25 MB
        if (file.size > MAX_SIZE) {
          setErrorMsg('Ukuran berkas melebihi batas maksimal 25 MB.');
          setIsUploading(false);
          return;
        }
        const uploadRes = await api.uploadFile(file);
        fileUrl = uploadRes.file_url;
      }

      const newMaterial = await api.createMaterial(activeClassId, {
        title: title.trim(),
        description: desc.trim(),
        file_url: fileUrl,
      });

      resetForm();
      onSuccess(newMaterial);
      onClose();
    } catch (err: any) {
      console.error('Failed to create material:', err);
      setErrorMsg(err.message || 'Gagal mengunggah materi ke kelas.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Unggah Materi Pelajaran">
      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMsg && (
          <div className="p-4 bg-m3-error-container/50 border border-m3-error/20 text-m3-on-error-container text-xs rounded-[1.25rem] font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-m3-error" />
            <span>{errorMsg}</span>
          </div>
        )}

        {classes.length > 1 && !defaultClassId && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-m3-on-surface-variant uppercase tracking-wider">Target Kelas</label>
            <select
              value={targetClassId}
              onChange={(e) => setTargetClassId(e.target.value)}
              className="w-full bg-m3-surface-container border border-m3-outline-variant/50 rounded-xl p-3 text-sm text-m3-on-surface focus:border-m3-primary focus:bg-m3-surface focus:outline-none transition-all duration-300 appearance-none"
              required
            >
              <option value="">Pilih Kelas</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.rombel})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-bold text-m3-on-surface-variant uppercase tracking-wider">Judul Materi *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Modul 1 - Pemrograman Berorientasi Objek"
            required
            className="w-full bg-m3-surface-container border border-m3-outline-variant/50 rounded-xl p-3 text-sm text-m3-on-surface placeholder-m3-on-surface-variant/70 focus:border-m3-primary focus:bg-m3-surface focus:outline-none transition-all duration-300"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-m3-on-surface-variant uppercase tracking-wider">Deskripsi / Petunjuk Bacaan</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Tulis ringkasan materi atau instruksi untuk siswa..."
            rows={3}
            className="w-full bg-m3-surface-container border border-m3-outline-variant/50 rounded-xl p-3 text-sm text-m3-on-surface placeholder-m3-on-surface-variant/70 focus:border-m3-primary focus:bg-m3-surface focus:outline-none transition-all duration-300"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-m3-on-surface-variant uppercase tracking-wider">Lampiran Berkas (PDF / Dokumen)</label>
          <div className="border-2 border-dashed border-m3-outline-variant/50 rounded-2xl p-6 text-center hover:border-m3-primary bg-m3-surface-container/50 hover:bg-m3-primary/5 transition-colors cursor-pointer relative">
            <input
              type="file"
              accept=".pdf,.docx,.doc,.pptx,.ppt,.zip,.rar"
              onChange={(e) => {
                const selected = e.target.files?.[0] || null;
                if (selected && selected.size > 25 * 1024 * 1024) {
                  setErrorMsg('Ukuran berkas melebihi batas maksimal 25 MB.');
                  setFile(null);
                  return;
                }
                setErrorMsg(null);
                setFile(selected);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center">
              <Upload className="w-8 h-8 text-m3-primary mb-2" />
              {file ? (
                <p className="text-sm font-bold text-m3-on-surface flex items-center gap-2">
                  <FileText className="w-4 h-4 text-m3-primary" />
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              ) : (
                <>
                  <p className="text-sm font-bold text-m3-on-surface-variant">
                    Klik atau seret file PDF / Dokumen ke sini
                  </p>
                  <p className="text-xs text-m3-on-surface-variant/70 mt-1">Maksimal 25MB (PDF, DOCX, PPTX)</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            className="px-5 py-2.5 text-xs font-bold text-m3-on-surface-variant hover:bg-m3-surface-container-high rounded-full transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isUploading || !title.trim()}
            className="px-6 py-2.5 bg-m3-primary hover:bg-m3-primary/90 text-m3-on-primary font-bold text-xs rounded-full shadow-m3-elevation-1 hover:shadow-m3-elevation-2 transition-all duration-300 ease-out active:scale-95 cursor-pointer disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Mengunggah...</span>
              </>
            ) : (
              'Simpan Materi'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
