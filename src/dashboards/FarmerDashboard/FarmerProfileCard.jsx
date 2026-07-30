import { useAuth } from '../../hooks/useAuth';
import { Card, CardHeader, CardBody } from '../../components/common/Card';

export const FarmerProfileCard = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Card>
      <CardHeader title="Your Profile" />
      <CardBody>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Full Name</label>
            <p className="text-lg font-semibold text-gray-900">{user.full_name}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <p className="text-gray-900">{user.email}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Phone</label>
            <p className="text-gray-900">{user.phone}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Location</label>
            <p className="text-gray-900">{user.address}, {user.city}, {user.state}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="text-center">
              <p className="text-gray-600 text-sm">Latitude</p>
              <p className="text-gray-900 font-semibold">{user.latitude}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm">Longitude</p>
              <p className="text-gray-900 font-semibold">{user.longitude}</p>
            </div>
          </div>
          <button className="mt-4 w-full rounded-lg bg-green-700 px-4 py-2 text-white transition hover:bg-green-800">
            Edit Profile
          </button>
        </div>
      </CardBody>
    </Card>
  );
};
