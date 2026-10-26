import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from '../src/api/common/Sidebar';
import Navbar from '../src/api/common/Navbar';
import Dashboard from "../src/pages/admin/Dashboard";
import Categories from '../src/pages/admin/Categories';
import InventoryStock from '../src/pages/admin/InventoryStock';
import Orders from '../src/pages/admin/Orders';
import BillingPOS from '../src/pages/admin/BillingPOS';
import Dealers from "../src/pages/admin/Dealers";
import Login from '../src/pages/admin/Login';
import Signup from '../src/pages/admin/Register';
import Profile from './pages/admin/Profile';

// Protected Layout: Only renders Sidebar & Navbar if a valid token exists in localStorage
function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const token = localStorage.getItem('token');

  // If not logged in, redirect directly to login screen
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans text-gray-800">
      {/* Left Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Right Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Navbar */}
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* Main View Area */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Authentication Routes (No Sidebar/Navbar) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Dashboard Routes (Wrapped with Sidebar & Navbar Layout) */}
        <Route element={<AdminLayout />}>
          {/* <Route path="/" element={<Navigate to="/billing" replace />} /> */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/inventory" element={<InventoryStock />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/billing" element={<BillingPOS />} />
          <Route path="/dealers" element={<Dealers />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Catch-all redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}