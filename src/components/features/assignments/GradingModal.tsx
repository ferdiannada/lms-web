import React, { useState } from 'react';
import { Award, AlertCircle, MessageSquare } from 'lucide-react';
import { Modal } from '../../Modal';
import { api } from '../../../services';
import { Submission } from '../../../types';

interface GradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: Submission | null;
  maxScore?: number;
  onSuccess: (submissionId: string, score: number, feedback: string) => void;
}

export const GradingModal: React.FC<GradingModalProps> = ({
  isOpen,
  onClose,
  submission,
  maxScore = 100,
  onSuccess,
}) => {
  const [score, setScore] = useState<number>(submission?.score ?? 100);
  const [feedback, setFeedback] = useState(submission?.feedback ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (submission) {
      setScore(submission.score ?? 100);
      setFeedback(submission.feedback ?? '');
      setErrorMsg(null);
    }
  }, [submission]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submission) return;

    if (score < 0 || score > maxScore) {
      setErrorMsg(`Nilai harus berada di rentang 0 hingga ${maxScore}.`);
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      await api.gradeSubmission(submission.id, score, feedback.trim());
      onSuccess(submission.id, score, feedback.trim());
      onClose();
    } catch (err: any) {
      console.error('Failed to grade submission:', err);
      setErrorMsg(err.message || 'Gagal menyimpan nilai.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={submission ? `Beri Nilai: ${submission.student_name}` : 'Penilaian Tugas'}
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
            Nilai Angka (Maks. {maxScore}) *
          </label>
          <div className="relative">
            <input
              type="number"
              min={0}
              max={maxScore}
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              required
              className="w-full text-sm font-bold bg-m3-surface-container border border-m3-outline-variant/50 rounded-xl pl-10 pr-3.5 py-3 focus:bg-m3-surface focus:outline-none focus:border-m3-primary transition-all text-m3-on-surface"
            />
            <Award className="w-5 h-5 text-m3-primary absolute left-3.5 top-3" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-m3-on-surface-variant uppercase tracking-wider">
            Umpan Balik / Catatan Guru
          </label>
          <div className="relative">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Berikan saran atau evaluasi untuk siswa ini..."
              rows={3}
              className="w-full bg-m3-surface-container border border-m3-outline-variant/50 rounded-xl p-3 text-sm text-m3-on-surface placeholder-m3-on-surface-variant/70 focus:border-m3-primary focus:bg-m3-surface focus:outline-none transition-all duration-300"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2.5 text-xs font-bold text-m3-on-surface-variant hover:bg-m3-surface-container-high rounded-full transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-m3-primary hover:bg-m3-primary/90 text-m3-on-primary font-bold text-xs rounded-full shadow-m3-elevation-1 hover:shadow-m3-elevation-2 transition-all duration-300 ease-out active:scale-95 cursor-pointer disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Menyimpan...</span>
              </>
            ) : (
              'Simpan Nilai'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
