import { Link } from 'react-router-dom';
import { X, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../routes/paths';

/** Login / Register modal (was injected by injectNavbar() in shared.js) */
export default function AuthModal() {
  const { authOpen, authTab, setAuthTab, closeAuth, login, register, guestLogin } = useAuth();

  const onLogin = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    await login(fd.get('email'), fd.get('password'));
  };

  const onRegister = async (e) => {
    e.preventDefault();
    const f = e.target;
    await register({
      name: f.fullname.value,
      email: f.email.value,
      password: f.password.value,
      confirmPassword: f.confirmPassword.value,
    });
  };

  return (
    <>
      <div className={`modal-backdrop${authOpen ? ' active' : ''}`} id="modalBackdrop" onClick={closeAuth} />

      <div className={`auth-modal${authOpen ? ' active' : ''}`} id="authModal">
        <div className="modal-content">
          <span className="close" onClick={closeAuth} role="button" aria-label="Close">
            <X size={26} />
          </span>

          <div className="auth-tabs">
            <button
              type="button"
              className={`tab-btn${authTab === 'login' ? ' active' : ''}`}
              onClick={() => setAuthTab('login')}
            >
              Login
            </button>
            <button
              type="button"
              className={`tab-btn${authTab === 'register' ? ' active' : ''}`}
              onClick={() => setAuthTab('register')}
            >
              Register
            </button>
          </div>

          <form className={`auth-form${authTab === 'login' ? '' : ' hidden'}`} id="loginForm" onSubmit={onLogin}>
            <h3>Login</h3>
            <input type="email" name="email" placeholder="Email" required />
            <input type="password" name="password" placeholder="Password" required />
            <button type="submit">Login</button>
            <Link to={ROUTES.FORGOT_PASSWORD} onClick={closeAuth}>
              Forget Password?
            </Link>
          </form>

          <form
            className={`auth-form${authTab === 'register' ? '' : ' hidden'}`}
            id="registerForm"
            onSubmit={onRegister}
          >
            <h3>Register</h3>
            <input type="text" name="fullname" placeholder="Full Name" required />
            <input type="email" name="email" placeholder="Email" required />
            <input type="password" name="password" placeholder="Password" required />
            <input type="password" name="confirmPassword" placeholder="Confirm Password" required />
            <button type="submit">Register</button>
          </form>

          <div className="guest-login-section" style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>
              Want to explore first without password?
            </p>
            <button
              type="button"
              className="guest-login-btn"
              onClick={guestLogin}
              style={{
                width: '100%',
                padding: '11px 16px',
                borderRadius: '8px',
                border: '1.5px solid #081b6b',
                background: '#f8fafc',
                color: '#081b6b',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
            >
              <UserCheck size={16} /> Continue as Guest
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
