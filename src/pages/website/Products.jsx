import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import usePageStyles from '../../hooks/usePageStyles';
import usePageTitle from '../../hooks/usePageTitle';
import { PRODUCTS_STYLES } from '../../styles';
import { useProducts } from '../../context/ProductsContext';
import ProductCard from '../../components/ProductCard';
import { getCategoriesRequest } from '../../services/api';

const DEFAULT_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'Laundry Care', label: 'Laundry Care' },
  { key: 'Floor & Surface Care', label: 'Floor & Surface Care' },
  { key: 'Bathroom & Toilet Care', label: 'Bathroom & Toilet Care' },
  { key: 'Personal Hygiene', label: 'Personal Hygiene' },
  { key: 'Kitchen Hygiene', label: 'Kitchen Hygiene' },
];

export default function Products() {
  usePageStyles(PRODUCTS_STYLES);
  usePageTitle('Bluely – Products');

  const { products } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [apiCategories, setApiCategories] = useState([]);
  const q = searchParams.get('q');
  const catParam = searchParams.get('category');

  const [category, setCategory] = useState(catParam || 'all');

  // Load live categories from API
  useEffect(() => {
    let cancelled = false;
    const loadCategories = async () => {
      try {
        const { data } = await getCategoriesRequest();
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
        console.error('Failed to load categories in Products:', err);
      }
    };
    loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  // Dynamically build filter list from database API categories
  const dynamicFilters = useMemo(() => {
    const list = [{ key: 'all', label: 'All' }];
    const seen = new Set(['all']);

    apiCategories.forEach((cat) => {
      const name = cat.name?.trim();
      if (name && !seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        list.push({ key: name, label: name });
      }
    });

    // Also include any categories found on product models
    products.forEach((p) => {
      const c = typeof p.category === 'object' ? p.category?.name : p.category;
      if (c && typeof c === 'string' && c.trim() && !seen.has(c.trim().toLowerCase())) {
        seen.add(c.trim().toLowerCase());
        list.push({ key: c.trim(), label: c.trim() });
      }
    });

    if (list.length <= 1) {
      return DEFAULT_FILTERS;
    }

    return list;
  }, [apiCategories, products]);

  // Sync with URL query parameter
  useEffect(() => {
    if (catParam) {
      const lower = catParam.toLowerCase();
      const match = dynamicFilters.find(
        (f) => f.label.toLowerCase() === lower || f.key.toLowerCase() === lower
      );
      setCategory(match ? match.key : catParam);
    } else {
      setCategory('all');
    }
  }, [catParam, dynamicFilters]);

  const searchMode = Boolean(q);

  const list = useMemo(() => {
    if (searchMode) {
      const lowerQ = q.toLowerCase();
      return products.filter(
        (p) =>
          p.name?.toLowerCase().includes(lowerQ) ||
          p.description?.toLowerCase().includes(lowerQ) ||
          (typeof p.category === 'object' ? p.category?.name : p.category)?.toLowerCase().includes(lowerQ)
      );
    }
    if (category === 'all') return products;

    const target = category.toLowerCase();
    return products.filter((p) => {
      const cat = ((typeof p.category === 'object' ? p.category?.name : p.category) || p.categoryName || '').toLowerCase();
      return cat.includes(target) || target.includes(cat);
    });
  }, [products, searchMode, q, category]);

  // Clicking a category leaves "search results" mode
  const onFilter = (key) => {
    setCategory(key);
    if (searchMode) setSearchParams({}, { replace: true });
  };

  return (
    <>
      <section className="categories">
        <h1>Categories</h1>
        <div className="filters">
          {dynamicFilters.map((f) => (
            <button
              type="button"
              key={f.key}
              className={`filter-btn${!searchMode && category.toLowerCase() === f.key.toLowerCase() ? ' active' : ''}`}
              onClick={() => onFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      <section className="products">
        <h2>{searchMode ? `Search Results: "${q}"` : 'Products'}</h2>
        <div className="product-grid" id="productsGrid">
          {searchMode && list.length === 0 ? (
            <p style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', fontSize: '1.2rem', color: '#666' }}>
              No products found matching "{q}"
            </p>
          ) : (
            list.map((p) => <ProductCard key={p._id || p.id} product={p} />)
          )}
        </div>
      </section>
    </>
  );
}
