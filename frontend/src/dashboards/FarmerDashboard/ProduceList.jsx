import { useState } from 'react';
import { ProduceCard } from './ProduceCard';
import { AddProduceForm } from './AddProduceForm';
import * as farmerApi from '../../api/farmerApi';
import { Card } from '../../components/common/Card';

export const ProduceList = ({ produce, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const handleAddSuccess = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (id) => {
    setEditingId(id);
    setShowForm(true);
  };

  const editProduce = editingId ? produce.find((p) => p.id === editingId) : null;

  const handleDelete = async (id) => {
    try {
      await farmerApi.deleteProduceListing(id);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div id="produce-section" className="flex flex-col gap-4 rounded-2xl border border-green-100 bg-green-50/70 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Produce Listings</h2>
          <p className="text-sm text-gray-600">You have {produce.length} active listings</p>
        </div>
        <button
          id="add-produce-btn"
          onClick={() => { setShowForm(!showForm); setEditingId(null); }}
          className="rounded-lg bg-green-700 px-6 py-3 font-medium text-white transition hover:bg-green-800"
        >
          {showForm ? '✕ Cancel' : '+ Add Produce'}
        </button>
      </div>

      {showForm && (
        <Card className="border-2 border-green-200 bg-green-50">
          <h3 className="text-lg font-bold mb-4 text-gray-900">{editingId ? 'Edit Produce Listing' : 'Add New Produce Listing'}</h3>
          <AddProduceForm
            onClose={handleAddSuccess}
            onSuccess={onRefresh}
            editProduce={editProduce}
          />
        </Card>
      )}

      {produce.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-green-200 bg-green-50/50 py-12 text-center">
          <p className="mb-2 text-4xl">🌾</p>
          <p className="font-medium text-gray-700">No produce listings yet</p>
          <p className="mt-1 text-sm text-gray-500">Add your first product to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {produce.map((p) => (
            <ProduceCard
              key={p.id}
              produce={p}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
