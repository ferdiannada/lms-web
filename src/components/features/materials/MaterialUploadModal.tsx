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
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {classes.length > 1 && !defaultClassId && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Target Kelas</label>
            <select
              value={targetClassId}
              onChange={(e) => setTargetClassId(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
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

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Judul Materi *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Modul 1 - Pemrograman Berorientasi Objek"
            required
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Deskripsi / Petunjuk Bacaan</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Tulis ringkasan materi atau instruksi untuk siswa..."
            rows={3}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Lampiran Berkas (PDF / Dokumen)</label>
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20 transition cursor-pointer relative">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center">
              <Upload className="w-7 h-7 text-indigo-600 mb-1.5" />
              {file ? (
                <p className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              ) : (
                <>
                  <p className="text-xs font-medium text-slate-700">
                    Klik atau seret file PDF / Dokumen ke sini
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Maksimal 25MB (PDF, DOCX, PPTX)</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isUploading}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-sm hover:shadow transition flex items-center gap-1.5"
          >
            {isUploading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
