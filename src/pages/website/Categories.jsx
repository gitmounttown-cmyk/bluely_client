import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import usePageStyles from '../../hooks/usePageStyles';
import usePageTitle from '../../hooks/usePageTitle';
import { HOME_STYLES } from '../../styles';
import { getCategoriesRequest } from '../../services/api';
import { resolveImageUrl } from '../../utils/format';
import { ROUTES } from '../../routes/paths';

const FALLBACK_CATEGORIES = [
  { _id: 'c1', name: 'Laundry Care', imageURL: '/images/Ellipse 12.png', description: 'Liquid detergents, softeners, and laundry additives for fresh fabrics.' },
  { _id: 'c2', name: 'Floor & Surface Care', imageURL: '/images/Ellipse 13.png', description: 'Disinfectant phenyls, tile cleaners, and heavy-duty degreasers.' },
  { _id: 'c3', name: 'Bathroom & Toilet Care', imageURL: '/images/Ellipse 14.png', description: 'Powerful toilet bowl cleaners, descalers, and sanitizers.' },
  { _id: 'c4', name: 'Personal Hygiene', imageURL: '/images/Ellipse 15.png', description: 'Gentle handwashes, antibacterial sanitizers, and body care.' },
  { _id: 'c5', name: 'Kitchen Care', imageURL: '/images/Ellipse 12.png', description: 'Grease-cutting dishwash liquids, glass cleaners, and degreasers.' },
];

export default function Categories() {
  usePageStyles(HOME_STYLES);
  usePageTitle('All Categories – Bluely');

  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchCats = async () => {
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
        setCategories(list.length > 0 ? list : FALLBACK_CATEGORIES);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        if (!cancelled) setCategories(FALLBACK_CATEGORIES);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchCats();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="categories-page-wrap" style={{ minHeight: '80vh', padding: '100px 20px 60px', background: '#f8fafc' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#0284c7', background: '#e0f2fe', padding: '6px 14px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <Sparkles size={14} /> Bluely Catalog
          </span>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#071f6b', margin: '14px 0 8px' }}>
            Product Categories
          </h1>
          <p style={{ color: '#64748b', fontSize: '15px', maxWidth: '600px', margin: '0 auto' }}>
            Explore our curated collections of everyday cleaning, hygiene, and surface care formulations.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            Loading categories catalog...
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
            {categories.map((cat) => {
              const img = resolveImageUrl(cat.imageURL || cat.image || '/images/Ellipse 12.png');
              return (
                <div
                  key={cat._id || cat.id || cat.name}
                  onClick={() => navigate(`${ROUTES.PRODUCTS}?category=${encodeURIComponent(cat.name)}`)}
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    padding: '24px 20px',
                    textAlign: 'center',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(7, 31, 107, 0.12)';
                    e.currentTarget.style.borderColor = '#bae6fd';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.05)';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  <div
                    style={{
                      width: '110px',
                      height: '110px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      marginBottom: '16px',
                      border: '3px solid #e0f2fe',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.06)',
                      background: '#f8fafc',
                    }}
                  >
                    <img
                      src={img}
                      alt={cat.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/images/Ellipse 12.png';
                      }}
                    />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#071f6b', margin: '0 0 8px 0' }}>
                    {cat.name}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5', margin: '0 0 16px 0', flex: 1 }}>
                    {cat.description || 'Essential cleaning and care formulated for high performance.'}
                  </p>
                  <button
                    type="button"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      background: '#f0f7ff',
                      color: '#0284c7',
                      border: 'none',
                      borderRadius: '50px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    View Products <ArrowRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
