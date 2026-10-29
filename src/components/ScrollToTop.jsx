import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** A new page used to start at the top because the browser reloaded; do the same on route change. */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
