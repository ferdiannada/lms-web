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
      <div className="bg-m3-surface p-6 rounded-[1.5rem] border border-m3-outline-variant/30 shadow-m3-elevation-1 space-y-4 transition-all hover:shadow-m3-elevation-2">
      {/* Header Info */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-[1rem] bg-m3-primary-container text-m3-on-primary-container font-black flex items-center justify-center shrink-0">
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-m3-on-surface truncate">
              {user?.name || 'Mulai Diskusi Baru'}
            </h3>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-m3-secondary-container text-m3-on-secondary-container uppercase">
              {user?.role === 'guru' ? 'Guru Pengajar' : 'Siswa SMK'}
            </span>
          </div>
          <p className="text-[11px] text-m3-on-surface-variant font-medium mt-0.5">
            Bagikan pertanyaan, silabus, atau bahan diskusi interaktif ke seluruh anggota kelas
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Tulis topik diskusi, pertanyaan seputar materi kejuruan, atau pengumuman kelas..."
            rows={isFocused || content ? 4 : 2}
            className="w-full bg-m3-surface-container-highest border-2 border-transparent rounded-[1.25rem] p-4 text-sm text-m3-on-surface placeholder-m3-on-surface-variant focus:outline-none focus:border-m3-primary focus:bg-m3-surface resize-none transition-all leading-relaxed"
          />
        </div>

        {/* Quick Tag Pills (Visible when focused or typing) */}
        {(isFocused || content) && (
          <div className="flex flex-wrap items-center gap-2 animate-in fade-in">
            <span className="text-[11px] font-bold text-m3-on-surface-variant flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-m3-primary" /> Tag Cepat:
            </span>
            {quickTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleAddTag(tag)}
                className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-m3-surface-container hover:bg-m3-secondary-container hover:text-m3-on-secondary-container text-m3-on-surface-variant border border-m3-outline-variant/40 transition-all cursor-pointer active:scale-95"
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-m3-on-surface-variant">
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
                className="px-4 py-2.5 text-xs font-bold text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-container rounded-full transition-all cursor-pointer active:scale-95"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              disabled={!content.trim() || isPosting}
              className="px-6 py-2.5 bg-m3-primary hover:bg-m3-primary/90 text-m3-on-primary font-bold text-xs rounded-full flex items-center gap-2 shadow-m3-elevation-1 hover:shadow-m3-elevation-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>{isPosting ? 'Mempublikasikan...' : 'Kirim Diskusi'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
