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
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
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
              className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
            <Award className="w-4 h-4 text-indigo-600 absolute left-3 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Umpan Balik / Catatan Guru
          </label>
          <div className="relative">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Berikan saran atau evaluasi untuk siswa ini..."
              rows={3}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-sm hover:shadow transition flex items-center gap-1.5"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
