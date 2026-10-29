import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export default function Profile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      name: localStorage.getItem('userName') || '',
      email: localStorage.getItem('userEmail') || '',
    }));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getUserId = () => {
    let userId = localStorage.getItem('userId');
    if (!userId || userId === 'undefined' || userId === 'null') {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const decoded = JSON.parse(jsonPayload);
          userId = decoded.id || decoded.userId || decoded._id;
          if (userId) {
            localStorage.setItem('userId', userId);
          }
        }
      } catch (err) {
        console.error("Error decoding token:", err);
      }
    }
    return userId;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');

      const userId = getUserId();
      if (!userId) {
        throw new Error("User ID not found. Please log out and log back in.");
      }

      // API call to update user profile
      const res = await axiosClient.put(`/auth/update/${userId}`, {
        name: formData.name,
        email: formData.email,
        ...(formData.newPassword ? { password: formData.newPassword } : {}),
      });

      // Extract updated user data from backend response
      const updatedUser = res.data?.data || res.data?.user || res.data;

      // Update localStorage with fresh data so navbar updates instantly
      localStorage.setItem('userName', updatedUser.name || formData.name);
      localStorage.setItem('userEmail', updatedUser.email || formData.email);
      if (updatedUser.role) {
        localStorage.setItem('role', updatedUser.role);
      }

      setSuccessMessage('Profile updated successfully! Redirecting...');
      
      // Delay slightly to show success message, then navigate to dashboard/billing
      setTimeout(() => {
        navigate('/admin/dashboard');
        window.location.reload(); // Refresh to update navbar state cleanly
      }, 1200);

    } catch (err) {
      console.error("Profile update error:", err);
      setError(err.response?.data?.message || err.message || 'Failed to update profile.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">My Account & Profile</h2>
        <p className="text-xs text-gray-500">Update your account information and security credentials.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-600">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-xs text-green-700">
            <CheckCircle size={16} /> {successMessage}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <User size={14} /> Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-bluely-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-bluely-500"
            />
          </div>

          <div className="border-t border-gray-100 pt-4 mt-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
              <Lock size={14} /> Change Password
            </h3>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">New Password (Optional)</label>
                <input
                  type="password"
                  name="newPassword"
                  placeholder="Leave blank to keep current password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-bluely-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-bluely-500 hover:bg-bluely-600 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {loading ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}