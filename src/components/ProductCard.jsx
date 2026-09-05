import React from 'react';
import { Plus, Star, Film, Heart, Share2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function ProductCard({
  product,
  onSelect,
  onAddToCart,
  cartQuantity,
  isFavorite = false,
  onToggleFavorite,
  onShare,
}) {
  const { t } = useLanguage();
  const isOutOfStock = product.stock <= 0;

  return (
    <div
      onClick={() => onSelect(product)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-indigo-500/40 transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-md select-none"
    >
      {/* Image & Badges */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-800">
        <img
          src={product.image_url}
          alt={product.title}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Featured Badge */}
        {product.is_featured && (
          <span className="absolute top-2 left-2 flex items-center gap-1 rounded-lg bg-indigo-600/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white shadow-sm border border-indigo-400/30">
            <Star className="w-2.5 h-2.5 fill-white" />
            <span>{t('featured_badge')}</span>
          </span>
        )}

        {/* Video Badge */}
        {product.video_url && (
          <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-lg bg-violet-600/90 backdrop-blur-md px-1.5 py-0.5 text-[9px] font-extrabold text-white shadow-sm border border-violet-400/30">
            <Film className="w-2.5 h-2.5" />
            <span>{t('video_badge')}</span>
          </span>
        )}

        {/* Favorite Button */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(product.id);
            }}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-slate-300 hover:text-white z-10 transition-transform active:scale-90 border border-white/10 shadow-sm"
            title="Favorite"
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        )}

        {/* Share Button */}
        {onShare && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare(product);
            }}
            className={`absolute top-2 p-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-slate-300 hover:text-white z-10 transition-transform active:scale-90 border border-white/10 shadow-sm ${
              onToggleFavorite ? 'right-9' : 'right-2'
            }`}
            title="Share"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Stock Badges */}
        {isOutOfStock ? (
          <span className="absolute bottom-2 right-2 rounded-lg bg-rose-600/95 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white shadow-sm border border-rose-400/30">
            {t('sold_out_badge')}
          </span>
        ) : product.stock < 10 ? (
          <span className="absolute bottom-2 right-2 rounded-lg bg-amber-500/95 backdrop-blur-md px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm border border-amber-300/30">
            {t('only_left_badge', { count: product.stock })}
          </span>
        ) : null}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="text-xs font-semibold text-white line-clamp-2 leading-snug group-hover:text-indigo-300 transition-colors">
            {product.title}
          </h3>
          <p className="mt-1 text-[11px] text-slate-400 line-clamp-1">
            {product.description}
          </p>
        </div>

        {/* Price & Add Button */}
        <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between gap-1">
          <div className="min-w-0">
            <span className="text-slate-400 block -mb-0.5 text-[9px] sm:text-[10px] font-medium">
              {t('price_label')}
            </span>
            <span className="text-xs sm:text-sm font-bold text-emerald-400 truncate block">
              ${product.price.toFixed(2)}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!isOutOfStock) onAddToCart(product);
            }}
            disabled={isOutOfStock}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-all shrink-0 ${
              isOutOfStock
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : cartQuantity > 0
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 active:scale-90'
            }`}
            title={cartQuantity > 0 ? `${cartQuantity} ${t('in_cart_badge')}` : t('add_to_cart')}
          >
            {cartQuantity > 0 ? (
              <span className="text-xs font-bold">{cartQuantity}</span>
            ) : (
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
