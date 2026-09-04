import React, { useState } from 'react';
import {
  MoreVertical,
  X,
  RefreshCw,
  Info,
  ShieldCheck,
  Wifi,
  Battery,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function TelegramTopBar({
  onClose,
  user,
  isTelegram,
  isPhoneFrame,
  onToggleFrame,
}) {
  const { t } = useLanguage();
  const [showMenu, setShowMenu] = useState(false);

  // In actual Telegram, native client already renders the top header.
  if (isTelegram) {
    return null;
  }

  return (
    <div className="sticky top-0 z-50 select-none">
      {/* Simulated Phone Status Bar (Only in desktop preview mode) */}
      {!isTelegram && isPhoneFrame && (
        <div className="bg-slate-950 px-6 pt-2 pb-1 flex items-center justify-between text-[11px] font-semibold text-slate-400">
          <span>9:41</span>
          <div className="w-20 h-3.5 bg-black rounded-full mx-auto" /> {/* Dynamic Island */}
          <div className="flex items-center space-x-1.5 text-slate-300">
            <span className="text-[10px]">5G</span>
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5 fill-current" />
          </div>
        </div>
      )}

      {/* Telegram Native App Header */}
      <div className="bg-[#18222d] border-b border-[#242f3d] px-4 py-2.5 flex items-center justify-between text-white shadow-sm">
        {/* Left: Close */}
        <button
          onClick={onClose}
          className="text-[#64b5f6] hover:text-[#90caf9] font-medium text-xs flex items-center gap-1 active:opacity-70 transition-opacity"
        >
          <X className="w-4 h-4" />
          <span>{t('close')}</span>
        </button>

        {/* Center: Bot Title & Subtitle */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <span className="font-bold text-xs tracking-tight text-white">
              {t('app_title')}
            </span>
            <ShieldCheck className="w-3 h-3 text-[#64b5f6]" />
          </div>
          <span className="text-[10px] text-slate-400 block -mt-0.5">{t('bot')}</span>
        </div>

        {/* Right: Three Dots Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Telegram Dropdown Menu */}
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-1 w-52 rounded-2xl bg-[#242f3d] border border-[#2f3e50] shadow-2xl p-1.5 text-xs text-white z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-700/60 mb-1">
                  <div className="text-[11px] font-bold text-white truncate">
                    @{user?.username || 'minishopnuckbot'}
                  </div>
                  <div className="text-[10px] text-sky-400 font-mono">
                    ID: {user?.id || '8401599473'}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    window.location.reload();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#18222d] text-left transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('reload_app')}</span>
                </button>

                {!isTelegram && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onToggleFrame();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#18222d] text-left transition-colors"
                  >
                    <span>📱</span>
                    <span>{isPhoneFrame ? t('expand_screen') : t('phone_mockup')}</span>
                  </button>
                )}

                <a
                  href="https://t.me/minishopnuckbot"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setShowMenu(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#18222d] text-left transition-colors text-sky-400"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>{t('bot_support')}</span>
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
