import { useState } from 'react';
import { formatDate } from '../../utils/formatters';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Card } from '../../components/common/Card';

export const ProduceCard = ({ produce, onEdit, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this produce?')) {
      setIsDeleting(true);
      try {
        if (onDelete) await onDelete(produce.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Card className="flex h-full flex-col overflow-hidden border border-green-100 transition hover:shadow-lg">
      {/* Image */}
      <div className="relative mb-4 h-40 overflow-hidden rounded-xl bg-gradient-to-br from-green-100 to-emerald-50">
        {produce.photos && produce.photos.length > 0 ? (
          <img
            src={produce.photos[0].url}
            alt={produce.name}
            className="w-full h-full object-cover hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            🌾
          </div>
        )}
      </div>

      {/* Content */}
      <h3 className="text-lg font-bold text-gray-900 mb-1">{produce.name}</h3>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{produce.description}</p>

      {/* Details */}
      <div className="mb-4 grid grid-cols-2 gap-3 rounded-xl border border-green-100 bg-green-50/70 p-3 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-600">Quantity</p>
          <p className="font-semibold text-gray-900">{produce.quantity} {produce.unit}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-600">Price</p>
          <p className="font-semibold text-green-700">${produce.price_per_unit}</p>
        </div>
      </div>

      {/* Status and Date */}
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
        <StatusBadge status={produce.status} />
        <span className="text-xs text-gray-400">{formatDate(produce.created_at)}</span>
      </div>

      {/* Actions */}
      <div className="mt-auto flex gap-2">
        <button
          onClick={() => onEdit && onEdit(produce.id)}
          className="flex-1 rounded-lg bg-green-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-800"
        >
          ✏️ Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex-1 rounded-lg bg-gray-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:bg-gray-300"
        >
          {isDeleting ? '...' : '🗑️ Delete'}
        </button>
      </div>
    </Card>
  );
};
