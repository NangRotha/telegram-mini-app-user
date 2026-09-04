import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export function CategoryBar({ categories, selectedCategoryId, onSelectCategory }) {
  const { t } = useLanguage();

  return (
    <div className="px-3 sm:px-4 py-1.5 overflow-x-auto no-scrollbar touch-pan-x overscroll-x-contain select-none">
      <div className="flex items-center space-x-1.5 sm:space-x-2 w-max pb-0.5">
        <button
          onClick={() => onSelectCategory(null)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 active:scale-95 ${
            selectedCategoryId === null
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
              : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <span>🔥</span>
          <span>{t('all_items')}</span>
        </button>

        {categories.map((cat) => {
          const isActive = selectedCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <span>{cat.icon || '📦'}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
