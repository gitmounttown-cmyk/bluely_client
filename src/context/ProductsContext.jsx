import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getProductsRequest } from '../services/api';
import { resolveImageUrl } from '../utils/format';
import { useAuth } from './AuthContext';

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const { data } = await getProductsRequest();
      const rawList = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.products)
        ? data.products
        : [];

      const normalized = rawList.map((p) => {
        const img = resolveImageUrl(p.imageURL || p.image);
        const cat = typeof p.category === 'object' ? p.category?.name : p.category;
        return {
          ...p,
          id: p._id || p.id,
          image: img,
          imageURL: img,
          categoryName: cat || 'General',
        };
      });

      setProducts(normalized);
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch, token]);

  return (
    <ProductsContext.Provider value={{ products, loading, refetch }}>
      {children}
    </ProductsContext.Provider>
  );
}

export const useProducts = () => useContext(ProductsContext);
