export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  HEALTH: '/api/health',
  PRODUCE_LISTINGS: '/api/produce/listings',
  PURCHASE_REQUEST: '/api/purchase/request',
  PURCHASE_REQUESTS: '/api/purchase/requests',
};
