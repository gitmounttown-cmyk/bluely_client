import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  ArrowUpRight, 
  Package, 
  ChevronRight,
  AlertCircle,
  Clock,
  CheckCircle,
  Building2,
  Calendar,
  Download,
  Landmark,
  RefreshCw
} from 'lucide-react';
import { getDashboardStats } from '../../api/dashboardApi';
import { updatePaymentStatus } from '../../api/orderApi';
import { downloadOrderInvoice } from '../../utils/invoice';
import { inr } from '../../utils/format';

export default function Dashboard() {
  const [statsData, setStatsData] = useState({
    totalSales: '₹ 0',
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    lowStockCount: 0,
    recentOrders: [],
    lowStockItems: [],
    inventoryOverview: [],
    pendingSummary: {
      totalPendingAmount: 0,
      formattedTotalPending: '₹ 0',
      totalPendingCount: 0,
      totalPaidAmount: 0,
      formattedTotalPaid: '₹ 0',
      totalPaidCount: 0,
    },
    pendingByMonth: [],
    pendingByCompany: [],
    allPendingBills: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingBillId, setUpdatingBillId] = useState(null);

  // Pending Bills view mode: 'company' | 'month' | 'all'
  const [pendingViewMode, setPendingViewMode] = useState('company');
  const [selectedMonth, setSelectedMonth] = useState('all');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getDashboardStats();
      const data = res.data?.data || res.data;
      if (data) {
        setStatsData(data);
      }
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      setError(err.response?.data?.message || "Failed to load dashboard metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Admin marks a pending bill as Paid directly from Dashboard upon Bank receipt
  const handleMarkBillPaid = async (billId) => {
    try {
      setUpdatingBillId(billId);
      const bankRef = `ICICI-BANK-${Date.now().toString().slice(-6)}`;
      await updatePaymentStatus(billId, 'Paid', bankRef);
      // Refresh dashboard metrics
      await fetchDashboardData();
    } catch (err) {
      console.error("Error marking bill paid:", err);
      alert("Failed to update bill payment status. Please try again.");
    } finally {
      setUpdatingBillId(null);
    }
  };

  const pendingSummary = statsData.pendingSummary || {
    totalPendingAmount: 0,
    formattedTotalPending: '₹ 0',
    totalPendingCount: 0,
  };

  const statCards = [
    {
      title: 'Total Revenue / Sales',
      value: statsData.totalSales,
      change: '+12% vs last month',
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Pending Bank Receivables',
      value: pendingSummary.formattedTotalPending,
      change: `${pendingSummary.totalPendingCount} unpaid bulk bills`,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      highlight: true,
    },
    {
      title: 'Total Active Products',
      value: statsData.totalProducts,
      change: 'Catalog inventory items',
      icon: Package,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Low Stock Threshold',
      value: statsData.lowStockCount,
      change: 'Requires replenishment',
      icon: AlertTriangle,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Hospital & Bulk Billing Dashboard</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time tracking of month-wise & hospital-based pending bills, volume supplies, and bank collections.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh Metrics
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-600">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Top Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition shadow-xs flex flex-col justify-between ${
                stat.highlight
                  ? 'bg-gradient-to-br from-amber-50/90 to-amber-100/40 border-amber-300'
                  : 'bg-white border-gray-100'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-gray-500">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    {loading ? "..." : stat.value}
                  </h3>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon size={20} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-gray-600">
                <span>{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================== */}
      {/* PENDING BILLS MODULE: MONTH-WISE & HOSPITAL / COMPANY BASED */}
      {/* ========================================================== */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Module Header & View Tabs */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-gray-50 to-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                <Landmark size={18} />
              </span>
              <h2 className="text-base font-bold text-gray-900">
                Pending Bills & Outstanding Hospital Receivables
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Bulk orders are delayed for days, weeks, or months. Review pending balances by hospital or by month and mark as Paid upon bank credit.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setPendingViewMode('company')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                pendingViewMode === 'company'
                  ? 'bg-[#041A71] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Building2 size={13} className="inline mr-1.5" /> By Hospital / Company
            </button>
            <button
              onClick={() => setPendingViewMode('month')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                pendingViewMode === 'month'
                  ? 'bg-[#041A71] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar size={13} className="inline mr-1.5" /> Month-wise View
            </button>
            <button
              onClick={() => setPendingViewMode('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                pendingViewMode === 'all'
                  ? 'bg-[#041A71] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Invoices ({statsData.allPendingBills?.length || 0})
            </button>
          </div>
        </div>

        {/* TAB 1: HOSPITAL / COMPANY VIEW */}
        {pendingViewMode === 'company' && (
          <div className="p-5 space-y-4">
            {statsData.pendingByCompany && statsData.pendingByCompany.length > 0 ? (
              statsData.pendingByCompany.map((company, cIdx) => (
                <div
                  key={cIdx}
                  className="border border-gray-200 rounded-xl p-4.5 bg-gradient-to-b from-white to-gray-50/40 hover:border-blue-300 transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-100 pb-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Building2 size={18} className="text-[#041A71]" />
                        <h3 className="font-bold text-gray-900 text-sm">{company.companyName}</h3>
                        {company.buyerGstin && (
                          <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            GST: {company.buyerGstin}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{company.buyerAddress}</p>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span className="text-[11px] text-gray-400 uppercase font-semibold">Total Pending</span>
                        <div className="text-lg font-extrabold text-amber-700">
                          {company.formattedTotal}
                        </div>
                      </div>
                      <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full border border-amber-200 whitespace-nowrap">
                        {company.billCount} Bill{company.billCount > 1 ? 's' : ''} Pending
                      </span>
                    </div>
                  </div>

                  {/* List of Invoices for this company */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Pending Invoices & Supply Details:
                    </span>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="text-gray-400 border-b border-gray-200 pb-1">
                            <th className="py-2 font-semibold">Invoice No</th>
                            <th className="py-2 font-semibold">Bill Date</th>
                            <th className="py-2 font-semibold">Volume Supplied</th>
                            <th className="py-2 font-semibold">Payment Terms</th>
                            <th className="py-2 text-right font-semibold">Amount</th>
                            <th className="py-2 text-right font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {company.bills.map((bill, bIdx) => (
                            <tr key={bIdx} className="hover:bg-white transition">
                              <td className="py-2.5 font-bold text-blue-900">#{bill.invoiceNo}</td>
                              <td className="py-2.5 text-gray-600">{bill.date}</td>
                              <td className="py-2.5">
                                <span className="font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded">
                                  {bill.volumeSummary}
                                </span>
                              </td>
                              <td className="py-2.5 text-gray-500">
                                <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                                  <Clock size={11} /> {bill.delayNotice || 'Delayed Credit'}
                                </span>
                              </td>
                              <td className="py-2.5 text-right font-bold text-gray-900">
                                {bill.formattedAmount}
                              </td>
                              <td className="py-2.5 text-right space-x-2">
                                <button
                                  type="button"
                                  disabled={updatingBillId === bill._id}
                                  onClick={() => handleMarkBillPaid(bill._id)}
                                  className="text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-md transition shadow-2xs"
                                  title="Mark as Paid once payment is credited to Vishaka ICICI account"
                                >
                                  {updatingBillId === bill._id ? 'Updating...' : 'Mark as Paid'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => downloadOrderInvoice(bill)}
                                  className="text-[11px] font-semibold bg-[#041A71] hover:bg-blue-900 text-white px-2 py-1 rounded-md transition shadow-2xs"
                                  title="Download official Vishaka Medical Industries Tax Invoice"
                                >
                                  <Download size={11} className="inline mr-1" /> Invoice
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-gray-400 text-sm">
                No pending hospital bills recorded. All bulk orders are settled.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MONTH-WISE VIEW */}
        {pendingViewMode === 'month' && (
          <div className="p-5 space-y-6">
            {statsData.pendingByMonth && statsData.pendingByMonth.length > 0 ? (
              statsData.pendingByMonth.map((monthGroup, mIdx) => (
                <div key={mIdx} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-[#041A71]" />
                      <h3 className="font-bold text-gray-900 text-sm">{monthGroup.monthLabel}</h3>
                      <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                        {monthGroup.count} Bill{monthGroup.count > 1 ? 's' : ''} Pending
                      </span>
                    </div>
                    <div className="text-sm font-extrabold text-[#041A71]">
                      Total: {monthGroup.formattedTotal}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-white border-b border-gray-100 text-gray-400">
                          <th className="py-2.5 px-4 font-semibold">Invoice No</th>
                          <th className="py-2.5 px-4 font-semibold">Hospital / Company Buyer</th>
                          <th className="py-2.5 px-4 font-semibold">Volume Supplied</th>
                          <th className="py-2.5 px-4 font-semibold">Date</th>
                          <th className="py-2.5 px-4 text-right font-semibold">Amount</th>
                          <th className="py-2.5 px-4 text-right font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {monthGroup.bills.map((bill, bIdx) => (
                          <tr key={bIdx} className="hover:bg-gray-50/50 transition">
                            <td className="py-3 px-4 font-bold text-blue-900">#{bill.invoiceNo}</td>
                            <td className="py-3 px-4 font-medium text-gray-800">
                              {bill.hospitalOrCompanyName}
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded">
                                {bill.volumeSummary}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-500">{bill.date}</td>
                            <td className="py-3 px-4 text-right font-bold text-gray-900">
                              {bill.formattedAmount}
                            </td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <button
                                type="button"
                                disabled={updatingBillId === bill._id}
                                onClick={() => handleMarkBillPaid(bill._id)}
                                className="text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-md transition shadow-2xs"
                              >
                                {updatingBillId === bill._id ? 'Updating...' : 'Mark Paid'}
                              </button>
                              <button
                                type="button"
                                onClick={() => downloadOrderInvoice(bill)}
                                className="text-[11px] font-semibold bg-[#041A71] hover:bg-blue-900 text-white px-2 py-1 rounded-md transition shadow-2xs"
                              >
                                <Download size={11} className="inline mr-1" /> Invoice
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-gray-400 text-sm">
                No monthly pending bills found.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ALL PENDING INVOICES TABLE */}
        {pendingViewMode === 'all' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Invoice No</th>
                  <th className="py-3 px-4">Hospital / Company</th>
                  <th className="py-3 px-4">Volume & Products</th>
                  <th className="py-3 px-4">Bill Date</th>
                  <th className="py-3 px-4">Terms</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {statsData.allPendingBills && statsData.allPendingBills.length > 0 ? (
                  statsData.allPendingBills.map((bill, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition">
                      <td className="py-3.5 px-4 font-bold text-blue-900">#{bill.invoiceNo}</td>
                      <td className="py-3.5 px-4 font-medium text-gray-800">
                        {bill.hospitalOrCompanyName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded">
                          {bill.volumeSummary}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-500">{bill.date}</td>
                      <td className="py-3.5 px-4 text-amber-700 font-semibold">{bill.delayNotice}</td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-gray-900">
                        {bill.formattedAmount}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          type="button"
                          disabled={updatingBillId === bill._id}
                          onClick={() => handleMarkBillPaid(bill._id)}
                          className="text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-md transition shadow-2xs"
                        >
                          {updatingBillId === bill._id ? 'Updating...' : 'Mark Paid'}
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadOrderInvoice(bill)}
                          className="text-[11px] font-semibold bg-[#041A71] hover:bg-blue-900 text-white px-2 py-1 rounded-md transition shadow-2xs"
                        >
                          <Download size={11} className="inline mr-1" /> Invoice
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-400">
                      No pending bills recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inventory & Recent Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Orders Widget */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 text-sm mb-4">Recent Order Activity</h3>
          <div className="space-y-3">
            {statsData.recentOrders && statsData.recentOrders.length > 0 ? (
              statsData.recentOrders.map((order, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-gray-50 pb-2.5">
                  <div>
                    <p className="text-xs font-semibold text-gray-800">
                      #{order.invoiceNo || order.orderNo} - {order.customer}
                    </p>
                    <p className="text-[10px] text-gray-400">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-900">{order.amount}</p>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        order.paymentStatus === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-4 text-center">No recent orders recorded.</p>
            )}
          </div>
        </div>

        {/* Low Stock Alert Widget */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 text-sm mb-4">Stock Alert & Volumes</h3>
          <div className="space-y-3">
            {statsData.lowStockItems && statsData.lowStockItems.length > 0 ? (
              statsData.lowStockItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-gray-50 pb-2.5">
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{item.name}</p>
                    <p className="text-[10px] text-sky-700 font-medium">Volume: {item.litre || '1L'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full font-semibold">
                      Stock: {item.stock} left
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-4 text-center">All items are sufficiently stocked.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
