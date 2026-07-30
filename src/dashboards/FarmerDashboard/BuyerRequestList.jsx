import { BuyerRequestCard } from './BuyerRequestCard';
import * as farmerApi from '../../api/farmerApi';
import { Card, CardHeader } from '../../components/common/Card';

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
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Buyer Requests</h2>
        <p className="text-gray-600">
          {requests.length} total • {pendingCount} pending • {approvedCount} approved
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-4xl mb-2">📋</p>
          <p className="text-gray-600 font-medium">No buyer requests yet</p>
          <p className="text-gray-500 text-sm mt-1">Buyers will start requesting your produce when you add listings</p>
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
