import React from 'react';
import { BookOpen, Download, Trash2 } from 'lucide-react';
import { Material } from '../../../types';
import { sanitizeUrl } from '../../../utils/security';

interface MaterialCardProps {
  material: Material & { className?: string };
  isTeacher: boolean;
  onDelete?: (id: string) => void;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  isTeacher,
  onDelete,
}) => {
  return (
    <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between hover:shadow-md transition group">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-xs text-slate-900 truncate">{material.title}</h3>
              {material.className && (
                <p className="text-[10px] text-indigo-600 font-semibold">{material.className}</p>
              )}
            </div>
          </div>

          {isTeacher && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(material.id)}
              title="Hapus Materi"
              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {material.description && (
          <p className="text-xs text-slate-600 line-clamp-2">{material.description}</p>
        )}
      </div>

      {material.file_url ? (
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
            {material.file_name || 'Dokumen Modul'}
          </span>
          <a
            href={sanitizeUrl(material.file_url)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
          >
            <Download className="w-3 h-3" /> Unduh
          </a>
        </div>
      ) : (
        <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 italic">
          Materi Teks Digital
        </div>
      )}
    </div>
  );
};
