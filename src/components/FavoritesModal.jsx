import React, { useEffect } from 'react';
import { X, ArrowLeft, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function FavoritesModal({
  isOpen,
  onClose,
  favoriteProducts = [],
  onSelectProduct,
  onAddToCart,
  onRemoveFavorite,
  haptic,
}) {
  const { t } = useLanguage();

  useEffect(() => {
    if (!isOpen) return;
    const prevBody = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevBody;
    };
  }, [isOpen]);

  if (!isOpen) return null;

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
          <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
          <span>{t('favorites_title')} ({favoriteProducts.length})</span>
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
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3 max-w-md mx-auto w-full scroll-touch">
        {favoriteProducts.length === 0 ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-sm font-bold text-white">{t('no_favorites_title')}</h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              {t('no_favorites_subtitle')}
            </p>
          </div>
        ) : (
          favoriteProducts.map((p) => (
            <div
              key={p.id}
              className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex items-center gap-3 shadow-md transition-all"
            >
              <img
                src={p.image_url}
                alt={p.title}
                onClick={() => {
                  onSelectProduct(p);
                  onClose();
                }}
                className="w-16 h-16 rounded-xl object-cover bg-slate-800 shrink-0 cursor-pointer border border-white/5"
              />

              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => {
                  onSelectProduct(p);
                  onClose();
                }}
              >
                <h3 className="text-xs font-bold text-white truncate">{p.title}</h3>
                <p className="text-xs font-black text-emerald-400 mt-0.5">${p.price.toFixed(2)}</p>
                <span className="text-[10px] text-slate-400">
                  {p.stock > 0 ? `${t('in_stock')} (${p.stock})` : t('sold_out_badge')}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    haptic?.impact?.('medium');
                    onAddToCart(p, 1);
                  }}
                  disabled={p.stock <= 0}
                  className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 active:scale-95 shadow-md"
                  title={t('add_to_cart')}
                >
                  <ShoppingBag className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    haptic?.selection?.();
                    onRemoveFavorite(p.id);
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 active:scale-95 transition-colors"
                  title={t('remove_favorite')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
