import { amountToWords, calculateTotalVolume } from './format';

/**
 * Generates and triggers print/PDF download for the official Vishaka Medical Industries Tax Invoice
 * Matches the required format with Volume column, SGST/CGST breakdown, and Bank Account Details.
 */
export function downloadOrderInvoice(order) {
  if (!order) return;

  const items = Array.isArray(order.items) ? order.items : [];
  const invoiceNo = order.invoiceNo || `V26-${(order.orderNo || order._id || '159').toString().slice(-3)}`;
  const deliveryNote = order.deliveryNote || `DNTV26-${(order.orderNo || order._id || '159').toString().slice(-3)}`;
  
  const rawDate = order.orderDate || order.createdAt || new Date();
  const formattedDate = new Date(rawDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).replace(/\//g, '-');

  const buyerName = order.hospitalOrCompanyName || order.customerName || 'GANGA MEDICAL CENTRE AND HOSPITIALS PVT LTD';
  const buyerAddress = order.buyerAddress || order.shippingAddress || 'NO .2 , SWARNABIGA LAYOUT\nRAMNAGAR\nCOIMBATORE -641 009';
  const buyerGstin = order.buyerGstin || order.gstNumber || '33AABCG8283F1ZN';
  const orderNo = order.orderNo ? (order.orderNo.startsWith('ORD-') ? order.orderNo : `ORD-${order.orderNo}`) : 'Verbal';
  const termsOfPayment = order.termsOfPayment || (order.paymentMethod === 'Bank Transfer' ? 'Bank Transfer (Delayed)' : order.paymentMethod || 'Bank Transfer');
  const dispatchedThrough = order.dispatchedThrough || 'Direct';
  const termsOfDelivery = order.termsOfDelivery || 'Direct Delivery';

  const subtotal = Number(order.subtotal || items.reduce((s, i) => s + (Number(i.lineTotal) || (Number(i.price) * Number(i.quantity))), 0));
  const sgst = Number(order.sgst !== undefined ? order.sgst : (subtotal * 0.025).toFixed(2));
  const cgst = Number(order.cgst !== undefined ? order.cgst : (subtotal * 0.025).toFixed(2));
  const totalAmount = Number(order.totalAmount || (subtotal + sgst + cgst).toFixed(2));
  const inWords = amountToWords(totalAmount);

  // Generate rows with Volume column
  const itemsHtml = items.map((item, idx) => {
    const name = (item.productName || item.product?.name || item.name || 'Medical Supply').toUpperCase();
    const qty = Number(item.quantity) || 1;
    const baseVolume = item.volume || item.litre || item.product?.litre || '1L';
    const volumeDisplay = calculateTotalVolume(baseVolume, qty);
    const hsnCode = item.hsnCode || '9018';
    const rate = Number(item.price || item.rate || 0);
    const amount = Number(item.lineTotal || (rate * qty));

    return `
      <tr>
        <td style="text-align: center; border-right: 1px solid #000; padding: 8px 6px;">${idx + 1}</td>
        <td style="border-right: 1px solid #000; padding: 8px 10px; font-weight: 600;">${name}</td>
        <td style="text-align: center; border-right: 1px solid #000; padding: 8px 6px; font-weight: 600; color: #000;">${volumeDisplay}</td>
        <td style="text-align: center; border-right: 1px solid #000; padding: 8px 6px;">${qty}</td>
        <td style="text-align: center; border-right: 1px solid #000; padding: 8px 6px;">${hsnCode}</td>
        <td style="text-align: right; border-right: 1px solid #000; padding: 8px 10px;">${rate}</td>
        <td style="text-align: right; padding: 8px 10px; font-weight: 600;">${amount}</td>
      </tr>
    `;
  }).join('');

  // Minimum row height padding to match authentic printed invoice
  const emptyRowsNeeded = Math.max(0, 4 - items.length);
  let emptyRowsHtml = '';
  for (let i = 0; i < emptyRowsNeeded; i++) {
    emptyRowsHtml += `
      <tr>
        <td style="border-right: 1px solid #000; padding: 12px 6px;">&nbsp;</td>
        <td style="border-right: 1px solid #000;">&nbsp;</td>
        <td style="border-right: 1px solid #000;">&nbsp;</td>
        <td style="border-right: 1px solid #000;">&nbsp;</td>
        <td style="border-right: 1px solid #000;">&nbsp;</td>
        <td style="border-right: 1px solid #000;">&nbsp;</td>
        <td>&nbsp;</td>
      </tr>
    `;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to open and print the invoice.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Vishaka Invoice ${invoiceNo}</title>
      <style>
        * { box-sizing: border-box; }
        body {
          margin: 0;
          padding: 20px;
          background: #ffffff;
          color: #000000;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 13px;
          line-height: 1.35;
        }
        .invoice-wrapper {
          max-width: 820px;
          margin: 0 auto;
          background: #ffffff;
        }
        .brand-header {
          text-align: right;
          padding-bottom: 8px;
        }
        .brand-logo {
          font-size: 42px;
          font-weight: 900;
          color: #1a237e;
          font-style: italic;
          letter-spacing: -1px;
          display: inline-block;
          font-family: "Trebuchet MS", "Lucida Sans Unicode", "Arial", sans-serif;
        }
        .main-box {
          border: 1.5px solid #000000;
          width: 100%;
        }
        .title-bar {
          text-align: center;
          font-size: 14px;
          font-weight: bold;
          border-bottom: 1.5px solid #000000;
          padding: 4px 0;
          letter-spacing: 1px;
        }
        .grid-row {
          display: flex;
          border-bottom: 1px solid #000000;
        }
        .col-left {
          width: 50%;
          border-right: 1.5px solid #000000;
          padding: 8px 12px;
        }
        .col-right {
          width: 50%;
        }
        .sub-grid {
          display: flex;
          border-bottom: 1px solid #000000;
        }
        .sub-grid:last-child {
          border-bottom: none;
        }
        .sub-cell-left {
          width: 50%;
          border-right: 1px solid #000000;
          padding: 4px 8px;
        }
        .sub-cell-right {
          width: 50%;
          padding: 4px 8px;
        }
        .sub-title {
          font-weight: bold;
          font-size: 11px;
          color: #222;
        }
        .sub-val {
          font-size: 13px;
          font-weight: 500;
        }
        .company-name {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 4px;
        }
        .company-address {
          font-size: 13px;
          white-space: pre-line;
          line-height: 1.4;
        }
        .buyer-box {
          border-bottom: 1.5px solid #000000;
          padding: 8px 12px;
        }
        .buyer-label {
          font-weight: bold;
          font-size: 12px;
          margin-bottom: 2px;
        }
        .buyer-name {
          font-size: 13px;
          font-weight: bold;
        }
        .buyer-address {
          font-size: 13px;
          white-space: pre-line;
          line-height: 1.35;
        }
        table.items-table {
          width: 100%;
          border-collapse: collapse;
        }
        table.items-table th {
          border-bottom: 1.5px solid #000000;
          border-right: 1px solid #000000;
          padding: 8px 6px;
          font-size: 12px;
          font-weight: bold;
          text-align: center;
        }
        table.items-table th:last-child {
          border-right: none;
          text-align: right;
          padding-right: 10px;
        }
        table.items-table td {
          font-size: 12px;
        }
        .tax-subtotal-row {
          display: flex;
          justify-content: flex-end;
          border-top: 1px solid #000000;
        }
        .tax-subtotal-table {
          width: 320px;
          border-collapse: collapse;
        }
        .tax-subtotal-table td {
          padding: 4px 10px;
          font-size: 12px;
        }
        .tax-subtotal-table td.label {
          font-weight: bold;
        }
        .tax-subtotal-table td.val {
          text-align: right;
          font-weight: 600;
        }
        .total-row {
          display: flex;
          border-top: 1.5px solid #000000;
          border-bottom: 1.5px solid #000000;
        }
        .total-label {
          width: 70%;
          text-align: center;
          font-weight: bold;
          padding: 6px 12px;
          border-right: 1.5px solid #000000;
        }
        .total-amount {
          width: 30%;
          text-align: right;
          font-weight: bold;
          padding: 6px 12px;
        }
        .amount-words-row {
          border-bottom: 1.5px solid #000000;
          padding: 8px 12px;
          font-weight: bold;
          font-size: 12.5px;
        }
        .bottom-grid {
          display: flex;
        }
        .bottom-left {
          width: 50%;
          border-right: 1.5px solid #000000;
          padding: 10px 12px;
        }
        .bottom-right {
          width: 50%;
          padding: 10px 12px;
        }
        .account-title {
          font-weight: bold;
          margin-bottom: 4px;
        }
        .account-details {
          line-height: 1.5;
          font-size: 12px;
        }
        .declaration-box {
          margin-top: 14px;
          font-size: 11.5px;
          line-height: 1.4;
        }
        .declaration-title {
          font-weight: bold;
          margin-bottom: 2px;
        }
        .signatory-box {
          margin-top: 25px;
          border-top: 1px solid #000000;
          padding-top: 6px;
        }
        .signatory-title {
          font-weight: bold;
          font-size: 12px;
          margin-bottom: 30px;
        }
        .signatory-text {
          font-size: 11.5px;
          color: #333;
        }
        .computer-generated-footer {
          text-align: center;
          font-size: 12px;
          margin-top: 10px;
          font-style: normal;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none !important; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-wrapper">
        <div class="brand-header">
          <div class="brand-logo">Vishaka</div>
        </div>

        <div class="main-box">
          <div class="title-bar">INVOICE</div>

          <!-- Top Grid: Company vs Metadata -->
          <div class="grid-row">
            <div class="col-left">
              <div class="company-name">VISHAKA MEDICAL INDUSTRIES</div>
              <div class="company-address">5/83,E3 ,Janarthanan Nagar ,<br />Mettupalayam<br />Coimbatore - 641301<br />ph:9361333919</div>
            </div>

            <div class="col-right">
              <div class="sub-grid">
                <div class="sub-cell-left">
                  <div class="sub-title">Invoice No</div>
                  <div class="sub-val">${invoiceNo}</div>
                </div>
                <div class="sub-cell-right">
                  <div class="sub-title">Dated</div>
                  <div class="sub-val">${formattedDate}</div>
                </div>
              </div>

              <div class="sub-grid">
                <div class="sub-cell-left">
                  <div class="sub-title">Delivery Note</div>
                  <div class="sub-val">${deliveryNote}</div>
                </div>
                <div class="sub-cell-right">
                  <div class="sub-title">Mode/Terms of Payment</div>
                  <div class="sub-val">${termsOfPayment}</div>
                </div>
              </div>

              <div class="sub-grid">
                <div class="sub-cell-left">
                  <div class="sub-title">Order No</div>
                  <div class="sub-val">${orderNo}</div>
                </div>
                <div class="sub-cell-right">
                  <div class="sub-title">Order Date</div>
                  <div class="sub-val">${formattedDate}</div>
                </div>
              </div>

              <div class="sub-grid">
                <div class="sub-cell-left">
                  <div class="sub-title">Dispatched Through</div>
                  <div class="sub-val">${dispatchedThrough}</div>
                </div>
                <div class="sub-cell-right">
                  <div class="sub-title">Dispatched Date</div>
                  <div class="sub-val">${formattedDate}</div>
                </div>
              </div>

              <div class="sub-grid">
                <div style="width: 100%; padding: 4px 8px;">
                  <div class="sub-title">Terms Of Delivery</div>
                  <div class="sub-val">${termsOfDelivery}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Buyer Details -->
          <div class="buyer-box">
            <div class="buyer-label">BUYER:</div>
            <div class="buyer-name">${buyerName}</div>
            <div class="buyer-address">${buyerAddress}</div>
            <div style="margin-top: 4px; font-weight: bold;">GST NO : ${buyerGstin}</div>
          </div>

          <!-- Items Table with Volume Column -->
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 6%;">S.no</th>
                <th style="width: 38%; text-align: left; padding-left: 10px;">Discription Of Goods</th>
                <th style="width: 14%;">Volume</th>
                <th style="width: 10%;">Quantity</th>
                <th style="width: 10%;">HSN Code</th>
                <th style="width: 10%; text-align: right; padding-right: 10px;">Rate</th>
                <th style="width: 12%; text-align: right; padding-right: 10px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              ${emptyRowsHtml}
            </tbody>
          </table>

          <!-- Tax Calculation Box -->
          <div class="tax-subtotal-row">
            <table class="tax-subtotal-table">
              <tr>
                <td class="label">SGST</td>
                <td style="text-align: center; width: 60px;">2.50%</td>
                <td class="val">${sgst.toFixed(1)}</td>
              </tr>
              <tr>
                <td class="label">CGST</td>
                <td style="text-align: center; width: 60px;">2.50%</td>
                <td class="val">${cgst.toFixed(1)}</td>
              </tr>
            </table>
          </div>

          <!-- Total Row -->
          <div class="total-row">
            <div class="total-label">Total</div>
            <div class="total-amount">${Math.round(totalAmount)}</div>
          </div>

          <!-- Amount In Words -->
          <div class="amount-words-row">
            <span>Amount In Words:</span> &nbsp; <span style="font-weight: 500;">${inWords}</span>
          </div>

          <!-- Bottom Grid: PAN/GST/Declaration vs Bank Account Details -->
          <div class="bottom-grid">
            <div class="bottom-left">
              <div style="font-weight: bold; margin-bottom: 2px;">Company PAN - DCKPK7308L</div>
              <div style="font-weight: bold; margin-bottom: 12px;">Company GST - 33DCKPK7308L1ZB</div>
              
              <div class="declaration-box">
                <div class="declaration-title">Declaration</div>
                <p style="margin: 0;">We declarethat this invoice show sthe actual priceof the goods described and that all particularsare true and correct.</p>
              </div>
            </div>

            <div class="bottom-right">
              <div class="account-title">Account Details :-</div>
              <div class="account-details">
                <div><strong>Vishaka Medical Industries</strong></div>
                <div>Acc No - 7591 0550 0038</div>
                <div>IFSC - ICIC0007591 ,</div>
                <div>Bank - ICICI BANK ,SIRUMUGAI BRANCH.</div>
              </div>

              <div class="signatory-box">
                <div class="signatory-title">For Vishaka Medical Industries</div>
                <div style="height: 35px;"></div>
                <div class="signatory-text">Authorized Signatory</div>
              </div>
            </div>
          </div>
        </div>

        <div class="computer-generated-footer">
          This is Computer Generated Invoice
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
