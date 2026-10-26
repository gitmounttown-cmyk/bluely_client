import  { useState, useEffect } from 'react';
import { getOrders } from '../../api/orderApi';

export default function Orders() {
  const [orders, setOrders] = useState([
    { _id: 'BL-9021', customer: { name: 'R. Priya (Chennai)' }, items: [{ name: 'Detergent Liquid' }], total: 230, status: 'Delivered' },
    { _id: 'BL-9022', customer: { name: 'K. Arun (Coimbatore)' }, items: [{ name: 'Floor Cleaner' }], total: 280, status: 'Processing' }
  ]);

  useEffect(() => {
    getOrders().then(res => setOrders(res.data.orders || res.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Customer Orders</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="py-3 px-6">Order ID</th>
              <th className="py-3 px-6">Customer</th>
              <th className="py-3 px-6">Total</th>
              <th className="py-3 px-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {orders.map(o => (
              <tr key={o._id}>
                <td className="py-3 px-6 font-semibold text-bluely-600">#{o._id}</td>
                <td className="py-3 px-6">{o.customer?.name || 'Walk-in'}</td>
                <td className="py-3 px-6 font-medium">₹{o.total}</td>
                <td className="py-3 px-6">
                  <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold">{o.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}