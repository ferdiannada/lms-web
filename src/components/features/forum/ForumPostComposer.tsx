import React, { useState } from 'react';
import { Send, MessageSquarePlus, Sparkles, Hash, X } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface ForumPostComposerProps {
  onSubmit: (content: string) => Promise<void>;
}

export const ForumPostComposer: React.FC<ForumPostComposerProps> = ({ onSubmit }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const quickTags = ['#TanyaGuru', '#DiskusiTugas', '#BahanAjar', '#KejuruanSMK', '#Pengumuman'];

  const handleAddTag = (tag: string) => {
    if (!content.includes(tag)) {
      setContent((prev) => (prev ? `${prev} ${tag}` : tag));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isPosting) return;

    setIsPosting(true);
    try {
      await onSubmit(content.trim());
      setContent('');
      setIsFocused(false);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3 transition-all duration-200 hover:shadow-md">
      {/* Header Info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1e1b4b] to-indigo-600 text-white font-black flex items-center justify-center shadow-xs shrink-0">
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
              {user?.name || 'Mulai Diskusi Baru'}
            </h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
              {user?.role === 'guru' ? 'Guru Pengajar' : 'Siswa SMK'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Bagikan pertanyaan, silabus, atau bahan diskusi interaktif ke seluruh anggota kelas
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Tulis topik diskusi, pertanyaan seputar materi kejuruan, atau pengumuman kelas..."
            rows={isFocused || content ? 4 : 2}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white resize-none shadow-2xs transition-all leading-relaxed"
          />
        </div>

        {/* Quick Tag Pills (Visible when focused or typing) */}
        {(isFocused || content) && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 animate-in fade-in">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
              <Hash className="w-3 h-3 text-indigo-600" /> Tag Cepat:
            </span>
            {quickTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleAddTag(tag)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200/80 transition-colors cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-400">
            {content.length > 0 && `${content.length} karakter`}
          </span>

          <div className="flex items-center gap-2">
            {content && (
              <button
                type="button"
                onClick={() => {
                  setContent('');
                  setIsFocused(false);
                }}
                className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              disabled={!content.trim() || isPosting}
              className="px-5 py-2.5 bg-[#1e1b4b] hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-indigo-100 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isPosting ? 'Mempublikasikan...' : 'Kirim Diskusi'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
