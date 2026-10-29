import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import usePageStyles from '../../hooks/usePageStyles';
import usePageTitle from '../../hooks/usePageTitle';
import { RESET_STYLES } from '../../styles';
import { resetPasswordRequest } from '../../services/api';
import { ROUTES } from '../../routes/paths';

export default function ResetPassword() {
  usePageStyles(RESET_STYLES);
  usePageTitle('Reset Password');
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('resetToken');
    if (!token) {
      setMsg(' Session expired. Please verify OTP again.');
      return;
    }
    try {
      const { ok, data } = await resetPasswordRequest(newPassword, token);
      if (ok) {
        localStorage.removeItem('resetToken');
        setMsg(' Password reset successful');
        navigate(ROUTES.HOME);
      } else {
        setMsg(` ${data?.error}`);
      }
    } catch (err) {
      console.error(err);
      setMsg(' Server error');
    }
  };

  return (
    <form id="resetForm" onSubmit={onSubmit}>
      <h2>Reset Password</h2>
      <br /><br />
      <label htmlFor="email">Email:</label>
      <br /><br />
      <input type="email" id="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <br /><br />

      <label htmlFor="newPassword">New Password:</label>
      <br /><br />
      <input
        type="password"
        id="newPassword"
        required
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <br /><br />

      <button type="submit">Reset Password</button>
      <br /><br /><br />
      <p id="msg">{msg}</p>
    </form>
  );
}
