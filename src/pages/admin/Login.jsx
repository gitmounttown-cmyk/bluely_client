import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { ROUTES } from '../../routes/paths';
import '../../styles/admin.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      const res = await axiosClient.post('/auth/login', { email, password });
      
      const token = res.data.token || res.data.data?.token;
      const user = res.data.user || res.data.data?.user || res.data.data;

      if (!token) {
        throw new Error("Authentication token not found in response");
      }

      // Store session details securely in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userId', user?._id || user?.id || user?.userId || '');
      localStorage.setItem('role', user?.role || 'Admin');
      localStorage.setItem('userName', user?.name || user?.username || 'Admin');
      localStorage.setItem('userEmail', user?.email || email);

      // Navigate to admin billing POS or dashboard
      navigate(ROUTES.ADMIN_BILLING);
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAdminLogin = () => {
    localStorage.setItem('token', 'guest_admin_token_' + Date.now());
    localStorage.setItem('userId', 'guest_admin_1');
    localStorage.setItem('role', 'Admin');
    localStorage.setItem('userName', 'Admin User');
    localStorage.setItem('userEmail', 'admin@bluely.in');
    navigate(ROUTES.ADMIN_BILLING);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl border border-slate-700/20">
        <div className="mb-6 text-center">
          <Link to={ROUTES.HOME} className="inline-flex items-center gap-1.5 text-xs text-sky-600 hover:text-sky-700 mb-3 font-medium">
            <ArrowLeft size={14} /> Back to Customer Website
          </Link>
          <h1 className="text-2xl font-bold text-slate-800 tracking-wide">BLUELY</h1>
          <p className="text-xs text-slate-500 mt-1">Admin & POS Management Portal</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@bluely.in"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-sky-600 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50 shadow-md shadow-sky-600/20 cursor-pointer"
          >
            {loading ? "Signing in..." : "Sign In to Admin Portal"}
          </button>

          <button
            type="button"
            onClick={handleGuestAdminLogin}
            className="w-full rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            Instant Guest / Demo Admin Access
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Don't have an account?</span>
          <Link to={ROUTES.ADMIN_SIGNUP} className="font-semibold text-sky-600 hover:underline">
            Register Staff Account
          </Link>
        </div>
      </div>
    </div>
  );
}
