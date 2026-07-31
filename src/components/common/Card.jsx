export const Card = ({ children, className = '' }) => {
  return (
    <div className={`rounded-2xl border border-green-100 bg-white/95 p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action }) => {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export const CardBody = ({ children }) => {
  return <div>{children}</div>;
};

export const CardFooter = ({ children }) => {
  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      {children}
    </div>
  );
};
