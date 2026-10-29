import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, ChevronRight, Star } from 'lucide-react';
import usePageStyles from '../../hooks/usePageStyles';
import usePageTitle from '../../hooks/usePageTitle';
import { HOME_STYLES } from '../../styles';
import { useProducts } from '../../context/ProductsContext';
import HomeProductCard from '../../components/HomeProductCard';
import { getCategoriesRequest } from '../../services/api';
import { resolveImageUrl } from '../../utils/format';
import { ROUTES } from '../../routes/paths';

const DEFAULT_CATEGORIES = [
  { _id: 'cat-1', name: 'Laundry Care', imageURL: '/images/Ellipse 12.png' },
  { _id: 'cat-2', name: 'Floor & Surface Care', imageURL: '/images/Ellipse 13.png' },
  { _id: 'cat-3', name: 'Bathroom & Toilet Care', imageURL: '/images/Ellipse 14.png' },
  { _id: 'cat-4', name: 'Personal Hygiene', imageURL: '/images/Ellipse 15.png' },
];

const WHY = [
  { img: 'Group 10.png', alt: 'Fast Delivery', text: 'Fast Delivery' },
  { img: 'Group 12.png', alt: 'Quality Assured', text: 'Quality Assured' },
  { img: 'Group 13.png', alt: 'Secure Payments', text: 'Secure Payments' },
  { img: 'Group 14.png', alt: 'Eco Friendly', text: 'Eco Friendly', extra: 'bottom-left' },
  { img: 'Group 27.png', alt: 'Support 24/7', text: 'Support 24/7', extra: 'bottom-right' },
];

const TESTIMONIALS = [
  {
    cls: 'left',
    text: '"The quality really surprised me. Simple to use and gives exactly the results promised. Definitely worth trying."',
    img: 'bubbles.png',
    name: 'R. Priya , Chennai',
  },
  {
    cls: 'center',
    text: `"I started using this for everyday cleaning and now it's part of my routine. Clean results and great value."`,
    img: 'bathroom2.jpg',
    name: 'K. Arun, Coimbatore',
  },
  {
    cls: 'right',
    text: `"Neat packaging, easy usage, and effective results. I'm happy with the experience and would recommend it."`,
    img: 'disinfectant1.jpg',
    name: 'S. Meena, Madurai',
  },
];

function Stars() {
  return (
    <div className="stars" aria-label="5 out of 5 stars">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} size={18} fill="currentColor" />
      ))}
    </div>
  );
}

export default function Home() {
  usePageStyles(HOME_STYLES);
  usePageTitle('Bluely – Pure Clean. Pure Care.');

  const navigate = useNavigate();
  const { products } = useProducts();
  const [activeCategory, setActiveCategory] = useState('All');
  const [apiCategories, setApiCategories] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const loadCategories = async () => {
      try {
        const { ok, data } = await getCategoriesRequest();
        if (cancelled) return;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.categories)
          ? data.categories
          : [];
        if (list.length > 0) {
          setApiCategories(list);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  // Use API categories or fallback defaults
  const categoriesList = useMemo(() => {
    return apiCategories.length > 0 ? apiCategories.slice(0, 4) : DEFAULT_CATEGORIES;
  }, [apiCategories]);

  // Products to show in Products section (top 8)
  const displayedProducts = useMemo(() => {
    return products.slice(0, 8);
  }, [products]);

  // Dynamic Popular categories list
  const popularCategories = useMemo(() => {
    const defaultCats = [
      'All',
      'Laundry Care',
      'Floor & Surface Care',
      'Bathroom & Toilet Care',
      'Personal Hygiene',
      'Kitchen Care',
    ];
    const catSet = new Set();
    products.forEach((p) => {
      const c = typeof p.category === 'object' ? p.category?.name : p.category;
      if (c && typeof c === 'string' && c.trim()) catSet.add(c.trim());
    });
    const found = Array.from(catSet);
    return found.length > 0 ? ['All', ...found] : defaultCats;
  }, [products]);

  // Category-based Popular products
  const categoryPopularProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    let list = products;
    if (activeCategory !== 'All') {
      const target = activeCategory.toLowerCase();
      list = products.filter((p) => {
        const cat = ((typeof p.category === 'object' ? p.category?.name : p.category) || '').toLowerCase();
        return cat.includes(target) || target.includes(cat);
      });
    }
    // Prioritize high-rated products or top 8
    return [...list].sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5)).slice(0, 8);
  }, [products, activeCategory]);

  const onSearchKey = (e) => {
    if (e.key === 'Enter') {
      const query = searchText.trim();
      if (query) navigate(`${ROUTES.PRODUCTS}?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <>
      <section className="hero">
        <div className="hero-text reveal">
          <h1>
            Complete Cleaning
            <br />
            at One Stop Solutions
          </h1>
          <p>Powerful Cleaning. Gentle Care.</p>
          <div className="hero-buttons">
            <button type="button" className="primary" onClick={() => navigate(ROUTES.PRODUCTS)}>
              View Products
            </button>
            <button type="button" className="secondary">Become a Dealer</button>
          </div>
        </div>
      </section>

      <section className="categories reveal">
        <h2>Categories</h2>
        <div className="category-list">
          {categoriesList.map((c) => {
            const img = c.imageURL || c.image || '/images/Ellipse 12.png';
            return (
              <div
                className="category"
                key={c._id || c.id || c.name}
                onClick={() => navigate(`${ROUTES.PRODUCTS}?category=${encodeURIComponent(c.name)}`)}
                style={{ cursor: 'pointer' }}
                title={`Browse ${c.name}`}
              >
                <img
                  src={resolveImageUrl(img)}
                  alt={c.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/images/Ellipse 12.png';
                  }}
                />
                <span>
                  {c.name}
                </span>
              </div>
            );
          })}
          <div className="category category-arrow-btn">
            <button
              type="button"
              onClick={() => navigate(ROUTES.CATEGORIES)}
              className="category-circle-arrow"
              aria-label="View all categories"
              title="View All Categories"
            >
              <ChevronRight size={32} />
            </button>
          </div>
        </div>
      </section>

      <section className="bluelly-products-section reveal">
        <div className="bluelly-section-header">
          <div>
            <h2>Products</h2>
            <p style={{ color: '#cbd5e1', fontSize: '13px', marginTop: '4px' }}>
              Everyday cleaning essentials formulated for pure performance
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(ROUTES.PRODUCTS)}
            className="view-all"
            aria-label="View all products in catalog"
          >
            <span>View All</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="bluelly-product-grid" id="productsGrid">
          {displayedProducts.length > 0 ? (
            displayedProducts.map((p) => (
              <HomeProductCard key={p._id || p.id} product={p} />
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 20px', color: '#cbd5e1' }}>
              Loading products catalog...
            </div>
          )}
        </div>
      </section>

      <section className="bluelly-products-section reveal">
        <div className="bluelly-section-header">
          <div>
            <h2>Popular Products</h2>
            <p style={{ color: '#cbd5e1', fontSize: '13px', marginTop: '4px' }}>
              Top customer favorites filtered by category
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(`${ROUTES.PRODUCTS}${activeCategory !== 'All' ? `?category=${encodeURIComponent(activeCategory)}` : ''}`)}
            className="view-all"
            aria-label="View popular products in catalog"
          >
            <span>View All</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Category-based Filter Pills for Popular Products */}
        <div className="popular-category-tabs">
          {popularCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`category-pill-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="bluelly-product-grid" id="popularProductsGrid">
          {categoryPopularProducts.length > 0 ? (
            categoryPopularProducts.map((p) => (
              <HomeProductCard key={p._id || p.id} product={p} />
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 20px', color: '#cbd5e1' }}>
              <p style={{ fontSize: '15px', marginBottom: '14px' }}>
                No popular products found under {activeCategory}.
              </p>
              <button
                type="button"
                onClick={() => setActiveCategory('All')}
                className="category-pill-btn"
                style={{ background: '#ffffff', color: '#071f6b', borderColor: '#ffffff', fontWeight: '700' }}
              >
                Reset to All Categories
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="bluelly-why-exact reveal">
        <h2>Why Choose Us?</h2>
        <div className="why-grid-exact">
          {WHY.map((w) => (
            <div className={`why-item-exact${w.extra ? ` ${w.extra}` : ''}`} key={w.img}>
              <div className="icon-circle">
                <img src={`/images/${w.img}`} alt={w.alt} />
              </div>
              <p>{w.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bluelly-cta-exact reveal">
        <h2>"One Brand. Many Everyday Solutions."</h2>
        <div className="hero-buttons">
          <button type="button" className="primary" onClick={() => navigate(ROUTES.PRODUCTS)}>
            Explore All Products
          </button>
        </div>
      </section>

      <section className="bluelly-testimonial-wrap">
        <h2 className="testimonial-title">Loved by Thousands of Homes</h2>
        <div className="testimonial-stage">
          <div className="testimonial-gradient" />
          <div className="testimonial-cards">
            {TESTIMONIALS.map((t) => (
              <div className={`testimonial-card ${t.cls}`} key={t.name}>
                <Stars />
                <p>{t.text}</p>
                <div className="user-info">
                  <img src={`/images/${t.img}`} alt="" />
                  <div>
                    <strong>{t.name}</strong>
                    <span>Customer</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
