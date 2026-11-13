import { Minus, Plus, X, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { calculateTotalVolume } from '../utils/format';

/**
 * Cart sidebar with directly editable quantity inputs for bulk orders (e.g. 100L)
 * and real-time total volume calculation.
 */
export default function CartSidebar() {
  const {
    cart,
    cartTotal,
    cartOpen,
    toggleCart,
    updateQuantity,
    setQuantity,
    removeFromCart,
    goToCheckout,
  } = useCart();

  return (
    <div id="cartSidebar" className={`cart-sidebar${cartOpen ? ' active' : ''}`}>
      <div className="cart-header">
        <h3>Your Cart & Bulk Orders</h3>
        <button type="button" onClick={toggleCart} aria-label="Close cart">
          <X size={18} />
        </button>
      </div>

      <div id="cartItems" className="cart-items">
        {cart.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '24px 16px', color: '#7f8c8d' }}>
            Your cart is empty. Add bulk products to begin.
          </p>
        ) : (
          cart.map((item, index) => {
            const qty = Number(item.quantity) || 1;
            const unitVolume = item.litre || item.volume || '1L';
            const totalVolume = calculateTotalVolume(unitVolume, qty);

            return (
              <div
                className="cart-item"
                key={`${item.productId}-${index}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: '12px',
                  borderBottom: '1px solid #e2e8f0',
                  background: '#ffffff',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="cart-item-info" style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: '0 0 2px 0', fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                      {item.name}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          color: '#0284c7',
                          background: '#f0f9ff',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        <Package size={11} /> {unitVolume} each
                      </span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>₹{item.price}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(index)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                    }}
                    title="Remove item"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Bulk Quantity Input & Total Volume Display */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#f8fafc',
                    padding: '6px 8px',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => updateQuantity(index, -1)}
                      style={{
                        width: '26px',
                        height: '26px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        cursor: 'pointer',
                        color: '#475569',
                      }}
                      title="Decrease quantity"
                    >
                      <Minus size={13} />
                    </button>

                    <input
                      type="number"
                      min="1"
                      max="99999"
                      value={item.quantity === '' ? '' : item.quantity}
                      onChange={(e) => {
                        const val = e.target.value;
                        setQuantity(index, val === '' ? '' : parseInt(val, 10));
                      }}
                      onBlur={() => {
                        if (!item.quantity || Number(item.quantity) < 1) {
                          setQuantity(index, 1);
                        }
                      }}
                      style={{
                        width: '64px',
                        height: '26px',
                        textAlign: 'center',
                        fontSize: '12.5px',
                        fontWeight: 'bold',
                        border: '1px solid #0284c7',
                        borderRadius: '6px',
                        background: '#ffffff',
                        outline: 'none',
                      }}
                      title="Type bulk quantity (e.g. 100 for 100L)"
                    />

                    <button
                      type="button"
                      onClick={() => updateQuantity(index, 1)}
                      style={{
                        width: '26px',
                        height: '26px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        cursor: 'pointer',
                        color: '#475569',
                      }}
                      title="Increase quantity"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#0369a1' }}>
                      {totalVolume} Total
                    </div>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>
                      ₹{((Number(item.price) || 0) * qty).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="cart-footer">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Total Payable:</span>
          <div id="cartTotal" className="cart-total" style={{ fontSize: '18px', fontWeight: 800, color: '#041A71' }}>
            ₹{cartTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <button
          type="button"
          className="checkout-btn"
          onClick={goToCheckout}
          style={{
            width: '100%',
            padding: '12px',
            background: 'linear-gradient(135deg, #041A71 0%, #0284c7 100%)',
            color: '#ffffff',
            fontWeight: 700,
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Proceed to Bulk Checkout
        </button>
      </div>
    </div>
  );
}
