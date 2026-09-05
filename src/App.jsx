import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTelegram } from './hooks/useTelegram';
import { useRealtime } from './hooks/useRealtime';
import {
  getCategories,
  getProducts,
  createOrder,
  getUserProfile,
  getActiveAlert,
  getSettings,
} from './services/api';
import { TelegramTopBar } from './components/TelegramTopBar';
import { Header } from './components/Header';
import { Banner } from './components/Banner';
import { SearchBar } from './components/SearchBar';
import { CategoryBar } from './components/CategoryBar';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { ProfileModal } from './components/ProfileModal';
import { PromosModal } from './components/PromosModal';
import { FavoritesModal } from './components/FavoritesModal';
import { KhqrPaymentModal } from './components/KhqrPaymentModal';
import { BottomNavBar } from './components/BottomNavBar';
import { ShareProductModal } from './components/ShareProductModal';
import { AlertPopupModal } from './components/AlertPopupModal';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { useLanguage } from './context/LanguageContext';

export default function App() {
  const { t } = useLanguage();
  const {
    user,
    isTelegram,
    haptic,
    close,
    updateMainButton,
    hideMainButton,
    updateBackButton,
  } = useTelegram();

  // User state that can be augmented with profile data
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    if (user) {
      setCurrentUser((prev) => ({ ...(prev || {}), ...user }));
      // Fetch latest profile from DB
      getUserProfile(user.id)
        .then((profile) => {
          if (profile) {
            setCurrentUser((prev) => ({ ...(prev || {}), ...profile }));
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // Catalog State
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active Bottom Bar Tab ('home' | 'search' | 'favorites' | 'profile')
  const [activeTab, setActiveTab] = useState('home');
  const searchInputRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Phone frame mockup toggle for desktop preview
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);

  // Modals & Drawers
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [shareProduct, setShareProduct] = useState(null);
  const [activeAlert, setActiveAlert] = useState(null);
  const [storeInfo, setStoreInfo] = useState({ store_name: 'Mini Shop', store_logo: '🛍' });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPromosOpen, setIsPromosOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [khqrOrder, setKhqrOrder] = useState(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Cart state with persistence
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('minishop_cart');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed)
        ? parsed.map((item) => ({
            id: item.id || `${item.product?.id || ''}_${item.variant_id || 'main'}`,
            product: item.product,
            quantity: item.quantity,
            selected_image: item.selected_image || item.product?.image_url || '',
            variant_name: item.variant_name || '',
            variant_id: item.variant_id || 'main',
          }))
        : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('minishop_cart', JSON.stringify(cartItems));
    } catch {}
  }, [cartItems]);

  // Favorites state with persistence
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('minishop_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('minishop_favorites', JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  const handleToggleFavorite = (productId) => {
    haptic.selection();
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const favoriteProducts = useMemo(() => {
    return products.filter((p) => favorites.includes(p.id));
  }, [products, favorites]);

  // Load catalog data, active alert, and store settings
  const loadCatalogData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const [cats, prods, alertData, settingsData] = await Promise.all([
        getCategories(),
        getProducts(),
        getActiveAlert(),
        getSettings(),
      ]);
      setCategories(cats);
      setProducts(prods);

      // Keep open modal in-sync with latest real-time product data (price, stock, media)
      setSelectedProduct((curr) => {
        if (!curr) return null;
        const fresh = prods.find((p) => p.id === curr.id);
        return fresh && fresh.is_active ? fresh : null;
      });

      // Keep cart items in-sync with real-time stock and pricing
      setCartItems((currItems) =>
        currItems
          .map((item) => {
            const fresh = prods.find((p) => p.id === item.product.id);
            if (!fresh || !fresh.is_active || fresh.stock <= 0) return null;
            return {
              ...item,
              id: item.id || `${item.product.id}_${item.variant_id || 'main'}`,
              product: fresh,
              quantity: Math.min(item.quantity, fresh.stock),
            };
          })
          .filter(Boolean)
      );

      if (settingsData) setStoreInfo(settingsData);
      if (alertData && alertData.id) {
        const isDismissed = sessionStorage.getItem('dismissed_alert_' + alertData.id);
        if (!isDismissed) {
          setActiveAlert(alertData);
        }
      }
    } catch (err) {
      console.error('Failed to load shop data:', err);
      if (!silent) {
        setError('Could not connect to backend server. Please make sure FastAPI backend is running.');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatalogData();
  }, [loadCatalogData]);

  // Handle Product Deep Linking (?product=123 or Telegram start_param)
  useEffect(() => {
    if (products.length === 0) return;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      let targetProdId = urlParams.get('product');

      if (!targetProdId && window.Telegram?.WebApp?.initDataUnsafe?.start_param) {
        const startParam = window.Telegram.WebApp.initDataUnsafe.start_param;
        if (startParam.startsWith('product_')) {
          targetProdId = startParam.replace('product_', '');
        } else if (/^\d+$/.test(startParam)) {
          targetProdId = startParam;
        }
      }

      if (targetProdId) {
        const found = products.find((p) => String(p.id) === String(targetProdId));
        if (found) {
          setSelectedProduct(found);
        }
      }
    } catch (e) {
      console.warn('Deep link error:', e);
    }
  }, [products]);

  // Real-time synchronization for catalog, profile, settings, and alerts
  useRealtime(
    useCallback(
      (event) => {
        if (event.type === 'PRODUCT_UPDATED') {
          // If a product was deleted, purge immediately from state and close modal if open
          if (event.data?.action === 'delete' && event.data?.product_id) {
            setProducts((prev) => prev.filter((p) => p.id !== event.data.product_id));
            setSelectedProduct((curr) => (curr?.id === event.data.product_id ? null : curr));
          } else if (event.data?.action === 'update' && event.data?.product) {
            // Update product in-place immediately
            const updated = event.data.product;
            setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            setSelectedProduct((curr) => (curr?.id === updated.id ? updated : curr));
          }
          loadCatalogData(true);
        }
        if (event.type === 'CATEGORY_UPDATED') {
          loadCatalogData(true);
        }
        if (event.type === 'PROFILE_UPDATED' && event.data?.id === currentUser?.id) {
          setCurrentUser((prev) => ({ ...(prev || {}), ...event.data }));
        }
        if (event.type === 'SETTINGS_UPDATED') {
          setStoreInfo((prev) => ({ ...prev, ...event.data }));
        }
        if (event.type === 'ALERT_UPDATED') {
          getActiveAlert().then((alertData) => {
            if (alertData && !sessionStorage.getItem('dismissed_alert_' + alertData.id)) {
              setActiveAlert(alertData);
            } else if (!alertData) {
              setActiveAlert(null);
            }
          });
        }
        if (event.type === 'PAYMENT_CONFIRMED' && event.data) {
          if (khqrOrder && khqrOrder.order_number === event.data.order_number) {
            setKhqrOrder(null);
            setConfirmedOrder({ ...khqrOrder, payment_status: 'paid', status: 'confirmed' });
            haptic.notification('success');
          }
        }
      },
      [loadCatalogData, currentUser?.id, khqrOrder, haptic]
    )
  );

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategoryId === null || p.category_id === selectedCategoryId;
      const matchesSearch =
        !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategoryId, searchQuery]);

  const cartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  }, [cartItems]);

  // Cart Handlers
  const handleAddToCart = (product, quantity = 1, variantOption = null) => {
    haptic.impact('light');
    const variantId = variantOption?.variant_id || 'main';
    const variantName = variantOption?.variant_name || '';
    const selectedImage = variantOption?.selected_image || product.image_url || '';
    const itemKey = `${product.id}_${variantId}`;

    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (item) =>
          item.id === itemKey ||
          (item.product.id === product.id && (item.variant_id || 'main') === variantId)
      );
      if (existingIdx !== -1) {
        return prev.map((item, idx) =>
          idx === existingIdx
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        );
      }
      return [
        ...prev,
        {
          id: itemKey,
          product,
          quantity,
          selected_image: selectedImage,
          variant_name: variantName,
          variant_id: variantId,
        },
      ];
    });
  };

  const handleUpdateQuantity = (itemKeyOrProductId, newQty) => {
    haptic.selection();
    if (newQty <= 0) {
      handleRemoveFromCart(itemKeyOrProductId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemKeyOrProductId || item.product.id === itemKeyOrProductId
          ? { ...item, quantity: newQty }
          : item
      )
    );
  };

  const handleRemoveFromCart = (itemKeyOrProductId) => {
    haptic.impact('medium');
    setCartItems((prev) =>
      prev.filter(
        (item) => item.id !== itemKeyOrProductId && item.product.id !== itemKeyOrProductId
      )
    );
  };

  // Tab Selection Handler
  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    if (tab === 'home') {
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'search') {
      setTimeout(() => {
        searchInputRef.current?.focus();
        searchInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    } else if (tab === 'favorites') {
      setIsFavoritesOpen(true);
    } else if (tab === 'profile') {
      setIsProfileOpen(true);
    }
  };

  const hasModalOpen = useMemo(() => {
    return (
      Boolean(selectedProduct) ||
      Boolean(shareProduct) ||
      Boolean(activeAlert) ||
      isCartOpen ||
      isCheckoutOpen ||
      isOrdersOpen ||
      isProfileOpen ||
      isPromosOpen ||
      isFavoritesOpen ||
      Boolean(confirmedOrder) ||
      Boolean(khqrOrder)
    );
  }, [
    selectedProduct,
    shareProduct,
    activeAlert,
    isCartOpen,
    isCheckoutOpen,
    isOrdersOpen,
    isProfileOpen,
    isPromosOpen,
    isFavoritesOpen,
    confirmedOrder,
    khqrOrder,
  ]);

  // Synchronize Telegram BackButton
  useEffect(() => {
    if (hasModalOpen) {
      updateBackButton({
        isVisible: true,
        onClick: () => {
          haptic.impact('light');
          if (shareProduct) {
            setShareProduct(null);
          } else if (activeAlert) {
            setActiveAlert(null);
          } else if (isCheckoutOpen) {
            setIsCheckoutOpen(false);
            setIsCartOpen(true);
          } else if (isCartOpen) {
            setIsCartOpen(false);
          } else if (selectedProduct) {
            setSelectedProduct(null);
          } else if (isFavoritesOpen) {
            setIsFavoritesOpen(false);
            setActiveTab('home');
          } else if (isPromosOpen) {
            setIsPromosOpen(false);
          } else if (isOrdersOpen) {
            setIsOrdersOpen(false);
          } else if (isProfileOpen) {
            setIsProfileOpen(false);
            setActiveTab('home');
          } else if (khqrOrder) {
            setKhqrOrder(null);
            setIsOrdersOpen(true);
          } else if (confirmedOrder) {
            setConfirmedOrder(null);
          }
        },
      });
    } else {
      updateBackButton({ isVisible: false });
    }
  }, [
    hasModalOpen,
    shareProduct,
    activeAlert,
    isCheckoutOpen,
    isCartOpen,
    selectedProduct,
    isFavoritesOpen,
    isPromosOpen,
    isOrdersOpen,
    isProfileOpen,
    confirmedOrder,
    khqrOrder,
    updateBackButton,
    haptic,
  ]);

  // Synchronize Telegram MainButton
  useEffect(() => {
    if (isCheckoutOpen || hasModalOpen) {
      hideMainButton();
    } else if (cartCount > 0) {
      updateMainButton({
        text: t('main_button_cart', { count: cartCount, total: cartTotal.toFixed(2) }),
        onClick: () => {
          haptic.impact('medium');
          setIsCartOpen(true);
        },
        isVisible: true,
      });
    } else {
      hideMainButton();
    }
  }, [
    cartCount,
    cartTotal,
    hasModalOpen,
    isCheckoutOpen,
    updateMainButton,
    hideMainButton,
    haptic,
    t,
  ]);

  // Checkout submission
  const handleSubmitOrder = async (orderPayload) => {
    setIsSubmittingOrder(true);
    try {
      const newOrder = await createOrder(orderPayload);
      haptic.notification('success');
      setCartItems([]); // Clear cart
      setIsCheckoutOpen(false);
      setIsCartOpen(false);

      // If user selected KHQR payment, open the KHQR Scan & Pay modal immediately!
      if (orderPayload.payment_method === 'khqr' && newOrder.total_amount > 0) {
        setKhqrOrder(newOrder);
      } else {
        setConfirmedOrder(newOrder);
      }

      // Reload user profile to update loyalty points balance
      if (currentUser?.id) {
        getUserProfile(currentUser.id).then((p) => {
          if (p) setCurrentUser((prev) => ({ ...prev, ...p }));
        }).catch(() => {});
      }
    } catch (err) {
      haptic.notification('error');
      alert(`Order submission failed: ${err.message}`);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleKhqrSuccess = (paidOrder) => {
    setKhqrOrder(null);
    setConfirmedOrder(paidOrder);
    haptic.notification('success');
  };

  // Main UI content structured with fixed header, scrollable body, and permanently fixed bottom bar
  const appContent = (
    <div className="h-full flex flex-col justify-between w-full relative overflow-hidden bg-slate-950 text-slate-100 select-none">
      {/* 1. Fixed Top Bar & Header (Never scrolls away) */}
      <div className="shrink-0 z-30 bg-slate-950 border-b border-slate-900">
        <TelegramTopBar
          onClose={close}
          user={user}
          isTelegram={isTelegram}
          isPhoneFrame={isPhoneFrame}
          onToggleFrame={() => setIsPhoneFrame(!isPhoneFrame)}
        />
        <Header
          user={currentUser}
          cartCount={cartCount}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenOrders={() => setIsOrdersOpen(true)}
          onOpenProfile={() => {
            setActiveTab('profile');
            setIsProfileOpen(true);
          }}
          onOpenPromos={() => setIsPromosOpen(true)}
          isTelegram={isTelegram}
          haptic={haptic}
          storeInfo={storeInfo}
        />
      </div>

      {/* 2. Middle Scrollable Area ONLY (Products, Banners, Search scroll smoothly here) */}
      <div
        ref={scrollContainerRef}
        className={`flex-1 overflow-y-auto overflow-x-hidden scroll-touch ${
          hasModalOpen ? 'pointer-events-none overflow-hidden' : ''
        }`}
      >
        <main className="pb-6">
          {/* Promotional Hero Banner */}
          <Banner onExploreClick={() => setIsPromosOpen(true)} />

          {/* Search Bar */}
          <SearchBar
            ref={searchInputRef}
            value={searchQuery}
            onChange={setSearchQuery}
          />

          {/* Category Filter Chips */}
          <CategoryBar
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={(id) => {
              haptic.selection();
              setSelectedCategoryId(id);
            }}
          />

          {/* Product Catalog Grid */}
          <div className="px-3 sm:px-4 py-2">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {selectedCategoryId
                  ? categories.find((c) => c.id === selectedCategoryId)?.name || t('all_products_title')
                  : t('all_products_title')}
              </h2>
              <span className="text-[11px] text-slate-500">
                {filteredProducts.length} {t('products_count')}
              </span>
            </div>

            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 text-xs">
                <RefreshCw className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
                <span>{t('loading_catalog')}</span>
              </div>
            ) : error ? (
              <div className="py-12 p-4 rounded-2xl bg-rose-950/30 border border-rose-800/40 text-center text-rose-300 text-xs space-y-2">
                <AlertCircle className="w-6 h-6 mx-auto text-rose-400" />
                <p>{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs mt-2"
                >
                  {t('retry_btn')}
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                <p>{t('no_products_found')}</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategoryId(null);
                  }}
                  className="mt-3 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 hover:text-white"
                >
                  {t('clear_filters')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {filteredProducts.map((product) => {
                  const productCartQty = cartItems
                    .filter((i) => i.product.id === product.id)
                    .reduce((sum, i) => sum + i.quantity, 0);
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={(p) => setSelectedProduct(p)}
                      onAddToCart={(p) =>
                        p.sub_images?.length > 0 ? setSelectedProduct(p) : handleAddToCart(p, 1)
                      }
                      onShare={(p) => setShareProduct(p)}
                      cartQuantity={productCartQty}
                      isFavorite={favorites.includes(product.id)}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 3. PERMANENTLY FIXED BOTTOM BAR (Never scrolls, permanently stuck at the bottom everywhere!) */}
      <div className="shrink-0 z-40 bg-slate-950">
        <BottomNavBar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          cartCount={cartCount}
          favoritesCount={favorites.length}
          onOpenCart={() => setIsCartOpen(true)}
          haptic={haptic}
        />
      </div>

      {/* Modals & Overlays */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onShare={(p) => setShareProduct(p)}
          initialQuantity={
            cartItems.find((i) => i.product.id === selectedProduct.id)?.quantity || 1
          }
          isFavorite={favorites.includes(selectedProduct.id)}
          onToggleFavorite={handleToggleFavorite}
          haptic={haptic}
        />
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        user={currentUser}
        onSubmitOrder={handleSubmitOrder}
        isSubmitting={isSubmittingOrder}
      />

      <OrderHistoryModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        telegramId={currentUser?.id}
        haptic={haptic}
        onExploreProducts={() => {
          setIsOrdersOpen(false);
          setActiveTab('home');
        }}
        onPayKhqr={(order) => {
          setIsOrdersOpen(false);
          setKhqrOrder(order);
        }}
      />

      <KhqrPaymentModal
        isOpen={Boolean(khqrOrder)}
        onClose={() => setKhqrOrder(null)}
        order={khqrOrder}
        onPaymentSuccess={handleKhqrSuccess}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => {
          setIsProfileOpen(false);
          setActiveTab('home');
        }}
        user={currentUser}
        onProfileUpdated={(updated) => {
          setCurrentUser((prev) => ({ ...(prev || {}), ...updated }));
        }}
        onOpenOrders={() => {
          setIsProfileOpen(false);
          setIsOrdersOpen(true);
        }}
        onOpenPromos={() => {
          setIsProfileOpen(false);
          setIsPromosOpen(true);
        }}
        haptic={haptic}
      />

      <PromosModal
        isOpen={isPromosOpen}
        onClose={() => setIsPromosOpen(false)}
        onApplyCode={() => {
          setIsPromosOpen(false);
          if (cartItems.length > 0) {
            setIsCheckoutOpen(true);
          }
        }}
        haptic={haptic}
      />

      <FavoritesModal
        isOpen={isFavoritesOpen}
        onClose={() => {
          setIsFavoritesOpen(false);
          setActiveTab('home');
        }}
        favoriteProducts={favoriteProducts}
        onSelectProduct={(p) => setSelectedProduct(p)}
        onAddToCart={(p) => handleAddToCart(p, 1)}
        onRemoveFavorite={handleToggleFavorite}
        haptic={haptic}
      />

      <OrderSuccessModal
        isOpen={Boolean(confirmedOrder)}
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        onOpenOrders={() => setIsOrdersOpen(true)}
      />

      {/* Active Alert Announcement Popup */}
      {activeAlert && (
        <AlertPopupModal
          alert={activeAlert}
          onDismiss={() => {
            try {
              sessionStorage.setItem('dismissed_alert_' + activeAlert.id, 'true');
            } catch {}
            setActiveAlert(null);
          }}
          haptic={haptic}
        />
      )}

      {/* Social Media Share Modal */}
      {shareProduct && (
        <ShareProductModal
          product={shareProduct}
          onClose={() => setShareProduct(null)}
          storeName={storeInfo?.store_name}
          haptic={haptic}
        />
      )}
    </div>
  );

  // If inside real Telegram, user toggled full width, or on mobile screen width
  if (isTelegram || !isPhoneFrame) {
    return (
      <div className="h-[100dvh] max-h-[100dvh] w-full bg-slate-950 flex justify-center overflow-hidden">
        <div className="w-full max-w-md h-[100dvh] max-h-[100dvh] flex flex-col relative overflow-hidden bg-slate-950 text-slate-100">
          {appContent}
        </div>
      </div>
    );
  }

  // Otherwise on desktop browsers, render inside a Telegram Mobile Phone Mockup Frame
  return (
    <div className="min-h-screen bg-[#070b13] flex flex-col items-center justify-center p-2 sm:p-6 overflow-hidden">
      {/* Top Banner Control */}
      <div className="mb-3 hidden sm:flex items-center gap-3 text-xs text-slate-400 bg-slate-900/90 px-4 py-2 rounded-full border border-slate-800 shadow-md shrink-0">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Telegram Mini App View (@minishopnuckbot)</span>
        <button
          onClick={() => setIsPhoneFrame(false)}
          className="text-sky-400 hover:text-sky-300 font-semibold ml-2 underline"
        >
          Full View
        </button>
      </div>

      {/* Responsive Phone Mockup Frame */}
      <div className="w-full sm:max-w-[410px] h-[100dvh] sm:h-[90vh] sm:max-h-[850px] sm:rounded-[48px] bg-slate-950 sm:border-[8px] sm:border-[#1e293b] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative sm:ring-1 sm:ring-slate-700/50">
        {/* Dynamic Island Speaker Slot (desktop only) */}
        <div className="hidden sm:block absolute top-3 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-50 pointer-events-none" />

        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          {appContent}
        </div>
      </div>
    </div>
  );
}
