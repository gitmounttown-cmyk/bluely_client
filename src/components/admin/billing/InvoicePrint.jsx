import React from 'react';

export const InvoicePrint = React.forwardRef(({ cart, customer, total, tax }, ref) => {
  return (
    <div ref={ref} className="p-6 text-black bg-white max-w-sm text-xs font-mono hidden">
      <div className="text-center border-b pb-2 mb-2">
        <h2 className="font-bold text-sm uppercase">BLUELY STORE</h2>
        <p>Cleaning Products Inventory & POS</p>
        <p>Date: {new Date().toLocaleString()}</p>
      </div>
      <div className="mb-2">
        <p><strong>Customer:</strong> {customer.name || 'Walk-in'}</p>
        <p><strong>Phone:</strong> {customer.phone || 'N/A'}</p>
      </div>
      <table className="w-full border-b mb-2">
        <thead>
          <tr className="border-b"><th className="text-left">Item</th><th className="text-center">Qty</th><th className="text-right">Price</th></tr>
        </thead>
        <tbody>
          {cart.map(item => (
            <tr key={item._id}>
              <td>{item.name}</td>
              <td className="text-center">{item.qty}</td>
              <td className="text-right">₹{item.price * item.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-right space-y-1">
        <p>GST (18%): ₹{tax.toFixed(2)}</p>
        <p className="font-bold">TOTAL: ₹{total.toFixed(2)}</p>
      </div>
    </div>
  );
});