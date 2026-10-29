import { useState } from 'react';
import { Star, Trash2, X } from 'lucide-react';

// Static "Recent Orders" view of dashboard.html (shown for ?page=dashboard)
const INITIAL = [
  { id: 1, color: 'purple', img: 'Product.png', name: 'Detergent Liquid', price: 100, date: 'Feb 6, 2026',
    desc: 'Deep stain removal with fabric care. Keeps clothes fresh, bright, and clean every wash.' },
  { id: 2, color: 'yellow', img: 'Product (5).png', name: 'Soap Oil', price: 120, date: 'Jan 6, 2026',
    desc: 'Multi-purpose cleaner that cuts tough grease and dirt with powerful cleaning action.' },
  { id: 3, color: 'blue', img: 'Product (9).png', name: 'Glass Cleaner', price: 120, date: 'Sep 8, 2025',
    desc: 'Streak-free formula for crystal clear glass and shiny surfaces in seconds.' },
];

export default function DashboardHome() {
  const [cards, setCards] = useState(INITIAL);

  const remove = (id) => {
    if (window.confirm('Are you sure you want to remove this item?')) {
      setCards((c) => c.filter((x) => x.id !== id));
    }
  };

  return (
    <div id="dashboardPage" className="page active">
      <h1 className="page-title">Dashboard</h1>

      <div className="section-header">
        <h2>Recent Orders</h2>
        <button type="button" className="close-btn" aria-label="Close">
          <X size={16} />
        </button>
      </div>
      <div className="product-list">
        {cards.map((c) => (
          <div className="product-card" key={c.id}>
            <div className={`product-image ${c.color}`}>
              <img src={`/images/${c.img}`} alt={c.name} />
            </div>
            <div className="product-info">
              <h3>{c.name}</h3>
              <div className="rating">
                4.3 <Star size={12} fill="currentColor" />
              </div>
              <p>{c.desc}</p>
            </div>
            <div className="product-price">₹{c.price}</div>
            <div className="delivery-status">
              <div className="status">Delivered On {c.date}</div>
              <div className="message">Your item has been delivered</div>
              <div className="review-link">
                <Star size={13} fill="currentColor" /> Ratings &amp; Reviews
              </div>
            </div>
            <button type="button" className="btn-delete" onClick={() => remove(c.id)} aria-label="Remove">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
