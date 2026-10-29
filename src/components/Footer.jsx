import { Link } from 'react-router-dom';
import { ROUTES } from '../routes/paths';

/*
 * Social logos keep the original inline SVGs: Lucide has no brand logos
 * (WhatsApp / Facebook / Instagram), and this keeps the footer pixel-identical.
 */
export default function Footer() {
  return (
    <footer className="bluelly-footer-wrap">
      <div className="footer-top">
        <div className="footer-logo">
          <img src="/images/bluelywhitellogo.png" alt="Bluely" />
        </div>

        <div className="footer-links">
          <Link to={ROUTES.PRODUCTS}>Products</Link>
          <Link to={ROUTES.ABOUT}>About Us</Link>
          <Link to={ROUTES.CONTACT}>Contact Us</Link>
          <Link to={ROUTES.ADMIN_DASHBOARD} style={{ opacity: 0.85 }}>Admin Portal</Link>
        </div>

        <div className="footer-social">
          <a href="#" aria-label="WhatsApp" onClick={(e) => e.preventDefault()}>
            <svg className="social-icon" viewBox="0 0 24 24">
              <path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.3A10 10 0 1 0 12 2zm0 18 a8 8 0 0 1-4-1l-.3-.2-2.8.7.7-2.7-.2-.3A8 8 0 1 1 12 20z" />
              <path d="M16.6 14.5c-.2-.1-1.2-.6-1.4-.7-.2-.1-.4-.1-.5.1l-.7.9 c-.1.2-.3.2-.5.1a6.2 6.2 0 0 1-2.9-2.6c-.2-.3 0-.4.1-.5l.3-.4 c.1-.1.1-.3.2-.4.1-.1 0-.3 0-.4l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5 c-.2 0-.4.1-.6.3s-.8.8-.8 1.9.8 2.2.9 2.4a9 9 0 0 0 3.4 3.2 c.4.2.7.4 1 .4.4.1.9.1 1.2 0 .4-.1 1.2-.5 1.4-1.1 .2-.5.2-1 .1-1.1-.1-.1-.2-.2-.3-.3z" />
            </svg>
          </a>
          <a href="#" aria-label="Facebook" onClick={(e) => e.preventDefault()}>
            <svg className="social-icon" viewBox="0 0 24 24">
              <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H8v-3h2.4V9.5 c0-2.4 1.4-3.8 3.7-3.8 1.1 0 2.2.2 2.2.2v2.3h-1.2 c-1.2 0-1.6.7-1.6 1.5V12h2.8l-.4 2.9h-2.4v7 A10 10 0 0 0 22 12z" />
            </svg>
          </a>
          <a href="#" aria-label="Instagram" onClick={(e) => e.preventDefault()}>
            <svg className="social-icon" viewBox="0 0 24 24">
              <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7 a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5 a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8 a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm5.2-8.8 a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z" />
            </svg>
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        © Copyright {new Date().getFullYear()}, All Rights Reserved by Bluely
      </div>
    </footer>
  );
}
