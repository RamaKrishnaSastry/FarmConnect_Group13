import { useEffect, useState } from 'react';
import { Card, CardHeader } from '../../components/common/Card';
import { useAuth } from '../../hooks/useAuth';
import { getAvailableProduce, getMyRequests, makePurchaseRequest, submitRating } from '../../api/buyerApi';
import * as farmerApi from '../../api/farmerApi';

export const BuyerDashboard = () => {
  const { user } = useAuth();
  const [availableProduce, setAvailableProduce] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestDrafts, setRequestDrafts] = useState({});
  const [submittingIds, setSubmittingIds] = useState({});
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatBusy, setChatBusy] = useState(false);
  const [ratingState, setRatingState] = useState({});
  const [ratingReviews, setRatingReviews] = useState({});
  const [ratingBusy, setRatingBusy] = useState({});
  const [submittedRatings, setSubmittedRatings] = useState({});

  const loadDashboard = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [produceData, requestData] = await Promise.all([
        getAvailableProduce(user.id),
        getMyRequests(user.id),
      ]);
      setAvailableProduce(produceData);
      setMyRequests(requestData);
      if (!selectedRequestId && requestData[0]?.id) {
        setSelectedRequestId(requestData[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [user?.id]);

  useEffect(() => {
    if (!selectedRequestId && myRequests[0]?.id) {
      setSelectedRequestId(myRequests[0].id);
      return;
    }

    if (selectedRequestId && !myRequests.some((request) => request.id === selectedRequestId)) {
      setSelectedRequestId(myRequests[0]?.id || null);
    }
  }, [myRequests, selectedRequestId]);

  useEffect(() => {
    const selectedRequest = myRequests.find((request) => request.id === selectedRequestId);
    if (!selectedRequest?.id) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const data = await farmerApi.getChatMessages(selectedRequest.id);
        setMessages(Array.isArray(data) ? data : []);
      } catch {
        setMessages([]);
      }
    };

    fetchMessages();
  }, [selectedRequestId, myRequests]);

  const handleDraftChange = (produceId, field, value) => {
    setRequestDrafts((prev) => ({
      ...prev,
      [produceId]: {
        ...prev[produceId],
        [field]: value,
      },
    }));
  };

  const handleRequestSubmit = async (item) => {
    const draft = requestDrafts[item.id] || {};
    const quantity = Number(draft.quantity || item.quantity || 1);
    const offeredPrice = Number(draft.offeredPrice || item.price_per_unit || 0);

    if (!user?.id || !quantity || !offeredPrice) {
      alert('Please enter a valid quantity and price.');
      return;
    }

    setSubmittingIds((prev) => ({ ...prev, [item.id]: true }));
    try {
      await makePurchaseRequest({
        produce_id: item.id,
        buyer_id: user.id,
        requested_quantity: quantity,
        offered_price: offeredPrice,
        buyer_note: draft.note || '',
      });
      setRequestDrafts((prev) => ({
        ...prev,
        [item.id]: { quantity: '', offeredPrice: '', note: '' },
      }));
      await loadDashboard();
    } catch (err) {
      alert(err?.message || 'Failed to submit your request.');
    } finally {
      setSubmittingIds((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    const selectedRequest = myRequests.find((request) => request.id === selectedRequestId);
    if (!selectedRequest?.id || !newMessage.trim() || chatBusy) return;

    setChatBusy(true);
    try {
      await farmerApi.sendChatMessage(selectedRequest.id, user.id, newMessage.trim(), selectedRequest.farmer_id || 1);
      setNewMessage('');
      const data = await farmerApi.getChatMessages(selectedRequest.id);
      setMessages(Array.isArray(data) ? data : []);
    } finally {
      setChatBusy(false);
    }
  };

  const handleRate = async (request, ratingType) => {
    const key = `${request.id}-${ratingType}`;
    const rating = Number(ratingState[key] || 0);
    if (!rating) return;

    setRatingBusy((prev) => ({ ...prev, [key]: true }));
    try {
      await submitRating({
        request_id: request.id,
        buyer_id: user.id,
        rated_user_id: request.farmer_id || 1,
        rating_type: ratingType,
        rating,
        review: ratingReviews[key] || '',
      });
      setSubmittedRatings((prev) => ({ ...prev, [key]: true }));
      setRatingReviews((prev) => ({ ...prev, [key]: '' }));
    } catch (err) {
      alert(err?.message || 'Failed to submit rating.');
    } finally {
      setRatingBusy((prev) => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-green-700 to-green-600 p-8 text-white shadow-sm">
        <h1 className="text-2xl font-semibold">Buyer Dashboard</h1>
        <p className="mt-2 text-sm text-green-50">Browse produce and keep track of your purchase requests.</p>
      </div>
      <Card>
        <CardHeader title="Buyer Dashboard" subtitle="Browse produce and track your purchase requests" />
      </Card>

      {loading ? (
        <div className="text-center py-12 text-gray-600">Loading dashboard data...</div>
      ) : (
        <>
          <Card>
            <CardHeader title="Available Produce" subtitle="Fresh listings from farmers" />
            {availableProduce.length === 0 ? (
              <p className="text-gray-600">No produce is currently available.</p>
            ) : (
              <div id="buyer-available" className="space-y-3">
                {availableProduce.map((item, index) => {
                  const draft = requestDrafts[item.id] || {};
                  return (
                    <div
                      key={item.id}
                      id={index === 0 ? 'buyer-request-form' : undefined}
                      className="rounded-xl border border-green-100 bg-green-50/50 p-4"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600">Farmer: {item.farmer_name || 'Unknown'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-700">${item.price_per_unit}</p>
                          <p className="text-sm text-gray-500">{item.quantity} {item.unit}</p>
                        </div>
                      </div>
                      {item.description && <p className="text-sm text-gray-600 mt-2">{item.description}</p>}
                      <div className="mt-4 grid gap-3 md:grid-cols-3">
                        <input
                          type="number"
                          min="1"
                          value={draft.quantity || ''}
                          onChange={(event) => handleDraftChange(item.id, 'quantity', event.target.value)}
                          placeholder="Quantity"
                          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={draft.offeredPrice || ''}
                          onChange={(event) => handleDraftChange(item.id, 'offeredPrice', event.target.value)}
                          placeholder="Offered price"
                          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        />
                        <button
                          onClick={() => handleRequestSubmit(item)}
                          disabled={submittingIds[item.id]}
                          className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-800 disabled:bg-gray-300"
                        >
                          {submittingIds[item.id] ? 'Submitting...' : 'Request'}
                        </button>
                      </div>
                      <textarea
                        value={draft.note || ''}
                        onChange={(event) => handleDraftChange(item.id, 'note', event.target.value)}
                        placeholder="Add a note for the farmer"
                        className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        rows="2"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="My Requests" subtitle="Your recent purchase requests" />
            {myRequests.length === 0 ? (
              <p className="text-gray-600">You have not made any purchase requests yet.</p>
            ) : (
              <div id="buyer-my-requests" className="space-y-3">
                {myRequests.map((request, reqIndex) => {
                  const productKey = `${request.id}-PRODUCT`;
                  const deliveryKey = `${request.id}-DELIVERY`;
                  return (
                    <div key={request.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-gray-900">{request.produce_name || 'Produce Request'}</h4>
                          <p className="text-sm text-gray-600">Farmer: {request.farmer_name || 'Unknown'}</p>
                        </div>
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm uppercase text-blue-700">
                          {request.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">Quantity: {request.requested_quantity}</p>
                      <div
                        id={reqIndex === 0 ? 'buyer-rating-box' : undefined}
                        className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-3"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-800">Rate this experience</p>
                          <button
                            onClick={() => setSelectedRequestId(request.id)}
                            className="text-sm font-medium text-green-700"
                          >
                            Message farmer
                          </button>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">Product quality</p>
                            <div className="mt-1 flex items-center gap-2">
                              {[1, 2, 3, 4, 5].map((value) => (
                                <button
                                  key={`${request.id}-product-${value}`}
                                  onClick={() => setRatingState((prev) => ({ ...prev, [productKey]: value }))}
                                  className={`text-xl ${Number(ratingState[productKey] || 0) >= value ? 'text-yellow-500' : 'text-gray-300'}`}
                                >
                                  ★
                                </button>
                              ))}
                              <button
                                onClick={() => handleRate(request, 'PRODUCT')}
                                disabled={ratingBusy[productKey] || submittedRatings[productKey]}
                                className="ml-2 rounded-lg bg-green-700 px-3 py-1 text-sm text-white disabled:bg-gray-300"
                              >
                                {submittedRatings[productKey] ? 'Rated' : ratingBusy[productKey] ? '...' : 'Submit'}
                              </button>
                            </div>
                            <textarea
                              value={ratingReviews[productKey] || ''}
                              onChange={(event) => setRatingReviews((prev) => ({ ...prev, [productKey]: event.target.value }))}
                              placeholder="Share feedback about the produce"
                              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                              rows="2"
                            />
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">Delivery experience</p>
                            <div className="mt-1 flex items-center gap-2">
                              {[1, 2, 3, 4, 5].map((value) => (
                                <button
                                  key={`${request.id}-delivery-${value}`}
                                  onClick={() => setRatingState((prev) => ({ ...prev, [deliveryKey]: value }))}
                                  className={`text-xl ${Number(ratingState[deliveryKey] || 0) >= value ? 'text-yellow-500' : 'text-gray-300'}`}
                                >
                                  ★
                                </button>
                              ))}
                              <button
                                onClick={() => handleRate(request, 'DELIVERY')}
                                disabled={ratingBusy[deliveryKey] || submittedRatings[deliveryKey]}
                                className="ml-2 rounded-lg bg-green-700 px-3 py-1 text-sm text-white disabled:bg-gray-300"
                              >
                                {submittedRatings[deliveryKey] ? 'Rated' : ratingBusy[deliveryKey] ? '...' : 'Submit'}
                              </button>
                            </div>
                            <textarea
                              value={ratingReviews[deliveryKey] || ''}
                              onChange={(event) => setRatingReviews((prev) => ({ ...prev, [deliveryKey]: event.target.value }))}
                              placeholder="Share feedback about the delivery"
                              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                              rows="2"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
          <Card id="buyer-chat">
            <CardHeader title="Message Farmer" subtitle="Keep the conversation going for each request" />
            {myRequests.length === 0 ? (
              <p className="text-gray-600">Create a request to start a conversation with the farmer.</p>
            ) : (
              <div className="space-y-4">
                <select
                  value={selectedRequestId || ''}
                  onChange={(event) => setSelectedRequestId(Number(event.target.value))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  {myRequests.map((request) => (
                    <option key={request.id} value={request.id}>
                      {request.produce_name || 'Request'} — {request.status}
                    </option>
                  ))}
                </select>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  {messages.length === 0 ? (
                    <p className="text-sm text-gray-500">No messages yet. Start the conversation.</p>
                  ) : (
                    <div className="space-y-2">
                      {messages.map((message) => {
                        const isMine = message.sender_id === user?.id;
                        return (
                          <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs rounded-lg px-3 py-2 text-sm ${isMine ? 'bg-green-700 text-white' : 'bg-white text-gray-800'}`}>
                              <p className="text-xs font-semibold opacity-75">{isMine ? 'You' : message.sender_name}</p>
                              <p>{message.message}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    value={newMessage}
                    onChange={(event) => setNewMessage(event.target.value)}
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    placeholder="Type your message"
                  />
                  <button
                    type="submit"
                    disabled={chatBusy || !newMessage.trim()}
                    className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white disabled:bg-gray-300"
                  >
                    {chatBusy ? 'Sending...' : 'Send'}
                  </button>
                </form>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};
