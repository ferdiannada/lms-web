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
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-4 bg-m3-error-container/50 border border-m3-error/20 text-m3-on-error-container text-xs rounded-[1.25rem] font-medium flex items-center gap-2">
            <svg className="w-4 h-4 text-m3-error shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}
        <div className="space-y-2">
          <label className="text-xs font-bold text-m3-on-surface-variant uppercase tracking-wider">
            Nama Mata Pelajaran / Kelas
          </label>
          <input
            type="text"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            required
            placeholder="Contoh: Pemrograman Web & Perangkat Bergerak"
            className="w-full bg-m3-surface-container border border-m3-outline-variant/50 rounded-xl p-3 text-sm text-m3-on-surface placeholder-m3-on-surface-variant/70 focus:border-m3-primary focus:bg-m3-surface focus:outline-none transition-all duration-300"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-m3-on-surface-variant uppercase tracking-wider">
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

        <div className="space-y-2">
          <label className="text-xs font-bold text-m3-on-surface-variant uppercase tracking-wider">Deskripsi Ringkas</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Silabus dan target kompetensi pembelajaran..."
            className="w-full bg-m3-surface-container border border-m3-outline-variant/50 rounded-xl p-3 text-sm text-m3-on-surface placeholder-m3-on-surface-variant/70 focus:border-m3-primary focus:bg-m3-surface focus:outline-none transition-all duration-300"
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
            disabled={isSubmitting || !className.trim() || !selectedRombelId}
            className="px-6 py-2.5 bg-m3-primary hover:bg-m3-primary/90 text-m3-on-primary font-bold text-xs rounded-full shadow-m3-elevation-1 hover:shadow-m3-elevation-2 transition-all duration-300 ease-out active:scale-95 cursor-pointer disabled:opacity-50 disabled:active:scale-100"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan & Terbitkan Kelas'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
