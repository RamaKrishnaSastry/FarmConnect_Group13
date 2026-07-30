import { DeliveryCard } from './DeliveryCard';
import { Card, CardHeader } from '../../components/common/Card';

export const DeliveryList = ({ deliveries }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title={`Delivery Tracking (${deliveries.length})`} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {deliveries.length > 0 ? (
          deliveries.map((delivery) => (
            <DeliveryCard key={delivery.id} delivery={delivery} />
          ))
        ) : (
          <div className="col-span-2 text-center py-8 text-gray-600">
            No active deliveries
          </div>
        )}
      </div>
    </div>
  );
};
