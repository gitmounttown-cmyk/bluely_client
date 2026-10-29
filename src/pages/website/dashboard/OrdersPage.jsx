import { useCallback, useEffect, useState } from 'react';
import { Download, FileText, Star, Trash2 } from 'lucide-react';
import { getMyOrdersRequest, removeOrderItemRequest } from '../../../services/api';
import { formatDate, productColorClass, resolveImageUrl } from '../../../utils/format';
import { downloadOrderInvoice } from '../../../utils/invoice';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'Success', label: 'Delivered' },
  { key: 'Refunded', label: 'Refunded' },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    try {
      const { data } = await getMyOrdersRequest();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.orders)
        ? data.orders
        : [];
      setOrders(list);
    } catch (err) {
      console.error('Orders error:', err);
      setOrders([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const removeFromOrders = async (itemId, orderId) => {
    try {
      if (!window.confirm('Are you sure you want to remove this item from the order?')) return;
      const { ok, data } = await removeOrderItemRequest(orderId, itemId);
      if (!ok) {
        window.alert(data?.message || 'Failed to remove');
        return;
      }
      await load();
    } catch (error) {
      console.error('Remove orders frontend error:', error);
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div id="ordersPage" className="page active">
      <h1 className="page-title">Orders</h1>
      <div className="order-filters">
        {FILTERS.map((f) => (
          <button
            type="button"
            key={f.key}
            className={`filter-btn${filter === f.key ? ' active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="product-list" id="ordersList">
        {filtered.length === 0 ? (
          <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>No orders found.</p>
        ) : (
          filtered.map((order) => {
            const orderDate = formatDate(
              order.status === 'Refunded' ? order.refundDate || order.createdAt : order.createdAt
            );
            const statusLabel =
              order.status === 'Success'
                ? 'Delivered'
                : order.status === 'Refunded'
                ? 'Refunded'
                : order.status || order.orderStatus || 'Processing';

            return (order.items || []).map((item, idx) => {
              const itemImg = resolveImageUrl(
                item.product?.imageURL ||
                item.product?.image ||
                item.image
              );
              const catColor = productColorClass(item.product?.category);
              const itemName =
                item.productName || item.product?.name || item.name || 'Bluely Cleaning Product';
              const itemPrice = item.price || item.product?.price || 0;

              return (
                <div className="product-card" key={`${order._id}-${item._id || idx}`}>
                  <div className={`product-image ${catColor}`}>
                    <img
                      src={itemImg}
                      alt={itemName}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/images/Product.png';
                      }}
                    />
                  </div>
                  <div className="product-info">
                    <h3>{itemName}</h3>
                    <div className="rating">
                      {item.rating || 4.5} <Star size={12} fill="currentColor" />
                    </div>
                    <p>
                      Order #{order.orderNo || order._id?.slice(-8)} • Qty: {item.quantity || 1} •{' '}
                      {order.paymentMethod || 'Online'}
                    </p>
                  </div>
                  <div className="product-price">₹{itemPrice}</div>
                  <div className="delivery-status">
                    <div className="status">
                      {statusLabel} on {orderDate}
                    </div>
                    <div className="message">Order status: {statusLabel}</div>
                    <button
                      type="button"
                      onClick={() => downloadOrderInvoice(order)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#e0f2fe',
                        color: '#0369a1',
                        border: '1px solid #bae6fd',
                        borderRadius: '6px',
                        padding: '5px 12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginTop: '8px',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#0284c7';
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#e0f2fe';
                        e.currentTarget.style.color = '#0369a1';
                      }}
                      title="Download Tax Invoice"
                    >
                      <Download size={13} /> Download Invoice
                    </button>
                    <div className="review-link" style={{ marginTop: '6px' }}>
                      <Star size={13} fill="currentColor" /> Ratings &amp; Reviews
                    </div>
                  </div>
                  {(order.status === 'pending' || order.status === 'Pending') && (
                    <button
                      type="button"
                      className="btn-delete"
                      onClick={() => removeFromOrders(item._id, order._id)}
                      aria-label="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              );
            });
          })
        )}
      </div>
    </div>
  );
}
