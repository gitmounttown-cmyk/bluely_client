import { useState } from 'react';
import { ArrowRight, Heart, ShoppingCart, Star, Package, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import useBuyNow from '../hooks/useBuyNow';
import { productColorClass, productExactColorTheme, resolveImageUrl, calculateTotalVolume } from '../utils/format';

/** Card used in the product sections on the home page (.bluelly-product-card) with Volume & Direct typing/stepper */
export default function HomeProductCard({ product }) {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const buyNow = useBuyNow();
  const wishlisted = isWishlisted(product);

  const [qty, setQty] = useState(1);

  const imgSrc = resolveImageUrl(product.image || product.imageURL);
  const volume = product.litre || product.volume || '1L';

  const handleQtyChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      setQty('');
      return;
    }
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      setQty(parsed);
    }
  };

  const handleQtyBlur = () => {
    if (qty === '' || Number(qty) < 1) {
      setQty(1);
    }
  };

  const handleDelta = (delta) => {
    setQty((prev) => {
      const current = Number(prev) || 1;
      const next = current + delta;
      return next >= 1 ? next : 1;
    });
  };

  const currentQty = Number(qty) || 1;
  const totalVolume = calculateTotalVolume(volume, currentQty);

  return (
    <div className="bluelly-product-card">
      <div className={`bluelly-product-image ${productExactColorTheme(product)}`}>
        <span
          className={`wishlist-icon${wishlisted ? ' active' : ''}`}
          onClick={() => toggleWishlist(product)}
          role="button"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
        </span>
        <img
          src={imgSrc}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/images/Product.png';
          }}
        />
      </div>
      <div className="bluelly-product-content">
        <div className="bluelly-product-title">
          <h3>{product.name}</h3>
          <span>₹{product.price}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0 6px 0', flexWrap: 'wrap' }}>
          <span className="bluelly-rating" style={{ margin: 0 }}>
            {product.rating || 4.5} <Star size={11} fill="currentColor" />
          </span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#0284c7',
              background: '#e0f2fe',
              padding: '2px 8px',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            <Package size={11} /> Volume: {volume}
          </span>
        </div>

        <p>{product.description}</p>

        {/* Direct Typing & Stepper Quantity for Bulk Orders */}
        <div className="card-qty-row">
          <div className="card-stepper">
            <button
              type="button"
              className="card-qty-btn minus"
              onClick={() => handleDelta(-1)}
              aria-label="Decrease quantity"
              disabled={currentQty <= 1}
              title="Decrease quantity (-1)"
            >
              <Minus size={13} />
            </button>
            <input
              type="number"
              className="card-qty-input"
              value={qty}
              onChange={handleQtyChange}
              onBlur={handleQtyBlur}
              min="1"
              max="99999"
              aria-label="Quantity"
              title="Click directly to type quantity (e.g. 100 for 100L)"
            />
            <button
              type="button"
              className="card-qty-btn plus"
              onClick={() => handleDelta(1)}
              aria-label="Increase quantity"
              title="Increase quantity (+1)"
            >
              <Plus size={13} />
            </button>
          </div>

          <div className="card-vol-display" title="Calculated Total Volume">
            {currentQty > 1 ? (
              <span className="card-total-badge">
                <Package size={11} /> <strong>{totalVolume}</strong>
              </span>
            ) : (
              <span className="card-unit-badge">
                {volume} / unit
              </span>
            )}
          </div>
        </div>

        <div className="bluelly-product-actions">
          <button
            type="button"
            className="cart-btn"
            onClick={() => addToCart(product, currentQty)}
            aria-label="Add to cart"
            title={`Add ${currentQty} to cart`}
          >
            <ShoppingCart size={18} />
          </button>
          <button
            type="button"
            className="buy-btn"
            onClick={() => buyNow(product, currentQty)}
            title={`Place bulk order for ${currentQty} units (${totalVolume})`}
          >
            <span>Bulk Order</span>
            <ArrowRight size={16} className="buy-arrow" />
          </button>
        </div>
      </div>
    </div>
  );
}
