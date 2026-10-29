import { ToastProvider } from './ToastContext';
import { AuthProvider } from './AuthContext';
import { CartProvider } from './CartContext';
import { ProductsProvider } from './ProductsContext';
import { WishlistProvider } from './WishlistContext';

export default function AppProviders({ children }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <ProductsProvider>
            <WishlistProvider>{children}</WishlistProvider>
          </ProductsProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
