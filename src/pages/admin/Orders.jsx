import { useState, useEffect, useMemo } from 'react';
import { Download, CheckCircle, Clock, Search, Filter, Building2, Package, RefreshCw } from 'lucide-react';
import { getOrders, updatePaymentStatus } from '../../api/orderApi';
import { downloadOrderInvoice } from '../../utils/invoice';
import { calculateTotalVolume, inr } from '../../utils/format';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Pending' | 'Paid'
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getOrders();
      const orderData = Array.isArray(res.data) ? res.data : res.data?.data || res.data?.orders || [];
      setOrders(Array.isArray(orderData) ? orderData : []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError('Failed to load hospital orders.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Handle Admin marking an order from Pending to Paid (or vice versa) upon Bank Account receipt
  const handleTogglePaymentStatus = async (order, targetStatus) => {
    try {
      setUpdatingId(order._id);
      const bankRef = targetStatus === 'Paid' ? `ICICI-BANK-${Date.now().toString().slice(-6)}` : '';
      await updatePaymentStatus(order._id, targetStatus, bankRef);

      // Update local state smoothly
      setOrders((prev) =>
        prev.map((o) =>
          o._id === order._id
            ? {
                ...o,
                paymentStatus: targetStatus,
                status: targetStatus,
                orderStatus: targetStatus,
                paidAt: targetStatus === 'Paid' ? new Date().toISOString() : null,
                bankReference: bankRef,
              }
            : o
        )
      );
    } catch (err) {
      console.error("Failed to update payment status:", err);
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const isPending = (o.paymentStatus === 'Pending' || o.status === 'Pending') && o.paymentStatus !== 'Paid';
      const isPaid = o.paymentStatus === 'Paid' || o.status === 'Paid' || o.status === 'Completed';

      if (statusFilter === 'Pending' && !isPending) return false;
      if (statusFilter === 'Paid' && !isPaid) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hosp = (o.hospitalOrCompanyName || o.customerName || '').toLowerCase();
        const ordNo = (o.orderNo || '').toLowerCase();
        const invNo = (o.invoiceNo || '').toLowerCase();
        const gstin = (o.buyerGstin || '').toLowerCase();
        return hosp.includes(q) || ordNo.includes(q) || invNo.includes(q) || gstin.includes(q);
      }
      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  // Overall metric counters
  const metrics = useMemo(() => {
    let pendingCount = 0;
    let pendingAmount = 0;
    let paidCount = 0;
    let paidAmount = 0;

    orders.forEach((o) => {
      const amt = Number(o.totalAmount || o.grandTotal || o.subtotal || 0);
      const isPending = (o.paymentStatus === 'Pending' || o.status === 'Pending') && o.paymentStatus !== 'Paid';
      if (isPending) {
        pendingCount += 1;
        pendingAmount += amt;
      } else {
        paidCount += 1;
        paidAmount += amt;
      }
    });

    return { pendingCount, pendingAmount, paidCount, paidAmount };
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Hospital & Bulk Orders Management</h2>
          <p className="text-xs text-gray-500">
            Track delayed bank settlements (days/weeks/month credit) and generate Vishaka invoices.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-lg transition shadow-xs"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Bills
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500">Total Bulk Bills</p>
            <h3 className="text-xl font-bold text-gray-900 mt-0.5">{orders.length}</h3>
          </div>
          <span className="p-2.5 rounded-lg bg-blue-50 text-[#041A71]"><Building2 size={20} /></span>
        </div>

        <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-800">Pending Bank Payments</p>
            <h3 className="text-xl font-bold text-amber-900 mt-0.5">₹{inr(metrics.pendingAmount)}</h3>
            <span className="text-[11px] text-amber-700 font-medium">{metrics.pendingCount} unpaid bulk bills</span>
          </div>
          <span className="p-2.5 rounded-lg bg-amber-100 text-amber-800"><Clock size={20} /></span>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-800">Settled & Paid Collections</p>
            <h3 className="text-xl font-bold text-emerald-900 mt-0.5">₹{inr(metrics.paidAmount)}</h3>
            <span className="text-[11px] text-emerald-700 font-medium">{metrics.paidCount} paid in bank</span>
          </div>
          <span className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800"><CheckCircle size={20} /></span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3.5 rounded-xl border border-gray-100">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search Hospital name, Invoice, GSTIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50/60 pl-9 pr-3 py-1.5 text-xs outline-none focus:border-bluely-500"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {['All', 'Pending', 'Paid'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === st
                  ? 'bg-[#041A71] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st === 'Pending' ? `Pending (${metrics.pendingCount})` : st}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[780px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">Invoice / Order</th>
                <th className="py-3 px-4">Hospital / Company (Buyer)</th>
                <th className="py-3 px-4">Volume & Items</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-400 text-sm">
                    Loading hospital orders...
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((o) => {
                  const isPending =
                    (o.paymentStatus === 'Pending' || o.status === 'Pending') && o.paymentStatus !== 'Paid';
                  const orderDate = new Date(o.createdAt || o.orderDate || Date.now()).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  });

                  const itemsList = Array.isArray(o.items) ? o.items : [];
                  const volumeSummary =
                    itemsList
                      .map((i) => {
                        const qty = Number(i.quantity) || 1;
                        const vol = i.volume || i.product?.litre || '1L';
                        return `${vol} × ${qty}`;
                      })
                      .join(', ') || 'Bulk Supply';

                  return (
                    <tr key={o._id} className="hover:bg-gray-50/70 transition">
                      {/* Invoice No */}
                      <td className="py-3.5 px-4 font-semibold text-blue-900">
                        <div>#{o.invoiceNo || `V26-${o.orderNo?.slice(-3) || '159'}`}</div>
                        <span className="text-[11px] text-gray-400 font-normal">{o.orderNo || 'Verbal'}</span>
                      </td>

                      {/* Hospital Buyer */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-800 text-xs">
                          {o.hospitalOrCompanyName || o.customerName || 'Ganga Medical Centre'}
                        </div>
                        {o.buyerGstin && (
                          <div className="text-[10px] text-gray-400">GSTIN: {o.buyerGstin}</div>
                        )}
                      </td>

                      {/* Volume & Items */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded inline-block">
                          {volumeSummary}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          {itemsList.length} item{itemsList.length > 1 ? 's' : ''}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-xs text-gray-600 whitespace-nowrap">
                        {orderDate}
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        ₹{inr(o.totalAmount ?? o.grandTotal ?? o.subtotal ?? 0)}
                      </td>

                      {/* Payment Status with Direct Action */}
                      <td className="py-3.5 px-4">
                        {isPending ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <Clock size={11} /> Pending
                            </span>
                            <button
                              type="button"
                              disabled={updatingId === o._id}
                              onClick={() => handleTogglePaymentStatus(o, 'Paid')}
                              className="text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-md transition shadow-2xs whitespace-nowrap"
                              title="Click once payment is received into Vishaka bank account"
                            >
                              {updatingId === o._id ? 'Updating...' : 'Mark Paid'}
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle size={11} /> Paid via Bank
                            </span>
                            <button
                              type="button"
                              disabled={updatingId === o._id}
                              onClick={() => handleTogglePaymentStatus(o, 'Pending')}
                              className="text-[10px] text-gray-400 hover:text-amber-600 underline ml-1"
                              title="Revert back to Pending"
                            >
                              Revert
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Download Invoice */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => downloadOrderInvoice(o)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-[#041A71] hover:bg-blue-800 px-2.5 py-1.5 rounded-lg transition shadow-xs"
                          title="Download official Vishaka Medical Industries Tax Invoice"
                        >
                          <Download size={13} /> Invoice
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-400 text-sm">
                    No hospital orders found matching filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
