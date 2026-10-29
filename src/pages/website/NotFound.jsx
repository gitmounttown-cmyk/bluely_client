import { Navigate } from 'react-router-dom';
import { ROUTES } from '../../routes/paths';

// Unknown URL -> home page
export default function NotFound() {
  return <Navigate to={ROUTES.HOME} replace />;
}
