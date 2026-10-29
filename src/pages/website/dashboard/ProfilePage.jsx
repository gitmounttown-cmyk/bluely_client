import { useEffect, useState } from 'react';
import { getMe, updateProfileRequest } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

/** renderProfilePage(user) + saveProfile() from dashboard.html */
export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    gender: user?.gender || 'Male',
    mobile: user?.mobile ?? '',
    address: user?.address ?? '',
  });

  // refresh from the server (loadProfileFromJWT)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { ok, data } = await getMe();
        if (!ok || cancelled) return;
        updateUser(data);
        setForm({
          name: data.name ?? '',
          email: data.email ?? '',
          gender: data.gender || 'Male',
          mobile: data.mobile ?? '',
          address: data.address ?? '',
        });
      } catch {
        /* keep the locally stored user */
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const saveProfile = async () => {
    const { ok, data } = await updateProfileRequest(form);
    if (!ok) {
      window.alert('Failed to update profile');
      return;
    }
    updateUser(data);
    window.alert('Profile updated successfully!');
  };

  return (
    <div id="profilePage" className="page active">
      <h1 className="page-title">My Profile</h1>
      <div className="card profile-card">
        <h2 className="profile-heading">Personal Information</h2>
        <br />
        <div className="form-group">
          <label>Name</label>
          <input type="text" id="profileNameInput" placeholder="John Doe" value={form.name} onChange={set('name')} />
        </div>
        <br />
        <div className="form-group">
          <label>Email</label>
          <input type="email" id="profileEmailInput" value={form.email} readOnly />
        </div>
        <br />
        <div className="form-group">
          <label>Gender</label>
          <select id="profileGenderInput" className="profileGenderInput" value={form.gender} onChange={set('gender')}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <br />
        <div className="form-group">
          <label>Mobile</label>
          <input type="text" id="profileMobileInput" placeholder="Mobile Number" value={form.mobile} onChange={set('mobile')} />
        </div>
        <br />
        <div className="form-group">
          <label>Address</label>
          <textarea id="profileAddressInput" placeholder="Enter address" value={form.address} onChange={set('address')} />
        </div>
        <br />
        <button type="button" className="save-btn" onClick={saveProfile}>Save Changes</button>
      </div>
    </div>
  );
}
