import { API_BASE_URL } from '../config/config';
import { getToken } from '../utils/storage';

/**
 * Robust fetch wrapper that communicates with the backend Bluely API.
 * Returns { ok, status, data }.
 */
async function request(path, { method = 'GET', body, token, auth = false } = {}) {
  const headers = {};
  if (body !== undefined && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const bearer = token ?? (auth ? getToken() : null);
  if (bearer) {
    headers.Authorization = `Bearer ${bearer}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body:
      body !== undefined
        ? body instanceof FormData
          ? body
          : JSON.stringify(body)
        : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { ok: res.ok, status: res.status, data };
}

/* ── Auth ───────────────────────────────────────────────── */
export const loginRequest = (email, password) =>
  request('/auth/login', { method: 'POST', body: { email, password } });

export const registerRequest = (name, email, password) =>
  request('/auth/signup', { method: 'POST', body: { name, email, password } });

export const getMe = () => request('/auth/me', { auth: true });

export const forgotPasswordRequest = (email) =>
  request('/auth/forgot-password', { method: 'POST', body: { email } });

export const verifyOtpRequest = (email, otp) =>
  request('/auth/verify-otp', { method: 'POST', body: { email, otp } });

export const resetPasswordRequest = (newPassword, resetToken) =>
  request('/auth/reset-password', {
    method: 'POST',
    body: { newPassword },
    token: resetToken,
  });

export const updateProfileRequest = (user) => {
  const id = user.id || user._id;
  return request(`/auth/update/${id}`, { method: 'PUT', body: user, auth: true });
};

/* ── Products, Categories & Wishlist ─────────────────────── */
export const getCategoriesRequest = async () => {
  const res = await request('/categories/all');
  if (res.ok) return res;
  return request('/categories');
};

export const getProductsRequest = async () => {
  // First try /product/all, fallback to /products
  const res = await request('/product/all');
  if (res.ok) return res;
  return request('/products');
};

export const getWishlistRequest = () => request('/wishlist/all', { auth: true });

export const addToWishlistRequest = (product) => {
  const productId = product.productId || product._id || product.id;
  return request('/wishlist/add', {
    method: 'POST',
    body: { productId, ...product },
    auth: true,
  });
};

export const removeFromWishlistRequest = (productId) =>
  request(`/wishlist/${productId}`, { method: 'DELETE', auth: true });

/* ── Orders & Checkout ───────────────────────────────────── */
export const getMyOrdersRequest = () => request('/order/my-orders', { auth: true });

export const removeOrderItemRequest = (orderId, itemId) =>
  request(`/order/${orderId}/item/${itemId}`, { method: 'DELETE', auth: true });

export const createPaymentOrderRequest = (payload) =>
  request('/order/create', { method: 'POST', body: payload, auth: true });

/* ── Addresses ───────────────────────────────────────────── */
export const getAddressesRequest = (email) =>
  request(`/addresses/${encodeURIComponent(email)}`);

export const saveAddressesRequest = (email, addresses) =>
  request('/addresses', { method: 'PUT', body: { email, addresses } });

/* ── Contact ─────────────────────────────────────────────── */
export const sendContactRequest = (form) =>
  request('/contact', { method: 'POST', body: form });
