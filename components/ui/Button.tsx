import { ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'data';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-gradient-to-b from-primary-500 to-primary-600 text-white',
    'hover:from-primary-400 hover:to-primary-500',
    'focus-visible:shadow-glow-primary',
  ].join(' '),
  secondary: [
    'bg-gradient-to-b from-space-600 to-space-700 text-hull-100',
    'border border-space-500',
    'hover:from-space-500 hover:to-space-600',
    'focus-visible:shadow-glow-primary',
  ].join(' '),
  danger: [
    'bg-gradient-to-b from-danger-500 to-danger-600 text-white',
    'hover:from-danger-400 hover:to-danger-500',
    'focus-visible:shadow-glow-danger',
  ].join(' '),
  ghost: [
    'bg-transparent text-hull-300',
    'hover:bg-space-800 hover:text-hull-100',
    'shadow-none',
    'focus-visible:shadow-glow-primary',
  ].join(' '),
  data: [
    'bg-gradient-to-b from-data-500 to-data-600 text-white',
    'hover:from-data-400 hover:to-data-500',
    'focus-visible:shadow-glow-data',
  ].join(' '),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, className = '', children, ...props }, ref) => {
    const baseStyles = [
      // Layout
      'inline-flex items-center justify-center',
      // Typography
      'font-medium',
      // Border radius - tactical micro-radii
      'rounded-tactical',
      // Transitions
      'transition-all duration-150 ease-out',
      // Shadow with top-light effect
      'shadow-btn',
      // Hover transform
      'hover:shadow-btn-hover hover:-translate-y-px',
      // Active state
      'active:scale-[0.98]',
      // Focus
      'focus:outline-none focus-visible:outline-none',
      // Disabled
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-btn',
    ].join(' ');

    // Top-light inset shadow via inline style for proper layering
    const insetShadowStyle = variant !== 'ghost'
      ? { boxShadow: 'inset 0 1px 0 0 rgb(255 255 255 / 0.1)' }
      : {};

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        style={insetShadowStyle}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
