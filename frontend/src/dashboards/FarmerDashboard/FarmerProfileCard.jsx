import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { updateUserProfile } from '../../api/userApi';

const FIELD_LABELS = {
  full_name: 'Full Name',
  phone: 'Phone',
  address: 'Address',
  city: 'City',
  state: 'State',
  latitude: 'Latitude',
  longitude: 'Longitude',
};

export const FarmerProfileCard = () => {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  if (!user) return null;

  const openEdit = () => {
    setForm({
      full_name: user.full_name || '',
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      latitude: user.latitude ?? '',
      longitude: user.longitude ?? '',
    });
    setMessage(null);
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        full_name: form.full_name,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        latitude: form.latitude === '' ? null : Number(form.latitude),
        longitude: form.longitude === '' ? null : Number(form.longitude),
      };
      const res = await updateUserProfile(user.id, payload);
      if (res?.user) setUser(res.user);
      setEditing(false);
    } catch (err) {
      setMessage(err?.response?.data?.message || err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <Card>
      <CardHeader title="Your Profile" action={
        !editing && (
          <button
            onClick={openEdit}
            className="rounded-lg bg-green-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-green-800"
          >
            ✏️ Edit Profile
          </button>
        )
      } />
      <CardBody>
        {!editing ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Full Name</label>
              <p className="text-lg font-semibold text-gray-900">{user.full_name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <p className="text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Phone</label>
              <p className="text-gray-900">{user.phone || '—'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Location</label>
              <p className="text-gray-900">
                {[user.address, user.city, user.state].filter(Boolean).join(', ') || '—'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center">
                <p className="text-gray-600 text-sm">Latitude</p>
                <p className="text-gray-900 font-semibold">{user.latitude ?? '—'}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 text-sm">Longitude</p>
                <p className="text-gray-900 font-semibold">{user.longitude ?? '—'}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(FIELD_LABELS).map(([field, label]) => (
              <div key={field}>
                <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
                <input
                  type={field === 'latitude' || field === 'longitude' ? 'number' : 'text'}
                  step={field === 'latitude' || field === 'longitude' ? 'any' : undefined}
                  value={form[field] ?? ''}
                  onChange={(e) => update(field, e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            ))}

            {message && <p className="text-sm text-red-600">{message}</p>}

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-800 disabled:bg-gray-300"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
