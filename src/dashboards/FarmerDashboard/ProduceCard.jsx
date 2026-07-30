import { useState } from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';
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
    <Card className="flex flex-col h-full hover:shadow-lg transition border border-gray-200 overflow-hidden">
      {/* Image */}
      <div className="mb-4 h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden relative">
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
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm bg-gray-50 p-3 rounded-lg">
        <div>
          <p className="text-gray-600 text-xs uppercase tracking-wide">Quantity</p>
          <p className="font-bold text-gray-900">{produce.quantity} {produce.unit}</p>
        </div>
        <div>
          <p className="text-gray-600 text-xs uppercase tracking-wide">Price</p>
          <p className="font-bold text-green-600">${produce.price_per_unit}</p>
        </div>
      </div>

      {/* Status and Date */}
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
        <StatusBadge status={produce.status} />
        <span className="text-xs text-gray-400">{formatDate(produce.created_at)}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <button
          onClick={() => onEdit && onEdit(produce.id)}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition shadow-sm hover:shadow"
        >
          ✏️ Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-3 py-2 rounded-lg text-sm font-medium transition shadow-sm hover:shadow"
        >
          {isDeleting ? '...' : '🗑️ Delete'}
        </button>
      </div>
    </Card>
  );
};
