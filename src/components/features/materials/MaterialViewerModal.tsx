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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-bold text-slate-800 truncate pr-4">{title}</h2>
          <div className="flex items-center gap-2">
            <a
              href={sanitizeUrl(fileUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition cursor-pointer flex items-center gap-2"
              title="Unduh Manual"
            >
              <Download className="w-5 h-5" />
              <span className="text-sm font-semibold hidden sm:inline">Unduh</span>
            </a>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-slate-100 relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
              <p className="text-sm font-medium text-slate-600">Memuat dokumen...</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-900 mb-1">Gagal Menampilkan Materi</p>
              <p className="text-xs text-slate-500 mb-4">{error}</p>
              <a
                href={sanitizeUrl(fileUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
              >
                <Download className="w-4 h-4" />
                Unduh Manual Saja
              </a>
            </div>
          )}

          {blobUrl && !error && (
            <iframe
              src={blobUrl}
              className="w-full h-full border-0"
              title={title}
            />
          )}
        </div>
      </div>
    </div>
  );
};
