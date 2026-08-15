import React, { useState } from 'react';
import { Modal } from '../../Modal';
import { SearchableSelect } from '../../SearchableSelect';
import { Rombel } from '../../../types';
import { api } from '../../../services';

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  rombels: Rombel[];
  onSuccess: () => void;
}

export const CreateClassModal: React.FC<CreateClassModalProps> = ({
  isOpen,
  onClose,
  rombels,
  onSuccess,
}) => {
  const [className, setClassName] = useState('');
  const [selectedRombelId, setSelectedRombelId] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRombelId) {
      setError('Pilih rombongan belajar (rombel) terlebih dahulu.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await api.createClass({
        name: className,
        description,
        rombel_id: selectedRombelId,
      });
      setClassName('');
      setDescription('');
      setSelectedRombelId('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal membuat kelas baru.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setClassName('');
    setDescription('');
    setSelectedRombelId('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Buat Ruang Kelas Baru">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {error}
          </div>
        )}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase">
            Nama Mata Pelajaran / Kelas
          </label>
          <input
            type="text"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            required
            placeholder="Contoh: Pemrograman Web & Perangkat Bergerak"
            className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase">
            Pilih Rombongan Belajar (Dapodik)
          </label>
          <SearchableSelect
            options={rombels.map((r) => ({
              value: r.id,
              label: r.name,
              badge: `Tingkat ${r.tingkat}`,
              subLabel: r.student_count !== undefined ? `${r.student_count} Siswa` : undefined,
            }))}
            value={selectedRombelId}
            onChange={(val) => setSelectedRombelId(val)}
            placeholder="Pilih atau cari rombongan belajar..."
            searchPlaceholder="Ketik nama rombel (contoh: XI RPL, X TKJ)..."
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase">Deskripsi Ringkas</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Silabus dan target kompetensi pembelajaran..."
            className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
          />
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
            disabled={isSubmitting || !className.trim() || !selectedRombelId}
            className="px-5 py-2.5 bg-[#1e1b4b] hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan & Terbitkan Kelas'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
