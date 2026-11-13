import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { setJSON } from '../utils/storage';
import { productId } from '../utils/format';
import { ROUTES } from '../routes/paths';

/** Replaces buyNow() (shared.js / products.html): login check, save item with volume & bulk quantity, go to checkout */
export default function useBuyNow() {
  const navigate = useNavigate();
  const { openAuth } = useAuth();
  const { showNotification } = useToast();

  return useCallback(
    (product, qty = 1) => {
      if (!localStorage.getItem('token')) {
        openAuth('login');
        showNotification('Please login to buy');
        return;
      }
      const safeQty = Math.max(1, parseInt(qty, 10) || 1);
      const volume = product.litre || product.volume || '1L';
      setJSON('buyNow', {
        id: productId(product),
        name: product.name,
        price: product.price,
        image: product.image || product.imageURL || '',
        litre: volume,
        volume: volume,
        qty: safeQty,
      });
      navigate(`${ROUTES.BUY_NOW}?type=buyNow`);
    },
    [navigate, openAuth, showNotification]
  );
}
