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
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Judul Tugas *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Tugas Praktik 1 - Membuat API CRUD Go"
            required
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Petunjuk / Instruksi Pengerjaan</label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Tulis kriteria penilaian, format pengerjaan, instruksi jelas untuk siswa..."
            rows={3}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tenggat Waktu (Due Date) *</label>
            <div className="relative">
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Skor Maksimal</label>
            <input
              type="number"
              min={10}
              max={100}
              value={maxScore}
              onChange={(e) => setMaxScore(Number(e.target.value))}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Lampiran Soal / Template (Opsional)</label>
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
                  <p className="text-xs font-medium text-slate-700">Klik atau seret template file ke sini</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">PDF, DOCX, ZIP</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClose}
            disabled={isCreating}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isCreating}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-sm hover:shadow transition flex items-center gap-1.5"
          >
            {isCreating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
