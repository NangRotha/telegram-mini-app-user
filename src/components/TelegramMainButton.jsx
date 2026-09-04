import React from 'react';
import { Loader2 } from 'lucide-react';

export function TelegramMainButton({
  text,
  onClick,
  isVisible = true,
  isLoading = false,
  disabled = false,
  isTelegram = false,
}) {
  // If running inside Telegram, native MainButton handles it
  if (isTelegram || !isVisible) return null;

  return (
    <div className="sticky bottom-0 left-0 right-0 z-40 p-3 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent">
      <button
        onClick={onClick}
        disabled={disabled || isLoading}
        className="w-full py-3.5 px-5 rounded-2xl bg-[#2481cc] hover:bg-[#2074b8] active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-sky-900/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <span>{text}</span>
        )}
      </button>
    </div>
  );
}
