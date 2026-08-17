import React, { useState } from 'react';
import { HelpCircle, Clock, AlertCircle } from 'lucide-react';
import { Modal } from '../../Modal';
import { api } from '../../../services';
import { ClassRoom, Quiz } from '../../../types';
import { QuizQuestionBuilder, QuizQuestionDraft } from './QuizQuestionBuilder';

interface QuizCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (quiz: Quiz) => void;
  classes?: ClassRoom[];
  defaultClassId?: string;
}

export const QuizCreateModal: React.FC<QuizCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  classes = [],
  defaultClassId = '',
}) => {
  const [targetClassId, setTargetClassId] = useState(defaultClassId);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [dueDate, setDueDate] = useState('');
  const [questions, setQuestions] = useState<QuizQuestionDraft[]>([
    {
      question_text: '',
      points: 20,
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_option: 'A',
    },
  ]);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (defaultClassId && !targetClassId) {
      setTargetClassId(defaultClassId);
    }
  }, [defaultClassId, targetClassId]);

  const resetForm = () => {
    setTitle('');
    setDesc('');
    setDurationMinutes(30);
    setDueDate('');
    setQuestions([
      {
        question_text: '',
        points: 20,
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 'A',
      },
    ]);
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
      setErrorMsg('Silakan pilih kelas terlebih dahulu.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Judul kuis wajib diisi.');
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text.trim()) {
        setErrorMsg(`Soal nomor ${i + 1} belum memiliki teks pertanyaan.`);
        return;
      }
      if (!q.option_a.trim() || !q.option_b.trim() || !q.option_c.trim() || !q.option_d.trim()) {
        setErrorMsg(`Semua pilihan opsi (A, B, C, D) pada soal nomor ${i + 1} wajib diisi.`);
        return;
      }
    }

    setIsCreating(true);
    setErrorMsg(null);

    try {
      const newQuiz = await api.createQuiz(activeClassId, {
        title: title.trim(),
        description: desc.trim(),
        duration_minutes: durationMinutes,
        end_time: dueDate ? new Date(dueDate).toISOString() : undefined,
        questions: questions as any,
      });

      resetForm();
      onSuccess(newQuiz);
      onClose();
    } catch (err: any) {
      console.error('Failed to create quiz:', err);
      setErrorMsg(err.message || 'Gagal membuat kuis.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Buat Kuis & Ujian Pilihan Ganda">
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
          <label className="text-xs font-bold text-m3-on-surface-variant uppercase tracking-wider">Judul Kuis *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Kuis Harian 1 - Dasar Algoritma"
            required
            className="w-full bg-m3-surface-container border border-m3-outline-variant/50 rounded-xl p-3 text-sm text-m3-on-surface placeholder-m3-on-surface-variant/70 focus:border-m3-primary focus:bg-m3-surface focus:outline-none transition-all duration-300"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-m3-on-surface-variant uppercase tracking-wider">Deskripsi / Petunjuk Pengerjaan</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Tulis instruksi pengerjaan untuk siswa..."
            rows={2}
            className="w-full bg-m3-surface-container border border-m3-outline-variant/50 rounded-xl p-3 text-sm text-m3-on-surface placeholder-m3-on-surface-variant/70 focus:border-m3-primary focus:bg-m3-surface focus:outline-none transition-all duration-300"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-m3-on-surface-variant uppercase tracking-wider">Durasi Waktu (Menit) *</label>
            <div className="relative">
              <input
                type="number"
                min={5}
                max={180}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                required
                className="w-full bg-m3-surface-container border border-m3-outline-variant/50 rounded-xl p-3 pl-10 text-sm text-m3-on-surface focus:border-m3-primary focus:bg-m3-surface focus:outline-none transition-all duration-300"
              />
              <Clock className="w-4 h-4 text-m3-on-surface-variant absolute left-3.5 top-3.5" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-m3-on-surface-variant uppercase tracking-wider">Batas Akhir (Opsional)</label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-m3-surface-container border border-m3-outline-variant/50 rounded-xl p-3 text-sm text-m3-on-surface focus:border-m3-primary focus:bg-m3-surface focus:outline-none transition-all duration-300"
            />
          </div>
        </div>

        {/* Dynamic Question List */}
        <div className="pt-2">
          <QuizQuestionBuilder questions={questions} onChange={setQuestions} />
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
            disabled={isCreating}
            className="px-6 py-2.5 bg-m3-primary hover:bg-m3-primary/90 text-m3-on-primary font-bold text-xs rounded-full shadow-m3-elevation-1 hover:shadow-m3-elevation-2 transition-all duration-300 ease-out active:scale-95 cursor-pointer disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Menyimpan...</span>
              </>
            ) : (
              'Terbitkan Kuis'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
