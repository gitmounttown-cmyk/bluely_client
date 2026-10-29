import { BrowserRouter } from 'react-router-dom';
import AppProviders from './context/AppProviders';
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from './components/ScrollToTop';

export default function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <ScrollToTop />
        <AppRoutes />
      </AppProviders>
    </BrowserRouter>
  );
}
