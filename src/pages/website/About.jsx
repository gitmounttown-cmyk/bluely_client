import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import usePageStyles from '../../hooks/usePageStyles';
import usePageTitle from '../../hooks/usePageTitle';
import { ABOUT_STYLES } from '../../styles';
import { ROUTES } from '../../routes/paths';

/** Port of the inline script at the bottom of about.html */
function useAboutEffects() {
  useEffect(() => {
    const cleanups = [];

    /* Intersection observer for fade-in */
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            entry.target
              .querySelectorAll('.mission-card, .vision-card, .cta-title, .cta-subtitle, .cta-button')
              .forEach((child) => child.classList.add('animate'));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );
    ['.section-title', '.story-content', '.beliefs-wrapper', '.mission-vision-section', '.cta-section'].forEach(
      (sel) => document.querySelectorAll(sel).forEach((el) => observer.observe(el))
    );
    cleanups.push(() => observer.disconnect());

    /* Belief items stagger */
    document.querySelectorAll('.belief-item').forEach((item, i) => {
      item.style.animationDelay = `${0.5 + i * 0.2}s`;
    });

    /* Image smooth load */
    document.querySelectorAll('img').forEach((img) => {
      img.style.cssText += 'opacity:0;transform:scale(0.95);transition:opacity .5s ease,transform .5s ease;';
      const show = () => {
        img.style.opacity = '1';
        img.style.transform = 'scale(1)';
      };
      if (img.complete) show();
      else img.addEventListener('load', show);
      cleanups.push(() => {
        img.removeEventListener('load', show);
        img.style.opacity = '';
        img.style.transform = '';
        img.style.transition = '';
      });
    });

    /* Parallax hero */
    const heroOverlay = document.querySelector('.hero-overlay');
    const heroSection = document.querySelector('.hero-section');
    if (heroSection && heroOverlay) {
      const onScroll = () => {
        const s = window.pageYOffset;
        if (s < window.innerHeight) {
          heroOverlay.style.transform = `translateY(${s * 0.5}px)`;
          heroOverlay.style.opacity = (1 - s / window.innerHeight).toFixed(2);
        }
      };
      window.addEventListener('scroll', onScroll);
      cleanups.push(() => window.removeEventListener('scroll', onScroll));
    }

    /* Story card hover */
    const storyCard = document.querySelector('.story-card');
    if (storyCard) {
      const enter = () => (storyCard.style.transform = 'translateY(-5px)');
      const leave = () => (storyCard.style.transform = 'translateY(0)');
      storyCard.addEventListener('mouseenter', enter);
      storyCard.addEventListener('mouseleave', leave);
      cleanups.push(() => {
        storyCard.removeEventListener('mouseenter', enter);
        storyCard.removeEventListener('mouseleave', leave);
        storyCard.style.transform = '';
      });
    }

    document.body.classList.add('loaded');
    cleanups.push(() => document.body.classList.remove('loaded'));

    return () => cleanups.forEach((fn) => fn());
  }, []);
}

export default function About() {
  usePageStyles(ABOUT_STYLES);
  usePageTitle('About Us - Bluely');
  useAboutEffects();
  const navigate = useNavigate();

  return (
    <>
      <section className="hero-section">
        <div className="hero-overlay">
          <h1 className="hero-title">About Us</h1>
          <p className="hero-subtitle">Everyday Essentials. Thoughtfully Made.</p>
        </div>
      </section>

      <section className="intro-section">
        <div className="container">
          <p className="intro-text">
            Bluely is a modern home and personal care brand created with a simple idea — to make everyday cleaning
            and care easier, more effective, and more reliable. We understand that cleanliness is not just about
            appearance, but about comfort, safety, and peace of mind. Our products are designed for real homes, real
            routines, and real people.
          </p>
        </div>
      </section>

      <section className="story-section">
        <div className="container">
          <h2 className="section-title">Our Story</h2>
          <div className="story-content">
            <div className="story-card">
              <div className="story-image-placeholder">
                <img src="/images/Logo.png" height="170" width="250" style={{ borderRadius: '18px' }} alt="" />
              </div>
            </div>
            <div className="story-text">
              <p>
                Bluely was born from the need for dependable everyday products that people can trust without
                thinking twice. In a market full of complicated promises and over-designed solutions, we chose a
                simpler path — creating products that do exactly what they are meant to do, and do it well. From
                floors and fabrics to hands and homes, every Bluely product is made with focus on performance,
                usability, and consistency.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="beliefs-section">
        <div className="container">
          <div className="beliefs-wrapper">
            <div className="belief-item top">
              <p className="belief-label">Be easy to understand</p>
              <div className="icon-circle">
                <img src="/images/icons/Group 60.png" alt="Easy" />
              </div>
            </div>
            <div className="center-box">
              <h2>What We Believe</h2>
            </div>
            <div className="belief-item left">
              <p className="belief-label">Deliver consistent results</p>
              <div className="icon-circle">
                <img src="/images/icons/Group 61.png" alt="Consistent" />
              </div>
            </div>
            <div className="belief-item right">
              <div className="icon-circle">
                <img src="/images/icons/Group 62.png" alt="Daily" />
              </div>
              <p className="belief-label">Fit naturally into daily life</p>
            </div>
            <div className="belief-item bottom">
              <div className="icon-circle">
                <img src="/images/icons/Group 63.png" alt="Safe" />
              </div>
              <p className="belief-label">Be safe and reliable</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mission-vision-section">
        <div className="container">
          <div className="mission-vision-grid">
            <div className="mission-card">
              <h3>OUR MISSION</h3>
              <p>
                Our mission is to deliver everyday care solutions that simplify routines, improve cleanliness, and
                add comfort to daily life.
              </p>
            </div>
            <div className="vision-card">
              <h3>OUR VISION</h3>
              <p>To become a trusted everyday brand that people choose for quality, consistency, and ease of use.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <h2 className="cta-title">One Brand. Many Everyday Solutions.</h2>
          <p className="cta-subtitle">
            Explore our range of products and experience simple, effective care for your everyday needs.
          </p>
          <button type="button" className="cta-button" onClick={() => navigate(ROUTES.PRODUCTS)}>
            Explore Our Products
          </button>
        </div>
      </section>
    </>
  );
}
