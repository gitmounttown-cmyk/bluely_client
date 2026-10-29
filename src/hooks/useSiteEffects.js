import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initSiteAnimations } from '../effects/siteAnimations';
import { initBubbleCursor } from '../effects/bubbleCursor';

/** animation.js + bubble.js for the public pages (home, products, about, contact) */
export default function useSiteEffects() {
  const { pathname } = useLocation();

  useEffect(() => {
    const animations = initSiteAnimations();
    const destroyBubbles = initBubbleCursor();
    window.__bluelyAnimations = animations;
    return () => {
      animations.destroy();
      destroyBubbles();
      delete window.__bluelyAnimations;
    };
  }, []);

  // re-scan for .reveal elements whenever the page changes
  useEffect(() => {
    window.__bluelyAnimations?.observeNewContent();
  }, [pathname]);
}
