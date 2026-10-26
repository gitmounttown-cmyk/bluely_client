import React, { useState } from 'react';
import { Handshake, CheckCircle } from 'lucide-react';

export default function Dealers() {
  const [dealers, setDealers] = useState([
    { _id: '1', name: 'Rajesh Enterprises', location: 'Trichy, Tamil Nadu', contact: '+91 98450 XXXXX', status: 'Pending Review' },
    { _id: '2', name: 'Kumar Distributors', location: 'Madurai, Tamil Nadu', contact: '+91 94431 XXXXX', status: 'Approved' }
  ]);

  const handleApprove = (id) => {
    setDealers(dealers.map(d => d._id === id ? { ...d, status: 'Approved' } : d));
    alert('Dealer request approved successfully!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Dealer Partnership Requests</h2>
        <p className="text-xs text-gray-500">Review and approve regional distributor partnership applications.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="py-3 px-6">Applicant Name</th>
              <th className="py-3 px-6">Location</th>
              <th className="py-3 px-6">Contact</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {dealers.map(dealer => (
              <tr key={dealer._id} className="hover:bg-gray-50">
                <td className="py-3.5 px-6 font-semibold flex items-center gap-2">
                  <Handshake size={16} className="text-bluely-500" /> {dealer.name}
                </td>
                <td className="py-3.5 px-6 text-gray-600">{dealer.location}</td>
                <td className="py-3.5 px-6 text-gray-500">{dealer.contact}</td>
                <td className="py-3.5 px-6">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    dealer.status === 'Approved' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {dealer.status}
                  </span>
                </td>
                <td className="py-3.5 px-6 text-right">
                  {dealer.status === 'Pending Review' ? (
                    <button 
                      onClick={() => handleApprove(dealer._id)} 
                      className="text-xs bg-green-50 text-green-700 hover:bg-green-100 font-semibold px-3 py-1.5 rounded transition"
                    >
                      Approve
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400 font-medium flex items-center justify-end gap-1">
                      <CheckCircle size={14} /> Approved
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}