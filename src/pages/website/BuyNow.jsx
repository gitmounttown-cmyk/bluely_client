import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronDown, Phone, User, Building2, Package, CheckCircle2, Clock, Landmark, CreditCard, Plus, Minus, Trash2, Download } from 'lucide-react';
import usePageStyles from '../../hooks/usePageStyles';
import usePageTitle from '../../hooks/usePageTitle';
import { BUYNOW_STYLES } from '../../styles';
import { createPaymentOrderRequest, getAddressesRequest, getMe } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { getJSON, setJSON } from '../../utils/storage';
import { inr, resolveImageUrl, calculateTotalVolume } from '../../utils/format';
import { ROUTES } from '../../routes/paths';
import { RAZORPAY_KEY_ID, RAZORPAY_SCRIPT_URL } from '../../config/config';
import { downloadOrderInvoice } from '../../utils/invoice';

/**
 * Checkout & Cart Page:
 * - Direct typing of bulk quantities (e.g. 100 for 100L)
 * - Volume display from Product API
 * - Hospital / Company billing (Ganga Medical Centre & Hospitals)
 * - Always shows Payment Status as Pending (Delayed days/weeks/months credit)
 * - Vishaka Medical Industries Bank Account Details
 * - Generates official Vishaka Invoice with Volume
 */
export default function BuyNow() {
  usePageStyles(BUYNOW_STYLES);
  usePageTitle('Bulk Order & Checkout');

  const navigate = useNavigate();
  const { showNotification } = useToast();
  const [params] = useSearchParams();
  const type = params.get('type');

  /* ── Initial items from localStorage ── */
  const initialItems = useMemo(() => {
    const buyNowItem = getJSON('buyNow');
    const cartItems = getJSON('cart', []) || [];

    if (buyNowItem && type === 'buyNow') {
      return [
        {
          productId: buyNowItem.id || buyNowItem._id || 'unknown',
          name: buyNowItem.name,
          price: Number(buyNowItem.price) || 0,
          litre: buyNowItem.litre || buyNowItem.volume || '1L',
          quantity: Number(buyNowItem.qty || buyNowItem.quantity) || 1,
          image: buyNowItem.image || buyNowItem.imageURL || '',
        },
      ];
    }
    return cartItems.map((item) => ({
      ...item,
      litre: item.litre || item.volume || '1L',
      quantity: Number(item.quantity) || 1,
    }));
  }, [type]);

  const [items, setItems] = useState(initialItems);

  // Sync back to localStorage when user changes quantities on cart page
  useEffect(() => {
    if (type === 'buyNow') {
      if (items.length > 0) {
        setJSON('buyNow', { ...items[0], qty: items[0].quantity });
      }
    } else {
      setJSON('cart', items);
    }
  }, [items, type]);

  /* ── Hospital & Company Buyer Details ── */
  const [hospitalName, setHospitalName] = useState('GANGA MEDICAL CENTRE AND HOSPITIALS PVT LTD');
  const [gstNumber, setGstNumber] = useState('33AABCG8283F1ZN');
  const [deliveryAddress, setDeliveryAddress] = useState('NO .2 , SWARNABIGA LAYOUT, RAMNAGAR, COIMBATORE -641 009');
  const [buyerPhone, setBuyerPhone] = useState('9361333919');
  const [poNumber, setPoNumber] = useState('Verbal');

  /* ── Payment Mode: Default to Bank Transfer with Pending status ── */
  const [paymentOption, setPaymentOption] = useState('bank_transfer'); // 'bank_transfer' | 'razorpay'

  /* ── Financial calculations (SGST 2.5% + CGST 2.5% = 5%) ── */
  const subtotal = items.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0);
  const sgst = Number((subtotal * 0.025).toFixed(2));
  const cgst = Number((subtotal * 0.025).toFixed(2));
  const totalTax = Number((sgst + cgst).toFixed(2));
  const grandTotal = Math.round(subtotal + totalTax);

  /* ── UI state ── */
  const [openSection, setOpenSection] = useState('order'); // "company" | "address" | "order"
  const [currentUser, setCurrentUser] = useState(null);
  const [userName, setUserName] = useState('Ganga Medical Centre');
  const [processing, setProcessing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const toggleSection = (id) => setOpenSection((cur) => (cur === id ? null : id));

  // Direct typed quantity change handler
  const handleQuantityChange = (index, value) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          if (value === '') return { ...item, quantity: '' };
          const qty = Math.max(1, parseInt(value, 10) || 1);
          return { ...item, quantity: qty };
        }
        return item;
      })
    );
  };

  const handleQuantityBlur = (index) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === index && (!item.quantity || Number(item.quantity) < 1)) {
          return { ...item, quantity: 1 };
        }
        return item;
      })
    );
  };

  const handleDeltaQuantity = (index, delta) => {
    setItems((prev) =>
      prev
        .map((item, i) => {
          if (i === index) {
            const next = (Number(item.quantity) || 1) + delta;
            return { ...item, quantity: next };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Quick preset helper (e.g. set to 100 for 100L bulk order)
  const setBulkPreset = (index, presetQty) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity: presetQty } : item))
    );
    showNotification(`Updated quantity to ${presetQty} units!`);
  };

  /* ── Load User Info ── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await getMe();
        if (cancelled) return;
        if (data) {
          setCurrentUser(data);
          setUserName(data.name || hospitalName);
          if (data.mobile) setBuyerPhone(data.mobile);
        }
      } catch {
        // Guest mode fallback
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ── Place Bulk Order (Pending Bank Status) ── */
  const handlePlaceOrder = async (isOnline = false, paymentId = '') => {
    if (items.length === 0) {
      showNotification('Cart is empty. Please add items.', 'error');
      return;
    }

    try {
      setProcessing(true);

      const orderItems = items.map((i) => {
        const qty = Number(i.quantity) || 1;
        const rate = Number(i.price) || 0;
        const baseVol = i.litre || i.volume || '1L';
        const calcVol = calculateTotalVolume(baseVol, qty);

        return {
          product: i.productId || i._id || i.id,
          productName: i.name || 'Medical Supply',
          volume: calcVol,
          quantity: qty,
          hsnCode: '9018',
          price: rate,
          lineTotal: rate * qty,
        };
      });

      const orderPayload = {
        items: orderItems,
        hospitalOrCompanyName: hospitalName.trim() || 'GANGA MEDICAL CENTRE AND HOSPITIALS PVT LTD',
        buyerGstin: gstNumber.trim() || '33AABCG8283F1ZN',
        buyerAddress: deliveryAddress.trim() || 'NO .2 , SWARNABIGA LAYOUT, RAMNAGAR, COIMBATORE -641 009',
        customerName: hospitalName.trim() || 'GANGA MEDICAL CENTRE AND HOSPITIALS PVT LTD',
        customerPhone: buyerPhone.trim(),
        customerEmail: currentUser?.email || 'procurement@gangahospital.com',
        shippingAddress: deliveryAddress.trim(),
        orderNo: poNumber.trim() || 'Verbal',
        invoiceNo: `V26-${Math.floor(100 + Math.random() * 900)}`,
        deliveryNote: `DNTV26-${Math.floor(100 + Math.random() * 900)}`,
        dispatchedThrough: 'Direct',
        termsOfDelivery: 'Direct Hospital Delivery',
        termsOfPayment: 'Delayed Bank Transfer (Days / Weeks / Month based delay)',
        paymentMethod: isOnline ? 'Razorpay' : 'Bank Transfer',
        paymentStatus: 'Pending', // ALWAYS Pending until verified by Admin upon bank receipt
        status: 'Pending',
        orderStatus: 'Pending',
        subtotal,
        sgst,
        cgst,
        tax: totalTax,
        discount: 0,
        totalAmount: grandTotal,
        paymentId: paymentId || '',
      };

      const { ok, data } = await createPaymentOrderRequest(orderPayload);

      if (ok) {
        const savedOrder = data?.data || data?.order || data || {
          ...orderPayload,
          createdAt: new Date().toISOString(),
        };

        showNotification(
          'Bulk Order Placed Successfully! Payment status is Pending (Bank Account receipt awaited).',
          'success'
        );

        localStorage.removeItem('buyNow');
        localStorage.removeItem('cart');

        // Automatically trigger official Vishaka Medical Industries Tax Invoice download
        downloadOrderInvoice(savedOrder);

        // Keep user on the clean Order Confirmation screen instead of redirecting to customer dashboard
        setPlacedOrder(savedOrder);
      } else {
        showNotification(data?.message || 'Failed to submit bulk order', 'error');
      }
    } catch (err) {
      console.error('Order creation error:', err);
      showNotification('Unable to record order. Please try again.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const Header = ({ id, badge, badgeClass = '', title, doneLabel }) => (
    <div className="card-header" onClick={() => toggleSection(id)}>
      <div className="header-left">
        <div className={`step-badge${badgeClass}`}>{badge}</div>
        <span className="card-title">{title}</span>
      </div>
      <div className="header-right">
        {doneLabel && <span className="badge-done">{doneLabel}</span>}
        <span className="chevron">
          <ChevronDown size={18} />
        </span>
      </div>
    </div>
  );

  const cardClass = (id) => `card${openSection === id ? ' active-card expanded' : ''}`;

  const userRole = (currentUser?.role || localStorage.getItem('role') || '').toLowerCase().trim();
  const allowedAdminRoles = ['admin', 'super admin', 'superadmin', 'cashier', 'inventory manager', 'inventory_manager', 'inventorymanager'];
  const hasAdminAccess = allowedAdminRoles.includes(userRole);

  if (placedOrder) {
    return (
      <div className="page-wrapper" style={{ maxWidth: '800px', margin: '40px auto', padding: '30px 16px' }}>
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '36px 28px',
            boxShadow: '0 10px 30px rgba(4, 26, 113, 0.08)',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: '#ecfdf5',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <CheckCircle2 size={44} />
          </div>

          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#041A71', margin: '0 0 8px 0' }}>
            Bulk Order Placed Successfully!
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 24px 0', lineHeight: '1.5' }}>
            Your bulk order has been recorded. The official Vishaka Medical Industries Tax Invoice has been generated and downloaded to your device.
          </p>

          <div
            style={{
              background: '#f8fafc',
              borderRadius: '14px',
              padding: '20px',
              marginBottom: '24px',
              textAlign: 'left',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Order ID</span>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '2px 0 0 0' }}>
                  {placedOrder.orderNo || placedOrder._id}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Hospital / Buyer</span>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '2px 0 0 0' }}>
                  {placedOrder.hospitalOrCompanyName || placedOrder.customerName || hospitalName}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Payment Status</span>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#d97706', margin: '2px 0 0 0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Clock size={14} /> Pending (Bank Transfer)
                </p>
              </div>

              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Total Amount</span>
                <p style={{ fontSize: '16px', fontWeight: 800, color: '#041A71', margin: '2px 0 0 0' }}>
                  ₹{placedOrder.totalAmount || grandTotal}
                </p>
              </div>
            </div>
          </div>

          {/* Bank Transfer Details Box */}
          <div
            style={{
              background: '#eff6ff',
              borderRadius: '14px',
              padding: '18px 20px',
              marginBottom: '28px',
              textAlign: 'left',
              border: '1px solid #bfdbfe',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Landmark size={18} color="#0284c7" />
              <strong style={{ fontSize: '13px', color: '#0369a1' }}>Bank Transfer Payment Account (ICICI Bank)</strong>
            </div>
            <div style={{ fontSize: '12.5px', color: '#334155', lineHeight: '1.6' }}>
              <div><strong>Account Name:</strong> VISHAKA MEDICAL INDUSTRIES</div>
              <div><strong>Bank:</strong> ICICI Bank Ltd</div>
              <div><strong>Account Number:</strong> 123405001234</div>
              <div><strong>IFSC Code:</strong> ICIC0001234</div>
              <div><strong>Branch:</strong> Coimbatore Main Branch</div>
              <p style={{ margin: '8px 0 0 0', fontSize: '11.5px', color: '#64748b' }}>
                Please share the bank transfer reference number once the payment is completed.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => downloadOrderInvoice(placedOrder)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 22px',
                background: '#041A71',
                color: '#ffffff',
                border: 'none',
                borderRadius: '50px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Download size={15} /> Download Tax Invoice
            </button>

            <button
              type="button"
              onClick={() => navigate(ROUTES.PRODUCTS)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 22px',
                background: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: '50px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Continue Shopping
            </button>

            {hasAdminAccess && (
              <button
                type="button"
                onClick={() => navigate(ROUTES.ADMIN_ORDERS)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '11px 22px',
                  background: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '50px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Go to Admin Orders
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ maxWidth: '960px', margin: '0 auto', padding: '30px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#041A71', margin: '0 0 6px 0' }}>
          Bulk Order & Institutional Checkout
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
          Manage bulk order volumes (e.g. 100L) with delayed bank account settlement & GST invoices.
        </p>
      </div>

      {/* 1. Hospital / Company & Buyer Section */}
      <div className={cardClass('company')} id="companyCard">
        {Header({
          id: 'company',
          badge: '1',
          badgeClass: ' completed',
          title: 'Hospital & Company Details (Buyer)',
          doneLabel: 'Configured',
        })}
        <div className={`card-body${openSection === 'company' ? ' show' : ''}`}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Hospital / Company Name (Buyer)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px', background: '#ffffff' }}>
                <Building2 size={16} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  style={{ border: 'none', outline: 'none', width: '100%', fontSize: '13px', fontWeight: 600 }}
                  placeholder="e.g. GANGA MEDICAL CENTRE AND HOSPITIALS PVT LTD"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Buyer GST Number
              </label>
              <input
                type="text"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', outline: 'none' }}
                placeholder="GSTIN (e.g. 33AABCG8283F1ZN)"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Contact Phone / Procurement
              </label>
              <input
                type="text"
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', outline: 'none' }}
                placeholder="Phone Number"
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Delivery Address
              </label>
              <textarea
                rows={2}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', outline: 'none', resize: 'vertical' }}
                placeholder="Full Hospital or Warehouse Address"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Order Summary & Direct Typed Quantity / Volume Table */}
      <div className={cardClass('order')} id="orderCard">
        {Header({ id: 'order', badge: '2', title: 'Cart Products & Bulk Quantities (Type Quantity)' })}
        <div className={`card-body${openSection === 'order' ? ' show' : ''}`}>
          {items.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Your cart is empty.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '12px', color: '#0369a1', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '10px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={16} />
                <span>
                  <strong>Tip for Bulk Orders:</strong> You can directly <strong>type the quantity</strong> into the input box below (e.g. type <strong>100</strong> for a 100L bulk order) or click the preset buttons!
                </span>
              </div>

              {items.map((item, idx) => {
                const qty = item.quantity === '' ? '' : Number(item.quantity) || 1;
                const unitVol = item.litre || item.volume || '1L';
                const totalVol = calculateTotalVolume(unitVol, qty || 1);
                const lineTotal = (Number(item.price) || 0) * (qty || 1);

                return (
                  <div
                    key={`${item.productId}-${idx}`}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '16px',
                      background: '#ffffff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div
                        style={{
                          width: '70px',
                          height: '70px',
                          borderRadius: '10px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          padding: '6px',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <img
                          src={resolveImageUrl(item.image)}
                          alt={item.name}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/images/Product.png';
                          }}
                        />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                              {item.name}
                            </h3>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '12px', color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                                Unit: {unitVol}
                              </span>
                              <span style={{ fontSize: '13px', color: '#64748b' }}>₹{item.price} / unit</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                            title="Remove product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Interactive Quantity Typing & Preset Controls */}
                        <div
                          style={{
                            marginTop: '12px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '12px',
                            background: '#f8fafc',
                            padding: '10px 12px',
                            borderRadius: '8px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                              Quantity:
                            </span>

                            <div style={{ display: 'inline-flex', alignItems: 'center', background: '#ffffff', border: '1.5px solid #0284c7', borderRadius: '8px', overflow: 'hidden' }}>
                              <button
                                type="button"
                                onClick={() => handleDeltaQuantity(idx, -1)}
                                style={{ padding: '6px 10px', border: 'none', background: '#f1f5f9', cursor: 'pointer', color: '#475569' }}
                              >
                                <Minus size={14} />
                              </button>

                              <input
                                type="number"
                                min="1"
                                max="99999"
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(idx, e.target.value)}
                                onBlur={() => handleQuantityBlur(idx)}
                                style={{
                                  width: '80px',
                                  textAlign: 'center',
                                  fontSize: '15px',
                                  fontWeight: 800,
                                  color: '#041A71',
                                  border: 'none',
                                  outline: 'none',
                                  padding: '4px 0',
                                }}
                                title="Type your exact bulk order quantity"
                              />

                              <button
                                type="button"
                                onClick={() => handleDeltaQuantity(idx, 1)}
                                style={{ padding: '6px 10px', border: 'none', background: '#f1f5f9', cursor: 'pointer', color: '#475569' }}
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            {/* Quick Presets */}
                            <div style={{ display: 'flex', gap: '4px' }}>
                              {[10, 50, 100, 500].map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => setBulkPreset(idx, preset)}
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    border: '1px solid #cbd5e1',
                                    background: qty === preset ? '#041A71' : '#ffffff',
                                    color: qty === preset ? '#ffffff' : '#475569',
                                    cursor: 'pointer',
                                  }}
                                >
                                  {preset}L
                                </button>
                              ))}
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0284c7' }}>
                              Total Volume: {totalVol}
                            </div>
                            <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                              ₹{inr(lineTotal)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Price Breakdown with GST */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  marginTop: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13.5px', color: '#64748b' }}>
                  <span>Goods Subtotal ({items.length} items):</span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>₹{inr(subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13.5px', color: '#64748b' }}>
                  <span>SGST (2.50%):</span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>₹{sgst.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13.5px', color: '#64748b' }}>
                  <span>CGST (2.50%):</span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>₹{cgst.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13.5px', color: '#64748b' }}>
                  <span>Direct Hospital Delivery:</span>
                  <span style={{ fontWeight: 700, color: '#16a34a' }}>FREE (Direct Dispatch)</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px 0 4px 0',
                    borderTop: '2px solid #041A71',
                    marginTop: '8px',
                    fontSize: '18px',
                    fontWeight: 800,
                    color: '#041A71',
                  }}
                >
                  <span>Grand Total (Invoice Amount):</span>
                  <span>₹{inr(grandTotal)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Payment Terms & Bank Settlement (Always Pending by Default) */}
      <div className={cardClass('payment')} id="paymentCard">
        {Header({ id: 'payment', badge: '3', title: 'Payment Terms & Vishaka Bank Details (Delayed Settlement)' })}
        <div className={`card-body${openSection === 'payment' ? ' show' : ''}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Primary Option: Delayed Bank Transfer (Pending) */}
            <div
              onClick={() => setPaymentOption('bank_transfer')}
              style={{
                border: paymentOption === 'bank_transfer' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                borderRadius: '12px',
                padding: '16px',
                background: paymentOption === 'bank_transfer' ? '#f0f9ff' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Landmark size={20} className="text-bluely-600" />
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                    Bank Account / Delayed Credit (Hospital & Bulk Purchase)
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    background: '#fef3c7',
                    color: '#92400e',
                    border: '1px solid #fde68a',
                  }}
                >
                  Status: PENDING PAYMENT
                </span>
              </div>

              <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                Immediate online payment is <strong>not required</strong>. Payment can be transferred via Bank Account (NEFT / RTGS / Cheque) on a <strong>days, weeks, or month-based delayed credit cycle</strong>. The Admin will mark the bill as <strong>PAID</strong> once credit is received in the Vishaka bank account.
              </p>

              {/* Official Bank Account Box from Attached Sample */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #bae6fd',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '12.5px',
                  lineHeight: 1.6,
                  color: '#1e293b',
                }}
              >
                <div style={{ fontWeight: 700, color: '#0369a1', marginBottom: '4px' }}>
                  Account Details (for Bank Transfer):
                </div>
                <div><strong>Beneficiary:</strong> Vishaka Medical Industries</div>
                <div><strong>Account Number:</strong> 7591 0550 0038</div>
                <div><strong>IFSC Code:</strong> ICIC0007591</div>
                <div><strong>Bank & Branch:</strong> ICICI BANK, SIRUMUGAI BRANCH</div>
              </div>
            </div>

            {/* Optional Online Payment Option */}
            <div
              onClick={() => setPaymentOption('razorpay')}
              style={{
                border: paymentOption === 'razorpay' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                borderRadius: '12px',
                padding: '14px 16px',
                background: paymentOption === 'razorpay' ? '#f0f9ff' : '#ffffff',
                cursor: 'pointer',
                opacity: 0.85,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CreditCard size={18} className="text-gray-500" />
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>
                  Pay Immediately via UPI / Card (Razorpay)
                </span>
              </div>
            </div>

            {/* Submit / Confirm Button */}
            <button
              type="button"
              onClick={() => handlePlaceOrder(paymentOption === 'razorpay')}
              disabled={processing || items.length === 0}
              style={{
                marginTop: '10px',
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, #041A71 0%, #0284c7 100%)',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 800,
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(4, 26, 113, 0.25)',
                transition: 'all 0.2s ease',
              }}
            >
              {processing
                ? 'Submitting Bulk Order...'
                : `Confirm Order (Status: Pending) • ₹${inr(grandTotal)}`}
            </button>
            <p style={{ textAlign: 'center', fontSize: '11.5px', color: '#64748b', margin: '4px 0 0 0' }}>
              ✓ Automatic official Vishaka Tax Invoice generation with Volume & GST upon placement
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
