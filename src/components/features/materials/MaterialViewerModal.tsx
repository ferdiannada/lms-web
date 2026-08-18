import React, { useState, useEffect } from 'react';
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
        const headers: HeadersInit = {};
        // Do not attach the Bearer token for S3 pre-signed URLs 
        // because AWS/MinIO will reject requests that contain both 
        // presigned query credentials and Authorization headers (400 Bad Request).

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

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4 overflow-hidden">
          <button
            type="button"
            onClick={onClose}
            className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition flex items-center gap-2 group"
          >
            <X className="w-5 h-5 group-hover:-rotate-90 transition-transform duration-300" />
            <span className="text-sm font-medium hidden sm:block">Tutup</span>
          </button>
          <div className="w-px h-5 bg-slate-800 hidden sm:block"></div>
          <h2 className="text-sm sm:text-base font-semibold text-slate-200 truncate">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href={sanitizeUrl(fileUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white rounded-xl text-xs sm:text-sm font-semibold transition"
            title="Unduh Manual"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Unduh</span>
          </a>
        </div>
      </div>

      {/* Viewer Content */}
      <div className="flex-1 relative bg-slate-900/50 flex items-center justify-center">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
            <p className="text-sm font-medium text-slate-400 animate-pulse">Menyiapkan penampil dokumen...</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
              <AlertCircle className="w-7 h-7" />
            </div>
            <p className="text-base font-bold text-slate-200 mb-2">Gagal Menampilkan Materi</p>
            <p className="text-sm text-slate-400 mb-6 max-w-md">{error}</p>
            <a
              href={sanitizeUrl(fileUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition"
            >
              <Download className="w-4 h-4" />
              Unduh File Langsung
            </a>
          </div>
        )}

        {blobUrl && !error && (
          <iframe
            src={blobUrl}
            className="w-full h-full border-0 bg-transparent transition-opacity duration-500"
            style={{ opacity: loading ? 0 : 1 }}
            title={title}
          />
        )}
      </div>
    </div>
  );
};
