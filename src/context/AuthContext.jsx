import { createContext, useCallback, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginRequest, registerRequest } from '../services/api';
import { getJSON, setJSON } from '../utils/storage';
import { useToast } from './ToastContext';
import { ROUTES } from '../routes/paths';

const AuthContext = createContext(null);

/**
 * Auth state + login / register modal state.
 * Replaces: currentUser, handleLogin, handleRegister, updateAuthUI,
 * toggleAuth/closeAuth/showLogin/showRegister and logout() from shared.js
 */
export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const { showNotification } = useToast();

  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => getJSON('user'));
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login'); // "login" | "register"

  const isLoggedIn = Boolean(token && user);

  /* modal */
  const openAuth = useCallback((tab = 'login') => {
    setAuthTab(tab);
    setAuthOpen(true);
  }, []);
  const closeAuth = useCallback(() => setAuthOpen(false), []);
  const toggleAuth = useCallback(() => setAuthOpen((o) => !o), []);

  const persistSession = (t, u) => {
    localStorage.setItem('token', t);
    if (u && u.role) {
      localStorage.setItem('role', u.role);
    } else {
      localStorage.removeItem('role');
    }
    setJSON('user', u);
    setToken(t);
    setUser(u);
  };

  /* update the stored user (profile edits) */
  const updateUser = useCallback((u) => {
    setJSON('user', u);
    setUser(u);
  }, []);

  const login = useCallback(
    async (email, password) => {
      try {
        const { ok, data } = await loginRequest(email, password);
        if (ok) {
          persistSession(data.token, data.user);
          setAuthOpen(false);
          showNotification('Login successful!');
          return true;
        }
        showNotification(data?.error || 'Login failed', 'error');
      } catch (err) {
        console.error(err);
        showNotification('Login failed. Server error.', 'error');
      }
      return false;
    },
    [showNotification]
  );

  const register = useCallback(
    async ({ name, email, password, confirmPassword }) => {
      if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return false;
      }
      try {
        const { ok, data } = await registerRequest(name, email, password);
        if (ok) {
          persistSession(data.token, data.user);
          setAuthOpen(false);
          showNotification('Registration successful!');
          return true;
        }
        showNotification(data?.error || 'Registration failed', 'error');
      } catch (err) {
        console.error(err);
        showNotification('Registration failed. Server error.', 'error');
      }
      return false;
    },
    [showNotification]
  );

  const guestLogin = useCallback(() => {
    const guestUser = {
      _id: 'guest_' + Math.random().toString(36).substring(2, 9),
      name: 'Guest User',
      email: 'guest@bluely.in',
      role: 'guest',
      isGuest: true,
    };
    persistSession('guest_token_' + Date.now(), guestUser);
    setAuthOpen(false);
    showNotification('Welcome! You are browsing as a Guest.');
    return true;
  }, [showNotification]);

  /** Navbar logout: removes token + user + role, keeps the cart (same as shared.js). */
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    setToken(null);
    setUser(null);
    navigate(ROUTES.HOME);
  }, [navigate]);

  /** Dashboard logout: wipes everything (same as logoutUser() in dashboard.html). */
  const logoutAndClearAll = useCallback(() => {
    localStorage.clear();
    sessionStorage.clear();
    setToken(null);
    setUser(null);
    navigate(ROUTES.HOME);
  }, [navigate]);

  return (
    <AuthContext.Provider
      value={{
        token, user, isLoggedIn,
        authOpen, authTab, setAuthTab, openAuth, closeAuth, toggleAuth,
        login, register, guestLogin, logout, logoutAndClearAll, updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
