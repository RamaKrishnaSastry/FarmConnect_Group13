import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import './TransporterDashboard.css';

const TABS = { AVAILABLE: 'available', MY_DELIVERIES: 'mine' };
const API = API_BASE_URL;

export default function TransporterDashboard() {
  const navigate = useNavigate();
  const [user] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
  const [activeTab, setActiveTab] = useState(TABS.AVAILABLE);
  const [available, setAvailable] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showMap, setShowMap] = useState(false);

  const fetchAvailable = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/deliveries/available`);
      const data = await res.json();
      if (data.success) setAvailable(data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  const fetchMyDeliveries = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/deliveries/transporter/${user.user_id}`);
      const data = await res.json();
      if (data.success) setMyDeliveries(data.data);
    } catch (err) { console.error(err); }
  }, [user.user_id]);

  useEffect(() => {
    if (activeTab === TABS.AVAILABLE) fetchAvailable();
    else fetchMyDeliveries();
  }, [activeTab, fetchAvailable, fetchMyDeliveries]);

  const handleAccept = async (deliveryId) => {
    try {
      const res = await fetch(`${API}/api/deliveries/${deliveryId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transporterId: user.user_id }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAvailable();
        setActiveTab(TABS.MY_DELIVERIES);
        fetchMyDeliveries();
      } else {
        alert(data.message);
      }
    } catch (err) { alert('Failed to accept delivery'); }
  };

  const handleDeliver = async (deliveryId) => {
    if (!window.confirm('Mark this delivery as completed?')) return;
    try {
      const res = await fetch(`${API}/api/deliveries/${deliveryId}/deliver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transporterId: user.user_id }),
      });
      const data = await res.json();
      if (data.success) {
        fetchMyDeliveries();
      } else {
        alert(data.message);
      }
    } catch (err) { alert('Failed to update delivery'); }
  };

  const openMap = (delivery) => {
    setSelectedDelivery(delivery);
    setShowMap(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    navigate('/');
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  }) : '';

  const RouteMap = ({ delivery }) => {
    if (!delivery) return null;
    const pad = 15;
    const mapW = 400, mapH = 300;
    const plat = parseFloat(delivery.pickup_latitude);
    const plon = parseFloat(delivery.pickup_longitude);
    const dlat = parseFloat(delivery.delivery_latitude);
    const dlon = parseFloat(delivery.delivery_longitude);

    const minX = Math.min(plat, dlat) - pad;
    const maxX = Math.max(plat, dlat) + pad;
    const minY = Math.min(plon, dlon) - pad;
    const maxY = Math.max(plon, dlon) + pad;

    const scaleX = (x) => ((x - minX) / (maxX - minX)) * mapW;
    const scaleY = (y) => mapH - ((y - minY) / (maxY - minY)) * mapH;

    const px = scaleX(plat), py = scaleY(plon);
    const dx = scaleX(dlat), dy = scaleY(dlon);

    const midX = (px + dx) / 2, midY = (py + dy) / 2;

    return (
      <svg width={mapW} height={mapH} viewBox={`0 0 ${mapW} ${mapH}`} className="route-svg">
        <rect width={mapW} height={mapH} fill="#f0f9f4" rx="8" />
        <line x1={px} y1={py} x2={dx} y2={dy} stroke="#2d6a4f" strokeWidth="3" strokeDasharray="8,4" />
        <circle cx={px} cy={py} r="8" fill="#1b4d3a" />
        <text x={px} y={py - 14} textAnchor="middle" fontSize="11" fill="#1b4d3a" fontWeight="600">
          Farmer: {delivery.farmer_name}
        </text>
        <text x={px} y={py + 22} textAnchor="middle" fontSize="10" fill="#555">
          {delivery.pickup_address}
        </text>
        <circle cx={dx} cy={dy} r="8" fill="#d9534f" />
        <text x={dx} y={dy - 14} textAnchor="middle" fontSize="11" fill="#d9534f" fontWeight="600">
          Buyer: {delivery.buyer_name}
        </text>
        <text x={dx} y={dy + 22} textAnchor="middle" fontSize="10" fill="#555">
          {delivery.delivery_address || delivery.buyer_city}
        </text>
        <rect x={midX - 40} y={midY - 12} width="80" height="24" rx="12" fill="#2d6a4f" opacity="0.9" />
        <text x={midX} y={midY + 4} textAnchor="middle" fontSize="11" fill="#fff" fontWeight="600">
          {delivery.distance_km} km
        </text>
      </svg>
    );
  };

  return (
    <div className="transporter-dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="app-logo">FarmConnect</h1>
          <span className="header-role">Transporter</span>
        </div>
        <div className="header-right">
          <span className="header-user">Welcome, {user.fullName || user.full_name}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <nav className="tab-nav">
        <button className={`tab-btn ${activeTab === TABS.AVAILABLE ? 'active' : ''}`} onClick={() => setActiveTab(TABS.AVAILABLE)}>
          Available Deliveries ({available.length})
        </button>
        <button className={`tab-btn ${activeTab === TABS.MY_DELIVERIES ? 'active' : ''}`} onClick={() => { setActiveTab(TABS.MY_DELIVERIES); fetchMyDeliveries(); }}>
          My Deliveries ({myDeliveries.length})
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === TABS.AVAILABLE && (
          <div className="available-section">
            <h2>Available Deliveries</h2>
            {loading ? <div className="loading-spinner">Loading...</div> : available.length === 0 ? (
              <div className="empty-state">
                <p>No available deliveries at the moment.</p>
              </div>
            ) : (
              <div className="delivery-grid">
                {available.map((d) => (
                  <div key={d.delivery_id} className="delivery-card">
                    <div className="delivery-header">
                      <h3>{d.produce_name}</h3>
                      <span className="status-badge status-shipped">SHIPPED</span>
                    </div>
                    <div className="delivery-body">
                      <p><span className="label">Farmer:</span> {d.farmer_name} ({d.farmer_city})</p>
                      <p><span className="label">Buyer:</span> {d.buyer_name} ({d.buyer_city})</p>
                      <p><span className="label">Quantity:</span> {parseFloat(d.requested_quantity).toFixed(2)} {d.unit}</p>
                      <p><span className="label">Total:</span> ${parseFloat(d.total_amount).toFixed(2)}</p>
                      <p><span className="label">Distance:</span> {parseFloat(d.distance_km).toFixed(2)} km</p>
                      <p><span className="label">Est. Time:</span> {d.estimated_time_minutes} min</p>
                      <p><span className="label">Pickup:</span> {d.pickup_address}</p>
                      <p><span className="label">Delivery:</span> {d.delivery_address || d.buyer_city}</p>
                    </div>
                    <div className="delivery-actions">
                      <button className="map-btn" onClick={() => openMap(d)}>View Route</button>
                      <button className="accept-btn" onClick={() => handleAccept(d.delivery_id)}>Accept Delivery</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === TABS.MY_DELIVERIES && (
          <div className="mine-section">
            <h2>My Deliveries</h2>
            {myDeliveries.length === 0 ? (
              <div className="empty-state">
                <p>You haven't accepted any deliveries yet.</p>
              </div>
            ) : (
              <div className="delivery-grid">
                {myDeliveries.map((d) => (
                  <div key={d.delivery_id} className="delivery-card">
                    <div className="delivery-header">
                      <h3>{d.produce_name}</h3>
                      <span className={`status-badge status-${d.status.toLowerCase()}`}>{d.status}</span>
                    </div>
                    <div className="delivery-body">
                      <p><span className="label">Farmer:</span> {d.farmer_name} ({d.farmer_city})</p>
                      <p><span className="label">Buyer:</span> {d.buyer_name} ({d.buyer_city})</p>
                      <p><span className="label">Quantity:</span> {parseFloat(d.requested_quantity).toFixed(2)} {d.unit}</p>
                      <p><span className="label">Total:</span> ${parseFloat(d.total_amount).toFixed(2)}</p>
                      <p><span className="label">Distance:</span> {parseFloat(d.distance_km).toFixed(2)} km</p>
                      <p><span className="label">Pickup:</span> {d.pickup_address}</p>
                      <p><span className="label">Delivery:</span> {d.delivery_address || d.buyer_city}</p>
                      {d.accepted_at && <p className="delivery-date"><span className="label">Accepted:</span> {formatDate(d.accepted_at)}</p>}
                      {d.completed_at && <p className="delivery-date"><span className="label">Delivered:</span> {formatDate(d.completed_at)}</p>}
                    </div>
                    <div className="delivery-actions">
                      <button className="map-btn" onClick={() => openMap(d)}>View Route</button>
                      {d.status === 'OUT_FOR_DELIVERY' && (
                        <button className="deliver-btn" onClick={() => handleDeliver(d.delivery_id)}>Mark Delivered</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showMap && selectedDelivery && (
          <div className="modal-overlay" onClick={() => setShowMap(false)}>
            <div className="modal-content map-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowMap(false)}>&times;</button>
              <h2>Route Map</h2>
              <div className="map-legend">
                <span className="legend-pickup">&#x25CF; Pickup (Farmer)</span>
                <span className="legend-delivery">&#x25CF; Delivery (Buyer)</span>
                <span className="legend-route">- - - Route</span>
              </div>
              <RouteMap delivery={selectedDelivery} />
              <div className="map-info">
                <p><strong>Pickup:</strong> {selectedDelivery.pickup_address}</p>
                <p><strong>Delivery:</strong> {selectedDelivery.delivery_address || selectedDelivery.buyer_city}</p>
                <p><strong>Distance:</strong> {parseFloat(selectedDelivery.distance_km).toFixed(2)} km</p>
                <p><strong>Est. Time:</strong> {selectedDelivery.estimated_time_minutes} minutes</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
