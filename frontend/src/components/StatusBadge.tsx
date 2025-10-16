interface StatusBadgeProps {
  status: string;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending_verification':
        return {
          label: 'En attente',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'active':
        return {
          label: 'Active',
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'sold':
        return {
          label: 'Vendue',
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'expired':
        return {
          label: 'Expirée',
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
      case 'rejected':
        return {
          label: 'Rejetée',
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'validated':
        return {
          label: 'Validée',
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;