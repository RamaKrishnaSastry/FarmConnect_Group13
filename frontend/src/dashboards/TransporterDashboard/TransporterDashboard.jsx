import { useEffect, useState } from 'react';
import { Card, CardHeader } from '../../components/common/Card';
import { useAuth } from '../../hooks/useAuth';
import { acceptDelivery, getAvailableDeliveries, getMyDeliveries, updateDeliveryStatus } from '../../api/transporterApi';

export const TransporterDashboard = () => {
  const { user } = useAuth();
  const [availableDeliveries, setAvailableDeliveries] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState('');

  const loadDashboard = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [availableData, myData] = await Promise.all([
        getAvailableDeliveries(user.id),
        getMyDeliveries(user.id),
      ]);
      setAvailableDeliveries(availableData);
      setMyDeliveries(myData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [user?.id]);

  const handleAccept = async (deliveryId) => {
    if (!user?.id) return;
    const updated = await acceptDelivery(deliveryId, user.id);
    if (updated?.id) {
      loadDashboard();
    }
  };

  const handleComplete = async (deliveryId) => {
    const updated = await updateDeliveryStatus(deliveryId, 'DELIVERED');
    if (updated?.id) {
      loadDashboard();
    }
  };

  const matchesLocationFilter = (delivery) => {
    if (!locationFilter.trim()) return true;
    const filter = locationFilter.toLowerCase();
    return [delivery.pickup_address, delivery.delivery_address, delivery.buyer_name, delivery.farmer_name, delivery.produce_name]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(filter));
  };

  const filteredAvailable = availableDeliveries.filter(matchesLocationFilter);
  const filteredMy = myDeliveries.filter(matchesLocationFilter);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-emerald-700 to-green-600 p-8 text-white shadow-sm">
        <h1 className="text-2xl font-semibold">Transporter Dashboard</h1>
        <p className="mt-2 text-sm text-green-50">Accept deliveries and track your active assignments.</p>
      </div>
      <Card>
        <CardHeader title="Transporter Dashboard" subtitle="Accept deliveries and track your active assignments" />
      </Card>

      {loading ? (
        <div className="text-center py-12 text-gray-600">Loading dashboard data...</div>
      ) : (
        <>
          <Card>
            <CardHeader title="Available Deliveries" subtitle="Open assignments you can accept" />
            <input
              id="transp-filter"
              type="text"
              value={locationFilter}
              onChange={(event) => setLocationFilter(event.target.value)}
              placeholder="Filter by location or route"
              className="mb-4 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            {filteredAvailable.length === 0 ? (
              <p className="text-gray-600">No deliveries are currently available.</p>
            ) : (
              <div id="transp-available" className="space-y-3">
                {filteredAvailable.map((delivery, index) => (
                  <div key={delivery.id} className="rounded-xl border border-green-100 bg-green-50/50 p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-gray-900">{delivery.produce_name || 'Delivery'}</h4>
                        <p className="text-sm text-gray-600">Buyer: {delivery.buyer_name || 'Unknown'}</p>
                        <p className="text-sm text-gray-600">Farmer: {delivery.farmer_name || 'Unknown'}</p>
                      </div>
                      <button
                        id={index === 0 ? 'transp-accept-btn' : undefined}
                        onClick={() => handleAccept(delivery.id)}
                        className="rounded-lg bg-green-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-800"
                      >
                        Accept
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">Pickup: {delivery.pickup_address}</p>
                    <p className="text-sm text-gray-600">Delivery: {delivery.delivery_address}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(delivery.pickup_address || '')}&destination=${encodeURIComponent(delivery.delivery_address || '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium text-green-700 underline"
                      >
                        View route
                      </a>
                      <button
                        onClick={() => handleAccept(delivery.id)}
                        className="rounded-lg bg-green-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-800"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="My Deliveries" subtitle="Your accepted assignments" />
            {filteredMy.length === 0 ? (
              <p className="text-gray-600">You have not accepted any deliveries yet.</p>
            ) : (
              <div id="transp-mine" className="space-y-3">
                {filteredMy.map((delivery, index) => (
                  <div key={delivery.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-gray-900">{delivery.produce_name || 'Delivery'}</h4>
                        <p className="text-sm text-gray-600">Status: {delivery.status}</p>
                      </div>
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm uppercase text-blue-700">
                        {delivery.status}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(delivery.pickup_address || '')}&destination=${encodeURIComponent(delivery.delivery_address || '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium text-green-700 underline"
                      >
                        View route
                      </a>
                      {delivery.status !== 'delivered' && (
                        <button
                          id={index === 0 ? 'transp-complete-btn' : undefined}
                          onClick={() => handleComplete(delivery.id)}
                          className="rounded-lg bg-green-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-800"
                        >
                          Mark completed
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};
