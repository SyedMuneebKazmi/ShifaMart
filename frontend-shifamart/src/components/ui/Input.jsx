import { forwardRef } from 'react';
import clsx from 'clsx';

/**
 * Input component with label, error state, and helper text
 * @param {Object} props
 * @param {string} props.label
 * @param {string} props.error
 * @param {string} props.helperText
 * @param {React.ReactNode} props.leftIcon
 * @param {React.ReactNode} props.rightIcon
 * @param {string} props.className
 */
const Input = forwardRef(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <label htmlFor={inputId} className="label-base">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'input-base',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-danger focus:border-danger focus:ring-danger/20'
          )}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-danger">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-neutral-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
