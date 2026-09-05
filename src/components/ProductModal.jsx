import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Heart,
  Share2,
  Film,
  Star,
  CheckCircle2,
  Check,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function ProductModal({
  product,
  onClose,
  onAddToCart,
  initialQuantity = 1,
  isFavorite = false,
  onToggleFavorite,
  onShare,
  haptic,
}) {
  const { t } = useLanguage();
  const [qty, setQty] = useState(initialQuantity || 1);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  // Prevent background page from scrolling when product modal is open
  useEffect(() => {
    if (!product) return;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [product]);

  // Combine video (FIRST) and images into a single gallery list
  const mediaList = useMemo(() => {
    if (!product) return [];
    const list = [];
    if (product.video_url && product.video_url.trim()) {
      list.push({ type: 'video', url: product.video_url.trim() });
    }
    if (product.image_url) {
      list.push({ type: 'image', url: product.image_url });
    }
    if (Array.isArray(product.sub_images)) {
      product.sub_images.filter(Boolean).forEach((img) => {
        list.push({ type: 'image', url: img });
      });
    }
    return list;
  }, [product]);

  // List of selectable image types / variants
  const imageTypes = useMemo(() => {
    if (!product) return [];
    const types = [];
    if (product.image_url) {
      types.push({
        id: 'main',
        label: `${t('type_option')} #1`,
        title: t('default_type'),
        url: product.image_url,
      });
    }
    if (Array.isArray(product.sub_images)) {
      product.sub_images.filter(Boolean).forEach((img) => {
        types.push({
          id: `sub_${types.length}`,
          label: `${t('type_option')} #${types.length + 1}`,
          title: `${t('type_option')} #${types.length + 1}`,
          url: img,
        });
      });
    }
    return types;
  }, [product, t]);

  const [selectedVariantId, setSelectedVariantId] = useState('main');

  useEffect(() => {
    setSelectedVariantId('main');
  }, [product?.id]);

  const selectedVariant = useMemo(() => {
    return imageTypes.find((item) => item.id === selectedVariantId) || imageTypes[0] || null;
  }, [imageTypes, selectedVariantId]);

  const handleSelectVariant = (variant) => {
    haptic?.selection?.();
    setSelectedVariantId(variant.id);
    const mediaIdx = mediaList.findIndex((m) => m.type === 'image' && m.url === variant.url);
    if (mediaIdx !== -1) {
      setActiveMediaIndex(mediaIdx);
    }
  };

  useEffect(() => {
    setActiveMediaIndex(0);
    setQty(initialQuantity || 1);
    setIsMuted(true);
  }, [product?.id, initialQuantity]);

  // Auto-play video whenever it becomes active
  useEffect(() => {
    const currentMedia = mediaList[activeMediaIndex] || mediaList[0];
    if (currentMedia?.type === 'video' && videoRef.current) {
      const vid = videoRef.current;
      vid.muted = isMuted;
      vid.defaultMuted = true;
      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.log('Video autoplay deferred:', err);
        });
      }
    }
  }, [activeMediaIndex, mediaList, isMuted, product?.id]);

  if (!product) return null;

  const isOutOfStock = product.stock <= 0;
  const maxQty = product.stock || 1;
  const activeMedia = mediaList[activeMediaIndex] || mediaList[0];

  const handleIncrement = () => {
    haptic?.selection?.();
    if (qty < maxQty) setQty((prev) => prev + 1);
  };

  const handleDecrement = () => {
    haptic?.selection?.();
    if (qty > 1) setQty((prev) => prev - 1);
  };

  const handleAdd = () => {
    if (!isOutOfStock) {
      haptic?.notification?.('success');
      const chosen = selectedVariant || imageTypes[0];
      onAddToCart(product, qty, {
        variant_id: chosen?.id || 'main',
        variant_name: imageTypes.length > 1 ? chosen?.label || `${t('type_option')} #1` : '',
        selected_image: chosen?.url || product.image_url,
      });
      onClose();
    }
  };

  const handleSelectMedia = (idx) => {
    haptic?.selection?.();
    setActiveMediaIndex(idx);
    const media = mediaList[idx];
    if (media?.type === 'image') {
      const match = imageTypes.find((t) => t.url === media.url);
      if (match) setSelectedVariantId(match.id);
    }
  };

  const prevMedia = (e) => {
    e.stopPropagation();
    haptic?.selection?.();
    setActiveMediaIndex((prev) => {
      const newIdx = prev > 0 ? prev - 1 : mediaList.length - 1;
      const media = mediaList[newIdx];
      if (media?.type === 'image') {
        const match = imageTypes.find((t) => t.url === media.url);
        if (match) setSelectedVariantId(match.id);
      }
      return newIdx;
    });
  };

  const nextMedia = (e) => {
    e.stopPropagation();
    haptic?.selection?.();
    setActiveMediaIndex((prev) => {
      const newIdx = prev < mediaList.length - 1 ? prev + 1 : 0;
      const media = mediaList[newIdx];
      if (media?.type === 'image') {
        const match = imageTypes.find((t) => t.url === media.url);
        if (match) setSelectedVariantId(match.id);
      }
      return newIdx;
    });
  };

  const handleShare = () => {
    haptic?.impact?.('light');
    if (onShare) {
      onShare(product);
      return;
    }
    if (navigator.share) {
      navigator
        .share({
          title: product.title,
          text: `Check out ${product.title} on Mini Shop!`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert('Product link copied to clipboard!');
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    haptic?.impact?.('light');
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col animate-in slide-in-from-bottom duration-250 select-none">
      {/* Top Phone App Header */}
      <header className="px-4 py-3 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 flex items-center justify-between shrink-0 z-20 pt-safe">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/10 shadow transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('close')}</span>
        </button>

        {product.category?.name && (
          <span className="text-[11px] font-bold text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/60 truncate max-w-[140px]">
            {product.category.icon} {product.category.name}
          </span>
        )}

        <div className="flex items-center gap-2">
          {onToggleFavorite && (
            <button
              onClick={() => {
                haptic?.impact?.('light');
                onToggleFavorite(product.id);
              }}
              className={`p-2 rounded-full border border-white/10 transition-all active:scale-90 ${
                isFavorite
                  ? 'bg-rose-500/20 text-rose-500 border-rose-500/30'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
              title="Favorite"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>
          )}

          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-slate-800/80 text-slate-300 hover:text-white border border-white/10 active:scale-90"
            title="Share Product"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800/80 text-slate-300 hover:text-white border border-white/10 active:scale-90"
            title={t('close')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Full-Screen Scrollable Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-touch">
        {/* Media Hero Viewer */}
        <div className="relative w-full bg-black aspect-[16/11] sm:aspect-[16/9] max-h-[380px] overflow-hidden group">
          {activeMedia?.type === 'video' ? (
            <div className="relative w-full h-full bg-black flex items-center justify-center">
              <video
                ref={videoRef}
                key={activeMedia.url}
                src={activeMedia.url}
                controls
                autoPlay
                muted={isMuted}
                loop
                playsInline
                preload="auto"
                onCanPlay={(e) => {
                  e.target.muted = isMuted;
                  e.target.play().catch(() => {});
                }}
                className="w-full h-full object-contain bg-black"
              />

              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-violet-600/90 backdrop-blur-md text-[10px] font-extrabold text-white flex items-center gap-1 shadow-lg pointer-events-none z-10">
                <Film className="w-3 h-3" />
                <span>{t('video_badge')}</span>
              </div>

              {/* Floating Mute / Unmute Toggle */}
              <button
                type="button"
                onClick={toggleMute}
                className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/75 hover:bg-black/90 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1.5 border border-white/20 shadow-lg active:scale-90 transition-all z-10"
                title={isMuted ? 'Unmute sound' : 'Mute sound'}
              >
                {isMuted ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                    <span>Unmute</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sound On</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="relative w-full h-full bg-slate-900">
              <img
                src={activeMedia?.url || product.image_url}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
            </div>
          )}

          {/* Carousel Arrows */}
          {mediaList.length > 1 && (
            <>
              <button
                onClick={prevMedia}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-md shadow-lg transition-transform active:scale-90 z-10"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMedia}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-md shadow-lg transition-transform active:scale-90 z-10"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-[10px] font-bold text-white border border-white/10 shadow z-10">
                {activeMediaIndex + 1} / {mediaList.length}
              </div>
            </>
          )}
        </div>

        {/* Thumbnail Strip */}
        {mediaList.length > 1 && (
          <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {mediaList.map((item, idx) => {
              const isActive = activeMediaIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectMedia(idx)}
                  className={`relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    isActive
                      ? 'border-indigo-500 ring-2 ring-indigo-500/30 scale-105'
                      : 'border-slate-800 opacity-60 hover:opacity-100 bg-slate-900'
                  }`}
                >
                  {item.type === 'video' ? (
                    <div className="w-full h-full bg-violet-950/80 flex flex-col items-center justify-center text-violet-300">
                      <Film className="w-4 h-4 mb-0.5" />
                      <span className="text-[8px] font-black tracking-tighter">{t('video_badge')}</span>
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt={`thumb-${idx}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Details Container */}
        <div className="p-4 space-y-4 max-w-md mx-auto">
          {/* Title & Price Card */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                {product.title}
              </h1>
              <div className="text-right shrink-0">
                <span className="text-xl sm:text-2xl font-black text-emerald-400">
                  ${product.price.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Ratings & Stock Badges */}
            <div className="flex items-center gap-2 pt-0.5">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-bold">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>4.9</span>
                <span className="text-slate-400 font-normal">(128)</span>
              </div>

              {isOutOfStock ? (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  {t('sold_out_badge')}
                </span>
              ) : (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {t('in_stock')} ({t('units_available', { count: product.stock })})
                </span>
              )}
            </div>
          </div>

          {/* Sub-Image Types / Variants Selector (if more than 1 image option exists) */}
          {imageTypes.length > 1 && (
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/90 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <span>{t('select_type')}</span>
                </h3>
                <span className="text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  {selectedVariant?.label}
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {imageTypes.map((variant) => {
                  const isSelected = selectedVariantId === variant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => handleSelectVariant(variant)}
                      className={`relative p-1.5 rounded-xl flex flex-col items-center gap-1.5 border transition-all active:scale-95 text-left ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-500/10'
                          : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600 text-slate-400'
                      }`}
                    >
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-slate-950">
                        <img
                          src={variant.url}
                          alt={variant.label}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-md">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-bold truncate w-full text-center ${
                          isSelected ? 'text-white' : 'text-slate-300'
                        }`}
                      >
                        {variant.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t('description_label')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {product.description || 'No description provided.'}
            </p>
          </div>

          {/* Guarantee / Bot Delivery Note */}
          <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex items-center gap-2.5 text-xs text-indigo-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Instant order tracking & live bot updates on Telegram.</span>
          </div>
        </div>
      </main>

      {/* Pinned Bottom Action Bar (Quantity + Add to Cart) */}
      <footer className="p-3 sm:p-4 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 shrink-0 shadow-2xl safe-bottom z-30">
        <div className="max-w-md mx-auto flex items-center gap-3">
          {/* Quantity Stepper */}
          <div className="flex items-center bg-slate-800/90 rounded-2xl border border-slate-700/80 p-1 shrink-0">
            <button
              onClick={handleDecrement}
              disabled={qty <= 1 || isOutOfStock}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 active:scale-90 transition-all"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-sm font-bold text-white">{qty}</span>
            <button
              onClick={handleIncrement}
              disabled={qty >= maxQty || isOutOfStock}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 active:scale-90 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 active:scale-98 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>
              {isOutOfStock
                ? t('sold_out_badge')
                : `${t('add_to_cart')} • $${(product.price * qty).toFixed(2)}`}
            </span>
          </button>
        </div>
      </footer>
    </div>
  );
}
