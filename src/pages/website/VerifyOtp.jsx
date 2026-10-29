import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import usePageStyles from '../../hooks/usePageStyles';
import usePageTitle from '../../hooks/usePageTitle';
import { OTP_STYLES } from '../../styles';
import { verifyOtpRequest } from '../../services/api';
import { ROUTES } from '../../routes/paths';

export default function VerifyOtp() {
  usePageStyles(OTP_STYLES);
  usePageTitle('Verify OTP');
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [msg, setMsg] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const { ok, data } = await verifyOtpRequest(email, otp);
      if (ok) {
        localStorage.setItem('resetToken', data.resetToken);
        navigate(ROUTES.RESET_PASSWORD, { state: { email } });
      } else {
        setMsg(data?.error || '');
      }
    } catch (err) {
      console.error(err);
      setMsg('Server error');
    }
  };

  return (
    <form id="otpForm" onSubmit={onSubmit}>
      <h2>Login with OTP</h2>
      <br /><br />
      <label htmlFor="email">Enter your Email to Login</label>
      <br /><br />
      <input type="email" id="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <br /><br /><br />
      <label htmlFor="otp">Enter your OTP here </label>
      <br /><br />
      <input type="text" id="otp" required value={otp} onChange={(e) => setOtp(e.target.value)} />
      <br /><br /><br />
      <button type="submit">Next</button>
      <br /><br /><br />
      <p id="msg">{msg}</p>
    </form>
  );
}
