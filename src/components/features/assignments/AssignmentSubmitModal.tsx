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
      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMsg && (
          <div className="p-4 bg-m3-error-container/50 border border-m3-error/20 text-m3-on-error-container text-xs rounded-[1.25rem] font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-m3-error" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-bold text-m3-on-surface-variant uppercase tracking-wider">
            Jawaban / Catatan Siswa
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tulis uraian jawaban, link repository GitHub, atau catatan untuk guru di sini..."
            rows={4}
            className="w-full bg-m3-surface-container border border-m3-outline-variant/50 rounded-xl p-3 text-sm text-m3-on-surface placeholder-m3-on-surface-variant/70 focus:border-m3-primary focus:bg-m3-surface focus:outline-none transition-all duration-300"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-m3-on-surface-variant uppercase tracking-wider">
            Unggah Berkas Lampiran Jawaban (ZIP / PDF / Gambar)
          </label>
          <div className="border-2 border-dashed border-m3-outline-variant/50 rounded-2xl p-6 text-center hover:border-m3-primary bg-m3-surface-container/50 hover:bg-m3-primary/5 transition-colors cursor-pointer relative">
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
              <Upload className="w-8 h-8 text-m3-primary mb-2" />
              {file ? (
                <p className="text-sm font-bold text-m3-on-surface flex items-center gap-2">
                  <FileText className="w-4 h-4 text-m3-primary" />
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              ) : (
                <>
                  <p className="text-sm font-bold text-m3-on-surface-variant">
                    Klik atau seret file dokumen / arsip jawaban
                  </p>
                  <p className="text-xs text-m3-on-surface-variant/70 mt-1">ZIP, RAR, PDF, DOCX, PNG (Maks 25MB)</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-xs font-bold text-m3-on-surface-variant hover:bg-m3-surface-container-high rounded-full transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting || (!notes.trim() && !file)}
            className="px-6 py-2.5 bg-m3-primary hover:bg-m3-primary/90 text-m3-on-primary font-bold text-xs rounded-full shadow-m3-elevation-1 hover:shadow-m3-elevation-2 transition-all duration-300 ease-out active:scale-95 cursor-pointer disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Mengirim...</span>
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
