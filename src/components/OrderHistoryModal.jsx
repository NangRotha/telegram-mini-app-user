import React, { useEffect, useState, useCallback } from 'react';
import {
  X,
  ArrowLeft,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  MapPin,
  Phone,
  Calendar,
  QrCode,
} from 'lucide-react';
import { getUserOrders } from '../services/api';
import { useRealtime } from '../hooks/useRealtime';
import { useLanguage } from '../context/LanguageContext';

export function OrderHistoryModal({ isOpen, onClose, telegramId, haptic, onExploreProducts, onPayKhqr }) {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedOrderNumber, setCopiedOrderNumber] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const loadOrders = useCallback(async (silent = false) => {
    if (!telegramId) return;
    if (!silent) setLoading(true);
    try {
      const data = await getUserOrders(telegramId);
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [telegramId]);

  useEffect(() => {
    if (isOpen) {
      loadOrders();
    }
  }, [isOpen, loadOrders]);

  // Real-time synchronization for customer order status
  useRealtime(
    useCallback(
      (event) => {
        if (event.type === 'ORDER_STATUS_UPDATED' || event.type === 'ORDER_CREATED') {
          if (!event.data?.user_id || event.data.user_id === telegramId) {
            loadOrders(true);
          }
        }
      },
      [telegramId, loadOrders]
    )
  );

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

  if (!isOpen) return null;

  const handleCopy = (orderNumber) => {
    haptic?.notification?.('success');
    navigator.clipboard?.writeText(orderNumber);
    setCopiedOrderNumber(orderNumber);
    setTimeout(() => setCopiedOrderNumber(''), 1500);
  };

  const filteredOrders = orders.filter((order) => {
    if (activeFilter === 'all') return true;
    return order.status?.toLowerCase() === activeFilter;
  });

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <CheckCircle2 className="w-3 h-3" /> {t('status_confirmed')}
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Truck className="w-3 h-3" /> {t('status_shipped')}
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> {t('status_delivered')}
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <AlertCircle className="w-3 h-3" /> {t('status_cancelled')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3" /> {t('status_pending')}
          </span>
        );
    }
  };

  const renderTrackingSteps = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'cancelled') return null;

    const steps = [
      { id: 'pending', label: t('status_pending') },
      { id: 'confirmed', label: t('status_confirmed') },
      { id: 'shipped', label: t('status_shipped') },
      { id: 'delivered', label: t('status_delivered') },
    ];

    const currentIdx =
      s === 'delivered' ? 3 : s === 'shipped' ? 2 : s === 'confirmed' ? 1 : 0;

    return (
      <div className="py-2 px-1">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-3 right-3 top-2.5 h-0.5 bg-slate-800 -z-0" />
          <div
            className="absolute left-3 top-2.5 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 -z-0"
            style={{ width: `${(currentIdx / (steps.length - 1)) * 88}%` }}
          />

          {steps.map((step, idx) => {
            const isDone = idx <= currentIdx;
            const isCurrent = idx === currentIdx;

            return (
              <div key={step.id} className="flex flex-col items-center z-10">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black transition-all ${
                    isDone
                      ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-500/30'
                      : 'bg-slate-800 text-slate-500'
                  } ${isCurrent ? 'scale-110 shadow-lg shadow-emerald-500/40' : ''}`}
                >
                  {isDone ? '✓' : idx + 1}
                </div>
                <span
                  className={`text-[9px] mt-1 font-semibold truncate max-w-[60px] ${
                    isCurrent
                      ? 'text-emerald-400 font-bold'
                      : isDone
                      ? 'text-slate-300'
                      : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col animate-in slide-in-from-bottom duration-250 select-none">
      {/* Top Mobile Header */}
      <header className="px-4 py-3 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 flex items-center justify-between shrink-0 z-20 pt-safe">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/10 shadow transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('close')}</span>
        </button>

        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-indigo-400" />
          <h1 className="text-sm font-bold text-white">{t('order_history_title')}</h1>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {orders.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => loadOrders()}
            className="p-2 rounded-full bg-slate-800/80 text-slate-300 hover:text-white border border-white/10 active:scale-90"
            title={t('refresh_orders')}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
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

      {/* Filter Tabs */}
      <div className="px-4 py-2 bg-slate-900/40 border-b border-slate-800/60 flex items-center gap-1.5 overflow-x-auto scroll-touch shrink-0">
        {[
          { id: 'all', label: t('all_items') },
          { id: 'pending', label: t('status_pending') },
          { id: 'confirmed', label: t('status_confirmed') },
          { id: 'shipped', label: t('status_shipped') },
          { id: 'delivered', label: t('status_delivered') },
        ].map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                haptic?.selection?.();
                setActiveFilter(tab.id);
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800/70 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Orders List */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3.5 max-w-md mx-auto w-full scroll-touch">
        {loading ? (
          <div className="py-24 text-center space-y-3 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-400" />
            <p className="text-xs">{t('loading_catalog')}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
              <Package className="w-8 h-8" />
            </div>
            <h2 className="text-sm font-bold text-white">{t('no_orders_title')}</h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              {t('no_orders_subtitle')}
            </p>
            {onExploreProducts && (
              <button
                onClick={() => {
                  onClose();
                  onExploreProducts();
                }}
                className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
              >
                {t('start_browsing')}
              </button>
            )}
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isCopied = copiedOrderNumber === order.order_number;
            const hasDiscount = (order.discount_amount || 0) > 0;

            return (
              <div
                key={order.id}
                className="p-4 rounded-3xl bg-slate-900 border border-slate-800/90 shadow-xl space-y-3 transition-all hover:border-slate-700"
              >
                {/* Order Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-black text-indigo-300">
                        {order.order_number}
                      </span>
                      <button
                        onClick={() => handleCopy(order.order_number)}
                        className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                        title="Copy order number"
                      >
                        {isCopied ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>
                        {new Date(order.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {getStatusBadge(order.status)}
                    {order.payment_status === 'paid' ? (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {t('paid_badge')}
                      </span>
                    ) : order.payment_method === 'khqr' ? (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        KHQR {t('unpaid_badge')}
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Progress Tracking Timeline */}
                {renderTrackingSteps(order.status)}

                {/* Ordered Items */}
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {t('items_count_label', { count: order.items?.length || 0 })}
                  </span>
                  <div className="space-y-1.5">
                    {order.items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center text-xs text-slate-300 py-0.5"
                      >
                        <div className="flex items-center gap-2 truncate max-w-[220px]">
                          {item.selected_image && (
                            <img
                              src={item.selected_image}
                              alt=""
                              className="w-6 h-6 rounded-md object-cover bg-slate-900 border border-slate-700 shrink-0"
                            />
                          )}
                          <div className="truncate">
                            <span className="text-white font-medium">{item.product_title}</span>
                            {item.variant_name && (
                              <span className="ml-1.5 px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-bold border border-indigo-500/30">
                                {item.variant_name}
                              </span>
                            )}
                            <span className="text-slate-500 ml-1.5 font-bold">x{item.quantity}</span>
                          </div>
                        </div>
                        <span className="font-bold text-slate-200 shrink-0">
                          ${item.subtotal.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery destination summary */}
                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{order.delivery_address}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{order.customer_phone} ({order.customer_name})</span>
                  </div>
                </div>

                {/* Cost Breakdown & Total */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    <span>{t('total_paid')}: </span>
                    <span className="text-base font-extrabold text-emerald-400">
                      ${order.total_amount.toFixed(2)}
                    </span>
                  </div>

                  {hasDiscount && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      -${order.discount_amount.toFixed(2)} saved
                    </span>
                  )}

                  {order.payment_method === 'khqr' && order.payment_status !== 'paid' && order.status !== 'cancelled' && (
                    <button
                      type="button"
                      onClick={() => {
                        haptic?.impact?.('medium');
                        if (onPayKhqr) onPayKhqr(order);
                      }}
                      className="ml-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-600/20 active:scale-95 transition-all"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>{t('khqr_pay_now')}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}
