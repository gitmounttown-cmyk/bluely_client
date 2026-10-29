import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from './common/Sidebar';
import Navbar from './common/Navbar';
import { ROUTES } from '../../routes/paths';
import '../../styles/admin.css';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const token = localStorage.getItem('token');
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();
  const role = (user?.role || localStorage.getItem('role') || '').toLowerCase().trim();
  const allowedRoles = [
    'admin',
    'super admin',
    'superadmin',
    'cashier',
    'inventory manager',
    'inventory_manager',
    'inventorymanager',
  ];
  const hasAccess = Boolean(token && allowedRoles.includes(role));

  // If not authenticated or unauthorized role, redirect to Admin Login
  if (!token || !hasAccess) {
    return <Navigate to={ROUTES.ADMIN_LOGIN} replace />;
  }

  return (
    <div className="admin-app-container flex h-screen overflow-hidden bg-gray-50 font-sans text-gray-800">
      {/* Left Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Right Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto min-w-0">
        {/* Top Navbar */}
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Main View Area */}
        <main className="p-6 flex-1 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
