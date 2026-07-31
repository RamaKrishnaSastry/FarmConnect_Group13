import { DeliveryCard } from './DeliveryCard';

export const DeliveryList = ({ deliveries }) => {
  return (
    <div className="space-y-6">
      <div id="deliveries-section" className="rounded-2xl border border-green-100 bg-green-50/70 p-5">
        <h2 className="text-2xl font-bold text-gray-900">Delivery Tracking</h2>
        <p className="mt-1 text-sm text-gray-600">{deliveries.length} active and completed deliveries</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {deliveries.length > 0 ? (
          deliveries.map((delivery) => (
            <DeliveryCard key={delivery.id} delivery={delivery} />
          ))
        ) : (
          <div className="col-span-2 rounded-2xl border border-dashed border-green-200 bg-green-50/50 py-10 text-center text-gray-600">
            No active deliveries
          </div>
        )}
      </div>
    </div>
  );
};
