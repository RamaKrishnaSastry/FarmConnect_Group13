import axiosClient from './axiosClient';

export const loginUser = async (email, password) => {
  const { data } = await axiosClient.post('/auth/login', { email, password });
  return data;
};

export const logoutUser = async () => {
  await axiosClient.post('/auth/logout');
};

export const getCurrentUser = async () => {
  const { data } = await axiosClient.get('/auth/me');
  return data;
};
