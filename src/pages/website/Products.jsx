import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import usePageStyles from '../../hooks/usePageStyles';
import usePageTitle from '../../hooks/usePageTitle';
import { PRODUCTS_STYLES } from '../../styles';
import { useProducts } from '../../context/ProductsContext';
import ProductCard from '../../components/ProductCard';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'detergent', label: 'Laundry Care' },
  { key: 'floor', label: 'Floor & Surface Care' },
  { key: 'toilet', label: 'Bathroom & Toilet Care' },
  { key: 'softener', label: 'Personal Hygiene' },
  { key: 'kitchen', label: 'Kitchen Hygiene' },
];

export default function Products() {
  usePageStyles(PRODUCTS_STYLES);
  usePageTitle('Bluely – Products');

  const { products } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q');
  const catParam = searchParams.get('category');
  const [category, setCategory] = useState(() => {
    if (!catParam) return 'all';
    const lower = catParam.toLowerCase();
    const found = FILTERS.find((f) => f.label.toLowerCase().includes(lower) || lower.includes(f.key));
    return found ? found.key : 'all';
  });

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
    return category === 'all'
      ? products
      : products.filter((p) => {
          const cat = (typeof p.category === 'object' ? p.category?.name : p.category) || p.categoryName || '';
          const catLower = cat.toLowerCase();
          const filterObj = FILTERS.find((f) => f.key === category);
          const labelLower = filterObj ? filterObj.label.toLowerCase() : '';
          return (
            catLower.includes(category.toLowerCase()) ||
            (labelLower && (catLower.includes(labelLower) || labelLower.includes(catLower)))
          );
        });
  }, [products, searchMode, q, category]);

  // Clicking a category leaves "search results" mode (same as filterProducts() in products.html)
  const onFilter = (key) => {
    setCategory(key);
    if (searchMode) setSearchParams({}, { replace: true });
  };

  return (
    <>
      <section className="categories">
        <h1>Categories</h1>
        <div className="filters">
          {FILTERS.map((f) => (
            <button
              type="button"
              key={f.key}
              className={`filter-btn${!searchMode && category === f.key ? ' active' : ''}`}
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
