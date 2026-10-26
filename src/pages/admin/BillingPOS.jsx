import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Minus, Trash2, ShoppingCart, CheckCircle } from 'lucide-react';
import { getProducts } from '../../api/productApi';
import { createOrder } from '../../api/orderApi';

export default function BillingPOS() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      const productData = res.data?.data || res.data?.products || res.data;
      if (Array.isArray(productData)) {
        setProducts(productData);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Error fetching catalog products:", err);
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (typeof p.category === 'object' ? p.category?.name : p.category)?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add item to cart with real-time stock monitoring
  const addToCart = (product) => {
    const dbStock = product.stock ?? 0;
    const cartItem = cart.find(item => item._id === product._id);
    const currentCartQty = cartItem ? cartItem.quantity : 0;

    if (currentCartQty >= dbStock) {
      alert("Cannot add more than available stock.");
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item._id === product._id);
      if (existingItem) {
        return prevCart.map(item => 
          item._id === product._id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  // Update item quantity in cart with stock validation
  const updateQuantity = (productId, delta) => {
    const product = products.find(p => p._id === productId);
    const dbStock = product ? (product.stock ?? 0) : 0;

    setCart(prevCart => {
      return prevCart.map(item => {
        if (item._id === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > dbStock) {
            alert("Exceeds available stock.");
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item._id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.18;
  const grandTotal = subtotal + tax;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const submitOrderToBackend = async (paymentDetails = {}) => {
    const orderPayload = {
      customerName: customerName.trim() || `Walk-in Customer (${customerPhone || 'POS'})`,
      customerEmail: customerEmail.trim() || '',
      paymentMethod: paymentMethod,
      status: "Completed",
      discount: 0,
      paymentDetails,
      items: cart.map(item => ({
        product: item._id,
        quantity: item.quantity
      }))
    };

    await createOrder(orderPayload);
    
    setSuccessMessage("Bill generated successfully! Stock updated.");
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    
    // Refresh product stock catalog from backend
    await fetchProducts();

    setTimeout(() => {
      setSuccessMessage('');
      navigate('/orders');
    }, 1500);
  };

  const handleGenerateBill = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      setError("Please add at least one item to the cart.");
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (paymentMethod === 'UPI' || paymentMethod === 'Card') {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          alert('Razorpay SDK failed to load. Check your internet connection.');
          setLoading(false);
          return;
        }

        const options = {
          key: "rzp_test_TliPBF8ABANiq8",
          amount: Math.round(grandTotal * 100),
          currency: "INR",
          name: "Bluely E-Commerce",
          description: `POS Bill for ${customerName || 'Customer'}`,
          handler: async function (response) {
            try {
              await submitOrderToBackend({
                razorpay_payment_id: response.razorpay_payment_id,
              });
            } catch (err) {
              console.error("Backend order save error:", err);
              setError("Payment successful, but failed to save order on server.");
              setLoading(false);
            }
          },
          prefill: {
            name: customerName,
            email: customerEmail,
            contact: customerPhone,
          },
          theme: {
            color: "#0284c7"
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        setLoading(false);
      } else {
        await submitOrderToBackend();
      }
    } catch (err) {
      console.error("Error processing bill:", err);
      setError(err.response?.data?.message || "Failed to complete order.");
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Billing & POS Terminal</h2>
          <p className="text-xs text-gray-500">Select catalog items to build customer bills instantly.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search catalog items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-bluely-500 shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => {
              const imageSrc = product.imageURL 
                ? (product.imageURL.startsWith('http') ? product.imageURL : `http://localhost:5008${product.imageURL}`)
                : null;

              // Real-time stock monitoring calculation
              const dbStock = product.stock ?? 0;
              const cartItem = cart.find(item => item._id === product._id);
              const liveStock = dbStock - (cartItem ? cartItem.quantity : 0);

              return (
                <div
                  key={product._id}
                  onClick={() => addToCart(product)}
                  className={`bg-white rounded-xl p-4 border border-gray-100 shadow-sm transition cursor-pointer hover:border-bluely-500 hover:shadow-md flex flex-col justify-between ${liveStock <= 0 ? 'opacity-60 bg-gray-50' : ''}`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-gray-100 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded">
                        {typeof product.category === 'object' ? product.category?.name : product.category}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${liveStock <= 10 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        Stock: {liveStock}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      {imageSrc ? (
                        <img src={imageSrc} alt={product.name} className="w-12 h-12 object-cover rounded-lg border border-gray-100 bg-gray-50 flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs flex-shrink-0">Img</div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-800 text-sm line-clamp-1">{product.name}</h3>
                        {product.litre && <p className="text-xs text-gray-400">{product.litre}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                    <span className="font-bold text-gray-900 text-base">₹{product.price}</span>
                    <span className="bg-blue-50 text-bluely-600 p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1">
                      <Plus size={14} /> Add
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center text-gray-400 text-sm bg-white rounded-xl border border-gray-100">
              No products found in catalog.
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between h-[calc(100vh-7rem)] sticky top-6">
        <div>
          <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <ShoppingCart size={18} className="text-bluely-600" /> POS Quick Bill
            </h3>
            <span className="text-xs bg-blue-50 text-bluely-600 font-semibold px-2 py-0.5 rounded-full">
              {cart.reduce((sum, item) => sum + item.quantity, 0)} items
            </span>
          </div>

          <div className="space-y-3 mb-4">
            <input
              type="text"
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-bluely-500"
            />
            <input
              type="email"
              placeholder="Customer Email (for Invoice)"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-bluely-500"
            />
            <input
              type="text"
              placeholder="Phone Number"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-bluely-500"
            />
            
            <div className="flex gap-2">
              {['UPI', 'Card', 'Cash'].map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition ${paymentMethod === method ? 'bg-bluely-500 text-white border-bluely-500' : 'bg-gray-50 text-gray-600 border-gray-200'}`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(100vh-28rem)] divide-y divide-gray-50 pr-1">
            {cart.length > 0 ? (
              cart.map(item => (
                <div key={item._id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
                    <p className="text-[11px] text-gray-500">₹{item.price} × {item.quantity}</p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button onClick={() => updateQuantity(item._id, -1)} className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600"><Minus size={12} /></button>
                    <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, 1)} className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600"><Plus size={12} /></button>
                    <button onClick={() => removeFromCart(item._id)} className="p-1 rounded text-red-500 hover:bg-red-50 ml-1"><Trash2 size={13} /></button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center text-gray-400 text-xs">Cart is empty</div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-2">
          {error && <p className="text-[11px] text-red-600 bg-red-50 p-2 rounded">{error}</p>}
          {successMessage && <p className="text-[11px] text-green-700 bg-green-50 p-2 rounded flex items-center gap-1"><CheckCircle size={14}/> {successMessage}</p>}
          
          <div className="flex justify-between text-xs text-gray-500"><span>Subtotal</span><span className="font-semibold text-gray-700">₹{subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-xs text-gray-500"><span>GST (18%)</span><span className="font-semibold text-gray-700">₹{tax.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-dashed border-gray-200">
            <span>Grand Total</span>
            <span className="text-bluely-600">₹{grandTotal.toFixed(2)}</span>
          </div>

          <button
            onClick={handleGenerateBill}
            disabled={loading || cart.length === 0}
            className="w-full mt-3 bg-bluely-500 hover:bg-bluely-600 text-white text-sm font-semibold py-3 rounded-xl shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? "Processing..." : `Complete & Pay via ${paymentMethod}`}
          </button>
        </div>
      </div>
    </div>
  );
}