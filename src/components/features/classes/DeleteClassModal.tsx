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
        <div className="flex items-start gap-3.5 pb-3 border-b border-rose-100">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-xs border border-rose-200">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                Tindakan Berbahaya & Permanen
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1 leading-snug">
              Hapus Kelas / Mata Pelajaran
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Kelas: <strong className="text-slate-800">{classDetail.name}</strong> ({classDetail.rombel})
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Detailed Consequences Explanation */}
        <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-3">
          <h4 className="text-xs font-black text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            Konsekuensi Penghapusan Kelas:
          </h4>
          <ul className="space-y-2 text-xs text-rose-950">
            <li className="flex items-start gap-2">
              <FileText className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
              <span>
                <strong>Modul & Materi Pembelajaran:</strong> Seluruh dokumen PDF, link, dan bahan ajar yang diunggah akan dihapus secara permanen.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <FileText className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
              <span>
                <strong>Tugas & Nilai Siswa:</strong> Seluruh instruksi tugas, riwayat pengumpulan berkas (*submissions*), dan catatan penilaian guru akan dimusnahkan.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <HelpCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
              <span>
                <strong>Kuis & Ujian:</strong> Seluruh bank soal kuis dan rekap pengerjaan siswa (*attempts*) di kelas ini akan dihapus dari buku nilai.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
              <span>
                <strong>Forum Diskusi:</strong> Seluruh utas percakapan, tanya jawab, dan komentar kelas akan hilang.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Users className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
              <span>
                <strong>Akses Siswa Terputus:</strong> Siswa yang terdaftar tidak lagi dapat melihat atau membuka kelas ini di portal mereka.
              </span>
            </li>
          </ul>
        </div>

        {/* Double Verification Controls */}
        <form onSubmit={handleDelete} className="space-y-4 pt-1">
          {/* Verification Step 1: Checkbox */}
          <div
            onClick={() => setHasAgreedConsequences(!hasAgreedConsequences)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
              hasAgreedConsequences
                ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80 text-slate-700'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {hasAgreedConsequences ? (
                <CheckSquare className="w-4 h-4 text-amber-700" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
            </div>
            <div className="text-xs font-semibold leading-relaxed">
              <span className="font-bold text-slate-900 block mb-0.5">Verifikasi 1 • Persetujuan Konsekuensi</span>
              Saya telah membaca dan memahami bahwa data kelas ini <strong>TIDAK DAPAT dipulihkan</strong> setelah dihapus.
            </div>
          </div>

          {/* Verification Step 2: Exact Name Confirmation */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 block leading-snug">
              Verifikasi 2 • Ketik nama kelas untuk konfirmasi:
            </label>
            <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-800 text-center select-all">
              {targetName}
            </div>
            <input
              type="text"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder={`Ketik "${targetName}" di sini...`}
              disabled={!hasAgreedConsequences || isDeleting}
              className="w-full bg-slate-50 border border-slate-200 focus:border-rose-600 focus:bg-white rounded-xl py-2.5 px-3.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs font-medium"
            />
            {confirmationInput && !isInputMatched && (
              <p className="text-[11px] text-rose-600 font-semibold">
                Nama kelas belum cocok. Pastikan ejaan sama persis.
              </p>
            )}
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              disabled={isDeleting}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!isReadyToDelete}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-200 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isDeleting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Menghapus Kelas...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Kelas Permanen</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
