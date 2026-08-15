import React, { useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Modal } from '../../Modal';
import { api } from '../../../services';
import { Assignment, Submission } from '../../../types';

interface AssignmentSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  onSuccess: (submission: Submission) => void;
}

export const AssignmentSubmitModal: React.FC<AssignmentSubmitModalProps> = ({
  isOpen,
  onClose,
  assignment,
  onSuccess,
}) => {
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resetForm = () => {
    setNotes('');
    setFile(null);
    setErrorMsg(null);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignment) return;
    if (!notes.trim() && !file) {
      setErrorMsg('Harap masukkan jawaban/catatan teks atau unggah berkas jawaban.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      let fileUrl = '';
      let fileName = '';

      if (file) {
        const MAX_SIZE = 25 * 1024 * 1024; // 25 MB
        if (file.size > MAX_SIZE) {
          setErrorMsg('Ukuran berkas lampiran melebihi batas maksimal 25 MB.');
          setIsSubmitting(false);
          return;
        }
        const uploadRes = await api.uploadFile(file);
        fileUrl = uploadRes.file_url;
        fileName = file.name;
      }

      const submission = await api.submitAssignment(assignment.id, {
        notes: notes.trim(),
        answer_text: notes.trim(),
        file_url: fileUrl,
        file_name: fileName,
      });

      resetForm();
      onSuccess(submission);
      onClose();
    } catch (err: any) {
      console.error('Failed to submit assignment:', err);
      setErrorMsg(err.message || 'Gagal mengirimkan tugas.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={assignment ? `Kumpulkan Tugas: ${assignment.title}` : 'Kumpulkan Tugas'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Jawaban / Catatan Siswa
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tulis uraian jawaban, link repository GitHub, atau catatan untuk guru di sini..."
            rows={4}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Unggah Berkas Lampiran Jawaban (ZIP / PDF / Gambar)
          </label>
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20 transition cursor-pointer relative">
            <input
              type="file"
              accept=".zip,.rar,.pdf,.docx,.doc,.png,.jpg,.jpeg"
              onChange={(e) => {
                const selected = e.target.files?.[0] || null;
                if (selected && selected.size > 25 * 1024 * 1024) {
                  setErrorMsg('Ukuran berkas lampiran melebihi batas maksimal 25 MB.');
                  setFile(null);
                  return;
                }
                setErrorMsg(null);
                setFile(selected);
              }}
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
                    Klik atau seret file dokumen / arsip jawaban
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">ZIP, RAR, PDF, DOCX, PNG (Maks 25MB)</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-sm hover:shadow transition flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Mengirim Tugas...</span>
              </>
            ) : (
              'Kirim Jawaban'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
