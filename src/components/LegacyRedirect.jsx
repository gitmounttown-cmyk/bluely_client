import { Navigate, useLocation } from 'react-router-dom';
import { LEGACY_ROUTES, ROUTES } from '../routes/paths';

/** /products.html?x=1  ->  /products?x=1 (keeps query string + hash) */
export default function LegacyRedirect() {
  const { pathname, search, hash } = useLocation();
  const target = LEGACY_ROUTES[pathname.toLowerCase()] || ROUTES.HOME;
  return <Navigate to={`${target}${search}${hash}`} replace />;
}
