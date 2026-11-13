import { SERVER_URL } from '../config/config';

/**
 * Resolves the EXACT light color theme class based on the product's name,
 * physical bottle/liquid packaging, and category.
 */
export const productExactColorTheme = (productOrCategory, fallbackName = '') => {
  let name = '';
  let category = '';

  if (productOrCategory && typeof productOrCategory === 'object') {
    name = (productOrCategory.name || fallbackName || '').toString().toLowerCase();
    const cat = productOrCategory.category;
    category = (typeof cat === 'object' ? cat?.name || '' : cat || '').toString().toLowerCase();
    if (productOrCategory.color && typeof productOrCategory.color === 'string') {
      return productOrCategory.color.toLowerCase();
    }
  } else {
    name = (fallbackName || '').toString().toLowerCase();
    category = (productOrCategory || '').toString().toLowerCase();
  }

  // 1. Direct explicit color keywords in product name
  if (name.includes('green') || name.includes('herbal') || name.includes('neem') || name.includes('mint')) return 'green';
  if (name.includes('blue') || name.includes('aqua') || name.includes('ocean')) return 'blue';
  if (name.includes('yellow') || name.includes('lemon') || name.includes('lime') || name.includes('citrus')) return 'yellow';
  if (name.includes('red') || name.includes('strawberry')) return 'coral';
  if (name.includes('pink') || name.includes('rose') || name.includes('floral')) return 'pink';
  if (name.includes('orange') || name.includes('peach') || name.includes('sandal')) return 'orange';
  if (name.includes('purple') || name.includes('violet')) return 'purple';
  if (name.includes('lavender')) return 'lavender';

  // 2. Exact product name matches based on physical Bluely product packaging
  if (name.includes('dishwash') || name.includes('dish') || name.includes('utensil')) return 'yellow';
  if (name.includes('soap oil') || name.includes('soap')) return 'coral';
  if (name.includes('acid') || name.includes('gel acid') || name.includes('muriatic')) return 'yellow';
  if (name.includes('glass') || name.includes('shine') || name.includes('mirror')) return 'blue';
  if (name.includes('softener') || name.includes('fabric care') || name.includes('conditioner')) return 'blue';
  if (name.includes('toilet') || name.includes('commode')) return 'blue';

  if (name.includes('phenyl') || name.includes('phenyle')) {
    if (name.includes('green')) return 'green';
    if (name.includes('blue')) return 'blue';
    if (name.includes('white')) return 'lavender';
    if (name.includes('yellow')) return 'yellow';
    return 'blue';
  }

  if (name.includes('detergent') || name.includes('laundry') || name.includes('wash') || name.includes('fabric')) return 'purple';
  if (name.includes('floor') || name.includes('surface') || name.includes('tile')) return 'pink';
  if (name.includes('hand') || name.includes('sanit') || name.includes('hygiene') || name.includes('personal')) return 'blue';
  if (name.includes('bleach') || name.includes('white')) return 'lavender';

  // 3. Fallback based on category
  if (category.includes('kitchen') || category.includes('dish')) return 'yellow';
  if (category.includes('floor') || category.includes('surface') || category.includes('tile')) return 'pink';
  if (category.includes('toilet') || category.includes('bath') || category.includes('sanit')) return 'blue';
  if (category.includes('hygiene') || category.includes('personal') || category.includes('hand')) return 'blue';
  if (category.includes('green') || category.includes('eco') || category.includes('herbal')) return 'green';
  if (category.includes('laundry') || category.includes('detergent') || category.includes('wash')) return 'purple';

  return 'blue';
};

export const productColorClass = (categoryOrProduct, options) => {
  return productExactColorTheme(categoryOrProduct);
};

/**
 * Safely resolves any product/category image path to a full working URL.
 */
export const resolveImageUrl = (img) => {
  if (!img || typeof img !== 'string' || img.trim() === '') {
    return '/images/Product.png';
  }
  let trimmed = img.trim();

  // If the image URL contains localhost or 127.0.0.1, strip it so mobile devices don't try to query themselves!
  if (trimmed.includes('localhost:') || trimmed.includes('127.0.0.1:')) {
    try {
      const parsed = new URL(trimmed);
      trimmed = parsed.pathname;
    } catch {
      trimmed = trimmed.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, '');
    }
  }

  // If the image URL is stored as https://bluely.in/images/..., route to local asset
  if (trimmed.includes('bluely.in/images/')) {
    const parts = trimmed.split('bluely.in/images/');
    return `/images/${decodeURIComponent(parts[1] || '')}`;
  }

  // If the image URL is stored as https://bluely.in/uploads/..., route to local /uploads/ asset
  if (trimmed.includes('bluely.in/uploads/')) {
    const parts = trimmed.split('bluely.in/uploads/');
    const cleanPath = parts[1]?.startsWith('/') ? parts[1] : `/${parts[1] || ''}`;
    return `${SERVER_URL}/uploads${cleanPath}`;
  }

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }
  if (trimmed.startsWith('/uploads') || trimmed.startsWith('uploads/')) {
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${SERVER_URL}${cleanPath}`;
  }
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

export const productId = (p) => p?._id || p?.id;

export const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export const inr = (n) => Number(n || 0).toLocaleString('en-IN');

/**
 * Calculates total volume for bulk orders (e.g., 1L × 100 = 100L)
 */
export const calculateTotalVolume = (litreStr, quantity = 1) => {
  const qty = Number(quantity) || 1;
  if (!litreStr) return `${qty} units`;
  const str = String(litreStr).trim();
  const match = str.match(/^([\d.]+)\s*([a-zA-Z]+)?$/);
  if (match) {
    const unitVal = parseFloat(match[1]);
    const unitName = (match[2] || 'L').toUpperCase();
    if (!isNaN(unitVal)) {
      const total = unitVal * qty;
      if (unitName === 'ML' && total >= 1000) {
        return `${(total / 1000).toFixed(total % 1000 === 0 ? 0 : 2)}L`;
      }
      return `${total}${unitName}`;
    }
  }
  return qty > 1 ? `${qty} × ${str}` : str;
};

/**
 * Converts numeric amount to Indian Currency words for Vishaka Tax Invoices
 */
export const amountToWords = (amount) => {
  const num = Math.round(Number(amount) || 0);
  if (num === 0) return 'Rupees - Zero Only';

  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n) {
    if (n < 20) return a[n];
    const digit = n % 10;
    return b[Math.floor(n / 10)] + (digit ? ' ' + a[digit] : '');
  }

  function convert(n) {
    if (n === 0) return '';
    if (n < 100) return inWords(n);
    if (n < 1000) {
      return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' And ' + inWords(n % 100) : '');
    }
    if (n < 100000) {
      return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
    }
    if (n < 10000000) {
      return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '');
    }
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + convert(n % 10000000) : '');
  }

  const words = convert(num).trim();
  return `Rupees - ${words} Only`;
};
