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
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {error}
          </div>
        )}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase">
            Kode Unik Kelas (Dari Guru)
          </label>
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            required
            placeholder="Contoh: 4DLVVH"
            className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 font-mono uppercase tracking-widest focus:border-indigo-600 focus:outline-none"
          />
          <p className="text-[11px] text-slate-400">Mintalah 6 digit kode kelas kepada Guru pengajar Anda.</p>
        </div>
        <div className="pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !joinCode.trim()}
            className="px-5 py-2.5 bg-[#1e1b4b] hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Memproses...' : 'Gabung Kelas Sekarang'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
