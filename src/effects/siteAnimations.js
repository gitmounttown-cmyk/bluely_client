/**
 * Port of js/animation.js (class BluelyAnimations + helpers).
 * Same behaviour, but:
 *   - every listener is removed by destroy() (needed in a single-page app)
 *   - ripple / tilt use event delegation, so they also work on elements React
 *     renders later (e.g. products loaded from the API)
 *   - the CSS that animation.js used to inject lives in styles/effects.css
 */
export function initSiteAnimations() {
  const cleanups = [];
  const on = (target, evt, fn, opts) => {
    target.addEventListener(evt, fn, opts);
    cleanups.push(() => target.removeEventListener(evt, fn, opts));
  };

  let navbarHeight = 0;
  let lastScrollTop = 0;

  /* ── scroll reveal ─────────────────────────────────────── */
  const revealSelector = '.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-children';
  const observed = new WeakSet();
  let revealObserver = null;
  if ('IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('active')),
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );
    cleanups.push(() => revealObserver.disconnect());
  }
  const observeNewContent = () => {
    document.querySelectorAll(revealSelector).forEach((el) => {
      if (observed.has(el)) return;
      observed.add(el);
      revealObserver ? revealObserver.observe(el) : el.classList.add('active');
    });
    document.querySelectorAll('.counter:not(.counted)').forEach((c) => counterObserver?.observe(c));
  };

  /* ── counters ──────────────────────────────────────────── */
  const animateCounter = (element) => {
    const target = parseInt(element.dataset.target || element.textContent, 10);
    const duration = parseInt(element.dataset.duration || 2000, 10);
    const increment = target / (duration / 16);
    let current = 0;
    const tick = () => {
      current += increment;
      if (current < target) {
        element.textContent = Math.ceil(current);
        requestAnimationFrame(tick);
      } else {
        element.textContent = target;
      }
    };
    tick();
  };
  let counterObserver = null;
  if ('IntersectionObserver' in window) {
    counterObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            entry.target.classList.add('counted');
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        }),
      { threshold: 0.5 }
    );
    cleanups.push(() => counterObserver.disconnect());
  }

  /* ── smooth scroll for #anchors ────────────────────────── */
  on(document, 'click', (e) => {
    const anchor = e.target.closest?.('a[href^="#"]');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (href === '#' || href === '#!') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      window.scrollTo({ top: target.offsetTop - (navbarHeight || 80), behavior: 'smooth' });
    }
  });

  /* ── parallax (.parallax[data-speed]) ──────────────────── */
  const applyParallax = () => {
    const scrolled = window.pageYOffset;
    document.querySelectorAll('.parallax').forEach((el) => {
      const speed = el.dataset.speed || 0.5;
      el.style.transform = `translateY(${-(scrolled * speed)}px)`;
    });
  };

  /* ── navbar behaviour (same selector as the original: first <nav>) ── */
  const getNavbar = () => document.querySelector('nav');
  const navbar = getNavbar();
  if (navbar) {
    navbarHeight = navbar.offsetHeight;
    on(window, 'scroll', () => {
      const nav = getNavbar();
      if (!nav) return;
      if (window.scrollY > 50) {
        nav.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        nav.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
      } else {
        nav.style.boxShadow = 'none';
        nav.style.backgroundColor = 'white';
      }
    });
    let scrollTimeout;
    on(window, 'scroll', () => {
      clearTimeout(scrollTimeout);
      const current = window.pageYOffset;
      scrollTimeout = setTimeout(() => {
        const nav = getNavbar();
        if (!nav) return;
        nav.style.transform = current > lastScrollTop && current > 100 ? 'translateY(-100%)' : 'translateY(0)';
        lastScrollTop = current;
      }, 100);
    });
    cleanups.push(() => {
      clearTimeout(scrollTimeout);
      const nav = getNavbar();
      if (nav) {
        nav.style.boxShadow = '';
        nav.style.backgroundColor = '';
        nav.style.transform = '';
      }
    });
  }

  /* ── lazy images (img[data-src]) ───────────────────────── */
  const lazyImages = () => {
    const images = document.querySelectorAll('img[data-src]');
    if (!images.length) return;
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('loading-skeleton');
            io.unobserve(img);
          }
        })
      );
      images.forEach((img) => {
        img.classList.add('loading-skeleton');
        io.observe(img);
      });
      cleanups.push(() => io.disconnect());
    } else {
      images.forEach((img) => (img.src = img.dataset.src));
    }
  };
  lazyImages();

  /* ── ripple on buttons (delegated) ─────────────────────── */
  on(document, 'click', (e) => {
    const button = e.target.closest?.('button, .btn, .primary, .secondary');
    if (!button) return;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    ripple.classList.add('ripple-effect');
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });

  /* ── product card 3D tilt (delegated) ──────────────────── */
  on(document, 'mousemove', (e) => {
    const card = e.target.closest?.('.bluelly-product-card');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const rotateX = (e.clientY - rect.top - rect.height / 2) / 20;
    const rotateY = (rect.width / 2 - (e.clientX - rect.left)) / 20;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
  });
  on(
    document,
    'mouseleave',
    (e) => {
      if (e.target.classList?.contains('bluelly-product-card')) e.target.style.transform = '';
    },
    true
  );

  /* ── scroll progress bar + resize + scroll hooks ───────── */
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.appendChild(progressBar);
  cleanups.push(() => progressBar.remove());

  const handleScroll = () => {
    applyParallax();
    const total = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = total > 0 ? `${(window.pageYOffset / total) * 100}%` : '0%';
  };
  on(window, 'scroll', handleScroll);
  on(window, 'resize', () => {
    const nav = getNavbar();
    if (nav) navbarHeight = nav.offsetHeight;
    handleScroll();
  });
  handleScroll();

  /* ── page fade-in ──────────────────────────────────────── */
  document.body.style.opacity = '0';
  const fadeTimer = setTimeout(() => {
    document.body.style.transition = 'opacity 0.5s ease';
    document.body.style.opacity = '1';
  }, 100);
  cleanups.push(() => {
    clearTimeout(fadeTimer);
    document.body.style.opacity = '';
    document.body.style.transition = '';
  });

  observeNewContent();

  return {
    /** call after route changes / new content mounts */
    observeNewContent,
    destroy: () => cleanups.forEach((fn) => fn()),
  };
}
