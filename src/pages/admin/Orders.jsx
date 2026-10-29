import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { getOrders } from '../../api/orderApi';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getOrders();
      const orderData = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.orders || []);
      setOrders(Array.isArray(orderData) ? orderData : []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError('Failed to load customer orders.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDownloadInvoice = (order) => {
    const printWindow = window.open('', '_blank');
    const items = Array.isArray(order.items) ? order.items : [];
    
    const itemsHtml = items.map(item => {
      const name = item.productName || item.product?.name || 'Product Item';
      const qty = item.quantity || 1;
      const price = item.price || 0;
      const lineTotal = item.lineTotal || (price * qty);

      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${qty}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${price}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${lineTotal}</td>
        </tr>
      `;
    }).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - #${order.orderNo || order._id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; color: #333; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f8fafc; color: #475569; padding: 10px; text-align: left; }
            .totals { margin-top: 20px; float: right; width: 250px; }
            .totals div { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
            .grand-total { font-weight: bold; font-size: 16px; border-top: 1px solid #333; padding-top: 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h2 style="color: #0284c7; margin: 0;">BLUELY E-COMMERCE</h2>
              <p style="margin: 4px 0; color: #666; font-size: 12px;">Admin & POS Invoice Receipt</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; font-weight: bold;">Order: #${order.orderNo || order._id}</p>
              <p style="margin: 4px 0; color: #666; font-size: 12px;">Date: ${new Date(order.createdAt || Date.now()).toLocaleString()}</p>
            </div>
          </div>
          <p><strong>Customer:</strong> ${order.customerName || order.user?.name || 'Walk-in Customer'}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod || 'Cash'}</p>
          <p><strong>Status:</strong> ${order.orderStatus || order.status || 'Completed'}</p>
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th style="text-align: center;">Quantity</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="totals">
            <div><span>Subtotal:</span> <span>₹${order.subtotal || order.totalAmount || 0}</span></div>
            <div><span>GST (18%):</span> <span>₹${order.tax || 0}</span></div>
            <div class="grand-total"><span>Grand Total:</span> <span>₹${order.totalAmount || 0}</span></div>
          </div>
          <script>
            window.onload = () => { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Customer Orders</h2>
        <p className="text-xs text-gray-500">Manage and view all incoming customer transactions & invoices.</p>
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="py-3 px-6">Order ID</th>
              <th className="py-3 px-6">Customer</th>
              <th className="py-3 px-6">Payment</th>
              <th className="py-3 px-6">Total</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6 text-right">Invoice</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr><td colSpan="6" className="py-8 text-center text-gray-400 text-sm">Loading orders...</td></tr>
            ) : Array.isArray(orders) && orders.length > 0 ? (
              orders.map(o => (
                <tr key={o._id} className="hover:bg-gray-50">
                  <td className="py-3.5 px-6 font-semibold text-blue-900">#{o.orderNo || o._id.slice(-6)}</td>
                  <td className="py-3.5 px-6 font-medium text-gray-800">{o.customerName || o.user?.name || 'Walk-in Customer'}</td>
                  <td className="py-3.5 px-6 text-gray-600">{o.paymentMethod || 'Cash'}</td>
                  <td className="py-3.5 px-6 font-semibold text-gray-800">₹{o.totalAmount ?? o.total ?? 0}</td>
                  <td className="py-3.5 px-6">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                      {o.orderStatus || o.status || 'Completed'}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      onClick={() => handleDownloadInvoice(o)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 px-3 py-1.5 rounded-lg transition"
                    >
                      <Download size={14} /> Download
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" className="py-8 text-center text-gray-400 text-sm">No orders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}