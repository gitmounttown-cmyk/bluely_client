import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { addToWishlistRequest, getWishlistRequest, removeFromWishlistRequest } from '../services/api';
import { productId } from '../utils/format';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { token, openAuth } = useAuth();
  const { showNotification } = useToast();
  const [items, setItems] = useState([]);

  const refresh = useCallback(async () => {
    if (!localStorage.getItem('token')) {
      setItems([]);
      return [];
    }
    try {
      const { data } = await getWishlistRequest();
      const list = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.products)
        ? data.products
        : Array.isArray(data)
        ? data
        : [];
      setItems(list);
      return list;
    } catch (err) {
      console.error('Wishlist error:', err);
      return [];
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, token]);

  const wishlistedIds = useMemo(() => {
    const set = new Set();
    items.forEach((i) => {
      const id =
        i.productId?._id ||
        (typeof i.productId === 'string' ? i.productId : null) ||
        i._id ||
        i.id;
      if (id) set.add(id.toString());
    });
    return set;
  }, [items]);

  const isWishlisted = useCallback(
    (p) => {
      const id = productId(p) || p._id || p.id;
      return id ? wishlistedIds.has(id.toString()) : false;
    },
    [wishlistedIds]
  );

  const toggleWishlist = useCallback(
    async (product) => {
      if (!localStorage.getItem('token')) {
        openAuth('login');
        showNotification('Please login to use wishlist');
        return;
      }
      const prodId = productId(product) || product._id || product.id;
      const alreadyIn = wishlistedIds.has(prodId?.toString());

      try {
        if (alreadyIn) {
          const { ok } = await removeFromWishlistRequest(prodId);
          if (ok) {
            showNotification('Removed from wishlist');
          }
        } else {
          const { ok, data } = await addToWishlistRequest({
            productId: prodId,
            name: product.name,
            price: product.price,
            image: product.image || product.imageURL,
          });
          if (!ok) {
            showNotification(data?.message || 'Could not update wishlist', 'error');
            return;
          }
          showNotification('Added to wishlist');
        }
        await refresh();
      } catch (err) {
        console.error(err);
        showNotification('Something went wrong. Please try again.', 'error');
      }
    },
    [openAuth, showNotification, refresh, wishlistedIds]
  );

  return (
    <WishlistContext.Provider
      value={{ items, wishlistCount: items.length, isWishlisted, toggleWishlist, refresh }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
