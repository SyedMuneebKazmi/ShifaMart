import clsx from 'clsx';

/**
 * Badge component for status indicators
 * @param {Object} props
 * @param {'success'|'warning'|'danger'|'info'|'neutral'} props.variant
 * @param {'sm'|'md'|'lg'} props.size
 * @param {boolean} props.dot - Show dot indicator
 * @param {React.ReactNode} props.children
 */
const Badge = ({ 
  variant = 'neutral', 
  size = 'md', 
  dot = false,
  className,
  children 
}) => {
  const variantStyles = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    neutral: 'bg-neutral-100 text-neutral-800',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const dotColors = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    neutral: 'bg-neutral-500',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span className={clsx('w-2 h-2 rounded-full', dotColors[variant])} />
      )}
      {children}
    </span>
  );
};

export default Badge;
