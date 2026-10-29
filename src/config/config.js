// Configuration for API and external services
const isLocal =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1');

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (isLocal ? 'http://localhost:5008/api' : 'https://bluely.in/api');

export const SERVER_URL =
  import.meta.env.VITE_SERVER_URL ||
  (isLocal ? 'http://localhost:5008' : 'https://bluely.in');

export const CASHFREE_MODE = import.meta.env.VITE_CASHFREE_MODE || 'sandbox';
export const CASHFREE_SDK_URL = 'https://sdk.cashfree.com/js/v3/cashfree.js';

export const RAZORPAY_KEY_ID =
  import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TliPBF8ABANiq8';
export const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';
