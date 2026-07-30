import { formatStatus, getStatusColor } from '../../utils/formatters';

export const StatusBadge = ({ status, className = '' }) => {
  const color = getStatusColor(status);

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${color} ${className}`}>
      {formatStatus(status)}
    </span>
  );
};
