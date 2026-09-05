import React from 'react';
import { ShoppingBag, Package, Sparkles, Settings2, Tag, Languages } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function Header({
  user,
  cartCount,
  onOpenCart,
  onOpenOrders,
  onOpenProfile,
  onOpenPromos,
  isTelegram,
  haptic,
  storeInfo,
}) {
  const { lang, toggleLang, t } = useLanguage();

  const handleLanguageToggle = () => {
    haptic?.selection?.();
    toggleLang();
  };

  const isImageLogo = storeInfo?.store_logo?.startsWith('http') || storeInfo?.store_logo?.startsWith('/uploads');

  return (
    <header className="sticky top-0 z-40 glass-nav px-3 sm:px-4 py-2.5 sm:py-3 select-none">
      <div className="w-full flex items-center justify-between gap-2">
        {/* User profile & Brand - Clickable to open Profile Modal */}
        <button
          onClick={onOpenProfile}
          className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 text-left hover:opacity-90 active:scale-98 transition-all p-1 -m-1 rounded-2xl hover:bg-slate-800/40"
          title={t('profile_title')}
        >
          <div className="relative shrink-0">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt="Avatar"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-white/20 shadow-lg shadow-indigo-500/20"
              />
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-500/20 border border-white/20">
                {user?.first_name ? user.first_name[0].toUpperCase() : 'M'}
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] sm:text-xs font-semibold text-indigo-400 flex items-center gap-1 truncate max-w-[120px] sm:max-w-[160px]">
                {isImageLogo ? (
                  <img src={storeInfo.store_logo} alt="Logo" className="w-3.5 h-3.5 rounded object-cover inline shrink-0" />
                ) : (
                  <span>{storeInfo?.store_logo || '🛍'}</span>
                )}
                <span className="truncate">{storeInfo?.store_name || t('app_title')}</span>
              </span>
              {isTelegram ? (
                <span className="text-[9px] sm:text-[10px] bg-sky-500/20 text-sky-300 font-bold px-1.5 py-0.2 rounded-full border border-sky-500/30">
                  {t('bot_label')}
                </span>
              ) : (
                <span className="text-[9px] sm:text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.2 rounded-full border border-amber-500/30">
                  {t('preview_label')}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs sm:text-sm font-bold text-white truncate max-w-[110px] sm:max-w-[150px]">
              <span className="truncate">
                {t('hi_greeting')} {user?.first_name || t('guest_user')}
              </span>
              <Settings2 className="w-3 h-3 text-slate-400 shrink-0" />
            </div>
          </div>
        </button>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          {/* Language Switcher Pill */}
          <button
            onClick={handleLanguageToggle}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 hover:text-white transition-all active:scale-95 shadow-sm"
            title={lang === 'km' ? 'Switch to English' : 'ប្តូរទៅជាភាសាខ្មែរ'}
          >
            <span className="text-xs">{lang === 'km' ? '🇰🇭' : '🇬🇧'}</span>
            <span className="text-[11px] font-bold tracking-wide">
              {lang === 'km' ? 'ខ្មែរ' : 'EN'}
            </span>
          </button>

          {/* Promos Button */}
          {onOpenPromos && (
            <button
              onClick={onOpenPromos}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-emerald-400 hover:text-emerald-300 transition-all active:scale-95 relative"
              title={t('vouchers_tooltip')}
            >
              <Tag className="w-4 h-4" />
            </button>
          )}

          {/* Order history button */}
          <button
            onClick={onOpenOrders}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white transition-all active:scale-95 relative"
            title={t('orders_tooltip')}
          >
            <Package className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="p-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95 relative"
            title={t('cart_tooltip')}
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-bold text-[10px] sm:text-[11px] min-w-[18px] sm:min-w-[20px] h-4.5 sm:h-5 rounded-full flex items-center justify-center px-1 border-2 border-slate-900 animate-pulse">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
