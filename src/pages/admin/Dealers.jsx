import { useState, useEffect } from 'react';
import { Handshake, CheckCircle, FileText, Eye, X, AlertCircle, Plus} from 'lucide-react';
import { getDealers, approveDealerRequest, createDealerRequest } from '../../api/dealerApi';

export default function Dealers() {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Modals state
  const [selectedDealer, setSelectedDealer] = useState(null); // For viewing documents
  const [isModalOpen, setIsModalOpen] = useState(false);      // For creating new dealer application

  // New dealer form state
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    contact: '',
    email: '',
    panNumber: '',
    gstinNumber: '',
  });
  
  const [files, setFiles] = useState({
    aadhar: null,
    pan: null,
    gstin: null,
    tradeLicense: null,
    cancelledCheque: null,
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch all dealers from backend API
  const fetchDealers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getDealers();
      const dealerData = res.data?.data || res.data;
      if (Array.isArray(dealerData)) {
        setDealers(dealerData);
      } else {
        setDealers([]);
      }
    } catch (err) {
      console.error("Error fetching dealers:", err);
      setError(err.response?.data?.message || "Failed to load dealer requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  // Handle dealer approval
  const handleApprove = async (id) => {
    try {
      await approveDealerRequest(id);
      setDealers(prev => prev.map(d => d._id === id ? { ...d, status: 'Approved' } : d));
      alert('Dealer request approved successfully!');
    } catch (err) {
      console.error("Error approving dealer:", err);
      alert(err.response?.data?.message || 'Failed to approve dealer request.');
    }
  };

  // Handle form text inputs
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle file inputs
  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  // Submit new dealer application
  const handleCreateDealer = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');

      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      Object.keys(files).forEach(key => {
        if (files[key]) {
          data.append(key, files[key]);
        }
      });

      await createDealerRequest(data);
      alert('Dealer application submitted successfully!');
      
      setIsModalOpen(false);
      setFormData({ name: '', location: '', contact: '', email: '', panNumber: '', gstinNumber: '' });
      setFiles({ aadhar: null, pan: null, gstin: null, tradeLicense: null, cancelledCheque: null });
      
      fetchDealers();
    } catch (err) {
      console.error("Error creating dealer:", err);
      setError(err.response?.data?.message || 'Failed to submit dealer application.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to format file server URLs
  const getFileUrl = (path) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `http://localhost:5008${path}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Dealer Partnership Requests</h2>
          <p className="text-xs text-gray-500">Review, verify compliance documents, and approve regional distributor applications.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 bg-bluely-500 hover:bg-bluely-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition"
        >
          <Plus size={16} /> New Application
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-600">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="py-3 px-6">Applicant Name</th>
              <th className="py-3 px-6">Location</th>
              <th className="py-3 px-6">Contact & Tax IDs</th>
              <th className="py-3 px-6">Verification Docs</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan="6" className="py-12 text-center text-gray-400 text-xs">Loading dealer requests...</td>
              </tr>
            ) : dealers.length > 0 ? (
              dealers.map(dealer => (
                <tr key={dealer._id} className="hover:bg-gray-50 transition">
                  <td className="py-3.5 px-6 font-semibold flex items-center gap-2">
                    <Handshake size={16} className="text-bluely-500 flex-shrink-0" />
                    <div>
                      <p className="text-gray-800">{dealer.name}</p>
                      <p className="text-[11px] text-gray-400 font-normal">{dealer.email}</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 text-gray-600">{dealer.location}</td>
                  <td className="py-3.5 px-6 text-xs text-gray-500">
                    <p className="font-medium text-gray-700">{dealer.contact}</p>
                    {dealer.panNumber && <p className="text-[11px]">PAN: {dealer.panNumber}</p>}
                    {dealer.gstinNumber && <p className="text-[11px]">GSTIN: {dealer.gstinNumber}</p>}
                  </td>
                  <td className="py-3.5 px-6">
                    <button
                      onClick={() => setSelectedDealer(dealer)}
                      className="inline-flex items-center gap-1.5 bg-blue-50 text-bluely-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                    >
                      <FileText size={14} /> View Docs
                    </button>
                  </td>
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
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-12 text-center text-gray-400 text-xs">No dealer partnership requests found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* DOCUMENT VERIFICATION INSPECTION MODAL */}
      {selectedDealer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-gray-800 text-base">{selectedDealer.name} - Documents</h3>
                <p className="text-xs text-gray-500">Verify submitted identification and business licenses.</p>
              </div>
              <button onClick={() => setSelectedDealer(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {[
                { label: 'Aadhaar Card', path: selectedDealer.aadhar },
                { label: 'PAN Card', path: selectedDealer.pan || selectedDealer.panNumber },
                { label: 'GSTIN Certificate', path: selectedDealer.gstin || selectedDealer.gstinNumber },
                { label: 'Trade License / Business Registration', path: selectedDealer.tradeLicense },
                { label: 'Cancelled Cheque / Bank Statement', path: selectedDealer.cancelledCheque },
              ].map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-2.5">
                    <FileText size={18} className="text-bluely-500" />
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{doc.label}</p>
                      <p className="text-[10px] text-gray-400">{doc.path ? 'Uploaded / Provided' : 'Not Provided'}</p>
                    </div>
                  </div>

                  {doc.path && typeof doc.path === 'string' && doc.path.startsWith('/') ? (
                    <a
                      href={getFileUrl(doc.path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-semibold text-bluely-600 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 shadow-sm transition"
                    >
                      <Eye size={14} /> Open File
                    </a>
                  ) : doc.path && !doc.path.startsWith('/') ? (
                    <span className="text-xs font-semibold text-gray-700 bg-gray-200 px-2 py-1 rounded">{doc.path}</span>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Missing</span>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-end">
              <button
                onClick={() => setSelectedDealer(null)}
                className="bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW DEALER APPLICATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-gray-800 text-base">New Dealer Partnership Application</h3>
                <p className="text-xs text-gray-500">Fill in details and attach verification documents.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateDealer} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Business Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Rajesh Enterprises"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-bluely-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Location / City</label>
                  <input
                    type="text"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Trichy, Tamil Nadu"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-bluely-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Number</label>
                  <input
                    type="text"
                    name="contact"
                    required
                    value={formData.contact}
                    onChange={handleInputChange}
                    placeholder="+91 98450 XXXXX"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-bluely-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="dealer@enterprise.com"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-bluely-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">PAN Number</label>
                  <input
                    type="text"
                    name="panNumber"
                    value={formData.panNumber}
                    onChange={handleInputChange}
                    placeholder="ABCDE1234F"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-bluely-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    name="gstinNumber"
                    value={formData.gstinNumber}
                    onChange={handleInputChange}
                    placeholder="33AAAAA0000A1Z5"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-bluely-500"
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-3">
                <p className="text-xs font-bold text-gray-700">Upload Verification Documents (Image / PDF)</p>
                
                {[
                  { label: 'Aadhaar Card', name: 'aadhar' },
                  { label: 'PAN Card Scan', name: 'pan' },
                  { label: 'GSTIN Certificate', name: 'gstin' },
                  { label: 'Trade License / Business Registration', name: 'tradeLicense' },
                  { label: 'Cancelled Cheque / Bank Statement', name: 'cancelledCheque' },
                ].map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs">
                    <span className="font-medium text-gray-700">{doc.label}</span>
                    <input
                      type="file"
                      name={doc.name}
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="text-[11px] text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-bluely-50 file:text-bluely-600 hover:file:bg-bluely-100"
                    />
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-4 py-2 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-bluely-500 hover:bg-bluely-600 text-white text-xs font-semibold px-5 py-2 rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}