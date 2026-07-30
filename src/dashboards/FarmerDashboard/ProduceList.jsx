import { useState } from 'react';
import { ProduceCard } from './ProduceCard';
import { AddProduceForm } from './AddProduceForm';
import * as farmerApi from '../../api/farmerApi';
import { Card, CardHeader } from '../../components/common/Card';

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
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Produce Listings</h2>
          <p className="text-gray-600">You have {produce.length} active listings</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); }}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition shadow-md hover:shadow-lg"
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
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-4xl mb-2">🌾</p>
          <p className="text-gray-600 font-medium">No produce listings yet</p>
          <p className="text-gray-500 text-sm mt-1">Add your first product to get started</p>
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
