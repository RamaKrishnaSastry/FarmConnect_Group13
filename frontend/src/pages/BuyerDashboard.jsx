import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import './BuyerDashboard.css';

function StarRating({ current, onChange, disabled }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star-btn ${star <= (hover || current) ? 'active' : ''}`}
          onMouseEnter={() => !disabled && setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => !disabled && onChange(star)}
          disabled={disabled}
        >
          &#9733;
        </button>
      ))}
    </div>
  );
}

const TABS = { FEED: 'feed', ACTIVE: 'active', HISTORY: 'history' };

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const [user] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
  const [activeTab, setActiveTab] = useState(TABS.FEED);
  const [listings, setListings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [modalForm, setModalForm] = useState({ quantity: '', proposedPrice: '', notes: '' });
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchListings = useCallback(async (q) => {
    setLoading(true);
    try {
      const params = q ? `?search=${encodeURIComponent(q)}` : '';
      const res = await fetch(`${API_BASE_URL}/api/produce/listings${params}`);
      const data = await res.json();
      if (data.success) setListings(data.data);
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRequests = useCallback(async (deliveryStatus) => {
    try {
      const params = `?buyerId=${user.user_id}&deliveryStatus=${deliveryStatus}`;
      const res = await fetch(`${API_BASE_URL}/api/purchase/requests${params}`);
      const data = await res.json();
      if (data.success) setRequests(data.data);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    }
  }, [user.user_id]);

  useEffect(() => {
    if (activeTab === TABS.FEED) fetchListings(search);
    else if (activeTab === TABS.ACTIVE) fetchRequests('ACTIVE');
    else if (activeTab === TABS.HISTORY) fetchRequests('HISTORY');
  }, [activeTab, fetchListings, fetchRequests, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchListings(search);
  };

  const openModal = (listing) => {
    setSelectedListing(listing);
    setModalForm({ quantity: '', proposedPrice: '', notes: '' });
    setModalError('');
    setShowModal(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    const qty = parseFloat(modalForm.quantity);
    const price = parseFloat(modalForm.proposedPrice);
    if (!qty || qty <= 0) return setModalError('Enter a valid quantity');
    if (!price || price <= 0) return setModalError('Enter a valid proposed price');
    if (qty > selectedListing.quantity) return setModalError(`Only ${selectedListing.quantity} ${selectedListing.unit} available`);
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/purchase/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: user.user_id,
          produceId: selectedListing.id,
          quantity: qty,
          proposedPrice: price,
          notes: modalForm.notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchListings(search);
        setActiveTab(TABS.ACTIVE);
        fetchRequests('ACTIVE');
      } else {
        setModalError(data.message);
      }
    } catch (err) {
      setModalError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const [ratingState, setRatingState] = useState({});
  const [ratingMsg, setRatingMsg] = useState({});

  const handleRate = async (reqId, ratedUserId, ratingType, rating) => {
    const key = `${reqId}-${ratingType}`;
    try {
      const res = await fetch(`${API_BASE_URL}/api/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: reqId,
          buyerId: user.user_id,
          ratedUserId,
          ratingType,
          rating,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRatingState((prev) => ({ ...prev, [key]: rating }));
        setRatingMsg((prev) => ({ ...prev, [key]: 'Rating submitted!' }));
        fetchRequests('HISTORY');
      } else {
        setRatingMsg((prev) => ({ ...prev, [key]: data.message }));
      }
    } catch {
      setRatingMsg((prev) => ({ ...prev, [key]: 'Failed to submit' }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    navigate('/');
  };

  const resolvePhotoUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return `${API_BASE_URL}${url}`;
    return `${API_BASE_URL}/${url}`;
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  return (
    <div className="buyer-dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="app-logo">FarmConnect</h1>
          <span className="header-role">Buyer</span>
        </div>
        <div className="header-right">
          <span className="header-user">Welcome, {user.fullName || user.full_name}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <nav className="tab-nav">
        <button className={`tab-btn ${activeTab === TABS.FEED ? 'active' : ''}`} onClick={() => setActiveTab(TABS.FEED)}>
          Browse Produce
        </button>
        <button className={`tab-btn ${activeTab === TABS.ACTIVE ? 'active' : ''}`} onClick={() => { setActiveTab(TABS.ACTIVE); fetchRequests('ACTIVE'); }}>
          Active Requests
        </button>
        <button className={`tab-btn ${activeTab === TABS.HISTORY ? 'active' : ''}`} onClick={() => { setActiveTab(TABS.HISTORY); fetchRequests('HISTORY'); }}>
          Purchase History
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === TABS.FEED && (
          <div className="feed-section">
            <form className="search-bar" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search by produce name, farmer name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit">Search</button>
            </form>

            {loading ? (
              <div className="loading-spinner">Loading...</div>
            ) : listings.length === 0 ? (
              <div className="empty-state">
                <p>No produce listings available{search ? ' matching your search' : ''}.</p>
              </div>
            ) : (
              <div className="listings-grid">
                {listings.map((item) => (
                  <div key={item.id} className="listing-card">
                    <div className="listing-photos">
                      {item.photos && item.photos.length > 0 ? (
                        <img src={resolvePhotoUrl(item.photos[0])} alt={item.name} className="listing-img" />
                      ) : (
                        <div className="listing-img-placeholder">
                          <span>No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="listing-body">
                      <h3 className="listing-name">{item.name}</h3>
                      <p className="listing-farmer">
                        <span className="label">Farmer:</span> {item.farmer_name}
                        {item.farmer_city && <span className="farmer-location"> &middot; {item.farmer_city}{item.farmer_state ? `, ${item.farmer_state}` : ''}</span>}
                      </p>
                      <p className="listing-price">
                        <span className="label">Price:</span> ${parseFloat(item.price).toFixed(2)} / {item.unit}
                      </p>
                      <p className="listing-qty">
                        <span className="label">Available:</span> {parseFloat(item.quantity).toFixed(2)} {item.unit}
                      </p>
                      {item.description && (
                        <p className="listing-desc">{item.description}</p>
                      )}
                      <p className="listing-date">
                        <span className="label">Listed:</span> {formatDate(item.created_at)}
                      </p>
                      <button className="request-btn" onClick={() => openModal(item)}>
                        Request Purchase
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === TABS.ACTIVE && (
          <div className="requests-section">
            <h2>Active Purchase Requests</h2>
            {requests.length === 0 ? (
              <div className="empty-state">
                <p>No active purchase requests. Browse produce and request a purchase!</p>
              </div>
            ) : (
              <div className="requests-list">
                {requests.map((req) => (
                  <div key={req.id} className="request-card">
                    <div className="request-header">
                      <h3>{req.produce_name}</h3>
                      {(() => {
                        const show = req.status === 'PENDING' ? 'REQUESTED' :
                          (req.status === 'APPROVED' && req.delivery_status === 'OUT_FOR_DELIVERY') ? 'ARRIVING' :
                          req.status === 'APPROVED' && req.delivery_status === 'DELIVERED' ? 'DELIVERED' :
                          req.status;
                        const cls = show === 'ARRIVING' ? 'arriving' : show === 'DELIVERED' ? 'delivered' : show.toLowerCase();
                        return <span className={`status-badge status-${cls}`}>{show}</span>;
                      })()}
                    </div>
                    <div className="request-details">
                      <p><span className="label">Farmer:</span> {req.farmer_name}</p>
                      <p><span className="label">Quantity:</span> {parseFloat(req.quantity).toFixed(2)} {req.unit}</p>
                      <p><span className="label">Proposed Price:</span> ${parseFloat(req.proposed_price).toFixed(2)} / {req.unit}</p>
                      <p><span className="label">Total:</span> ${parseFloat(req.total_amount).toFixed(2)}</p>
                      {req.notes && <p><span className="label">Notes:</span> {req.notes}</p>}
                      <p className="request-date"><span className="label">Requested:</span> {formatDate(req.created_at)}</p>
                      {req.delivery_status === 'OUT_FOR_DELIVERY' && (
                        <p className="delivery-status-info"><span className="label">Delivery:</span> Out for delivery 🚚</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === TABS.HISTORY && (
          <div className="history-section">
            <h2>Purchase History</h2>
            {requests.length === 0 ? (
              <div className="empty-state">
                <p>No purchase history yet. Your completed and cancelled requests will appear here.</p>
              </div>
            ) : (
              <div className="requests-list">
                {requests.map((req) => (
                  <div key={req.id} className="request-card">
                    <div className="request-header">
                      <h3>{req.produce_name}</h3>
                      <span className={`status-badge status-${req.delivery_status === 'DELIVERED' ? 'delivered' : req.status.toLowerCase()}`}>
                        {req.delivery_status === 'DELIVERED' ? 'DELIVERED' : req.status}
                      </span>
                    </div>
                    <div className="request-details">
                      <p><span className="label">Farmer:</span> {req.farmer_name}</p>
                      <p><span className="label">Quantity:</span> {parseFloat(req.quantity).toFixed(2)} {req.unit}</p>
                      <p><span className="label">Proposed Price:</span> ${parseFloat(req.proposed_price).toFixed(2)} / {req.unit}</p>
                      <p><span className="label">Total:</span> ${parseFloat(req.total_amount).toFixed(2)}</p>
                      {req.notes && <p><span className="label">Notes:</span> {req.notes}</p>}
                      <p className="request-date"><span className="label">Requested:</span> {formatDate(req.created_at)}</p>

                      {req.delivery_status === 'DELIVERED' && (
                        <div className="rating-section">
                          <div className="rating-item">
                            <span className="rating-label">Product Quality ({req.farmer_name})</span>
                            {req.product_rating ? (
                              <div className="rated-display">
                                <StarRating current={req.product_rating} disabled />
                                <span className="rated-text">Rated {req.product_rating}/5</span>
                              </div>
                            ) : (
                              <>
                                <StarRating
                                  current={ratingState[`${req.id}-PRODUCT`] || 0}
                                  onChange={(v) => handleRate(req.id, req.farmer_id, 'PRODUCT', v)}
                                />
                                {ratingMsg[`${req.id}-PRODUCT`] && (
                                  <span className="rating-msg">{ratingMsg[`${req.id}-PRODUCT`]}</span>
                                )}
                              </>
                            )}
                          </div>
                          {req.transporter_name && (
                            <div className="rating-item">
                              <span className="rating-label">Delivery ({req.transporter_name})</span>
                              {req.delivery_rating ? (
                                <div className="rated-display">
                                  <StarRating current={req.delivery_rating} disabled />
                                  <span className="rated-text">Rated {req.delivery_rating}/5</span>
                                </div>
                              ) : (
                                <>
                                  <StarRating
                                    current={ratingState[`${req.id}-DELIVERY`] || 0}
                                    onChange={(v) => handleRate(req.id, req.transporter_id, 'DELIVERY', v)}
                                  />
                                  {ratingMsg[`${req.id}-DELIVERY`] && (
                                    <span className="rating-msg">{ratingMsg[`${req.id}-DELIVERY`]}</span>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {showModal && selectedListing && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            <h2>Request Purchase</h2>
            <div className="modal-listing-info">
              <p><strong>{selectedListing.name}</strong> by {selectedListing.farmer_name}</p>
              <p>Listed price: ${parseFloat(selectedListing.price).toFixed(2)} / {selectedListing.unit}</p>
              <p>Available: {parseFloat(selectedListing.quantity).toFixed(2)} {selectedListing.unit}</p>
            </div>
            <form onSubmit={handleModalSubmit} className="modal-form">
              <div className="form-group">
                <label>Quantity ({selectedListing.unit})</label>
                <input
                  type="number" step="0.01" min="0.01"
                  max={selectedListing.quantity}
                  value={modalForm.quantity}
                  onChange={(e) => setModalForm({ ...modalForm, quantity: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Proposed Price (per {selectedListing.unit})</label>
                <input
                  type="number" step="0.01" min="0.01"
                  value={modalForm.proposedPrice}
                  onChange={(e) => setModalForm({ ...modalForm, proposedPrice: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Notes (optional)</label>
                <textarea
                  value={modalForm.notes}
                  onChange={(e) => setModalForm({ ...modalForm, notes: e.target.value })}
                  rows="3"
                />
              </div>
              {modalError && <div className="error-message">{modalError}</div>}
              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Purchase Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
