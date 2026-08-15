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
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Judul Kuis *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Kuis Harian 1 - Dasar Algoritma"
            required
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Deskripsi / Petunjuk Pengerjaan</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Tulis instruksi pengerjaan untuk siswa..."
            rows={2}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Durasi Waktu (Menit) *</label>
            <div className="relative">
              <input
                type="number"
                min={5}
                max={180}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                required
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
              <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Batas Akhir (Opsional)</label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>
        </div>

        {/* Dynamic Question List */}
        <div className="pt-2 border-t border-slate-100">
          <QuizQuestionBuilder questions={questions} onChange={setQuestions} />
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
                <span>Menyimpan Kuis...</span>
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
