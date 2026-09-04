import React from 'react';
import { Home, Search, Heart, User, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function BottomNavBar({
  activeTab = 'home',
  onSelectTab,
  cartCount = 0,
  favoritesCount = 0,
  onOpenCart,
  haptic,
}) {
  const { t } = useLanguage();

  const tabs = [
    {
      id: 'home',
      label: t('nav_home'),
      icon: Home,
    },
    {
      id: 'search',
      label: t('nav_search'),
      icon: Search,
    },
    {
      id: 'favorites',
      label: t('nav_favorites'),
      icon: Heart,
      badge: favoritesCount,
    },
    {
      id: 'profile',
      label: t('nav_profile'),
      icon: User,
    },
  ];

  const handleTabClick = (tabId) => {
    haptic?.selection?.();
    onSelectTab(tabId);
  };

  return (
    <nav className="w-full bg-[#080d19]/95 backdrop-blur-2xl border-t border-slate-800/90 select-none pb-safe shrink-0 shadow-[0_-5px_25px_rgba(0,0,0,0.65)]">
      <div className="max-w-md mx-auto px-3 h-16 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all duration-200 relative active:scale-95 ${
                isActive
                  ? 'text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-200 ${
                    isActive
                      ? 'scale-110 stroke-[2.2px] fill-emerald-400/20 drop-shadow-[0_0_8px_rgba(52,211,153,0.35)]'
                      : 'stroke-[1.8px]'
                  }`}
                />
                {tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-[9px] font-black text-white flex items-center justify-center shadow-md animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] sm:text-[11px] mt-1 tracking-tight truncate max-w-[70px] leading-tight ${
                  isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* Quick Cart Pill Button if items in cart */}
        {cartCount > 0 && (
          <button
            onClick={() => {
              haptic?.impact?.('light');
              onOpenCart();
            }}
            className="flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-transform active:scale-95 shrink-0 ml-1"
            title={t('cart_tooltip')}
          >
            <div className="relative flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-[10px] sm:text-[11px] font-extrabold">{cartCount}</span>
            </div>
            <span className="text-[9px] font-bold text-indigo-200 tracking-tighter">
              {t('nav_cart')}
            </span>
          </button>
        )}
      </div>

      {/* Mobile Home Indicator Line */}
      <div className="w-full flex justify-center pb-1 pt-0.5 pointer-events-none">
        <div className="w-28 h-1 bg-slate-700/50 rounded-full" />
      </div>
    </nav>
  );
}
