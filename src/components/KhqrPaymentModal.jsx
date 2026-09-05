import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Clock,
  ExternalLink,
  ShieldCheck,
  Loader2,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { getKhqrPayment, checkPaymentStatus } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useTelegram } from '../hooks/useTelegram';

export function KhqrPaymentModal({
  isOpen,
  onClose,
  order,
  onPaymentSuccess,
}) {
  const { t } = useLanguage();
  const { haptic } = useTelegram();

  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState(null);
  const [error, setError] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown

  const pollIntervalRef = useRef(null);

  // Prevent background scrolling
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

  // Load ABA Pay / KHQR details when modal opens
  useEffect(() => {
    if (!isOpen || !order) return;

    let isMounted = true;
    setLoading(true);
    setError(null);
    setIsPaid(order.payment_status === 'paid');
    setTimeLeft(300);

    async function fetchQr() {
      try {
        const data = await getKhqrPayment(order.order_number);
        if (isMounted) {
          setQrData(data);
          if (data.paid || data.payment_status === 'paid') {
            setIsPaid(true);
            setTimeout(() => {
              if (onPaymentSuccess) onPaymentSuccess(order);
            }, 1200);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load ABA Pay / KHQR code');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchQr();

    return () => {
      isMounted = false;
    };
  }, [isOpen, order?.order_number]);

  // Periodic polling for auto-payment detection every 2.5s (via ABA Pay check-transv2)
  useEffect(() => {
    if (!isOpen || !order || isPaid) {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      return;
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await checkPaymentStatus(order.order_number);
        if (res.paid) {
          handleSuccessPayment();
        }
      } catch (err) {
        // Silent polling
      }
    }, 2500);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isOpen, order?.order_number, isPaid]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || isPaid || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, isPaid, timeLeft]);

  const handleSuccessPayment = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setIsPaid(true);
    haptic.notification('success');

    // Auto-transition to order success after celebration
    setTimeout(() => {
      if (onPaymentSuccess) {
        onPaymentSuccess({ ...order, payment_status: 'paid', status: 'confirmed' });
      }
    }, 1600);
  };

  const handleOpenAbaMobile = () => {
    const url = qrData?.checkout_url || qrData?.aba_deeplink;
    if (!url) return;
    haptic.impact('medium');
    if (window.Telegram?.WebApp?.openLink) {
      window.Telegram.WebApp.openLink(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const handleManualCheck = async () => {
    if (!order?.order_number || isVerifying || isPaid) return;
    setIsVerifying(true);
    haptic.selection();
    try {
      const res = await checkPaymentStatus(order.order_number);
      if (res.paid) {
        handleSuccessPayment();
      } else {
        haptic.notification('warning');
      }
    } catch (err) {
      haptic.notification('error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopyString = () => {
    const stringToCopy = qrData?.qr || order.order_number;
    navigator.clipboard.writeText(stringToCopy);
    setCopied(true);
    haptic.impact('light');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen || !order) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPaid) onClose();
      }}
    >
      <div
        className="relative w-full sm:max-w-md max-h-[95vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-slate-900 border-t sm:border border-slate-800 text-white shadow-2xl overflow-hidden select-none animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ABA Pay & KHQR Premium Header Bar */}
        <div className="bg-gradient-to-r from-[#003954] via-[#004f71] to-[#e1251b] px-5 py-3.5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 rounded-md bg-[#00283b] text-[#00b4d8] font-black text-xs tracking-wide border border-[#00b4d8]/30 flex items-center gap-1 shadow-sm">
              <span>ABA Pay</span>
            </div>
            <div className="px-2 py-0.5 rounded-md bg-white text-red-600 font-black text-xs tracking-wider shadow-sm">
              KHQR
            </div>
            <div className="text-xs font-bold text-white/95 truncate">
              {t('khqr_title')}
            </div>
          </div>

          {!isPaid && (
            <button
              onClick={onClose}
              className="p-1 rounded-full text-white/80 hover:text-white hover:bg-black/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5 scroll-touch text-center">
          {isPaid ? (
            /* Instant Payment Success Celebration Screen */
            <div className="py-8 space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shadow-xl shadow-emerald-500/20 animate-bounce">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-white">
                  {t('khqr_success_title')}
                </h3>
                <p className="text-xs text-emerald-400 font-medium">
                  {t('khqr_success_subtitle')}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 max-w-xs mx-auto text-left space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Order:</span>
                  <span className="font-mono font-bold text-slate-200">{order.order_number}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Amount:</span>
                  <span className="font-bold text-emerald-400 text-sm">${order.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Merchant:</span>
                  <span className="font-medium text-slate-300">NANG ROTHA (ABA)</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Status:</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> PAID
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Live ABA Pay & KHQR Scan & Pay Canvas */
            <>
              {/* Order Amount & Timer */}
              <div className="space-y-1">
                <div className="text-3xl font-black tracking-tight text-white flex items-center justify-center gap-1">
                  <span className="text-emerald-400">$</span>
                  <span>{order.total_amount.toFixed(2)}</span>
                  <span className="text-xs font-bold text-slate-400 ml-1 uppercase">USD</span>
                </div>

                <div className="flex items-center justify-center gap-3 text-xs">
                  <span className="text-slate-400 font-medium">
                    {t('aba_merchant_label')}
                  </span>
                  <span className="text-slate-600">•</span>
                  <div className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-mono font-bold text-amber-400">{formattedTime}</span>
                  </div>
                </div>
              </div>

              {/* 1-Tap Payment Button for ABA Mobile Users */}
              <button
                type="button"
                onClick={handleOpenAbaMobile}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#005a84] to-[#003954] hover:from-[#00699b] hover:to-[#004769] border border-[#00b4d8]/40 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#004f71]/30 active:scale-98 transition-all"
              >
                <Smartphone className="w-4 h-4 text-[#00b4d8]" />
                <span className="font-black text-sm tracking-wide">{t('aba_open_btn')}</span>
                <ExternalLink className="w-3.5 h-3.5 text-white/70 ml-1" />
              </button>

              {/* QR Code Presentation Card */}
              <div className="relative mx-auto w-64 max-w-full p-4 rounded-2xl bg-white shadow-2xl border-4 border-[#004f71] flex flex-col items-center justify-center aspect-square">
                {/* Header ribbon on QR card */}
                <div className="absolute top-2 left-3 right-3 flex items-center justify-between border-b pb-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-black text-[#004f71] tracking-wider">ABA Pay</span>
                    <span className="text-[9px] text-slate-400">|</span>
                    <span className="text-[9px] font-black text-red-600">KHQR</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-700 truncate max-w-[130px]">
                    NANG ROTHA
                  </span>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-10">
                    <Loader2 className="w-8 h-8 text-[#004f71] animate-spin" />
                    <span className="text-xs text-slate-600 font-medium">Generating ABA QR...</span>
                  </div>
                ) : error ? (
                  <div className="text-center p-2 text-xs text-rose-600 font-medium">
                    {error}
                  </div>
                ) : (
                  <div className="relative mt-3 flex items-center justify-center">
                    <img
                      src={qrData?.qr_url || `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${order.order_number}`}
                      alt="ABA Pay KHQR Code"
                      className="w-48 h-48 object-contain rounded-lg"
                    />
                    {/* Centered ABA / KHQR branding emblem */}
                    <div className="absolute inset-0 m-auto w-10 h-10 bg-white rounded-lg p-1 shadow-md border border-slate-200 flex items-center justify-center">
                      <div className="w-full h-full rounded bg-[#004f71] text-white font-black text-[8px] flex items-center justify-center">
                        ABA
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer on QR card */}
                <div className="absolute bottom-2 text-[9px] text-slate-400 font-mono tracking-tight">
                  {order.order_number}
                </div>
              </div>

              {/* Supported Cambodian Bank Logos Pill Strip */}
              <div className="space-y-1.5">
                <div className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                  <span>{t('khqr_subtitle')}</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 flex-wrap text-[10px] font-bold text-slate-300">
                  <span className="px-2 py-0.5 rounded-md bg-[#003954] border border-[#00b4d8]/40 text-[#00b4d8]">
                    ★ ABA Mobile
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-emerald-400">
                    Wing
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-blue-400">
                    ACLEDA
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-amber-400">
                    Bakong
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-purple-400">
                    Canadia
                  </span>
                </div>
              </div>

              {/* Live Status Detector Bar */}
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-slate-300 font-medium text-[11px]">
                    {t('khqr_waiting')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleManualCheck}
                  disabled={isVerifying}
                  className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isVerifying ? 'animate-spin' : ''}`} />
                  <span>{t('khqr_check_now')}</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={handleCopyString}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">{t('khqr_copied')}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-400" />
                      <span>{t('khqr_copy_string')}</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
