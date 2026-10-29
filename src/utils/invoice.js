/**
 * Generates and triggers print/PDF download for an Order Invoice
 */
export function downloadOrderInvoice(order) {
  if (!order) return;

  const items = Array.isArray(order.items) ? order.items : [];
  const orderId = order.orderNo || order._id || 'BLUELY-ORD';
  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) : new Date().toLocaleDateString('en-IN');

  const customerName = order.customerName || order.user?.name || 'Valued Customer';
  const customerEmail = order.customerEmail || order.user?.email || 'customer@bluely.in';
  const shippingAddress = order.shippingAddress || 'Standard Delivery';
  const paymentMethod = order.paymentMethod || 'Razorpay';
  const paymentId = order.paymentId || order.razorpayPaymentId || '';

  const subtotal = order.subtotal || order.totalAmount || 0;
  const grandTotal = order.totalAmount || 0;
  const platformFee = 3;

  const itemsHtml = items.map((item, idx) => {
    const name = item.productName || item.product?.name || item.name || 'Cleaning Product';
    const qty = item.quantity || 1;
    const price = item.price || item.product?.price || 0;
    const lineTotal = item.lineTotal || (price * qty);

    return `
      <tr>
        <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #1e293b;">
          <strong>${idx + 1}. ${name}</strong>
        </td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 13px; color: #475569;">
          ${qty}
        </td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 13px; color: #475569;">
          ₹${price}
        </td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 13px; font-weight: 600; color: #081b6b;">
          ₹${lineTotal}
        </td>
      </tr>
    `;
  }).join('');

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to download and print your invoice.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Bluely Invoice #${orderId}</title>
      <style>
        * { box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          margin: 0;
          padding: 40px;
          color: #1e293b;
          background: #ffffff;
        }
        .invoice-card {
          max-width: 800px;
          margin: 0 auto;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 36px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #081b6b;
          padding-bottom: 24px;
          margin-bottom: 24px;
        }
        .logo-title {
          font-size: 26px;
          font-weight: 800;
          color: #081b6b;
          letter-spacing: 0.5px;
          margin: 0 0 4px 0;
        }
        .tagline {
          font-size: 12px;
          color: #64748b;
          margin: 0;
        }
        .invoice-meta {
          text-align: right;
        }
        .invoice-badge {
          display: inline-block;
          background: #e0f2fe;
          color: #0369a1;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .order-id {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 4px 0;
        }
        .date {
          font-size: 12px;
          color: #64748b;
          margin: 0;
        }
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 8px;
          padding: 16px 20px;
          margin-bottom: 24px;
        }
        .details-col h4 {
          margin: 0 0 6px 0;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #64748b;
        }
        .details-col p {
          margin: 0;
          font-size: 13px;
          line-height: 1.5;
          color: #334155;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
        }
        th {
          background: #f1f5f9;
          color: #475569;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          padding: 10px 14px;
          text-align: left;
        }
        .totals-section {
          display: flex;
          justify-content: flex-end;
          margin-top: 10px;
        }
        .totals-table {
          width: 280px;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 13px;
          color: #64748b;
        }
        .totals-row.grand-total {
          border-top: 2px solid #081b6b;
          padding-top: 10px;
          margin-top: 6px;
          font-size: 16px;
          font-weight: 800;
          color: #081b6b;
        }
        .footer-note {
          margin-top: 36px;
          padding-top: 18px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
        }
        @media print {
          body { padding: 0; }
          .invoice-card { border: none; padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-card">
        <div class="header">
          <div>
            <h1 class="logo-title">BLUELY</h1>
            <p class="tagline">Pure Clean. Pure Care. | Clean Living Essentials</p>
          </div>
          <div class="invoice-meta">
            <span class="invoice-badge">Tax Invoice / Receipt</span>
            <p class="order-id">Order #${orderId}</p>
            <p class="date">Date: ${orderDate}</p>
          </div>
        </div>

        <div class="details-grid">
          <div class="details-col">
            <h4>Billed To</h4>
            <p><strong>${customerName}</strong></p>
            <p>${customerEmail}</p>
            <p style="margin-top: 4px;"><strong>Shipping Address:</strong><br />${shippingAddress}</p>
          </div>
          <div class="details-col">
            <h4>Payment Information</h4>
            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            ${paymentId ? `<p><strong>Transaction ID:</strong> ${paymentId}</p>` : ''}
            <p><strong>Payment Status:</strong> <span style="color: #16a34a; font-weight: 600;">PAID &amp; CONFIRMED</span></p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item Description</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="totals-section">
          <div class="totals-table">
            <div class="totals-row">
              <span>Items Subtotal:</span>
              <span>₹${subtotal}</span>
            </div>
            <div class="totals-row">
              <span>Platform / Handling Fee:</span>
              <span>₹${platformFee}</span>
            </div>
            <div class="totals-row">
              <span>Delivery Charges:</span>
              <span style="color: #16a34a; font-weight: 600;">FREE</span>
            </div>
            <div class="totals-row grand-total">
              <span>Total Paid:</span>
              <span>₹${grandTotal}</span>
            </div>
          </div>
        </div>

        <div class="footer-note">
          <p>Thank you for choosing Bluely! If you have any questions, reach us at support@bluely.in.</p>
        </div>
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}
