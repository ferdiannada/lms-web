import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Trash2,
  FileText,
  HelpCircle,
  MessageSquare,
  Users,
  ShieldAlert,
  CheckSquare,
  Square,
} from 'lucide-react';
import { ClassRoom } from '../../../types';
import { Modal } from '../../Modal';

interface DeleteClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classDetail: ClassRoom | null;
  onConfirmDelete: (classId: string) => Promise<void>;
}

export const DeleteClassModal: React.FC<DeleteClassModalProps> = ({
  isOpen,
  onClose,
  classDetail,
  onConfirmDelete,
}) => {
  const [hasAgreedConsequences, setHasAgreedConsequences] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Automatically reset all verification states whenever modal opens or class changes
  useEffect(() => {
    if (isOpen) {
      setHasAgreedConsequences(false);
      setConfirmationInput('');
      setIsDeleting(false);
      setErrorMessage(null);
    }
  }, [isOpen, classDetail?.id]);

  if (!classDetail) return null;

  const targetName = classDetail.name.trim();
  const isInputMatched = confirmationInput.trim() === targetName;
  const isReadyToDelete = hasAgreedConsequences && isInputMatched && !isDeleting;

  const handleReset = () => {
    setHasAgreedConsequences(false);
    setConfirmationInput('');
    setIsDeleting(false);
    setErrorMessage(null);
    onClose();
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReadyToDelete) return;

    setIsDeleting(true);
    setErrorMessage(null);
    try {
      await onConfirmDelete(classDetail.id);
      handleReset();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menghapus kelas. Pastikan koneksi server tersedia.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleReset} title="Konfirmasi Hapus Kelas">
      <div className="space-y-5">
        {/* Danger Header Badge */}
        <div className="flex items-start gap-3.5 pb-3 border-b border-m3-error/20">
          <div className="w-12 h-12 rounded-2xl bg-m3-error-container/50 text-m3-error flex items-center justify-center shrink-0 border border-m3-error/20">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-m3-error-container text-m3-on-error-container border border-m3-error/20">
                Tindakan Berbahaya & Permanen
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-m3-on-surface mt-1 leading-snug">
              Hapus Kelas / Mata Pelajaran
            </h3>
            <p className="text-xs text-m3-on-surface-variant font-medium mt-0.5">
              Kelas: <strong className="text-m3-on-surface">{classDetail.name}</strong> ({classDetail.rombel})
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 bg-m3-error-container/50 border border-m3-error/20 text-m3-on-error-container text-xs rounded-[1.25rem] font-medium flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-m3-error" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Detailed Consequences Explanation */}
        <div className="p-4 rounded-2xl bg-m3-error-container/30 border border-m3-error/20 space-y-3">
          <h4 className="text-xs font-black text-m3-error uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-m3-error" />
            Konsekuensi Penghapusan Kelas:
          </h4>
          <ul className="space-y-2 text-xs text-m3-on-error-container">
            <li className="flex items-start gap-2">
              <FileText className="w-3.5 h-3.5 text-m3-error shrink-0 mt-0.5" />
              <span>
                <strong>Modul & Materi Pembelajaran:</strong> Seluruh dokumen PDF, link, dan bahan ajar yang diunggah akan dihapus secara permanen.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <FileText className="w-3.5 h-3.5 text-m3-error shrink-0 mt-0.5" />
              <span>
                <strong>Tugas & Nilai Siswa:</strong> Seluruh instruksi tugas, riwayat pengumpulan berkas (*submissions*), dan catatan penilaian guru akan dimusnahkan.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <HelpCircle className="w-3.5 h-3.5 text-m3-error shrink-0 mt-0.5" />
              <span>
                <strong>Kuis & Ujian:</strong> Seluruh bank soal kuis dan rekap pengerjaan siswa (*attempts*) di kelas ini akan dihapus dari buku nilai.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-m3-error shrink-0 mt-0.5" />
              <span>
                <strong>Forum Diskusi:</strong> Seluruh utas percakapan, tanya jawab, dan komentar kelas akan hilang.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Users className="w-3.5 h-3.5 text-m3-error shrink-0 mt-0.5" />
              <span>
                <strong>Akses Siswa Terputus:</strong> Siswa yang terdaftar tidak lagi dapat melihat atau membuka kelas ini di portal mereka.
              </span>
            </li>
          </ul>
        </div>

        {/* Double Verification Controls */}
        <form onSubmit={handleDelete} className="space-y-5 pt-1">
          {/* Verification Step 1: Checkbox */}
          <div
            onClick={() => setHasAgreedConsequences(!hasAgreedConsequences)}
            className={`p-4 rounded-[1.25rem] border transition-all cursor-pointer flex items-start gap-3 select-none ${
              hasAgreedConsequences
                ? 'bg-m3-primary/10 border-m3-primary text-m3-on-surface'
                : 'bg-m3-surface-container border-m3-outline-variant/50 hover:bg-m3-surface-container-high text-m3-on-surface-variant'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {hasAgreedConsequences ? (
                <CheckSquare className="w-5 h-5 text-m3-primary" />
              ) : (
                <Square className="w-5 h-5 text-m3-on-surface-variant/50" />
              )}
            </div>
            <div className="text-xs font-medium leading-relaxed">
              <span className="font-bold text-m3-on-surface block mb-0.5 text-sm">Verifikasi 1 • Persetujuan Konsekuensi</span>
              Saya telah membaca dan memahami bahwa data kelas ini <strong className="text-m3-error">TIDAK DAPAT dipulihkan</strong> setelah dihapus.
            </div>
          </div>

          {/* Verification Step 2: Exact Name Confirmation */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-m3-on-surface-variant uppercase tracking-wider block">
              Verifikasi 2 • Ketik nama kelas untuk konfirmasi:
            </label>
            <div className="p-3 rounded-xl bg-m3-surface-container-high border border-m3-outline-variant/50 text-sm font-mono font-bold text-m3-on-surface text-center select-all">
              {targetName}
            </div>
            <input
              type="text"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder={`Ketik "${targetName}" di sini...`}
              disabled={!hasAgreedConsequences || isDeleting}
              className="w-full bg-m3-surface-container border border-m3-outline-variant/50 focus:border-m3-error focus:bg-m3-surface rounded-xl py-3 px-4 text-sm text-m3-on-surface placeholder-m3-on-surface-variant/70 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            />
            {confirmationInput && !isInputMatched && (
              <p className="text-[11px] text-m3-error font-bold mt-1">
                Nama kelas belum cocok. Pastikan ejaan sama persis.
              </p>
            )}
          </div>

          {/* Modal Action Buttons */}
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleReset}
              disabled={isDeleting}
              className="px-5 py-2.5 text-xs font-bold text-m3-on-surface-variant hover:bg-m3-surface-container-high rounded-full transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!isReadyToDelete}
              className="px-6 py-2.5 bg-m3-error hover:bg-m3-error/90 text-m3-on-error font-bold text-xs rounded-full shadow-m3-elevation-1 hover:shadow-m3-elevation-2 transition-all duration-300 ease-out active:scale-95 cursor-pointer disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Menghapus...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Hapus Permanen</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
