import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getJSON, setJSON } from '../utils/storage';
import { productId } from '../utils/format';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { ROUTES } from '../routes/paths';

const CartContext = createContext(null);

/** Cart (localStorage key "cart") + sidebar open state. Supports typing bulk quantity and tracking volume */
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
    (product, quantityToAdd = 1) => {
      const id = productId(product);
      const qty = Math.max(1, Number(quantityToAdd) || 1);
      const litre = product.litre || product.volume || '1L';

      setCart((prev) => {
        const existing = prev.find((i) => i.productId === id);
        if (existing) {
          return prev.map((i) =>
            i.productId === id
              ? {
                  ...i,
                  name: product.name,
                  price: product.price,
                  image: product.image || product.imageURL || i.image,
                  litre: litre || i.litre,
                  quantity: i.quantity + qty,
                }
              : i
          );
        }
        return [
          ...prev,
          {
            productId: id,
            name: product.name,
            price: product.price,
            litre: litre,
            quantity: qty,
            image: product.image || product.imageURL || '',
          },
        ];
      });
      showNotification(`Added ${qty > 1 ? `${qty} units` : 'item'} to cart!`);
    },
    [showNotification]
  );

  const removeFromCart = useCallback((index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Set quantity directly by typing in the input
  const setQuantity = useCallback((index, newQuantity) => {
    setCart((prev) => {
      return prev
        .map((item, i) => {
          if (i === index) {
            if (newQuantity === '' || isNaN(newQuantity)) {
              return { ...item, quantity: '' };
            }
            const q = Math.max(1, parseInt(newQuantity, 10) || 1);
            return { ...item, quantity: q };
          }
          return item;
        })
        .filter((item) => item.quantity !== 0);
    });
  }, []);

  // Update quantity by delta (+1 / -1)
  const updateQuantity = useCallback((index, change) => {
    setCart((prev) => {
      const next = prev.map((item, i) => {
        if (i === index) {
          const currentQty = Number(item.quantity) || 1;
          const nextQty = currentQty + change;
          return { ...item, quantity: nextQty };
        }
        return item;
      });
      return next.filter((item) => item.quantity > 0);
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const toggleCart = useCallback(() => setCartOpen((o) => !o), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const cartCount = useMemo(() => cart.reduce((s, i) => s + (Number(i.quantity) || 1), 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0), [cart]);

  const goToCheckout = useCallback(() => {
    if (cart.length === 0) {
      showNotification('Your cart is empty', 'error');
      return;
    }
    setCartOpen(false);
    navigate(`${ROUTES.BUY_NOW}?type=cart`);
  }, [cart.length, showNotification, navigate]);

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        cartCount,
        cartTotal,
        cartOpen,
        addToCart,
        removeFromCart,
        setQuantity,
        updateQuantity,
        clearCart,
        toggleCart,
        closeCart,
        goToCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
