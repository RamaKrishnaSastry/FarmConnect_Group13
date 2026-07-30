import { formatDateTime } from '../../utils/formatters';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Card, CardHeader, CardBody } from '../../components/common/Card';

export const DeliveryCard = ({ delivery }) => {
  const getStatusColor = (status) => {
    const colors = {
      in_transit: 'bg-blue-50 border-blue-200',
      completed: 'bg-green-50 border-green-200',
      pending: 'bg-amber-50 border-amber-200',
    };
    return colors[status] || 'bg-gray-50 border-gray-200';
  };

  return (
    <Card className={`border-2 ${getStatusColor(delivery.status)} hover:shadow-lg transition`}>
      <CardHeader
        title={`🚚 ${delivery.transporter_name}`}
        action={<StatusBadge status={delivery.status} />}
      />
      <CardBody>
        <div className="space-y-4">
          {/* Route */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-2">📍 Route</p>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span>📤 From:</span>
                <span className="text-gray-900 font-medium">{delivery.pickup_address}</span>
              </div>
              <div className="h-px bg-gradient-to-r from-green-300 to-transparent my-1 ml-4"></div>
              <div className="flex gap-2">
                <span>📥 To:</span>
                <span className="text-gray-900 font-medium">{delivery.delivery_address}</span>
              </div>
            </div>
          </div>

          {/* Distance & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Distance</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{delivery.distance_km}<span className="text-sm"> km</span></p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide">ETA</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{delivery.estimated_time_minutes}<span className="text-sm"> min</span></p>
            </div>
          </div>

          {/* Timeline */}
          <div className="text-xs text-gray-500 flex items-center gap-2">
            🕐 Accepted: {formatDateTime(delivery.accepted_at)}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
