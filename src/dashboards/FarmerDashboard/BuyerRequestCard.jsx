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
          <div className="rounded-xl border border-green-100 bg-green-50/70 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Quantity Requested</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{request.requested_quantity} units</p>
          </div>

          {/* Price */}
          <div className="rounded-xl border border-emerald-100 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Offered Price</p>
            <p className="mt-1 text-2xl font-bold text-green-700">${request.offered_price}</p>
            <p className="mt-1 text-xs text-gray-500">≈ ${(request.offered_price / request.requested_quantity).toFixed(2)} per unit</p>
          </div>

          {/* Buyer Note */}
          {request.buyer_note && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Note</p>
              <p className="mt-1 text-sm text-gray-900">“{request.buyer_note}”</p>
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
              className="flex-1 rounded-lg bg-green-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:bg-gray-300"
            >
              {loading ? '⏳' : '✓'} Approve
            </button>
            <button
              onClick={handleReject}
              disabled={loading}
              className="flex-1 rounded-lg bg-gray-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:bg-gray-300"
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
