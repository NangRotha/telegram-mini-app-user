import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Send,
  MessageCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function ShareProductModal({ product, onClose, storeName = 'Mini Shop', haptic }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!product) return null;

  // Build deep link for this product
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const shareUrl = `${origin}${pathname}?product=${product.id}`;
  const shareText = `Check out "${product.title}" for $${product.price.toFixed(2)} on ${storeName}! 🛍✨`;

  const handleCopyLink = () => {
    haptic?.selection?.();
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    haptic?.selection?.();
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleShareTo = (platform) => {
    haptic?.selection?.();
    let url = '';
    if (platform === 'telegram') {
      url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    } else if (platform === 'whatsapp') {
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`;
    } else if (platform === 'facebook') {
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    } else if (platform === 'twitter') {
      url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    }

    if (url) {
      if (window.Telegram?.WebApp?.openLink) {
        window.Telegram.WebApp.openLink(url);
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-gradient-to-r from-indigo-500/10 to-transparent">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Share Product</h3>
              <span className="text-[11px] text-slate-400">Share with friends & on social media</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Product Mini Preview Card */}
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-slate-700/40">
              <img
                src={product.image_url}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-xs text-white truncate leading-tight">
                {product.title}
              </h4>
              <div className="text-emerald-400 font-bold text-sm mt-0.5">
                ${product.price.toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-400 truncate block">
                {storeName}
              </span>
            </div>
          </div>

          {/* Social Channels Grid */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-2">
              Select Platform
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {/* Telegram */}
              <button
                onClick={() => handleShareTo('telegram')}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 active:scale-95 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white shadow-md shadow-sky-500/30">
                  <Send className="w-5 h-5 -translate-x-0.5 translate-y-0.5" />
                </div>
                <span className="text-[11px] font-bold text-white">Telegram</span>
              </button>

              {/* WhatsApp */}
              <button
                onClick={() => handleShareTo('whatsapp')}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 active:scale-95 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/30">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-white">WhatsApp</span>
              </button>

              {/* Facebook */}
              <button
                onClick={() => handleShareTo('facebook')}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 active:scale-95 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30 font-bold text-lg font-serif">
                  f
                </div>
                <span className="text-[11px] font-bold text-white">Facebook</span>
              </button>

              {/* Twitter / X */}
              <button
                onClick={() => handleShareTo('twitter')}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-300 active:scale-95 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-black border border-slate-700 flex items-center justify-center text-white font-bold text-base">
                  𝕏
                </div>
                <span className="text-[11px] font-bold text-white">X / Twitter</span>
              </button>
            </div>
          </div>

          {/* Direct Copy Link */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-[11px] font-semibold text-slate-400">
              Product Link
            </label>
            <div className="flex items-center gap-2 p-1.5 pl-3 rounded-xl bg-slate-800/90 border border-slate-700">
              <span className="text-xs text-slate-400 font-mono truncate flex-1 select-all">
                {shareUrl}
              </span>
              <button
                onClick={handleCopyLink}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  copied
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Native Share button (if on mobile/tablet) */}
          {typeof navigator !== 'undefined' && navigator.share && (
            <button
              onClick={handleNativeShare}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
              <span>More Share Options (Device)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
