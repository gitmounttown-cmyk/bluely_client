import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usePageStyles from '../../hooks/usePageStyles';
import usePageTitle from '../../hooks/usePageTitle';
import { FORGOT_STYLES } from '../../styles';
import { forgotPasswordRequest } from '../../services/api';
import { ROUTES } from '../../routes/paths';

export default function ForgotPassword() {
  usePageStyles(FORGOT_STYLES);
  usePageTitle('Forgot Password');
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const { ok, data } = await forgotPasswordRequest(email);
      if (ok) {
        setMsg(' OTP sent to your email');
        navigate(ROUTES.VERIFY_OTP, { state: { email } });
      } else {
        setMsg(` ${data?.error}`);
      }
    } catch (err) {
      console.error(err);
      setMsg(' Server error');
    }
  };

  return (
    <form id="forgotForm" onSubmit={onSubmit}>
      <h2>Forgot Password</h2>
      <br /><br />
      <label htmlFor="email">Enter your Email</label>
      <br /><br />
      <input type="email" id="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <br /><br />
      <button type="submit">Send OTP</button>
      <br /><br /><br />
      <p id="msg">{msg}</p>
    </form>
  );
}
