import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from '../src/api/common/Sidebar';
import Navbar from '../src/api/common/Navbar';
import Dashboard from  "../src/pages/admin/Dashboard";
import Categories from '../src/pages/admin/Categories';
import InventoryStock from '../src/pages/admin/InventoryStock';
import Orders from '../src/pages/admin/Orders';
import BillingPOS from '../src/pages/admin/BillingPOS';
import Dealers from  "../src/pages/admin/Dealers";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      {/* Outer Flex Wrapper matching h-screen overflow-hidden */}
      <div className="flex h-screen overflow-hidden bg-gray-50 font-sans text-gray-800">
        
        {/* Left Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Right Main Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Top Navbar */}
          <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          
          {/* Main View Area */}
          <main className="p-6">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/inventory" element={<InventoryStock />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/billing" element={<BillingPOS />} />
              <Route path="/dealers" element={<Dealers />} />
            </Routes>
          </main>
        </div>

      </div>
    </BrowserRouter>
  );
}