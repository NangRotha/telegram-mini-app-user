import React from 'react';
import { ArrowRight, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function Banner({ onExploreClick }) {
  const { t } = useLanguage();

  return (
    <div className="px-3 sm:px-4 pt-2.5 sm:pt-3 pb-1 select-none">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-violet-950 p-3.5 sm:p-4 border border-indigo-500/20 shadow-xl shadow-indigo-950/40">
        {/* Glow backdrop effects */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-purple-500/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between gap-2.5">
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider mb-1.5 border border-indigo-500/30">
              <Zap className="w-2.5 h-2.5 text-amber-400" />
              <span>{t('banner_tag')}</span>
            </div>
            <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight leading-snug line-clamp-2">
              {t('banner_title')}
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-300/80 mt-0.5 sm:mt-1 truncate">
              {t('banner_subtitle')}
            </p>
          </div>

          <button
            onClick={onExploreClick}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all group shrink-0"
            title={t('explore_btn')}
          >
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
