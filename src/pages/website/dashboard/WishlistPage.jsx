import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Heart, Star, Trash2 } from 'lucide-react';
import { getWishlistRequest, removeFromWishlistRequest } from '../../../services/api';
import { useProducts } from '../../../context/ProductsContext';
import { useToast } from '../../../context/ToastContext';
import { setJSON } from '../../../utils/storage';
import { resolveImageUrl } from '../../../utils/format';
import { ROUTES } from '../../../routes/paths';

const COLORS = ['purple', 'yellow', 'blue', 'green', 'pink', 'orange'];

export default function WishlistPage() {
  const navigate = useNavigate();
  const { products } = useProducts();
  const { showNotification } = useToast();
  const [items, setItems] = useState([]);
  const [state, setState] = useState('loading'); // loading | ready | error

  const load = useCallback(async () => {
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
      setState('ready');
    } catch (err) {
      console.error('Error rendering wishlist:', err);
      setState('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const removeFromWishlist = async (wishlistItemId) => {
    if (!window.confirm('Are you sure you want to remove this item from the wishlist?')) return;
    try {
      const { ok, data } = await removeFromWishlistRequest(wishlistItemId);
      if (!ok) {
        window.alert(data?.message || 'Failed to remove');
        return;
      }
      showNotification('Removed from wishlist');
      await load();
    } catch (err) {
      console.error('Remove wishlist error:', err);
      window.alert('Something went wrong. Please try again.');
    }
  };

  const buyNowFromWishlist = (productId) => {
    const product = products.find((p) => p._id === productId || p.id === productId);
    if (!product) {
      showNotification('Product details loaded', 'info');
    }
    const itemToBuy = product || {
      _id: productId,
      name: 'Bluely Product',
      price: 299,
      image: '/images/Product.png',
      qty: 1,
    };
    setJSON('buyNow', { ...itemToBuy, qty: 1 });
    navigate(`${ROUTES.BUY_NOW}?type=buyNow`);
  };

  return (
    <div id="wishlistPage" className="page active">
      <h1 className="wishlist-header">
        My Wishlist <span className="wishlist-count" id="dashWishlistPageCount">( {items.length} )</span>
      </h1>
      <div className="product-list" id="wishlistProductList">
        {state === 'loading' && <div className="loading">Loading your wishlist...</div>}
        {state === 'error' && <div className="loading">Failed to load wishlist. Please try again.</div>}

        {state === 'ready' && items.length === 0 && (
          <div className="empty-wishlist">
            <div className="empty-icon">
              <Heart size={56} fill="#e63946" color="#e63946" />
            </div>
            <h3>Your wishlist is empty</h3>
            <p>Browse products and add items to your wishlist!</p>
          </div>
        )}

        {state === 'ready' &&
          items.filter(Boolean).map((product, index) => {
            const prodObj = product.productId && typeof product.productId === 'object' ? product.productId : product;
            const productId = prodObj._id || prodObj.id || product.productId || product._id;
            const wishlistItemId = productId;
            const name = prodObj.name || product.name || 'Bluely Cleaning Product';
            const price = prodObj.price || product.price || 0;
            const image = resolveImageUrl(prodObj.imageURL || prodObj.image || product.image);

            return (
              <div className="product-card" key={wishlistItemId || index}>
                <div className={`product-image ${COLORS[index % COLORS.length]}`}>
                  <img
                    src={image}
                    alt={name}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/images/Product.png';
                    }}
                  />
                </div>
                <div className="product-info">
                  <h3>{name}</h3>
                  <div className="rating">
                    4.8 <Star size={12} fill="currentColor" />
                  </div>
                </div>
                <div className="product-price">₹{price}</div>
                <div className="product-actions">
                  <button type="button" className="btn-buy" onClick={() => buyNowFromWishlist(productId)}>
                    <span>Buy Now</span>
                    <ArrowRight size={16} className="buy-arrow" />
                  </button>
                  <button
                    type="button"
                    className="btn-delete"
                    onClick={() => removeFromWishlist(wishlistItemId)}
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
