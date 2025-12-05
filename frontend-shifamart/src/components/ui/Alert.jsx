import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import clsx from 'clsx';

/**
 * Alert component for notifications and messages
 * @param {Object} props
 * @param {'success'|'warning'|'danger'|'info'} props.variant
 * @param {string} props.title
 * @param {React.ReactNode} props.children
 */
const Alert = ({ variant = 'info', title, children, className }) => {
  const variantStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    danger: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const iconMap = {
    success: CheckCircle,
    warning: AlertCircle,
    danger: XCircle,
    info: Info,
  };

  const Icon = iconMap[variant];

  return (
    <div
      className={clsx(
        'flex gap-3 p-4 rounded-lg border',
        variantStyles[variant],
        className
      )}
      role="alert"
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && (
          <h4 className="font-semibold mb-1">{title}</h4>
        )}
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
};

export default Alert;
