import { useState } from 'react';
import { UNITS } from '../../utils/constants';
import * as farmerApi from '../../api/farmerApi';

export const AddProduceForm = ({ onClose, onSuccess, editProduce }) => {
  const [formData, setFormData] = useState({
    name: editProduce?.name || '',
    description: editProduce?.description || '',
    quantity: editProduce?.quantity?.toString() || '',
    unit: editProduce?.unit || 'kg',
    price_per_unit: editProduce?.price_per_unit?.toString() || '',
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!formData.name || !formData.quantity || !formData.price_per_unit) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      console.log('📤 Submitting produce form:', formData);

      const payload = {
        name: formData.name,
        description: formData.description,
        quantity: parseInt(formData.quantity),
        unit: formData.unit,
        price_per_unit: parseFloat(formData.price_per_unit),
      };

      if (editProduce) {
        await farmerApi.updateProduceListing(editProduce.id, payload);
        setSuccessMsg('✅ Produce updated successfully!');
      } else {
        await farmerApi.addProduceListing(payload);
        setSuccessMsg('✅ Produce added successfully!');
      }
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error adding produce:', err);
      alert('Failed to add produce: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (successMsg) {
    return (
      <div className="text-center py-8 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-2xl mb-2">🎉</p>
        <p className="text-lg font-semibold text-green-700">{successMsg}</p>
        <p className="text-sm text-green-600 mt-2">Redirecting...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Product Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition disabled:opacity-50"
            placeholder="e.g., Organic Tomatoes"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Quantity *</label>
          <div className="flex gap-2">
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              disabled={loading}
              min="1"
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition disabled:opacity-50"
              placeholder="0"
            />
            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              disabled={loading}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition disabled:opacity-50"
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          disabled={loading}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition disabled:opacity-50"
          rows="3"
          placeholder="Describe your product (freshness, origin, etc.)"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Price per Unit ($) *</label>
        <input
          type="number"
          name="price_per_unit"
          value={formData.price_per_unit}
          onChange={handleChange}
          required
          disabled={loading}
          step="0.01"
          min="0.01"
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition disabled:opacity-50"
          placeholder="0.00"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 text-white px-4 py-3 rounded-lg font-bold transition shadow-md hover:shadow-lg"
        >
          {loading ? '⏳ Saving...' : editProduce ? '✅ Update Produce' : '✅ Add Produce'}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:opacity-50 text-gray-900 px-4 py-3 rounded-lg font-bold transition"
        >
          ✕ Cancel
        </button>
      </div>
    </form>
  );
};
