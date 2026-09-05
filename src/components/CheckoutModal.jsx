import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle,
  ShieldCheck,
  MapPin,
  Phone,
  User,
  FileText,
  Loader2,
  Tag,
  Coins,
  Check,
  QrCode,
} from 'lucide-react';
import { getUserProfile, updateUserProfile, validatePromoCode } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export function CheckoutModal({
  isOpen,
  onClose,
  items,
  user,
  onSubmitOrder,
  isSubmitting,
}) {
  const { t } = useLanguage();

  // Prevent background page scrolling when modal is open
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

  const [customerName, setCustomerName] = useState(
    user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : ''
  );
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod] = useState('khqr'); // Exclusive payment method: ABA Pay / KHQR
  const [saveToProfile, setSaveToProfile] = useState(true);
  const [errors, setErrors] = useState({});

  // Promo code state
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  // Points redemption state
  const [usePoints, setUsePoints] = useState(false);
  const userPoints = user?.points || 100;

  useEffect(() => {
    if (!isOpen || !user?.id) return;
    async function loadSavedProfile() {
      try {
        const profile = await getUserProfile(user.id);
        if (profile) {
          if (profile.first_name) {
            setCustomerName(`${profile.first_name} ${profile.last_name || ''}`.trim());
          }
          if (profile.phone && !phone) setPhone(profile.phone);
          if (profile.default_address && !address) setAddress(profile.default_address);
        }
      } catch (err) {
        // Silently continue if offline
      }
    }
    loadSavedProfile();
  }, [isOpen, user?.id]);

  if (!isOpen) return null;

  const subtotalAmount = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Calculate promo discount
  const promoDiscount = appliedPromo ? appliedPromo.discount_amount : 0.0;
  const remainingAfterPromo = Math.max(0, subtotalAmount - promoDiscount);

  // Calculate points discount (100 pts = $1.00)
  const maxPointsWorth = Math.floor(userPoints / 100);
  const usablePointsWorth = Math.min(maxPointsWorth, Math.floor(remainingAfterPromo));
  const pointsDiscount = usePoints ? usablePointsWorth : 0.0;
  const pointsToRedeem = usePoints ? usablePointsWorth * 100 : 0;

  const finalTotal = Math.max(0, subtotalAmount - promoDiscount - pointsDiscount);
  const pointsToEarn = Math.floor(finalTotal * 10);

  const handleApplyPromo = async (codeToTry = promoInput) => {
    const code = (codeToTry || '').trim().toUpperCase();
    if (!code) {
      setPromoError(t('promo_placeholder'));
      return;
    }
    setIsValidatingPromo(true);
    setPromoError(null);
    try {
      const res = await validatePromoCode(code, subtotalAmount);
      if (res.valid) {
        setAppliedPromo(res);
        setPromoInput(code);
      } else {
        setPromoError(res.message || 'Invalid or expired code');
      }
    } catch (err) {
      setPromoError(err.message || 'Failed to validate voucher');
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!customerName.trim()) newErrors.name = t('error_required_fields');
    if (!phone.trim()) newErrors.phone = t('error_required_fields');
    if (!address.trim()) newErrors.address = t('error_required_fields');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (saveToProfile && user?.id) {
      try {
        await updateUserProfile(user.id, {
          phone: phone.trim(),
          default_address: address.trim(),
        });
      } catch (err) {
        console.warn('Failed to auto-save profile address:', err);
      }
    }

    const orderPayload = {
      telegram_id: user?.id,
      username: user?.username || null,
      customer_name: customerName.trim(),
      customer_phone: phone.trim(),
      delivery_address: address.trim(),
      payment_method: 'khqr',
      notes: `${notes.trim() ? notes.trim() + ' ' : ''}[Pay via ABA Pay / KHQR]`,
      promocode: appliedPromo ? appliedPromo.code : null,
      discount_amount: Number((promoDiscount + pointsDiscount).toFixed(2)),
      points_redeemed: pointsToRedeem,
      items: items.map((i) => ({
        product_id: i.product.id,
        quantity: i.quantity,
      })),
    };

    onSubmitOrder(orderPayload);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full sm:max-w-md max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-slate-900 border-t sm:border border-slate-800 text-white shadow-2xl animate-in slide-in-from-bottom duration-200 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-1.5">
              <span>{t('checkout_title')}</span>
            </h2>
            <p className="text-xs text-slate-400">{t('customer_info')}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 scroll-touch">
          {/* Recipient Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" /> {t('full_name_label')}
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                setErrors((prev) => ({ ...prev, name: null }));
              }}
              placeholder={t('full_name_placeholder')}
              className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            {errors.name && (
              <span className="text-[11px] text-rose-400 mt-1 block">{errors.name}</span>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-indigo-400" /> {t('phone_label')}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setErrors((prev) => ({ ...prev, phone: null }));
              }}
              placeholder={t('phone_placeholder')}
              className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            {errors.phone && (
              <span className="text-[11px] text-rose-400 mt-1 block">{errors.phone}</span>
            )}
          </div>

          {/* Delivery Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" /> {t('delivery_address_label')}
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setErrors((prev) => ({ ...prev, address: null }));
              }}
              placeholder={t('delivery_address_placeholder')}
              className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
            {errors.address && (
              <span className="text-[11px] text-rose-400 mt-1 block">{errors.address}</span>
            )}
          </div>

          {/* Order Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> {t('courier_notes_label')}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('courier_notes_placeholder')}
              className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Payment Method - ABA Pay / KHQR */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">
              {t('payment_method')}
            </label>
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-950/50 to-slate-900 border border-sky-500/40 shadow-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center shrink-0">
                  <QrCode className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">{t('payment_khqr')}</span>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      Bakong KHQR
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {t('payment_khqr_desc')}
                  </p>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Promo Code & Voucher Section */}
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-400" /> {t('promo_section')}
              </span>
              {appliedPromo && (
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <Check className="w-3 h-3" /> {appliedPromo.code} {t('applied_badge')}
                </span>
              )}
            </div>

            {appliedPromo ? (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-700/50">
                <div>
                  <div className="text-xs font-black text-emerald-300 font-mono">
                    {appliedPromo.code}
                  </div>
                  <div className="text-[11px] text-emerald-400">
                    Saved ${appliedPromo.discount_amount.toFixed(2)} ({appliedPromo.description})
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePromo}
                  className="px-2.5 py-1 text-[11px] font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 rounded-lg hover:bg-rose-500/20 active:scale-95 transition-all"
                >
                  {t('remove_btn')}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => {
                      setPromoInput(e.target.value.toUpperCase());
                      setPromoError(null);
                    }}
                    placeholder={t('promo_placeholder')}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white uppercase placeholder:normal-case placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyPromo()}
                    disabled={isValidatingPromo || !promoInput.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-40 active:scale-95 flex items-center gap-1 shrink-0"
                  >
                    {isValidatingPromo ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      t('apply_btn')
                    )}
                  </button>
                </div>

                {promoError && (
                  <p className="text-[11px] text-rose-400 font-medium">{promoError}</p>
                )}

                {/* Quick Suggestion Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 scroll-touch">
                  <span className="text-[10px] text-slate-400 shrink-0">Try:</span>
                  {['WELCOME10', 'SAVE20', 'MINI5'].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleApplyPromo(chip)}
                      className="px-2 py-0.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/20 active:scale-95 shrink-0"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Loyalty Points Redemption Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-800/60 to-slate-800/60 border border-amber-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{t('loyalty_points')}</h4>
                  <p className="text-[10px] text-slate-400">
                    <strong className="text-amber-400">{userPoints} {t('points_unit')}</strong> ({t('points_worth', { amount: (userPoints / 100).toFixed(2) })})
                  </p>
                </div>
              </div>

              {usablePointsWorth > 0 && (
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={usePoints}
                    onChange={(e) => setUsePoints(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              )}
            </div>

            {usePoints && (
              <div className="text-[11px] text-amber-300/90 bg-amber-950/30 p-2 rounded-xl border border-amber-500/20 flex items-center justify-between">
                <span>{t('points_discount')}:</span>
                <span className="font-bold text-amber-400">-${pointsDiscount.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Order items preview card */}
          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-300">{t('order_summary')}</h4>
            <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1 scroll-touch">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between text-[11px] text-slate-400">
                  <span className="truncate max-w-[200px]">
                    {product.title} <strong className="text-slate-200">x{quantity}</strong>
                  </span>
                  <span className="text-slate-200 font-semibold">
                    ${(product.price * quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-700/60 space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>{t('cart_subtotal')}</span>
                <span>${subtotalAmount.toFixed(2)}</span>
              </div>

              {promoDiscount > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>{t('promo_discount')} ({appliedPromo?.code})</span>
                  <span>-${promoDiscount.toFixed(2)}</span>
                </div>
              )}

              {pointsDiscount > 0 && (
                <div className="flex justify-between text-amber-400 font-medium">
                  <span>{t('points_discount')} ({pointsToRedeem} {t('points_unit')})</span>
                  <span>-${pointsDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400">
                <span>{t('delivery_fee')}</span>
                <span className="text-emerald-400 font-semibold">{t('free_badge')}</span>
              </div>

              <div className="pt-1.5 border-t border-slate-700/80 flex justify-between font-bold text-white text-sm">
                <span>{t('final_total')}</span>
                <span className="text-emerald-400 font-black">${finalTotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-end text-[10px] text-indigo-400 font-semibold pt-0.5">
                {t('earn_points_banner', { points: pointsToEarn })}
              </div>
            </div>
          </div>

          {/* Telegram notification note */}
          <div className="flex items-center gap-2 text-[11px] text-sky-300/90 bg-sky-950/40 p-2.5 rounded-xl border border-sky-800/50">
            <ShieldCheck className="w-4 h-4 shrink-0 text-sky-400" />
            <span>Instant order receipt & bot notification will be sent to your Telegram chat.</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('placing_order')}</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>{t('place_order_btn', { amount: finalTotal.toFixed(2) })}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
