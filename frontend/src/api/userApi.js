import axiosClient from './axiosClient';

export const updateUserProfile = (userId, payload) =>
  axiosClient.put(`/users/${userId}`, payload).then((res) => res.data);
