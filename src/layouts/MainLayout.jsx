import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useSiteEffects from '../hooks/useSiteEffects';

/** Shared shell for Home / Products / About / Contact: navbar + page + footer + animations */
export default function MainLayout() {
  useSiteEffects();
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}
