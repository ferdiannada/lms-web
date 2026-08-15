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
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border transition-all text-left text-sm ${
          isOpen
            ? 'bg-white border-indigo-600 ring-2 ring-indigo-100 text-slate-900 shadow-sm'
            : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800 hover:border-slate-400 shadow-xs'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
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
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
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
                <p className="font-semibold text-slate-700">Tidak ada rombel yang cocok</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Coba cari dengan kata kunci lain</p>
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
                        ? 'bg-[#1e1b4b] text-white font-bold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="text-xs truncate">{opt.label}</span>
                      {opt.badge && (
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase shrink-0 ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
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
                            isSelected ? 'text-indigo-100' : 'text-slate-400'
                          }`}
                        >
                          {opt.subLabel}
                        </span>
                      )}
                      {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Info */}
          <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
            <span>Total {options.length} Rombel Terdaftar</span>
            <span>{filteredOptions.length} Ditampilkan</span>
          </div>
        </div>
      )}
    </div>
  );
};
