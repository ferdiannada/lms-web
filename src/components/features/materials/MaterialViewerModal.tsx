import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Download, AlertCircle } from 'lucide-react';
import { sanitizeUrl } from '../../../utils/security';
import { getToken } from '../../../services/storage';

interface MaterialViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fileUrl: string;
}

export const MaterialViewerModal: React.FC<MaterialViewerModalProps> = ({
  isOpen,
  onClose,
  title,
  fileUrl,
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !fileUrl) {
      setBlobUrl(null);
      setError(null);
      return;
    }

    const fetchPdf = async () => {
      setLoading(true);
      setError(null);
      try {
        const safeUrl = sanitizeUrl(fileUrl);
        const token = getToken();
        const headers: HeadersInit = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(safeUrl, { headers });
        if (!response.ok) {
          throw new Error(`Gagal memuat dokumen (HTTP ${response.status})`);
        }
        
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan saat memuat materi');
      } finally {
        setLoading(false);
      }
    };

    fetchPdf();

    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, fileUrl]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-[#141218] flex flex-col animate-in fade-in duration-200">
      {/* Material Design 3 Top App Bar (Dark Theme) */}
      <div className="flex items-center h-16 px-2 sm:px-4 bg-[#141218] text-[#E6E0E9] shrink-0 z-10 shadow-sm">
        <button
          type="button"
          onClick={onClose}
          className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-colors shrink-0"
          aria-label="Tutup"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="ml-2 text-[22px] leading-7 font-normal truncate flex-1 tracking-tight">
          {title}
        </h2>
        <a
          href={sanitizeUrl(fileUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-4 h-10 px-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#D0BCFF] hover:bg-[#D0BCFF]/90 text-[#381E72] text-sm font-medium transition-colors shrink-0"
        >
          <Download className="w-4.5 h-4.5" />
          <span className="hidden sm:inline">Unduh</span>
        </a>
      </div>

      {/* Viewer Content (M3 Surface Container) */}
      <div className="flex-1 relative bg-[#1D1B20] flex items-center justify-center rounded-t-2xl sm:rounded-none overflow-hidden mx-0 sm:mx-2 mb-0 sm:mb-2 border-t sm:border-x sm:border-b sm:border-white/10 border-white/10">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <Loader2 className="w-10 h-10 text-[#D0BCFF] animate-spin mb-4" />
            <p className="text-sm font-medium text-[#CAC4D0]">Memuat dokumen...</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-[#F2B8B5]/10 text-[#F2B8B5] flex items-center justify-center mb-4">
              <AlertCircle className="w-7 h-7" />
            </div>
            <p className="text-xl font-normal text-[#E6E0E9] mb-2">Gagal Menampilkan Materi</p>
            <p className="text-sm text-[#CAC4D0] mb-6 max-w-md">{error}</p>
            <a
              href={sanitizeUrl(fileUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 h-10 bg-[#F2B8B5] hover:bg-[#F2B8B5]/90 text-[#601410] rounded-full text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Unduh File
            </a>
          </div>
        )}

        {blobUrl && !error && (
          <iframe
            src={blobUrl}
            className="w-full h-full border-0 bg-transparent transition-opacity duration-500 rounded-t-2xl sm:rounded-lg"
            style={{ opacity: loading ? 0 : 1 }}
            title={title}
          />
        )}
      </div>
    </div>,
    document.body
  );
};
