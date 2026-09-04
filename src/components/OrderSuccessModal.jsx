import React from 'react';
import { CheckCircle2, MessageSquare, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function OrderSuccessModal({ isOpen, onClose, order, onOpenOrders }) {
  const { t } = useLanguage();

  if (!isOpen || !order) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
      <div className="relative w-full max-w-xs rounded-3xl bg-slate-900 border border-slate-800 p-5 text-center text-white shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Glow & Icon */}
        <div className="relative mx-auto mb-4 w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
          <CheckCircle2 className="w-10 h-10 animate-bounce" />
        </div>

        <h3 className="text-base sm:text-lg font-bold text-white mb-1">
          {t('order_success_title')}
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          {t('order_success_subtitle')}
        </p>

        {/* Order Details Pill */}
        <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 mb-4 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-400">{t('order_number_label')}</span>
            <span className="font-mono font-bold text-indigo-300">
              {order.order_number}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">{t('total_amount_label')}</span>
            <span className="font-bold text-emerald-400">
              ${order.total_amount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Telegram Notice */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-sky-950/50 border border-sky-800/60 text-sky-200 text-xs mb-5 text-left">
          <MessageSquare className="w-4 h-4 shrink-0 text-sky-400" />
          <span>A confirmation receipt has been sent to your Telegram chat from <b>@minishopnuckbot</b>.</span>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={() => {
              onClose();
              onOpenOrders();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <span>{t('view_orders_btn')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-xs text-slate-300 hover:text-white active:scale-95 transition-all"
          >
            {t('continue_shopping_btn')}
          </button>
        </div>
      </div>
    </div>
  );
}
