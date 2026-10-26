import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../api/productApi';
import { getCategories } from '../../api/categoryApi';
import ProductModal from '../../components/admin/modals/ProductModal';

export default function InventoryStock() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([getProducts(), getCategories()]);
      
      const prodData = prodRes.data?.data || prodRes.data?.products || prodRes.data;
      if (Array.isArray(prodData)) {
        setProducts(prodData);
      } else {
        setProducts([]);
      }

      const catData = catRes.data?.categories || catRes.data?.data || catRes.data;
      if (Array.isArray(catData)) {
        setCategories(catData);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error("Error fetching inventory data:", err);
      setProducts([]);
      setCategories([]);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  const handleSave = async (formData) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, formData);
      } else {
        await createProduct(formData);
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      fetchData();
    } catch (err) {
      console.error("Error saving product:", err);
      throw err;
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        fetchData();
      } catch (err) {
        console.error("Error deleting product:", err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Product Inventory Stock</h2>
          <p className="text-xs text-gray-500">Manage stock levels, pricing, and product catalogs.</p>
        </div>
        <button 
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} 
          className="bg-bluely-500 hover:bg-bluely-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2"
        >
          <Plus size={16} /> Add New Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="py-3 px-6">Product Name</th>
              <th className="py-3 px-6">Category</th>
              <th className="py-3 px-6">Price</th>
              <th className="py-3 px-6">Stock</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {Array.isArray(products) && products.length > 0 ? (
              products.map(item => {
                const imageSrc = item.imageURL 
                  ? (item.imageURL.startsWith('http') ? item.imageURL : `http://localhost:5008${item.imageURL}`)
                  : null;

                return (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="py-3.5 px-6 font-medium">
                      <div className="flex items-center gap-3">
                        {imageSrc ? (
                          <img 
                            src={imageSrc} 
                            alt={item.name} 
                            className="w-10 h-10 object-cover rounded-lg border border-gray-100 bg-gray-50 flex-shrink-0"
                            onError={(e) => { e.target.style.display = 'none'; }} 
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs flex-shrink-0">
                            No Img
                          </div>
                        )}
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-gray-600">
                      {typeof item.category === 'object' ? item.category?.name : item.category}
                    </td>
                    <td className="py-3.5 px-6 font-semibold">₹{item.price}</td>
                    <td className="py-3.5 px-6 font-semibold">{item.stock} units</td>
                    <td className="py-3.5 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.stock <= 10 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                        {item.stock <= 10 ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right space-x-2">
                      <button 
                        onClick={() => { setEditingProduct(item); setIsModalOpen(true); }} 
                        className="text-bluely-600 text-xs px-2 py-1 bg-blue-50 rounded"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(item._id)} 
                        className="text-red-600 text-xs px-2 py-1 bg-red-50 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-400 text-sm">
                  No products found. Click "Add New Product" to add your first product.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        editingProduct={editingProduct} 
        categories={categories} 
      />
    </div>
  );
}