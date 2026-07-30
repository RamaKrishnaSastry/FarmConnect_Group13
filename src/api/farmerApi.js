import axiosClient from './axiosClient';

export const getProduceListing = async (farmerId) => {
  const { data } = await axiosClient.get(`/produce/${farmerId}`);
  return data;
};

export const addProduceListing = async (produce) => {
  const { data } = await axiosClient.post('/produce', produce);
  return data;
};

export const updateProduceListing = async (produceId, updates) => {
  const { data } = await axiosClient.put(`/produce/${produceId}`, updates);
  return data;
};

export const deleteProduceListing = async (produceId) => {
  const { data } = await axiosClient.delete(`/produce/${produceId}`);
  return data;
};

export const getPurchaseRequests = async (farmerId) => {
  const { data } = await axiosClient.get(`/requests/${farmerId}`);
  return data;
};

export const approvePurchaseRequest = async (requestId) => {
  const { data } = await axiosClient.put(`/requests/${requestId}/approve`);
  return data;
};

export const rejectPurchaseRequest = async (requestId) => {
  const { data } = await axiosClient.put(`/requests/${requestId}/reject`);
  return data;
};

export const getDeliveries = async (farmerId) => {
  const { data } = await axiosClient.get(`/deliveries/${farmerId}`);
  return data;
};

export const getRatings = async (farmerId) => {
  const { data } = await axiosClient.get(`/ratings/${farmerId}`);
  return data;
};

export const getChatMessages = async (requestId) => {
  const { data } = await axiosClient.get(`/chat/${requestId}`);
  return data;
};

export const sendChatMessage = async (requestId, senderId, message, receiverId) => {
  const { data } = await axiosClient.post('/chat', {
    request_id: requestId,
    sender_id: senderId,
    receiver_id: receiverId,
    message,
  });
  return data;
};
