// Configuration for API and external services

const getBaseUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:5008/api';
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;

  const hostname = window.location.hostname;
  const port = window.location.port;

  // Local/dev environment detection: localhost, 127.0.0.1, LAN IPs (192.168.*, 10.*, 172.*, .local),
  // or anytime accessed via Vite dev server port (5502, 5173, etc.)
  const isDevOrLocal =
    import.meta.env.DEV ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('172.') ||
    hostname.endsWith('.local') ||
    port === '5502' ||
    port === '5173';

  if (isDevOrLocal) {
    // When served via Vite dev server with proxy, relative '/api' works identically
    // on localhost, 127.0.0.1, 192.168.x.x, mobile on WiFi, and any LAN IP!
    if (port === '5502' || port === '5173') {
      return '/api';
    }
    return `${window.location.protocol}//${hostname}:5008/api`;
  }

  return 'https://bluely.in/api';
};

const getServerUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:5008';
  if (import.meta.env.VITE_SERVER_URL) return import.meta.env.VITE_SERVER_URL;

  const hostname = window.location.hostname;
  const port = window.location.port;

  const isDevOrLocal =
    import.meta.env.DEV ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('172.') ||
    hostname.endsWith('.local') ||
    port === '5502' ||
    port === '5173';

  if (isDevOrLocal) {
    if (port === '5502' || port === '5173') {
      // Relative URL: /uploads is proxied by Vite directly to http://localhost:5008/uploads
      return '';
    }
    return `${window.location.protocol}//${hostname}:5008`;
  }

  return 'https://bluely.in';
};

export const API_BASE_URL = getBaseUrl();
export const SERVER_URL = getServerUrl();

export const CASHFREE_MODE = import.meta.env.VITE_CASHFREE_MODE || 'sandbox';
export const CASHFREE_SDK_URL = 'https://sdk.cashfree.com/js/v3/cashfree.js';

export const RAZORPAY_KEY_ID =
  import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TliPBF8ABANiq8';
export const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';
