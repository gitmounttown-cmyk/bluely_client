import { useLayoutEffect } from 'react';

/**
 * Mounts a page's stylesheets (in order) while the page is on screen and removes
 * them when it unmounts.
 *
 * Why: the original site was multi-page – each .html loaded only its own CSS
 * files. Several files reuse the same class names with different rules
 * (.product-card, .card, .hero-section, .main-content, .filter-btn, body…), so
 * loading them all at once would break the design. This keeps every page's CSS
 * cascade identical to the original.
 *
 * `sheets` must be a module-level constant array (stable reference).
 */
export default function usePageStyles(sheets) {
  useLayoutEffect(() => {
    const nodes = sheets.map((css) => {
      const el = document.createElement('style');
      el.setAttribute('data-bluely-page-style', '');
      el.textContent = css;
      document.head.appendChild(el);
      return el;
    });
    return () => nodes.forEach((n) => n.remove());
  }, [sheets]);
}
