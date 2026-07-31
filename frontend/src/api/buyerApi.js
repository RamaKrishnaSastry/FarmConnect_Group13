import axiosClient from './axiosClient';

// Buyer API endpoints
export const getAvailableProduce = async (buyerId) => {
  const { data } = await axiosClient.get(`/buyer/dashboard/${buyerId}`);
  return data.availableProduce || [];
};

export const makePurchaseRequest = async (payload) => {
  const { data } = await axiosClient.post('/buyer/requests', payload);
  return data;
};

export const getMyRequests = async (buyerId) => {
  const { data } = await axiosClient.get(`/buyer/dashboard/${buyerId}`);
  return data.myRequests || [];
};

export const updateBuyerRequestStatus = async (requestId, status) => {
  const { data } = await axiosClient.put(`/buyer/requests/${requestId}`, { status });
  return data;
};

export const submitRating = async (payload) => {
  const { data } = await axiosClient.post('/ratings', payload);
  return data;
};
