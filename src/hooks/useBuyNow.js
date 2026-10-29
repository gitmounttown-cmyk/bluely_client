import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { setJSON } from '../utils/storage';
import { productId } from '../utils/format';
import { ROUTES } from '../routes/paths';

/** Replaces buyNow() (shared.js / products.html): login check, save item, go to checkout */
export default function useBuyNow() {
  const navigate = useNavigate();
  const { openAuth } = useAuth();
  const { showNotification } = useToast();

  return useCallback(
    (product) => {
      if (!localStorage.getItem('token')) {
        openAuth('login');
        showNotification('Please login to buy');
        return;
      }
      setJSON('buyNow', {
        id: productId(product),
        name: product.name,
        price: product.price,
        image: product.image || '',
        qty: 1,
      });
      navigate(`${ROUTES.BUY_NOW}?type=buyNow`);
    },
    [navigate, openAuth, showNotification]
  );
}
