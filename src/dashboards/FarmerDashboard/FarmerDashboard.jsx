import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useFarmerData } from '../../hooks/useFarmerData';
import { Loader } from '../../components/common/Loader';
import { StatsOverview } from '../../components/charts/StatsOverview';
import { FarmerProfileCard } from './FarmerProfileCard';
import { ProduceList } from './ProduceList';
import { BuyerRequestList } from './BuyerRequestList';
import { DeliveryList } from './DeliveryList';
import { RatingList } from './RatingList';
import { ChatSection } from './ChatSection';

export const FarmerDashboard = () => {
  const { produce, requests, deliveries, ratings, loading, error, refetch } = useFarmerData();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'overview');

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">🌾</div>
          <p className="text-lg font-semibold text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg m-6">
        <h3 className="text-lg font-bold text-red-700 mb-2">⚠️ Error Loading Dashboard</h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
        >
          Reload Page
        </button>
      </div>
    );
  }

  const stats = [
    { label: 'Active Listings', value: produce.length, icon: '🌾', color: 'bg-green-50' },
    { label: 'Pending Requests', value: requests.filter(r => r.status === 'pending').length, icon: '📋', color: 'bg-blue-50' },
    { label: 'In Transit', value: deliveries.filter(d => d.status === 'in_transit').length, icon: '🚚', color: 'bg-amber-50' },
    { label: 'Average Rating', value: '4.5', icon: '⭐', color: 'bg-purple-50' },
  ];

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'produce', label: '🌾 Produce' },
    { id: 'requests', label: '📝 Requests' },
    { id: 'deliveries', label: '🚚 Deliveries' },
    { id: 'ratings', label: '⭐ Ratings' },
    { id: 'chat', label: '💬 Chat' },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-green-700 to-green-600 p-8 text-white shadow-sm">
        <h1 className="text-2xl font-semibold">Farmer Dashboard</h1>
        <p className="mt-2 text-sm text-green-50">Manage your produce, track deliveries, and connect with buyers.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className={`${stat.color} rounded-2xl border border-green-100 p-6 shadow-sm transition hover:shadow-md`}>
            <div className="mb-2 text-3xl">{stat.icon}</div>
            <div className="mb-1 text-3xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-green-100 bg-white shadow-sm">
        <div className="flex overflow-x-auto border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 px-6 py-4 text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'border-green-600 bg-green-50 text-green-700'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <FarmerProfileCard />
              <div className="rounded-2xl border border-green-100 bg-green-50/60 p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">📈 Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3">
                    <span className="text-gray-700">Total Sales</span>
                    <span className="font-bold text-green-700">$2,450</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3">
                    <span className="text-gray-700">Completed Orders</span>
                    <span className="font-bold text-blue-700">12</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3">
                    <span className="text-gray-700">Buyer Rating</span>
                    <span className="font-bold text-yellow-600">4.8/5 ⭐</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'produce' && <ProduceList produce={produce} onRefresh={refetch} />}
          {activeTab === 'requests' && <BuyerRequestList requests={requests} onRefresh={refetch} />}
          {activeTab === 'deliveries' && <DeliveryList deliveries={deliveries} />}
          {activeTab === 'ratings' && <RatingList ratings={ratings} />}
          {activeTab === 'chat' && <ChatSection requests={requests} />}
        </div>
      </div>
    </div>
  );
};
