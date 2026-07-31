import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { updateUserProfile } from '../../api/userApi';

export const ProfileModal = ({ onClose }) => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  if (!user) return null;

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const updated = await updateUserProfile(user.id, {
        full_name: form.full_name.trim() || user.full_name,
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
      });
      setUser(updated);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="my-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">My Profile</h3>
          <button
            onClick={onClose}
            className="rounded-full px-2 py-1 text-gray-500 transition hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-gray-700">
          <p className="font-semibold text-gray-900">{user.full_name}</p>
          <p className="text-xs text-gray-600">{user.email}</p>
          <p className="text-xs capitalize text-gray-600">{user.role?.toLowerCase?.()}</p>
        </div>

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setField('full_name', e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setField('phone', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setField('address', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setField('city', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">State</label>
              <input
                type="text"
                value={form.state}
                onChange={(e) => setField('state', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-800 disabled:bg-gray-300"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
