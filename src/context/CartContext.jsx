import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getJSON, setJSON } from '../utils/storage';
import { productId } from '../utils/format';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { ROUTES } from '../routes/paths';

const CartContext = createContext(null);

/** Cart (localStorage key "cart") + sidebar open state. Replaces section 5 of shared.js */
export function CartProvider({ children }) {
  const navigate = useNavigate();
  const { showNotification } = useToast();
  const { user, openAuth } = useAuth();

  const [cart, setCart] = useState(() => getJSON('cart', []) || []);
  const [cartOpen, setCartOpen] = useState(false);

  // persist (saveCartToStorage)
  useEffect(() => {
    setJSON('cart', cart);
  }, [cart]);

  const addToCart = useCallback(
    (product) => {
      const id = productId(product);
      setCart((prev) => {
        const existing = prev.find((i) => i.productId === id);
        if (existing) {
          return prev.map((i) =>
            i.productId === id
              ? { ...i, name: product.name, price: product.price, image: product.image, quantity: i.quantity + 1 }
              : i
          );
        }
        return [
          ...prev,
          { productId: id, name: product.name, price: product.price, quantity: 1, image: product.image || '' },
        ];
      });
      showNotification('Product added to cart!');
    },
    [showNotification]
  );

  const removeFromCart = useCallback((index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateQuantity = useCallback((index, change) => {
    setCart((prev) => {
      const next = prev.map((item, i) =>
        i === index ? { ...item, quantity: item.quantity + change } : item
      );
      return next.filter((item) => item.quantity > 0);
    });
  }, []);

  const toggleCart = useCallback(() => setCartOpen((o) => !o), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.quantity, 0), [cart]);

  const goToCheckout = useCallback(() => {
    if (cart.length === 0) {
      showNotification('Your cart is empty', 'error');
      return;
    }
    if (!user) {
      openAuth('login');
      showNotification('Please login to checkout');
      return;
    }
    setCartOpen(false);
    navigate(`${ROUTES.BUY_NOW}?type=cart`);
  }, [cart.length, user, openAuth, showNotification, navigate]);

  return (
    <CartContext.Provider
      value={{
        cart, cartCount, cartTotal, cartOpen,
        addToCart, removeFromCart, updateQuantity, toggleCart, closeCart, goToCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
