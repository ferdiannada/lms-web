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
        <label className="block text-xs font-bold text-m3-on-surface-variant uppercase tracking-wider">
          Daftar Soal Pilihan Ganda ({questions.length} Butir)
        </label>
        <button
          type="button"
          onClick={handleAddQuestion}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-m3-primary hover:text-m3-primary/80 bg-m3-primary/10 hover:bg-m3-primary/20 px-3 py-2 rounded-full transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tambah Soal
        </button>
      </div>

      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
        {questions.map((q, idx) => (
          <div
            key={idx}
            className="p-5 bg-m3-surface-container rounded-[1.25rem] border border-m3-outline-variant/50 space-y-4 relative"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-m3-primary text-m3-on-primary font-bold text-xs flex items-center justify-center shadow-m3-elevation-1">
                  {idx + 1}
                </span>
                <span className="text-sm font-bold text-m3-on-surface">Pertanyaan Soal</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-m3-on-surface-variant font-bold uppercase tracking-wider">Poin:</span>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={q.points}
                    onChange={(e) => handleQuestionChange(idx, 'points', Number(e.target.value))}
                    className="w-16 text-sm font-bold bg-m3-surface border border-m3-outline-variant/50 rounded-xl px-2.5 py-1.5 focus:border-m3-primary focus:outline-none transition-colors text-center text-m3-on-surface"
                  />
                </div>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(idx)}
                    className="text-m3-on-surface-variant/50 hover:text-m3-error p-1.5 rounded-full hover:bg-m3-error-container/50 transition-colors cursor-pointer"
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
                className="w-full text-sm bg-m3-surface border border-m3-outline-variant/50 rounded-xl p-3 text-m3-on-surface placeholder-m3-on-surface-variant/70 focus:outline-none focus:border-m3-primary transition-colors"
              />
            </div>

            {/* Options A, B, C, D */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                const fieldName = `option_${optKey.toLowerCase()}` as keyof QuizQuestionDraft;
                const isCorrect = q.correct_option === optKey;

                return (
                  <div
                    key={optKey}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border transition-colors ${
                      isCorrect
                        ? 'bg-emerald-500/10 border-emerald-500/50'
                        : 'bg-m3-surface border-m3-outline-variant/50'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleQuestionChange(idx, 'correct_option', optKey)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                        isCorrect
                          ? 'bg-emerald-500 text-white shadow-m3-elevation-1'
                          : 'bg-m3-surface-container-high text-m3-on-surface-variant hover:bg-m3-surface-variant hover:text-m3-on-surface'
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
                      className="w-full text-sm bg-transparent focus:outline-none text-m3-on-surface placeholder-m3-on-surface-variant/50"
                    />
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-m3-on-surface-variant/70 italic font-medium">
              * Klik huruf opsi (A/B/C/D) untuk menandai kunci jawaban yang benar (berwarna hijau).
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
