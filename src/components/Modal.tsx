import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-m3-surface-container-high rounded-3xl p-6 sm:p-7 shadow-m3-elevation-3 text-m3-on-surface">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 shrink-0">
          <h3 className="text-xl sm:text-2xl font-normal tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-m3-on-surface hover:bg-m3-surface-variant transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Content with vertical scrolling */}
        <div className="overflow-y-auto pt-4 flex-1 pr-0.5 custom-scrollbar">{children}</div>
      </div>
    </div>,
    document.body
  );
};
