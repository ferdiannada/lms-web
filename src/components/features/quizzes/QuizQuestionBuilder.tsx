import React from 'react';
import { Plus, Trash2, HelpCircle } from 'lucide-react';

export interface QuizQuestionDraft {
  question_text: string;
  points: number;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
}

interface QuizQuestionBuilderProps {
  questions: QuizQuestionDraft[];
  onChange: (questions: QuizQuestionDraft[]) => void;
}

export const QuizQuestionBuilder: React.FC<QuizQuestionBuilderProps> = ({ questions, onChange }) => {
  const handleQuestionChange = (index: number, field: keyof QuizQuestionDraft, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleAddQuestion = () => {
    onChange([
      ...questions,
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
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) return;
    onChange(questions.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-800">
          Daftar Soal Pilihan Ganda ({questions.length} Butir)
        </label>
        <button
          type="button"
          onClick={handleAddQuestion}
          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah Soal
        </button>
      </div>

      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
        {questions.map((q, idx) => (
          <div
            key={idx}
            className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 relative"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-xs font-bold text-slate-700">Pertanyaan Soal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-slate-500 font-semibold">Poin:</span>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={q.points}
                    onChange={(e) => handleQuestionChange(idx, 'points', Number(e.target.value))}
                    className="w-14 text-xs font-bold bg-white border border-slate-200 rounded-lg px-2 py-1 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition"
                    title="Hapus Soal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <textarea
                value={q.question_text}
                onChange={(e) => handleQuestionChange(idx, 'question_text', e.target.value)}
                placeholder="Tuliskan pertanyaan / instruksi soal di sini..."
                rows={2}
                required
                className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>

            {/* Options A, B, C, D */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                const fieldName = `option_${optKey.toLowerCase()}` as keyof QuizQuestionDraft;
                const isCorrect = q.correct_option === optKey;

                return (
                  <div
                    key={optKey}
                    className={`flex items-center gap-2 p-2 rounded-xl border transition ${
                      isCorrect
                        ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400/50'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleQuestionChange(idx, 'correct_option', optKey)}
                      className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 transition ${
                        isCorrect
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      title={isCorrect ? 'Kunci Jawaban Benar' : 'Jadikan Kunci Jawaban'}
                    >
                      {optKey}
                    </button>
                    <input
                      type="text"
                      value={q[fieldName] as string}
                      onChange={(e) => handleQuestionChange(idx, fieldName, e.target.value)}
                      placeholder={`Pilihan ${optKey}...`}
                      required
                      className="w-full text-xs bg-transparent focus:outline-none text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-400">
              * Klik huruf opsi (A/B/C/D) untuk menandai kunci jawaban yang benar (berwarna hijau).
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
