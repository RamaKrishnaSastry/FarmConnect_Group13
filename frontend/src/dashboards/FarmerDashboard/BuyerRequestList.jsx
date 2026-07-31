import { BuyerRequestCard } from './BuyerRequestCard';
import * as farmerApi from '../../api/farmerApi';

export const BuyerRequestList = ({ requests, onRefresh }) => {
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;

  const handleApprove = async (id) => {
    try {
      await farmerApi.approvePurchaseRequest(id);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Failed to approve: ' + err.message);
    }
  };

  const handleReject = async (id) => {
    try {
      await farmerApi.rejectPurchaseRequest(id);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Failed to reject: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div id="requests-section" className="rounded-2xl border border-green-100 bg-green-50/70 p-5">
        <h2 className="text-2xl font-bold text-gray-900">Buyer Requests</h2>
        <p className="mt-1 text-sm text-gray-600">
          {requests.length} total • {pendingCount} pending • {approvedCount} approved
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-green-200 bg-green-50/50 py-12 text-center">
          <p className="mb-2 text-4xl">📋</p>
          <p className="font-medium text-gray-700">No buyer requests yet</p>
          <p className="mt-1 text-sm text-gray-500">Buyers will start requesting your produce when you add listings</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {requests.map((req) => (
            <BuyerRequestCard
              key={req.id}
              request={req}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  );
};
