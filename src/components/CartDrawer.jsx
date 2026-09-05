import React, { useEffect } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) {
  const { t } = useLanguage();

  useEffect(() => {
    if (!isOpen) return;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const totalAmount = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full sm:max-w-md h-full flex flex-col bg-slate-900 border-l border-slate-800 text-white animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">{t('your_cart')}</h2>
            <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">
              {items.length} {items.length === 1 ? t('cart_item_singular') : t('cart_item_plural')}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500 mb-3 border border-slate-700/50">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{t('empty_cart_title')}</h3>
              <p className="text-xs text-slate-400 max-w-xs mb-4">
                {t('empty_cart_subtitle')}
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 active:scale-95 transition-all"
              >
                {t('start_browsing')}
              </button>
            </div>
          ) : (
            items.map((cartItem) => {
              const { id: itemKey, product, quantity, selected_image, variant_name } = cartItem;
              const uniqueKey = itemKey || `${product.id}_${variant_name || 'main'}`;
              const displayImage = selected_image || product.image_url;

              return (
                <div
                  key={uniqueKey}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-800"
                >
                  {/* Product Image (Selected Subimage / Main) */}
                  <img
                    src={displayImage}
                    alt={product.title}
                    className="w-14 h-14 rounded-xl object-cover bg-slate-700 shrink-0 border border-white/5"
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-white truncate">
                      {product.title}
                    </h4>

                    {variant_name && (
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                        {variant_name}
                      </span>
                    )}

                    <p className="text-xs font-bold text-emerald-400 mt-0.5">
                      ${(product.price * quantity).toFixed(2)}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      ${product.price.toFixed(2)} / {t('price_label').toLowerCase()}
                    </span>
                  </div>

                  {/* Quantity Buttons */}
                  <div className="flex items-center bg-slate-900 rounded-lg border border-slate-700 p-0.5 shrink-0">
                    <button
                      onClick={() => onUpdateQuantity(uniqueKey, quantity - 1)}
                      className="p-1 text-slate-400 hover:text-white transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(uniqueKey, quantity + 1)}
                      disabled={quantity >= product.stock}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => onRemoveItem(uniqueKey)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {items.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-900/90 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>{t('cart_subtotal')}</span>
                <span className="font-semibold text-slate-200">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>{t('delivery_fee')}</span>
                <span className="font-semibold text-emerald-400">{t('free_badge')}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-1.5 border-t border-slate-800">
                <span>{t('final_total')}</span>
                <span className="text-emerald-400 text-base">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={onProceedToCheckout}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 font-semibold text-sm text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <span>{t('proceed_to_checkout')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
