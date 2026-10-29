import { ArrowRight, Heart, ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import useBuyNow from '../hooks/useBuyNow';
import { productColorClass, productExactColorTheme, resolveImageUrl } from '../utils/format';

/** Card used on the Products page (.product-card) */
export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const buyNow = useBuyNow();
  const wishlisted = isWishlisted(product);

  const imgSrc = resolveImageUrl(product.image || product.imageURL);

  return (
    <div className={`product-card ${product.category || ''}`}>
      <span className="border-line" />
      <div className={`img-box ${productExactColorTheme(product)}`}>
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
      <h3>
        {product.name} <span>₹{product.price}</span>
      </h3>
      <span className="rating">
        {product.rating || 4.5} <Star size={11} fill="currentColor" />
      </span>
      <p>{product.description}</p>
      <div className="actions">
        <button type="button" className="cart" onClick={() => addToCart(product)} aria-label="Add to cart">
          <ShoppingCart size={18} />
        </button>
        <button type="button" className="buy" onClick={() => buyNow(product)}>
          <span>Buy Now</span>
          <ArrowRight size={16} className="buy-arrow" />
        </button>
      </div>
    </div>
  );
}
