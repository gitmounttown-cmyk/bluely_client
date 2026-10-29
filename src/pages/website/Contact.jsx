import { useEffect, useRef, useState } from 'react';
import { CircleCheck, Mail, MapPin, Phone } from 'lucide-react';
import usePageStyles from '../../hooks/usePageStyles';
import usePageTitle from '../../hooks/usePageTitle';
import { CONTACT_STYLES } from '../../styles';
import { sendContactRequest } from '../../services/api';
import { useWishlist } from '../../context/WishlistContext';

const CARDS = [
  { Icon: Mail, title: 'Email', lines: ['support@bluely.com', 'info@bluely.com'] },
  { Icon: Phone, title: 'Phone', lines: ['+91 XXXX XXXXX', 'Mon–Sat, 9am – 6pm'] },
  { Icon: MapPin, title: 'Address', lines: ['1234 Bluely St', 'City, India'] },
];

const EMPTY = { name: '', email: '', contact: '', message: '' };

export default function Contact() {
  usePageStyles(CONTACT_STYLES);
  usePageTitle('Contact Us – Bluely');
  useWishlist(); // keeps the navbar wishlist count in sync (was `await getWishlist()`)

  const heroRef = useRef(null);
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState({ text: '', color: '' });
  const [sending, setSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const closeTimer = useRef(null);

  /* Hero parallax */
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return undefined;
    const onScroll = () => {
      const scrolled = window.pageYOffset;
      if (scrolled < 500) {
        hero.style.transform = `translateY(${scrolled * 0.45}px)`;
        hero.style.opacity = (1 - scrolled / 480).toFixed(2);
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const closeSuccess = () => setShowSuccess(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.id]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setStatus({ text: '✕ Please login to send a message.', color: 'red' });
      return;
    }
    setSending(true);
    setStatus({ text: '', color: '' });
    try {
      const { ok, data } = await sendContactRequest(form);
      if (!ok) throw new Error(data?.error || 'Something went wrong.');
      setShowSuccess(true);
      setStatus({ text: '✓ Message sent successfully!', color: '#4ade80' });
      setForm(EMPTY);
      closeTimer.current = setTimeout(closeSuccess, 3000);
    } catch (err) {
      setStatus({ text: `✕ ${err.message}`, color: 'red' });
    } finally {
      setSending(false);
    }
  };

  /* Card click animation */
  const pressCard = (e) => {
    const card = e.currentTarget;
    card.style.transform = 'scale(0.95) translateY(-8px)';
    setTimeout(() => {
      card.style.transform = '';
    }, 180);
  };

  /* Form focus animation */
  const focusGroup = (e) => {
    e.currentTarget.style.transform = 'translateX(4px)';
  };
  const blurGroup = (e) => {
    e.currentTarget.style.transform = '';
  };
  const groupProps = { onFocus: focusGroup, onBlur: blurGroup };

  return (
    <>
      <section className="hero-section" ref={heroRef} />
      <div className="main-content">
        <div className="content-wrapper">
          <div className="hero-content">
            <h1>Contact Us</h1>
            <p>We're Here to Help You</p>
          </div>
          <p className="intro-text">
            Have a question, need support, or want to know more about Bluely products? We'd love to hear from you.
            Reach out to us anytime — we're always happy to help.
          </p>
          <h2 className="contact-heading">Contact Details</h2>
          <div className="contact-cards">
            {CARDS.map(({ Icon, title, lines }) => (
              <div className="contact-card" key={title} onClick={pressCard}>
                <Icon className="contact-card-icon" />
                <h3>{title}</h3>
                <p>
                  {lines[0]}
                  <br />
                  {lines[1]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="contact-wrapper">
        <div className="contact-container">
          <h2 className="form-heading">Send Us a Message</h2>
          <p className="form-description">
            Have something to share?
            <br />
            Fill out the form below and we'll get back to you as soon as possible.
          </p>
          <form id="contactForm" onSubmit={onSubmit}>
            <div className="form-group" {...groupProps}>
              <label htmlFor="name">Name</label>
              <input type="text" id="name" placeholder="Enter your name" required value={form.name} onChange={onChange} />
            </div>
            <div className="form-group" {...groupProps}>
              <label htmlFor="email">Email</label>
              <input type="email" id="email" placeholder="Enter your email" required value={form.email} onChange={onChange} />
            </div>
            <div className="form-group" {...groupProps}>
              <label htmlFor="contact">Phone Number</label>
              <input type="tel" id="contact" placeholder="Enter your phone number" value={form.contact} onChange={onChange} />
            </div>
            <div className="form-group" {...groupProps}>
              <label htmlFor="message">Message</label>
              <textarea id="message" placeholder="Write your message here..." required value={form.message} onChange={onChange} />
            </div>
            <p id="status" style={{ color: status.color }}>{status.text}</p>
            <button type="submit" className={`submit-btn${sending ? ' loading' : ''}`} disabled={sending}>
              {sending ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>

      <div className={`overlay${showSuccess ? ' show' : ''}`} id="overlay" onClick={closeSuccess} />
      <div className={`success-message${showSuccess ? ' show' : ''}`} id="successMessage">
        <CircleCheck className="success-icon" />
        <h2>Thank You!</h2>
        <p>
          Your message has been sent successfully.
          <br />
          We'll get back to you soon.
        </p>
      </div>
    </>
  );
}
