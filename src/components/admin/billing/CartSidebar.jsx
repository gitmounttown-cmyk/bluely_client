import React from 'react';
import { Trash2, Printer, Receipt } from 'lucide-react';

export default function CartSidebar({ cart, updateQty, removeItem, customer, setCustomer, subtotal, tax, grandTotal, onCheckout }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between h-[calc(100vh-7rem)]">
      <div>
        <h3 className="font-bold text-slate-800 text-base mb-4 border-b pb-2 flex justify-between items-center">
          <span>POS Quick Bill</span>
          <Receipt size={18} className="text-bluely-500" />
        </h3>
        
        <div className="space-y-2 mb-4">
          <input 
            type="text" placeholder="Customer Name" value={customer.name}
            onChange={e => setCustomer({...customer, name: e.target.value})}
            className="w-full text-xs p-2 border border-slate-200 rounded-lg"
          />
          <input 
            type="text" placeholder="Phone Number" value={customer.phone}
            onChange={e => setCustomer({...customer, phone: e.target.value})}
            className="w-full text-xs p-2 border border-slate-200 rounded-lg"
          />
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {cart.map(item => (
            <div key={item._id} className="flex justify-between items-center text-xs border-b border-slate-100 pb-2">
              <div className="flex-1 pr-2">
                <p className="font-semibold text-slate-800">{item.name}</p>
                <p className="text-slate-400">₹{item.price} × {item.qty}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => updateQty(item._id, -1)} className="w-5 h-5 bg-slate-100 rounded text-center">-</button>
                <span>{item.qty}</span>
                <button onClick={() => updateQty(item._id, 1)} className="w-5 h-5 bg-slate-100 rounded text-center">+</button>
                <button onClick={() => removeItem(item._id)} className="text-red-500 ml-1"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
          {cart.length === 0 && <p className="text-xs text-slate-400 text-center py-8">Cart is empty</p>}
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4 space-y-2">
        <div className="flex justify-between text-xs text-slate-500">
          <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>GST (18%)</span><span>₹{tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-sm text-slate-800 border-t pt-2">
          <span>Grand Total</span><span className="text-bluely-500">₹{grandTotal.toFixed(2)}</span>
        </div>
        <button 
          onClick={onCheckout}
          disabled={cart.length === 0}
          className="w-full mt-2 bg-bluely-500 hover:bg-bluely-600 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition flex justify-center items-center gap-2"
        >
          <Printer size={16} /> Complete & Generate Bill
        </button>
      </div>
    </div>
  );
}