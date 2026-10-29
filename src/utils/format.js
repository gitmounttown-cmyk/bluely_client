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
  // Dishwash Liquid -> Yellow packaging with lime/lemon
  if (name.includes('dishwash') || name.includes('dish') || name.includes('utensil')) return 'yellow';

  // Soap Oil -> Red bottle with green cap
  if (name.includes('soap oil') || name.includes('soap')) return 'coral';

  // Acid / Gel Acid -> Clear bottle with yellow liquid, red cap
  if (name.includes('acid') || name.includes('gel acid') || name.includes('muriatic')) return 'yellow';

  // Glass Cleaner -> Blue spray bottle
  if (name.includes('glass') || name.includes('shine') || name.includes('mirror')) return 'blue';

  // Fabric Softener -> Light blue bottle with blue cap
  if (name.includes('softener') || name.includes('fabric care') || name.includes('conditioner')) return 'blue';

  // Toilet Cleaner -> Deep blue bottle with red nozzle
  if (name.includes('toilet') || name.includes('commode')) return 'blue';

  // Phenyl products
  if (name.includes('phenyl') || name.includes('phenyle')) {
    if (name.includes('green')) return 'green';
    if (name.includes('blue')) return 'blue';
    if (name.includes('white')) return 'lavender';
    if (name.includes('yellow')) return 'yellow';
    return 'blue';
  }

  // Detergent Liquid -> Purple / blue bottle
  if (name.includes('detergent') || name.includes('laundry') || name.includes('wash') || name.includes('fabric')) return 'purple';

  // Floor Cleaner
  if (name.includes('floor') || name.includes('surface') || name.includes('tile')) return 'pink';

  // Handwash / Sanitizer
  if (name.includes('hand') || name.includes('sanit') || name.includes('hygiene') || name.includes('personal')) return 'blue';

  // Bleach
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

// Aliased for backwards compatibility
export const productColorClass = (categoryOrProduct, options) => {
  return productExactColorTheme(categoryOrProduct);
};

/**
 * Safely resolves any product/category image path to a full working URL.
 * Handles server uploads (/uploads/...), absolute external URLs, blob URLs, and public images (/images/...).
 */
export const resolveImageUrl = (img) => {
  if (!img || typeof img !== 'string' || img.trim() === '') {
    return '/images/Product.png';
  }
  const trimmed = img.trim();
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

export const inr = (n) => Number(n).toLocaleString('en-IN');
