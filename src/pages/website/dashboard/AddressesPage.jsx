import { useCallback, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getAddressesRequest, saveAddressesRequest } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

const EMPTY = { type: '', name: '', mobile: '', street: '', city: '', state: '', zip: '', isDefault: false };

/** "Manage Address" (rewardsPage in dashboard.html) */
export default function AddressesPage() {
  const { user } = useAuth();
  const email = user?.email;

  const [addresses, setAddresses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const fetchAll = useCallback(async () => {
    const { data } = await getAddressesRequest(email);
    return Array.isArray(data) ? data : [];
  }, [email]);

  const load = useCallback(async () => {
    if (!email) return;
    try {
      setAddresses(await fetchAll());
    } catch (err) {
      console.error(err);
    }
  }, [email, fetchAll]);

  useEffect(() => {
    load();
  }, [load]);

  const persist = async (list) => {
    await saveAddressesRequest(email, list);
    await load();
  };

  const openAdd = () => {
    setForm(EMPTY);
    setEditingIndex(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm(EMPTY);
    setEditingIndex(null);
  };

  const editAddress = async (index) => {
    const list = await fetchAll();
    const addr = list[index];
    if (!addr) return;
    setForm({
      type: addr.type || '',
      name: addr.name || '',
      mobile: addr.mobile || '',
      street: addr.street || '',
      city: addr.city || '',
      state: addr.state || '',
      zip: addr.zip || '',
      isDefault: addr.isDefault || false,
    });
    setEditingIndex(index);
    setModalOpen(true);
  };

  const saveAddress = async (e) => {
    e.preventDefault();
    const list = await fetchAll();
    if (editingIndex !== null) {
      list[editingIndex] = form;
    } else {
      if (form.isDefault) list.forEach((a) => (a.isDefault = false));
      list.push(form);
    }
    closeModal();
    await persist(list);
  };

  const deleteAddress = async (index) => {
    if (!window.confirm('Delete this address?')) return;
    const list = await fetchAll();
    list.splice(index, 1);
    await persist(list);
  };

  const setDefaultAddress = async (index) => {
    const list = await fetchAll();
    list.forEach((a, i) => (a.isDefault = i === index));
    await persist(list);
  };

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  return (
    <div id="rewardsPage" className="page active">
      <h1 className="page-title">Manage Address</h1>
      <button type="button" className="btn-add-address" id="addAddressBtn" onClick={openAdd}>
        + Add New Address
      </button>

      <div className="address-list" id="addressList">
        {addresses.map((addr, index) => (
          <div className="address-card" key={index}>
            <div className="address-header">
              <h3>{addr.type || 'Address'}</h3>
              <div className="address-actions">
                <button type="button" className="btn-edit-address" onClick={() => editAddress(index)}>Edit</button>
                <button type="button" className="btn-delete-address" onClick={() => deleteAddress(index)}>Delete</button>
              </div>
            </div>
            <div className="address-details">
              <p className="address-name">{addr.name || ''}</p>
              <p className="address-text">{addr.street || ''}</p>
              <p className="address-text">
                {addr.city || ''}, {addr.state || ''} - {addr.zip || ''}
              </p>
              <p className="address-phone">Phone: +91 {addr.mobile || ''}</p>
            </div>
            {addr.isDefault ? (
              <div className="address-badge default-badge">Default Address</div>
            ) : (
              <button type="button" className="btn-set-default" onClick={() => setDefaultAddress(index)}>
                Set as Default
              </button>
            )}
          </div>
        ))}
      </div>

      <div className={`address-modal${modalOpen ? ' show' : ''}`} id="addressModal">
        <div className="address-modal-content">
          <div className="modal-header">
            <h2 id="modalTitle">{editingIndex !== null ? 'Edit Address' : 'Add New Address'}</h2>
            <button type="button" className="modal-close" onClick={closeModal} aria-label="Close">
              <X size={18} />
            </button>
          </div>
          <form id="addressForm" onSubmit={saveAddress}>
            <div className="form-row">
              <div className="form-group">
                <label>Address Type</label>
                <input type="text" id="addressType" placeholder="e.g., Home, Office, Other" required
                  value={form.type} onChange={set('type')} />
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" id="fullName" placeholder="Enter full name" required
                  value={form.name} onChange={set('name')} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" id="phoneNumber" placeholder="Enter 10 digit mobile number" required
                  pattern="[0-9]{10}" value={form.mobile} onChange={set('mobile')} />
              </div>
              <div className="form-group">
                <label>Pincode</label>
                <input type="text" id="pincode" placeholder="Enter pincode" required
                  pattern="[0-9]{6}" value={form.zip} onChange={set('zip')} />
              </div>
            </div>
            <div className="form-group">
              <label>Address (House No, Building, Street)</label>
              <input type="text" id="streetInput" placeholder="Enter address" required
                value={form.street} onChange={set('street')} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input type="text" id="city" placeholder="Enter city" required
                  value={form.city} onChange={set('city')} />
              </div>
              <div className="form-group">
                <label>State</label>
                <input type="text" id="state" placeholder="Enter state" required
                  value={form.state} onChange={set('state')} />
              </div>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input type="checkbox" id="setDefault" checked={form.isDefault} onChange={set('isDefault')} />
                <span>Set as default address</span>
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn-save">Save Address</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
