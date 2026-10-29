import { CASHFREE_MODE, CASHFREE_SDK_URL } from '../config/config';

let sdkPromise = null;

/** Loads https://sdk.cashfree.com/js/v3/cashfree.js on demand (it used to be a <script> in buynow.html) */
export function loadCashfree() {
  if (window.Cashfree) return Promise.resolve(window.Cashfree);
  if (!sdkPromise) {
    sdkPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = CASHFREE_SDK_URL;
      script.async = true;
      script.onload = () => resolve(window.Cashfree);
      script.onerror = () => {
        sdkPromise = null;
        reject(new Error('Failed to load Cashfree SDK'));
      };
      document.head.appendChild(script);
    });
  }
  return sdkPromise;
}

export async function openCashfreeCheckout(paymentSessionId) {
  const Cashfree = await loadCashfree();
  const cashfree = Cashfree({ mode: CASHFREE_MODE });
  cashfree.checkout({ paymentSessionId, redirectTarget: '_self' });
}
