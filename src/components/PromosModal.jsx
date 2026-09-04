import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, Tag, Copy, Check, Coins, Gift } from 'lucide-react';
import { getPromoCodes } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export function PromosModal({ isOpen, onClose, onApplyCode, haptic }) {
  const { t } = useLanguage();
  const [promos, setPromos] = useState([]);
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const prevBody = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevBody;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    getPromoCodes().then((data) => setPromos(data || [])).catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (code) => {
    haptic?.notification?.('success');
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 1800);
  };

  const handleUse = (code) => {
    haptic?.impact?.('medium');
    if (onApplyCode) {
      onApplyCode(code);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col animate-in slide-in-from-bottom duration-250 select-none">
      {/* Header */}
      <header className="px-4 py-3 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 flex items-center justify-between shrink-0 z-20 pt-safe">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/10 shadow transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('close')}</span>
        </button>

        <h1 className="text-sm font-bold text-white flex items-center gap-1.5">
          <Gift className="w-4 h-4 text-emerald-400" />
          <span>{t('promos_title')}</span>
        </h1>

        <button
          onClick={onClose}
          className="p-2 rounded-full bg-slate-800/80 text-slate-300 hover:text-white border border-white/10 active:scale-90"
          title={t('close')}
        >
          <X className="w-4 h-4" />
        </button>
      </header>

      {/* Body */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 max-w-md mx-auto w-full scroll-touch">
        {/* Banner */}
        <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 shadow-xl text-white space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-full inline-block">
            Special Discounts
          </span>
          <h2 className="text-base font-black">Save More on Every Order</h2>
          <p className="text-xs text-emerald-100">
            Apply any of the promo codes below during checkout or earn points with every purchase!
          </p>
        </div>

        {/* Promo Code Cards */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            {t('promos_title')}
          </h3>

          {promos.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-4 text-center">{t('no_promos')}</p>
          ) : (
            promos.map((p) => {
              const isCopied = copiedCode === p.code;
              return (
                <div
                  key={p.id}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-lg space-y-2.5 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                        <Tag className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white font-mono tracking-wide">
                            {p.code}
                          </span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {p.discount_type === 'percentage'
                              ? `${p.discount_value}% OFF`
                              : `$${p.discount_value} OFF`}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{p.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500">
                      {p.min_spend > 0 ? t('min_order_spend', { amount: p.min_spend }) : 'No minimum spend'}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(p.code)}
                        className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 active:scale-95 transition-colors"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">{t('code_copied')}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>{t('copy_code')}</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleUse(p.code)}
                        className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
                      >
                        {t('apply_btn')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Loyalty Points Explanation */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <Coins className="w-4 h-4" />
            <span>{t('points_profile_title')}</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            {t('points_profile_desc')}
          </p>
        </div>
      </main>
    </div>
  );
}
