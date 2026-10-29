// Each page gets exactly the stylesheets (and order) its original .html loaded,
// followed by the responsive additions. `?inline` gives the CSS as a string, which
// usePageStyles mounts/unmounts with the route.
import home from './home.css?inline';
import product from './product.css?inline';
import about from './about.css?inline';
import contact from './contact.css?inline';
import footer from './footer.css?inline';
import animation from './animation.css?inline';
import bubble from './bubble.css?inline';
import effects from './effects.css?inline';
import buynow from './buynow.css?inline';
import dashboard from './dashboard.css?inline';
import forgotpassword from './forgotpassword.css?inline';
import otp from './otp.css?inline';
import resetpassword from './resetpassword.css?inline';

import rBase from './responsive-base.css?inline';
import rHome from './responsive-home.css?inline';
import rProducts from './responsive-products.css?inline';
import rAbout from './responsive-about.css?inline';
import rContact from './responsive-contact.css?inline';
import rBuynow from './responsive-buynow.css?inline';
import rDashboard from './responsive-dashboard.css?inline';
import rAuth from './responsive-auth.css?inline';

const shell = [footer, animation, bubble, effects, rBase];

export const HOME_STYLES = [home, ...shell, rHome];
export const PRODUCTS_STYLES = [home, product, ...shell, rProducts];
export const ABOUT_STYLES = [home, about, ...shell, rAbout];
export const CONTACT_STYLES = [home, contact, ...shell, rContact];
export const BUYNOW_STYLES = [buynow, rBuynow];
export const DASHBOARD_STYLES = [dashboard, rDashboard];
export const FORGOT_STYLES = [forgotpassword, rAuth];
export const OTP_STYLES = [otp, rAuth];
export const RESET_STYLES = [resetpassword, rAuth];
