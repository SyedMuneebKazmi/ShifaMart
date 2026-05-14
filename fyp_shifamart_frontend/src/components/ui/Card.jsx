import clsx from 'clsx';

/**
 * Card component with header, body, and footer sections
 * @param {Object} props
 * @param {React.ReactNode} props.header
 * @param {React.ReactNode} props.footer
 * @param {boolean} props.hover - Enable hover effect
 * @param {string} props.className
 * @param {React.ReactNode} props.children
 */
const Card = ({ 
  header, 
  footer, 
  hover = false, 
  className, 
  children,
  ...props 
}) => {
  return (
    <div
      className={clsx(
        'card',
        hover && 'card-hover cursor-pointer',
        className
      )}
      {...props}
    >
      {header && (
        <div className="border-b border-neutral-200 pb-4 mb-4">
          {header}
        </div>
      )}
      
      <div className="card-body">
        {children}
      </div>
      
      {footer && (
        <div className="border-t border-neutral-200 pt-4 mt-4">
          {footer}
        </div>
      )}
    </div>
  );
};

/**
 * Card Header component
 */
export const CardHeader = ({ title, subtitle, action, className }) => {
  return (
    <div className={clsx('flex items-start justify-between', className)}>
      <div>
        {title && (
          <h3 className="text-headline-md text-neutral-900">{title}</h3>
        )}
        {subtitle && (
          <p className="text-body-md text-neutral-500 mt-1">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

/**
 * Card Body component
 */
export const CardBody = ({ className, children }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

/**
 * Card Footer component
 */
export const CardFooter = ({ className, children }) => {
  return (
    <div className={clsx('flex items-center gap-3', className)}>
      {children}
    </div>
  );
};

export default Card;
