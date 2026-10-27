import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  ArrowUpRight, 
  Package, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { getDashboardStats } from '../../api/dashboardApi';

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
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const statCards = [
    { title: 'Total Sales', value: statsData.totalSales, change: '+12% vs last week', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Total Products', value: statsData.totalProducts, change: 'Active catalog items', icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Total Customers', value: statsData.totalCustomers, change: '+10% vs last week', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Low Stock Items', value: statsData.lowStockCount, change: 'Requires attention', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const categoriesShare = [
    { name: 'Laundry Care', percentage: 32, color: 'bg-blue-600' },
    { name: 'Floor & Surface', percentage: 24, color: 'bg-cyan-500' },
    { name: 'Bathroom & Toilet', percentage: 18, color: 'bg-purple-500' },
    { name: 'Personal Hygiene', percentage: 15, color: 'bg-pink-500' },
    { name: 'Others', percentage: 11, color: 'bg-amber-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Welcome Back, Admin!</h1>
        <p className="text-xs text-gray-500 mt-0.5">Here's what's happening with your business today.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-600">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Top Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
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
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <ArrowUpRight size={14} />
                <span>{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Overview Chart Box */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-gray-800 text-base">Sales Overview</h3>
              <p className="text-xs text-gray-400">Daily revenue performance trend</p>
            </div>
            <select className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 outline-none font-semibold text-gray-600">
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
            </select>
          </div>
          
          <div className="h-48 w-full flex items-end justify-between gap-2 pt-6 px-2 relative border-b border-gray-100">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-b border-dashed border-gray-300 w-full"></div>
              <div className="border-b border-dashed border-gray-300 w-full"></div>
              <div className="border-b border-dashed border-gray-300 w-full"></div>
            </div>
            {[35, 45, 30, 60, 75, 55, 65, 80, 70, 85, 95, 90].map((val, i) => (
              <div key={i} className="w-full bg-blue-500/10 rounded-t transition-all flex flex-col justify-end" style={{ height: `${val}%` }}>
                <div className="w-full bg-bluely-500 rounded-t" style={{ height: `${val * 0.7}%` }}></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[11px] text-gray-400 pt-2">
            <span>Start</span>
            <span>Mid-Month</span>
            <span>Current</span>
          </div>
        </div>

        {/* Sales by Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-800 text-base mb-1">Sales by Category</h3>
            <p className="text-xs text-gray-400 mb-4">Revenue distribution by product type</p>
          </div>

          <div className="space-y-3">
            {categoriesShare.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-700 flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`}></span>
                    {cat.name}
                  </span>
                  <span className="text-gray-900">{cat.percentage}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${cat.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inventory Overview Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-800 text-base">Inventory Overview</h3>
            <p className="text-xs text-gray-400">Real-time stock statuses across catalog items</p>
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              <th className="py-3 px-6">Product Name</th>
              <th className="py-3 px-6">SKU</th>
              <th className="py-3 px-6">Category</th>
              <th className="py-3 px-6">Stock</th>
              <th className="py-3 px-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-xs">
            {statsData.inventoryOverview.length > 0 ? (
              statsData.inventoryOverview.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition">
                  <td className="py-3.5 px-6 font-semibold text-gray-800">{item.name}</td>
                  <td className="py-3.5 px-6 text-gray-500">{item.sku}</td>
                  <td className="py-3.5 px-6 text-gray-600">{item.category}</td>
                  <td className="py-3.5 px-6 font-bold text-gray-800">{item.stock}</td>
                  <td className="py-3.5 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      item.status === 'In Stock' ? 'bg-emerald-50 text-emerald-700' :
                      item.status === 'Low Stock' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-400">No inventory items found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Orders Widget */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 text-sm mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {statsData.recentOrders.length > 0 ? (
              statsData.recentOrders.map((order, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-gray-50 pb-2.5">
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{order.orderNo} - {order.customer}</p>
                    <p className="text-[10px] text-gray-400">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-900">{order.amount}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {order.status}
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
          <h3 className="font-bold text-gray-800 text-sm mb-4">Low Stock Alert</h3>
          <div className="space-y-3">
            {statsData.lowStockItems.length > 0 ? (
              statsData.lowStockItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-gray-50 pb-2.5">
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{item.name}</p>
                    <p className="text-[10px] text-amber-600 font-medium">Stock remaining: {item.stock}</p>
                  </div>
                  <span className="text-[10px] bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full font-semibold">
                    {item.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                  </span>
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