export const ROLES = {
  FARMER: 'FARMER',
  BUYER: 'BUYER',
  TRANSPORTER: 'TRANSPORTER',
};

export const STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  IN_TRANSIT: 'in_transit',
  COMPLETED: 'completed',
  AVAILABLE: 'available',
};

export const UNITS = [
  'kg',
  'ton',
  'lbs',
  'pieces',
  'bag',
  'box',
  'crate',
];

export const RATING_TYPES = {
  PRODUCT_QUALITY: 'product_quality',
  DELIVERY: 'delivery',
  COMMUNICATION: 'communication',
};

export const NAVIGATION = {
  FARMER: [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'My Produce', path: '/produce' },
    { name: 'Buyer Requests', path: '/requests' },
    { name: 'Deliveries', path: '/deliveries' },
    { name: 'Ratings', path: '/ratings' },
  ],
};
