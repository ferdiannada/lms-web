import React, { useState } from 'react';
import { Modal } from '../../Modal';
import { api } from '../../../services';

interface JoinClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const JoinClassModal: React.FC<JoinClassModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await api.joinClass(joinCode.trim().toUpperCase());
      setJoinCode('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal bergabung ke kelas. Periksa kembali kode kelas.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setJoinCode('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Gabung ke Ruang Kelas">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-4 bg-m3-error-container/50 border border-m3-error/20 text-m3-on-error-container text-xs rounded-[1.25rem] font-medium flex items-center gap-2">
            <svg className="w-4 h-4 text-m3-error shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}
        <div className="space-y-2">
          <label className="text-xs font-bold text-m3-on-surface-variant uppercase tracking-wider">
            Kode Kelas (6 Karakter)
          </label>
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            required
            maxLength={6}
            placeholder="Contoh: A8F29X"
            className="w-full bg-m3-surface-container border border-m3-outline-variant/50 rounded-xl p-3 text-sm text-m3-on-surface placeholder-m3-on-surface-variant/70 focus:border-m3-primary focus:bg-m3-surface focus:outline-none transition-all duration-300 uppercase tracking-widest text-center font-mono font-bold"
          />
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2.5 text-xs font-bold text-m3-on-surface-variant hover:bg-m3-surface-container-high rounded-full transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting || joinCode.length < 6}
            className="px-6 py-2.5 bg-m3-primary hover:bg-m3-primary/90 text-m3-on-primary font-bold text-xs rounded-full shadow-m3-elevation-1 hover:shadow-m3-elevation-2 transition-all duration-300 ease-out active:scale-95 cursor-pointer disabled:opacity-50 disabled:active:scale-100"
          >
            {isSubmitting ? 'Mengecek...' : 'Gabung Kelas'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
