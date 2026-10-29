// Safe localStorage helpers (same keys as the original HTML app:
// "token", "user", "cart", "buyNow", "resetToken")
export const getJSON = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
export const setJSON = (key, value) => localStorage.setItem(key, JSON.stringify(value));
export const getToken = () => localStorage.getItem('token');
