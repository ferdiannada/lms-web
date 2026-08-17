import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X, Layers } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  subLabel?: string;
  badge?: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  footerLabel?: string;
  emptyText?: string;
  emptySubText?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Pilih opsi...',
  searchPlaceholder = 'Ketik untuk mencari...',
  required = false,
  disabled = false,
  className = '',
  icon,
  footerLabel = 'Pilihan',
  emptyText = 'Tidak ada opsi yang cocok',
  emptySubText = 'Coba cari dengan kata kunci lain',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Auto-focus search input when opened
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredOptions = options.filter((opt) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    const matchLabel = opt.label.toLowerCase().includes(q);
    const matchSub = opt.subLabel ? opt.subLabel.toLowerCase().includes(q) : false;
    const matchBadge = opt.badge ? opt.badge.toLowerCase().includes(q) : false;
    return matchLabel || matchSub || matchBadge;
  });

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  };

  return (
    <div className={`relative w-full select-none ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border transition-all text-left text-sm ${
          isOpen
            ? 'bg-m3-surface border-m3-primary ring-2 ring-m3-primary/20 text-m3-on-surface shadow-none'
            : 'bg-m3-surface hover:bg-m3-surface-variant border-m3-outline text-m3-on-surface hover:border-m3-on-surface shadow-none'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {icon ? icon : <Layers className="w-4 h-4 text-indigo-600 shrink-0" />}
          {selectedOption ? (
            <div className="flex items-center gap-2 truncate">
              <span className="font-bold text-slate-900 truncate">{selectedOption.label}</span>
              {selectedOption.badge && (
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold shrink-0">
                  {selectedOption.badge}
                </span>
              )}
              {selectedOption.subLabel && (
                <span className="text-xs text-slate-500 truncate hidden sm:inline">
                  • {selectedOption.subLabel}
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-400 text-xs">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
          {selectedOption && !required && (
            <span
              onClick={handleClear}
              className="p-0.5 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
              title="Hapus pilihan"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`}
          />
        </div>
      </button>

      {/* Hidden input for HTML5 form validation if required */}
      {required && (
        <input
          type="text"
          value={value}
          onChange={() => {}}
          required
          tabIndex={-1}
          className="sr-only"
        />
      )}

      {/* Dropdown Menu (Select2 Style) */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-m3-surface-container rounded-2xl shadow-m3-elevation-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150 border-none">
          {/* Search Box Header */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 focus:border-indigo-600 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-700 rounded-md"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="py-6 px-3 text-center text-slate-400 text-xs">
                <p className="font-semibold text-slate-700">{emptyText}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{emptySubText}</p>
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-m3-secondary-container text-m3-on-secondary-container font-bold shadow-none'
                        : 'text-m3-on-surface hover:bg-m3-surface-variant'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="text-xs truncate font-bold">{opt.label}</span>
                      {opt.badge && (
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase shrink-0 ${
                            isSelected
                              ? 'bg-m3-on-secondary-container/10 text-m3-on-secondary-container border border-m3-on-secondary-container/20'
                              : 'bg-m3-primary/10 text-m3-primary border border-m3-primary/20'
                          }`}
                        >
                          {opt.badge}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {opt.subLabel && (
                        <span
                          className={`text-[11px] ${
                            isSelected ? 'text-m3-on-secondary-container/80' : 'text-m3-on-surface-variant'
                          }`}
                        >
                          {opt.subLabel}
                        </span>
                      )}
                      {isSelected && <Check className="w-4 h-4 text-m3-on-secondary-container shrink-0" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Info */}
          <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
            <span>Total {options.length} {footerLabel}</span>
            <span>{filteredOptions.length} Ditampilkan</span>
          </div>
        </div>
      )}
    </div>
  );
};
