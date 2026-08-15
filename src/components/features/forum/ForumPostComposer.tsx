import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface ForumPostComposerProps {
  onSubmit: (content: string) => Promise<void>;
}

export const ForumPostComposer: React.FC<ForumPostComposerProps> = ({ onSubmit }) => {
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isPosting) return;

    setIsPosting(true);
    try {
      await onSubmit(content.trim());
      setContent('');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Tulis pengumuman, pertanyaan, atau bagikan informasi ke forum kelas..."
          rows={3}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white resize-none shadow-2xs transition"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!content.trim() || isPosting}
            className="px-5 py-2.5 bg-[#1e1b4b] hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-indigo-100 transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {isPosting ? 'Mengirim...' : 'Kirim Postingan'}
          </button>
        </div>
      </form>
    </div>
  );
};
