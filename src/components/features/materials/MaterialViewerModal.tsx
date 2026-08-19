import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Download, AlertCircle, ExternalLink, FileText, FileArchive } from 'lucide-react';
import { sanitizeUrl } from '../../../utils/security';
import { getToken } from '../../../services/storage';

interface MaterialViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fileUrl: string;
}

type FileCategory = 'pdf' | 'image' | 'video' | 'audio' | 'office' | 'archive' | 'other';

function detectFileType(url: string, mimeType?: string): FileCategory {
  const cleanUrl = (url || '').split('?')[0].toLowerCase();
  if (mimeType?.includes('pdf') || cleanUrl.endsWith('.pdf')) return 'pdf';
  if (mimeType?.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg|bmp)$/i.test(cleanUrl)) return 'image';
  if (mimeType?.startsWith('video/') || /\.(mp4|webm|ogg|mov)$/i.test(cleanUrl)) return 'video';
  if (mimeType?.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|aac)$/i.test(cleanUrl)) return 'audio';
  if (/\.(docx?|pptx?|xlsx?|odt|ods|odp)$/i.test(cleanUrl)) return 'office';
  if (/\.(zip|rar|7z|tar|gz)$/i.test(cleanUrl)) return 'archive';
  return 'other';
}

export const MaterialViewerModal: React.FC<MaterialViewerModalProps> = ({
  isOpen,
  onClose,
  title,
  fileUrl,
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<FileCategory>('other');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !fileUrl) {
      setBlobUrl(null);
      setError(null);
      return;
    }

    const initialType = detectFileType(fileUrl);
    setFileType(initialType);

    // Office documents and archives cannot be previewed natively in an iframe
    if (initialType === 'office' || initialType === 'archive') {
      setLoading(false);
      setBlobUrl(null);
      return;
    }

    const fetchFile = async () => {
      setLoading(true);
      setError(null);
      try {
        const safeUrl = sanitizeUrl(fileUrl);
        const token = getToken();
        const headers: HeadersInit = {};
        
        // Do not attach Authorization header for pre-signed S3 URLs
        if (token && !safeUrl.includes('Signature=') && !safeUrl.includes('X-Amz-Signature=')) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(safeUrl, { headers });
        if (!response.ok) {
          throw new Error(`Gagal memuat dokumen (HTTP ${response.status})`);
        }

        const contentType = response.headers.get('content-type') || '';
        const detected = detectFileType(fileUrl, contentType);
        setFileType(detected);

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      } catch (err: any) {
        // If fetch failed (e.g. CORS on direct URL), fallback to direct URL preview
        console.warn('[MaterialViewer] Blob fetch failed, falling back to direct URL:', err.message);
        setBlobUrl(sanitizeUrl(fileUrl));
      } finally {
        setLoading(false);
      }
    };

    fetchFile();

    return () => {
      if (blobUrl && blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, fileUrl]);

  if (!isOpen) return null;

  const targetUrl = blobUrl || sanitizeUrl(fileUrl);

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-[#141218] flex flex-col animate-in fade-in duration-200">
      {/* Material Design 3 Top App Bar */}
      <div className="flex items-center h-16 px-2 sm:px-4 bg-[#141218] text-[#E6E0E9] shrink-0 z-10 shadow-sm border-b border-white/10">
        <button
          type="button"
          onClick={onClose}
          className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-colors shrink-0 cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="ml-2 text-lg sm:text-[20px] leading-7 font-semibold truncate flex-1 tracking-tight">
          {title}
        </h2>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={sanitizeUrl(fileUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 px-4 inline-flex items-center justify-center gap-2 rounded-full hover:bg-white/10 text-[#E6E0E9] text-sm font-medium transition-colors"
            title="Buka di Tab Baru"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Tab Baru</span>
          </a>
          <a
            href={sanitizeUrl(fileUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 px-5 inline-flex items-center justify-center gap-2 rounded-full bg-[#D0BCFF] hover:bg-[#D0BCFF]/90 text-[#381E72] text-sm font-bold transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Unduh</span>
          </a>
        </div>
      </div>

      {/* Viewer Content */}
      <div className="flex-1 relative bg-[#1D1B20] flex items-center justify-center overflow-hidden mx-0 sm:mx-2 mb-0 sm:mb-2 border-t sm:border-x sm:border-b sm:border-white/10 border-white/10">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[#1D1B20]/80">
            <Loader2 className="w-10 h-10 text-[#D0BCFF] animate-spin mb-4" />
            <p className="text-sm font-medium text-[#CAC4D0]">Memuat dokumen materi...</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-[#F2B8B5]/10 text-[#F2B8B5] flex items-center justify-center mb-4">
              <AlertCircle className="w-7 h-7" />
            </div>
            <p className="text-xl font-medium text-[#E6E0E9] mb-2">Gagal Menampilkan Materi</p>
            <p className="text-sm text-[#CAC4D0] mb-6 max-w-md">{error}</p>
            <div className="flex items-center gap-3">
              <a
                href={sanitizeUrl(fileUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 h-10 bg-[#D0BCFF] hover:bg-[#D0BCFF]/90 text-[#381E72] rounded-full text-sm font-bold transition-colors"
              >
                <Download className="w-4 h-4" />
                Unduh Berkas
              </a>
            </div>
          </div>
        )}

        {/* 1. PDF Viewer (Without restrictive sandbox to allow Chrome/Brave PDF plugin to render) */}
        {!error && fileType === 'pdf' && targetUrl && (
          <iframe
            src={targetUrl}
            className="w-full h-full border-0 bg-white/5 transition-opacity duration-300"
            style={{ opacity: loading ? 0 : 1 }}
            title={title}
          />
        )}

        {/* 2. Image Viewer */}
        {!error && fileType === 'image' && targetUrl && (
          <div className="w-full h-full flex items-center justify-center p-4 overflow-auto">
            <img
              src={targetUrl}
              alt={title}
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl transition-opacity duration-300"
              style={{ opacity: loading ? 0 : 1 }}
            />
          </div>
        )}

        {/* 3. Video Viewer */}
        {!error && fileType === 'video' && targetUrl && (
          <div className="w-full h-full flex items-center justify-center p-4">
            <video
              controls
              src={targetUrl}
              className="max-w-full max-h-full rounded-2xl shadow-2xl bg-black"
            >
              Browser Anda tidak mendukung pemutaran video langsung.
            </video>
          </div>
        )}

        {/* 4. Audio Viewer */}
        {!error && fileType === 'audio' && targetUrl && (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
            <p className="text-base text-[#E6E0E9] font-medium">{title}</p>
            <audio controls src={targetUrl} className="w-full max-w-md">
              Browser Anda tidak mendukung pemutaran audio langsung.
            </audio>
          </div>
        )}

        {/* 5. Office Document (Word / PPT / Excel) */}
        {!error && fileType === 'office' && (
          <div className="flex flex-col items-center justify-center p-8 text-center max-w-lg space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-[#D0BCFF]/10 text-[#D0BCFF] flex items-center justify-center">
              <FileText className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#E6E0E9] mb-1">{title}</h3>
              <p className="text-sm text-[#CAC4D0] leading-relaxed">
                Dokumen Office (Word/Excel/PowerPoint) tidak dapat dipratinjau langsung di dalam browser demi privasi dan keamanan dokumen.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={sanitizeUrl(fileUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 h-11 bg-[#D0BCFF] hover:bg-[#D0BCFF]/90 text-[#381E72] rounded-full text-sm font-bold transition-all shadow-md active:scale-95"
              >
                <Download className="w-4 h-4" />
                Unduh Dokumen
              </a>
            </div>
          </div>
        )}

        {/* 6. Archive (ZIP / RAR) or Other file types */}
        {!error && (fileType === 'archive' || fileType === 'other') && (
          <div className="flex flex-col items-center justify-center p-8 text-center max-w-lg space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-[#D0BCFF]/10 text-[#D0BCFF] flex items-center justify-center">
              <FileArchive className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#E6E0E9] mb-1">{title}</h3>
              <p className="text-sm text-[#CAC4D0] leading-relaxed">
                Berkas ini berupa arsip / format yang perlu diunduh untuk dapat dibuka di perangkat Anda.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={sanitizeUrl(fileUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 h-11 bg-[#D0BCFF] hover:bg-[#D0BCFF]/90 text-[#381E72] rounded-full text-sm font-bold transition-all shadow-md active:scale-95"
              >
                <Download className="w-4 h-4" />
                Unduh Berkas
              </a>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
