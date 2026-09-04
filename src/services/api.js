const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export async function getCategories() {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function getProducts({ categoryId, search, featuredOnly } = {}) {
  const params = new URLSearchParams();
  if (categoryId) params.append('category_id', categoryId);
  if (search) params.append('search', search);
  if (featuredOnly) params.append('featured_only', 'true');
  params.append('active_only', 'true');

  const res = await fetch(`${API_BASE}/products?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function createOrder(orderPayload) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to submit order');
  }
  return res.json();
}

export async function getUserOrders(telegramId) {
  if (!telegramId) return [];
  const res = await fetch(`${API_BASE}/orders/user/${telegramId}`);
  if (!res.ok) throw new Error('Failed to fetch user orders');
  return res.json();
}

export async function getUserProfile(telegramId) {
  if (!telegramId) return null;
  const res = await fetch(`${API_BASE}/users/${telegramId}`);
  if (!res.ok) throw new Error('Failed to fetch user profile');
  return res.json();
}

export async function updateUserProfile(telegramId, profileData) {
  if (!telegramId) throw new Error('Telegram ID is required');
  const res = await fetch(`${API_BASE}/users/${telegramId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to update profile');
  }
  return res.json();
}

export async function uploadUserAvatar(telegramId, file) {
  if (!telegramId) throw new Error('Telegram ID is required');
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/users/${telegramId}/avatar`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to upload profile picture');
  }
  return res.json();
}

export async function getPromoCodes() {
  const res = await fetch(`${API_BASE}/promocodes`);
  if (!res.ok) return [];
  return res.json();
}

export async function validatePromoCode(code, subtotal) {
  const res = await fetch(`${API_BASE}/promocodes/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, subtotal }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to validate promo code');
  }
  return res.json();
}

export async function getKhqrPayment(orderNumber) {
  const res = await fetch(`${API_BASE}/payment/generate/${orderNumber}`, {
    method: 'POST',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to generate KHQR code');
  }
  return res.json();
}

export async function checkPaymentStatus(orderNumber) {
  const res = await fetch(`${API_BASE}/payment/check/${orderNumber}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to check payment status');
  }
  return res.json();
}

export async function simulatePaymentSuccess(orderNumber) {
  const res = await fetch(`${API_BASE}/payment/simulate-success/${orderNumber}`, {
    method: 'POST',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to simulate payment');
  }
  return res.json();
}
