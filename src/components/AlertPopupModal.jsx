import React from 'react';
import { X, Sparkles, Megaphone, Info, AlertTriangle, ArrowRight } from 'lucide-react';

export function AlertPopupModal({ alert, onDismiss, onAction, haptic }) {
  if (!alert) return null;

  const handleAction = () => {
    haptic?.selection?.();
    if (alert.button_link && alert.button_link.trim()) {
      if (window.Telegram?.WebApp?.openLink) {
        window.Telegram.WebApp.openLink(alert.button_link.trim());
      } else {
        window.open(alert.button_link.trim(), '_blank', 'noopener,noreferrer');
      }
    }
    if (onAction) onAction();
    onDismiss();
  };

  const handleClose = () => {
    haptic?.selection?.();
    onDismiss();
  };

  const getIcon = () => {
    switch (alert.popup_type) {
      case 'announcement':
        return <Megaphone className="w-5 h-5 text-indigo-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-rose-400" />;
      case 'info':
        return <Info className="w-5 h-5 text-sky-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 text-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Banner Image if present */}
        <div className="relative">
          {alert.image_url ? (
            <div className="w-full aspect-[16/9] max-h-48 bg-slate-800 overflow-hidden">
              <img
                src={alert.image_url}
                alt={alert.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full py-8 bg-gradient-to-tr from-amber-500/20 via-indigo-500/20 to-violet-500/20 flex items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-white/10 flex items-center justify-center shadow-xl">
                {getIcon()}
              </div>
            </div>
          )}

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/90 active:scale-90 transition-all border border-white/10"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
            {getIcon()}
            <span>{alert.popup_type || 'Special Announcement'}</span>
          </div>

          <h3 className="text-lg font-black text-white leading-snug tracking-tight">
            {alert.title}
          </h3>

          {alert.message && (
            <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto">
              {alert.message}
            </p>
          )}

          {/* Action button */}
          <div className="pt-2">
            <button
              onClick={handleAction}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 active:scale-98 transition-all"
            >
              <span>{alert.button_text || 'Got It'}</span>
              {alert.button_link && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
