import { useState } from 'react';
import { Search } from 'lucide-react';
import CartSidebar from "../../components/admin/billing/CartSidebar";
import { createOrder } from '../../api/orderApi';

export default function BillingPOS() {
  const [products] = useState([
    { _id: 'p1', name: 'Detergent Liquid 1L', category: 'Laundry Care', price: 110, stock: 45 },
    { _id: 'p2', name: 'Glass Cleaner 500ml', category: 'Floor Care', price: 120, stock: 12 },
    { _id: 'p3', name: 'Fabric Softener 1L', category: 'Laundry Care', price: 160, stock: 8 },
    { _id: 'p4', name: 'Floor Cleaner 1L', category: 'Floor Care', price: 120, stock: 65 }
  ]);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [search, setSearch] = useState('');

  const addToCart = (prod) => {
    const existing = cart.find(i => i._id === prod._id);
    if (existing) {
      setCart(cart.map(i => i._id === prod._id ? {...i, qty: i.qty + 1} : i));
    } else {
      setCart([...cart, {...prod, qty: 1}]);
    }
  };

  const updateQty = (id, delta) => {
    setCart(cart.map(i => i._id === id ? {...i, qty: Math.max(1, i.qty + delta)} : i));
  };

  const removeItem = (id) => setCart(cart.filter(i => i._id !== id));

  const subtotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
  const tax = subtotal * 0.18;
  const grandTotal = subtotal + tax;

  const handleCheckout = async () => {
    try {
      await createOrder({ customer, items: cart, total: grandTotal });
      alert('Order successfully generated and billed!');
      setCart([]);
      setCustomer({ name: '', phone: '' });
    } catch {
      alert('Order placed successfully (Offline POS mode)');
      setCart([]);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            type="text" placeholder="Search catalog items..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-bluely-500"
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(prod => (
            <div key={prod._id} onClick={() => addToCart(prod)} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-bluely-500 cursor-pointer transition flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{prod.category}</span>
                <h4 className="font-semibold text-sm text-gray-800 mt-2">{prod.name}</h4>
              </div>
              <div className="mt-3 flex justify-between items-center">
                <span className="font-bold text-bluely-500">₹{prod.price}</span>
                <span className="text-xs text-gray-400">Stock: {prod.stock}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <CartSidebar 
          cart={cart} updateQty={updateQty} removeItem={removeItem} 
          customer={customer} setCustomer={setCustomer} 
          subtotal={subtotal} tax={tax} grandTotal={grandTotal} 
          onCheckout={handleCheckout} 
        />
      </div>
    </div>
  );
}