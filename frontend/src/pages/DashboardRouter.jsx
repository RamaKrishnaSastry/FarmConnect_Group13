import { FarmerDashboard } from '../dashboards/FarmerDashboard/FarmerDashboard';
import { BuyerDashboard } from '../dashboards/BuyerDashboard/BuyerDashboard';
import { TransporterDashboard } from '../dashboards/TransporterDashboard/TransporterDashboard';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/constants';

export const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) {
    return <div className="text-center py-12 text-gray-600">Loading...</div>;
  }

  let DashboardComponent;

  switch (user.role) {
    case ROLES.FARMER:
      DashboardComponent = FarmerDashboard;
      break;
    case ROLES.BUYER:
      DashboardComponent = BuyerDashboard;
      break;
    case ROLES.TRANSPORTER:
      DashboardComponent = TransporterDashboard;
      break;
    default:
      return <div className="text-center py-12 text-red-600">Invalid role</div>;
  }

  return (
    <DashboardLayout>
      <DashboardComponent />
    </DashboardLayout>
  );
};
