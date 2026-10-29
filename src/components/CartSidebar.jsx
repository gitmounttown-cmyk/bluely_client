import { Minus, Plus, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

/** Cart sidebar (was built by updateCartItems() in shared.js) */
export default function CartSidebar() {
  const { cart, cartTotal, cartOpen, toggleCart, updateQuantity, removeFromCart, goToCheckout } = useCart();

  return (
    <div id="cartSidebar" className={`cart-sidebar${cartOpen ? ' active' : ''}`}>
      <div className="cart-header">
        <h3>Your Cart</h3>
        <button type="button" onClick={toggleCart} aria-label="Close cart">
          <X size={18} />
        </button>
      </div>

      <div id="cartItems" className="cart-items">
        {cart.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '20px', color: '#7f8c8d' }}>Your cart is empty</p>
        ) : (
          cart.map((item, index) => (
            <div className="cart-item" key={`${item.productId}-${index}`}>
              <div className="cart-item-info">
                <h4>{item.name}</h4>
                <p>₹{item.price} each</p>
              </div>
              <div className="cart-item-actions">
                <button type="button" onClick={() => updateQuantity(index, -1)} aria-label="Decrease quantity">
                  <Minus size={14} />
                </button>
                <span>{item.quantity}</span>
                <button type="button" onClick={() => updateQuantity(index, 1)} aria-label="Increase quantity">
                  <Plus size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => removeFromCart(index)}
                  style={{ color: 'red', marginLeft: '6px' }}
                  aria-label="Remove item"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="cart-footer">
        <div id="cartTotal" className="cart-total">
          ₹{cartTotal.toFixed(2)}
        </div>
        <button type="button" className="checkout-btn" onClick={goToCheckout}>
          Checkout
        </button>
      </div>
    </div>
  );
}
