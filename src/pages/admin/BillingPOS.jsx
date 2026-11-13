import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Minus, Trash2, ShoppingCart, CheckCircle, Building2, Package, Landmark } from 'lucide-react';
import { getProducts } from '../../api/productApi';
import { createOrder } from '../../api/orderApi';
import { resolveImageUrl, calculateTotalVolume, inr } from '../../utils/format';
import { downloadOrderInvoice } from '../../utils/invoice';

export default function BillingPOS() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);

  // Hospital & Buyer Details
  const [hospitalName, setHospitalName] = useState('GANGA MEDICAL CENTRE AND HOSPITIALS PVT LTD');
  const [gstNumber, setGstNumber] = useState('33AABCG8283F1ZN');
  const [customerPhone, setCustomerPhone] = useState('9361333919');
  const [customerEmail, setCustomerEmail] = useState('procurement@gangahospital.com');
  const [deliveryAddress, setDeliveryAddress] = useState('NO .2 , SWARNABIGA LAYOUT, RAMNAGAR, COIMBATORE -641 009');
  
  // Default to Bank Transfer (Pending status) for hospital bulk orders
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [paymentStatus, setPaymentStatus] = useState('Pending');

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

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (typeof p.category === 'object' ? p.category?.name : p.category)?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add item to cart
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === product._id);
      if (existingItem) {
        return prevCart.map((item) =>
          item._id === product._id ? { ...item, quantity: (Number(item.quantity) || 1) + 1 } : item
        );
      } else {
        return [
          ...prevCart,
          {
            ...product,
            litre: product.litre || '1L',
            quantity: 1,
          },
        ];
      }
    });
  };

  // Direct typed quantity change handler (e.g. typing 100 for 100L)
  const handleSetQuantity = (productId, val) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item._id === productId) {
          if (val === '') return { ...item, quantity: '' };
          const q = Math.max(1, parseInt(val, 10) || 1);
          return { ...item, quantity: q };
        }
        return item;
      })
    );
  };

  // Delta adjustment (+ / -)
  const updateQuantity = (productId, delta) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item._id === productId) {
            const newQty = (Number(item.quantity) || 1) + delta;
            if (newQty <= 0) return null;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * (Number(item.quantity) || 1), 0);
  const sgst = Number((subtotal * 0.025).toFixed(2));
  const cgst = Number((subtotal * 0.025).toFixed(2));
  const tax = Number((sgst + cgst).toFixed(2));
  const grandTotal = Math.round(subtotal + tax);

  const handleGenerateBill = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      setError("Please add at least one item to the cart.");
      return;
    }

    try {
      setLoading(true);
      setError('');

      const orderPayload = {
        hospitalOrCompanyName: hospitalName.trim() || 'GANGA MEDICAL CENTRE AND HOSPITIALS PVT LTD',
        buyerGstin: gstNumber.trim() || '33AABCG8283F1ZN',
        buyerAddress: deliveryAddress.trim() || 'NO .2 , SWARNABIGA LAYOUT, RAMNAGAR, COIMBATORE -641 009',
        customerName: hospitalName.trim() || 'Hospital Buyer',
        customerEmail: customerEmail.trim() || '',
        customerPhone: customerPhone.trim() || '',
        shippingAddress: deliveryAddress.trim(),
        paymentMethod: paymentMethod,
        // Default to Pending for Bank Transfer / bulk orders
        paymentStatus: paymentMethod === 'Bank Transfer' ? 'Pending' : paymentStatus,
        status: paymentMethod === 'Bank Transfer' ? 'Pending' : 'Completed',
        orderStatus: paymentMethod === 'Bank Transfer' ? 'Pending' : 'Completed',
        termsOfPayment: 'Delayed Bank Transfer (Days / Weeks / Month based delay)',
        invoiceNo: `V26-${Math.floor(100 + Math.random() * 900)}`,
        deliveryNote: `DNTV26-${Math.floor(100 + Math.random() * 900)}`,
        subtotal,
        sgst,
        cgst,
        tax,
        discount: 0,
        totalAmount: grandTotal,
        items: cart.map((item) => {
          const qty = Number(item.quantity) || 1;
          const vol = calculateTotalVolume(item.litre || '1L', qty);
          return {
            product: item._id,
            productName: item.name,
            volume: vol,
            quantity: qty,
            price: item.price,
            hsnCode: '9018',
            lineTotal: item.price * qty,
          };
        }),
      };

      const res = await createOrder(orderPayload);
      const savedOrder = res.data?.order || res.data?.data || {
        ...orderPayload,
        createdAt: new Date().toISOString(),
      };

      setSuccessMessage("POS Invoice generated successfully! Payment recorded as Pending.");
      setCart([]);

      // Auto trigger official Vishaka Tax Invoice print with volume column
      downloadOrderInvoice(savedOrder);

      setTimeout(() => {
        setSuccessMessage('');
        navigate('/admin/orders');
      }, 1500);
    } catch (err) {
      console.error("Error processing bill:", err);
      setError(err.response?.data?.message || "Failed to complete POS order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Hospital & Bulk Billing POS Terminal</h2>
          <p className="text-xs text-gray-500">Select catalog items and type bulk quantities (e.g. 100L) with delayed bank settlement.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search catalog items (Floor cleaner, Babykit, etc.)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-bluely-500 shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => {
              const imgSrc = resolveImageUrl(product.image || product.imageURL);
              const unitVolume = product.litre || '1L';

              return (
                <div
                  key={product._id}
                  onClick={() => addToCart(product)}
                  className="group bg-white rounded-xl p-3.5 border border-gray-100 shadow-xs transition cursor-pointer hover:border-bluely-500 hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded-md">
                        {typeof product.category === 'object' ? product.category?.name : product.category}
                      </span>
                      <span className="bg-sky-50 text-sky-700 text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Package size={11} /> {unitVolume}
                      </span>
                    </div>

                    <div className="w-full h-28 rounded-xl bg-gradient-to-b from-slate-50 to-slate-100/60 border border-slate-100 p-2 mb-2 flex items-center justify-center overflow-hidden">
                      <img
                        src={imgSrc}
                        alt={product.name}
                        loading="lazy"
                        className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/images/Product.png';
                        }}
                      />
                    </div>

                    <div className="mb-2">
                      <h3 className="font-semibold text-gray-800 text-sm line-clamp-1">{product.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Volume: {unitVolume}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2.5 border-t border-gray-100">
                    <span className="font-bold text-gray-900 text-base">₹{product.price}</span>
                    <span className="bg-[#041A71] text-white hover:bg-bluely-600 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition">
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

      {/* POS Quick Bill Side Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 flex flex-col justify-between h-auto lg:h-[calc(100vh-6rem)] static lg:sticky lg:top-4">
        <div>
          <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-3">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
              <ShoppingCart size={18} className="text-bluely-600" /> Hospital Quick Bill
            </h3>
            <span className="text-xs bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full border border-amber-200">
              Status: PENDING
            </span>
          </div>

          {/* Hospital / Company Inputs */}
          <div className="space-y-2 mb-3">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase">Hospital / Company Buyer</label>
              <input
                type="text"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                placeholder="Hospital / Company Name"
                className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-bluely-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">GSTIN</label>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  placeholder="33AABCG8283F1ZN"
                  className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs outline-none focus:border-bluely-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Phone</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Phone No"
                  className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs outline-none focus:border-bluely-500"
                />
              </div>
            </div>

            <div className="flex gap-1.5 pt-1">
              {['Bank Transfer', 'Cash', 'Card', 'UPI'].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`flex-1 py-1 text-[11px] font-bold rounded-lg border transition ${
                    paymentMethod === method
                      ? 'bg-[#041A71] text-white border-[#041A71]'
                      : 'bg-gray-50 text-gray-600 border-gray-200'
                  }`}
                >
                  {method === 'Bank Transfer' ? 'Bank (Pending)' : method}
                </button>
              ))}
            </div>
          </div>

          {/* Cart Items with Directly Typed Quantity Input */}
          <div className="overflow-y-auto max-h-56 sm:max-h-64 divide-y divide-gray-50 pr-1 border-t border-gray-100 pt-2">
            {cart.length > 0 ? (
              cart.map((item) => {
                const qty = item.quantity === '' ? '' : Number(item.quantity) || 1;
                const totalVol = calculateTotalVolume(item.litre || '1L', qty || 1);

                return (
                  <div key={item._id} className="py-2 flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500">
                        <span className="text-bluely-600 font-bold">{totalVol}</span>
                        <span>• ₹{item.price} each</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item._id, -1)}
                        className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600"
                      >
                        <Minus size={11} />
                      </button>

                      <input
                        type="number"
                        min="1"
                        max="99999"
                        value={item.quantity}
                        onChange={(e) => handleSetQuantity(item._id, e.target.value)}
                        onBlur={() => {
                          if (!item.quantity || Number(item.quantity) < 1) {
                            handleSetQuantity(item._id, 1);
                          }
                        }}
                        className="w-14 text-center font-bold text-xs border border-bluely-500 rounded py-0.5 outline-none bg-blue-50/40"
                        title="Type bulk quantity (e.g. 100 for 100L)"
                      />

                      <button
                        onClick={() => updateQuantity(item._id, 1)}
                        className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600"
                      >
                        <Plus size={11} />
                      </button>

                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="p-1 rounded text-red-500 hover:bg-red-50 ml-1"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-gray-400 text-xs">
                Cart is empty. Click catalog items above to add.
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-3 space-y-1.5">
          {error && <p className="text-[11px] text-red-600 bg-red-50 p-2 rounded">{error}</p>}
          {successMessage && (
            <p className="text-[11px] text-green-700 bg-green-50 p-2 rounded flex items-center gap-1">
              <CheckCircle size={14} /> {successMessage}
            </p>
          )}

          <div className="flex justify-between text-xs text-gray-500">
            <span>Subtotal</span>
            <span className="font-semibold text-gray-700">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>SGST (2.50%) + CGST (2.50%)</span>
            <span className="font-semibold text-gray-700">₹{tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-gray-900 pt-1.5 border-t border-dashed border-gray-200">
            <span>Total Bill Amount</span>
            <span className="text-[#041A71]">₹{grandTotal.toFixed(2)}</span>
          </div>

          <button
            onClick={handleGenerateBill}
            disabled={loading || cart.length === 0}
            className="w-full mt-2 bg-[#041A71] hover:bg-blue-900 text-white text-xs font-bold py-2.5 rounded-xl shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? "Generating Vishaka Bill..." : `Generate Bill (Payment Status: Pending)`}
          </button>
        </div>
      </div>
    </div>
  );
}
