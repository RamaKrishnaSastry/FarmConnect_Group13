import axiosClient from './axiosClient';

// Transporter API endpoints
export const getAvailableDeliveries = async (transporterId) => {
  const { data } = await axiosClient.get(`/transporter/dashboard/${transporterId}`);
  return data.availableDeliveries || [];
};

export const acceptDelivery = async (deliveryId, transporterId) => {
  const { data } = await axiosClient.put(`/transporter/deliveries/${deliveryId}/accept`, { transporter_id: transporterId });
  return data;
};

export const updateDeliveryStatus = async (deliveryId, status) => {
  const { data } = await axiosClient.put(`/transporter/deliveries/${deliveryId}/status`, { status });
  return data;
};

export const getMyDeliveries = async (transporterId) => {
  const { data } = await axiosClient.get(`/transporter/dashboard/${transporterId}`);
  return data.myDeliveries || [];
};
