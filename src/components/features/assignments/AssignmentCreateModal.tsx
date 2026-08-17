import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, Calendar } from 'lucide-react';
import { Modal } from '../../Modal';
import { api } from '../../../services';
import { ClassRoom, Assignment } from '../../../types';

interface AssignmentCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (assignment: Assignment) => void;
  classes?: ClassRoom[];
  defaultClassId?: string;
}

export const AssignmentCreateModal: React.FC<AssignmentCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  classes = [],
  defaultClassId = '',
}) => {
  const [targetClassId, setTargetClassId] = useState(defaultClassId);
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxScore, setMaxScore] = useState(100);
  const [file, setFile] = useState<File | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (defaultClassId && !targetClassId) {
      setTargetClassId(defaultClassId);
    }
  }, [defaultClassId, targetClassId]);

  const resetForm = () => {
    setTitle('');
    setInstructions('');
    setDueDate('');
    setMaxScore(100);
    setFile(null);
    setErrorMsg(null);
    setIsCreating(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeClassId = defaultClassId || targetClassId;
    if (!activeClassId) {
      setErrorMsg('Silakan pilih kelas target terlebih dahulu.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Judul tugas wajib diisi.');
      return;
    }
    if (!dueDate) {
      setErrorMsg('Batas waktu (Due Date) pengumpulan tugas wajib ditentukan.');
      return;
    }

    setIsCreating(true);
    setErrorMsg(null);

    try {
      let fileUrl = '';
      if (file) {
        const uploadRes = await api.uploadFile(file);
        fileUrl = uploadRes.file_url;
      }

      const newAsg = await api.createAssignment(activeClassId, {
        title: title.trim(),
        instructions: instructions.trim(),
        due_date: new Date(dueDate).toISOString(),
        max_score: maxScore,
        file_url: fileUrl,
      });

      resetForm();
      onSuccess(newAsg);
      onClose();
    } catch (err: any) {
      console.error('Failed to create assignment:', err);
      setErrorMsg(err.message || 'Gagal membuat tugas.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Buat Penugasan Baru">
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
          <label className="text-xs font-bold text-m3-on-surface-variant uppercase tracking-wider">Judul Tugas *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Tugas Praktik 1 - Membuat API CRUD Go"
            required
            className="w-full bg-m3-surface-container border border-m3-outline-variant/50 rounded-xl p-3 text-sm text-m3-on-surface placeholder-m3-on-surface-variant/70 focus:border-m3-primary focus:bg-m3-surface focus:outline-none transition-all duration-300"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-m3-on-surface-variant uppercase tracking-wider">Petunjuk / Instruksi Pengerjaan</label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Tulis kriteria penilaian, format pengerjaan, instruksi jelas untuk siswa..."
            rows={3}
            className="w-full bg-m3-surface-container border border-m3-outline-variant/50 rounded-xl p-3 text-sm text-m3-on-surface placeholder-m3-on-surface-variant/70 focus:border-m3-primary focus:bg-m3-surface focus:outline-none transition-all duration-300"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-m3-on-surface-variant uppercase tracking-wider">Tenggat Waktu (Due Date) *</label>
            <div className="relative">
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full bg-m3-surface-container border border-m3-outline-variant/50 rounded-xl p-3 text-sm text-m3-on-surface focus:border-m3-primary focus:bg-m3-surface focus:outline-none transition-all duration-300"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-m3-on-surface-variant uppercase tracking-wider">Skor Maksimal</label>
            <input
              type="number"
              min={10}
              max={100}
              value={maxScore}
              onChange={(e) => setMaxScore(Number(e.target.value))}
              className="w-full bg-m3-surface-container border border-m3-outline-variant/50 rounded-xl p-3 text-sm text-m3-on-surface focus:border-m3-primary focus:bg-m3-surface focus:outline-none transition-all duration-300"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-m3-on-surface-variant uppercase tracking-wider">Lampiran Soal / Template (Opsional)</label>
          <div className="border-2 border-dashed border-m3-outline-variant/50 rounded-2xl p-6 text-center hover:border-m3-primary bg-m3-surface-container/50 hover:bg-m3-primary/5 transition-colors cursor-pointer relative">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
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
                  <p className="text-sm font-bold text-m3-on-surface-variant">Klik atau seret template file ke sini</p>
                  <p className="text-xs text-m3-on-surface-variant/70 mt-1">PDF, DOCX, ZIP</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isCreating}
            className="px-5 py-2.5 text-xs font-bold text-m3-on-surface-variant hover:bg-m3-surface-container-high rounded-full transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isCreating || !title.trim()}
            className="px-6 py-2.5 bg-m3-primary hover:bg-m3-primary/90 text-m3-on-primary font-bold text-xs rounded-full shadow-m3-elevation-1 hover:shadow-m3-elevation-2 transition-all duration-300 ease-out active:scale-95 cursor-pointer disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Membuat Tugas...</span>
              </>
            ) : (
              'Terbitkan Tugas'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
