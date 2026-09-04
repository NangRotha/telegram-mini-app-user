import React, { forwardRef } from 'react';
import { Search, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const SearchBar = forwardRef(function SearchBar({ value, onChange }, ref) {
  const { t } = useLanguage();

  return (
    <div className="px-3 sm:px-4 py-2" id="search-section">
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          ref={ref}
          id="app-search-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('search_placeholder')}
          className="w-full pl-10 pr-9 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-all shadow-inner"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-white transition-colors"
            title="Clear"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
});
