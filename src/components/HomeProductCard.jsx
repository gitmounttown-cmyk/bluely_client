import { ArrowRight, Heart, ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import useBuyNow from '../hooks/useBuyNow';
import { productColorClass, productExactColorTheme, resolveImageUrl } from '../utils/format';

/** Card used in the two product sections on the home page (.bluelly-product-card) */
export default function HomeProductCard({ product }) {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const buyNow = useBuyNow();
  const wishlisted = isWishlisted(product);

  const imgSrc = resolveImageUrl(product.image || product.imageURL);

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
        <span className="bluelly-rating">
          {product.rating || 4.5} <Star size={11} fill="currentColor" />
        </span>
        <p>{product.description}</p>
        <div className="bluelly-product-actions">
          <button type="button" className="cart-btn" onClick={() => addToCart(product)} aria-label="Add to cart">
            <ShoppingCart size={18} />
          </button>
          <button type="button" className="buy-btn" onClick={() => buyNow(product)}>
            <span>Buy Now</span>
            <ArrowRight size={16} className="buy-arrow" />
          </button>
        </div>
      </div>
    </div>
  );
}
