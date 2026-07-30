import { useState } from 'react';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/common/Card';

export const BuyerRequestCard = ({ request, onApprove, onReject }) => {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      if (onApprove) await onApprove(request.id);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      if (onReject) await onReject(request.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition">
      <CardHeader
        title={`👤 ${request.buyer_name}`}
        action={<StatusBadge status={request.status} />}
      />
      <CardBody>
        <div className="space-y-4">
          {/* Quantity */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Quantity Requested</p>
            <p className="text-2xl font-bold text-blue-900">{request.requested_quantity} units</p>
          </div>

          {/* Price */}
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">Offered Price</p>
            <p className="text-2xl font-bold text-green-900">${request.offered_price}</p>
            <p className="text-xs text-green-700 mt-1">≈ ${(request.offered_price / request.requested_quantity).toFixed(2)} per unit</p>
          </div>

          {/* Buyer Note */}
          {request.buyer_note && (
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide">Note</p>
              <p className="text-gray-900 text-sm mt-1">"<em>{request.buyer_note}</em>"</p>
            </div>
          )}

          {/* Timeline */}
          <div className="text-xs text-gray-500 flex items-center gap-2">
            🕐 {formatDateTime(request.requested_at)}
          </div>
        </div>
      </CardBody>

      {request.status === 'pending' && (
        <CardFooter>
          <div className="flex gap-2">
            <button
              onClick={handleApprove}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-3 rounded-lg font-semibold text-sm transition shadow-md hover:shadow-lg"
            >
              {loading ? '⏳' : '✓'} Approve
            </button>
            <button
              onClick={handleReject}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white px-4 py-3 rounded-lg font-semibold text-sm transition shadow-md hover:shadow-lg"
            >
              {loading ? '⏳' : '✕'} Reject
            </button>
          </div>
        </CardFooter>
      )}

      {request.status !== 'pending' && (
        <CardFooter>
          <div className="text-center text-sm text-gray-600">
            This request has been {request.status}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};
