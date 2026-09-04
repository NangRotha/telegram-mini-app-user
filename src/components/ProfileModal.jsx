import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Phone,
  MapPin,
  AtSign,
  Check,
  Loader2,
  ShieldCheck,
  Camera,
  ArrowLeft,
  Coins,
  Award,
  Package,
  Tag,
  Languages,
} from 'lucide-react';
import { getUserProfile, updateUserProfile, uploadUserAvatar } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export function ProfileModal({
  isOpen,
  onClose,
  user,
  onProfileUpdated,
  onOpenOrders,
  onOpenPromos,
  haptic,
}) {
  const { lang, setLang, t } = useLanguage();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [defaultAddress, setDefaultAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [points, setPoints] = useState(100);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  const avatarInputRef = useRef(null);

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

  useEffect(() => {
    if (!isOpen || !user?.id) return;

    let isMounted = true;
    async function fetchProfile() {
      setLoading(true);
      setError(null);
      try {
        const data = await getUserProfile(user.id);
        if (!isMounted) return;

        setFirstName(data.first_name || user.first_name || '');
        setLastName(data.last_name || user.last_name || '');
        setUsername(data.username || user.username || '');
        setPhone(data.phone || '');
        setDefaultAddress(data.default_address || '');
        setAvatarUrl(data.avatar_url || user.photo_url || '');
        setPoints(typeof data.points === 'number' ? data.points : 100);
      } catch (err) {
        if (!isMounted) return;
        setFirstName(user.first_name || '');
        setLastName(user.last_name || '');
        setUsername(user.username || '');
        setAvatarUrl(user.photo_url || '');
        setPoints(100);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setUploadingAvatar(true);
    haptic?.impact?.('light');

    try {
      const updatedUser = await uploadUserAvatar(user.id, file);
      setAvatarUrl(updatedUser.avatar_url);
      haptic?.notification?.('success');
      if (onProfileUpdated) {
        onProfileUpdated(updatedUser);
      }
    } catch (err) {
      alert(`Avatar upload failed: ${err.message}`);
      haptic?.notification?.('error');
    } finally {
      setUploadingAvatar(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return;

    setSaving(true);
    setError(null);
    haptic?.impact?.('medium');

    try {
      const updated = await updateUserProfile(user.id, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        username: username.trim().replace(/^@/, ''),
        phone: phone.trim(),
        default_address: defaultAddress.trim(),
        avatar_url: avatarUrl,
      });

      haptic?.notification?.('success');
      setSaveSuccess(true);
      if (onProfileUpdated) {
        onProfileUpdated(updated);
      }
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 900);
    } catch (err) {
      haptic?.notification?.('error');
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col animate-in slide-in-from-bottom duration-250 select-none">
      {/* Top Mobile App Header */}
      <header className="px-4 py-3 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 flex items-center justify-between shrink-0 z-20 pt-safe">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/10 shadow transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('close')}</span>
        </button>

        <h1 className="text-sm font-bold text-white">{t('profile_title')}</h1>

        <button
          onClick={onClose}
          className="p-2 rounded-full bg-slate-800/80 text-slate-300 hover:text-white border border-white/10 active:scale-90"
          title={t('close')}
        >
          <X className="w-4 h-4" />
        </button>
      </header>

      {/* Main Full-Screen Body */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 max-w-md mx-auto w-full scroll-touch">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            <span className="text-xs">Loading profile from Telegram account...</span>
          </div>
        ) : (
          <>
            {/* User Avatar & Identity Card */}
            <div className="relative p-5 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 text-center shadow-xl space-y-3">
              <div className="relative inline-block mx-auto">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-tr from-emerald-500 to-indigo-600 p-0.5 shadow-xl ring-4 ring-slate-800/80">
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 flex items-center justify-center">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Profile Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-black text-white">
                        {(firstName?.[0] || user?.first_name?.[0] || 'U').toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg border-2 border-slate-900 active:scale-90 transition-transform"
                  title="Upload profile picture"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />
              </div>

              <div>
                <h2 className="text-base font-extrabold text-white flex items-center justify-center gap-1.5">
                  <span>{firstName || user?.first_name || t('guest_user')}</span>
                  {lastName ? <span>{lastName}</span> : null}
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  @{username || user?.username || 'telegram_user'} · ID: #{user?.id}
                </p>
                <p className="text-[11px] text-emerald-400 font-semibold mt-1">
                  ✓ Auto-synced with Telegram
                </p>
              </div>
            </div>

            {/* Language Setting Selector Card */}
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-md space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Languages className="w-4 h-4 text-indigo-400" />
                <span>{t('language_setting_title')}</span>
              </div>
              <p className="text-[11px] text-slate-400">{t('select_language')}</p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    haptic?.selection?.();
                    setLang('km');
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-95 ${
                    lang === 'km'
                      ? 'bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500/50'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">🇰🇭</span>
                    <div>
                      <div className="text-xs font-bold">ភាសាខ្មែរ</div>
                      <div className="text-[10px] text-slate-400">Khmer</div>
                    </div>
                  </div>
                  {lang === 'km' && <Check className="w-4 h-4 text-indigo-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    haptic?.selection?.();
                    setLang('en');
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-95 ${
                    lang === 'en'
                      ? 'bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500/50'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">🇬🇧</span>
                    <div>
                      <div className="text-xs font-bold">English</div>
                      <div className="text-[10px] text-slate-400">English</div>
                    </div>
                  </div>
                  {lang === 'en' && <Check className="w-4 h-4 text-indigo-400" />}
                </button>
              </div>
            </div>

            {/* Loyalty Rewards & Points Wallet Card */}
            <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/20 via-emerald-500/10 to-indigo-500/20 border border-amber-500/30 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>{t('points_profile_title')}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-extrabold text-[10px] border border-amber-400/30 flex items-center gap-1">
                  <Award className="w-3 h-3" /> VIP Member
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-3xl font-black text-white">{points}</span>
                  <span className="text-xs font-bold text-amber-400 ml-1.5">{t('points_unit')}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">{t('points_worth', { amount: (points / 100).toFixed(2) })}</span>
                  <span className="text-base font-extrabold text-emerald-400">
                    ${(points / 100).toFixed(2)} USD
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-white/5 space-y-1">
                <p className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                  <span>●</span> {t('points_profile_desc')}
                </p>
              </div>
            </div>

            {/* Quick Access: My Orders & Vouchers */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  haptic?.impact?.('light');
                  onClose();
                  onOpenOrders?.();
                }}
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center gap-2.5 text-left transition-all active:scale-95 shadow-md group"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20">
                  <Package className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">{t('orders_tooltip')}</span>
                  <span className="text-[10px] text-slate-400 block truncate">Track deliveries</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  haptic?.impact?.('light');
                  onClose();
                  onOpenPromos?.();
                }}
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center gap-2.5 text-left transition-all active:scale-95 shadow-md group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20">
                  <Tag className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">{t('vouchers_tooltip')}</span>
                  <span className="text-[10px] text-slate-400 block truncate">Promo discounts</span>
                </div>
              </button>
            </div>

            {/* Edit Profile Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                {t('customer_info')}
              </h3>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    {t('full_name_label')}
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-emerald-500 outline-none"
                    placeholder="First Name"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-emerald-500 outline-none"
                    placeholder="Last Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  {t('telegram_username_label')}
                </label>
                <div className="relative">
                  <AtSign className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-emerald-500 outline-none"
                    placeholder="username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  {t('phone_profile')}
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-emerald-500 outline-none"
                    placeholder="012 345 678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  {t('address_profile')}
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                  <textarea
                    rows={2}
                    value={defaultAddress}
                    onChange={(e) => setDefaultAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-emerald-500 outline-none resize-none"
                    placeholder="Street, Sangkat, Khan / City..."
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
                  {error}
                </div>
              )}

              {/* Save Button */}
              <button
                type="submit"
                disabled={saving}
                className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl transition-all active:scale-98 ${
                  saveSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
                }`}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('saving_btn')}</span>
                  </>
                ) : saveSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{t('save_profile_btn')}</span>
                  </>
                ) : (
                  <span>{t('save_profile_btn')}</span>
                )}
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
