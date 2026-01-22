import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-hull-300 mb-1"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            block w-full rounded-lg border px-3 py-2 text-sm
            transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0
            bg-space-800
            ${error
              ? 'border-red-500 text-red-400 placeholder-red-400/50 focus:border-red-500 focus:ring-red-500'
              : 'border-space-600 text-hull-100 placeholder-hull-500 focus:border-primary-500 focus:ring-primary-500'
            }
            disabled:bg-space-700 disabled:text-hull-500 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
