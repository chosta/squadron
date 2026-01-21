interface ValidatorBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4 text-[10px]',
  md: 'w-5 h-5 text-xs',
  lg: 'w-6 h-6 text-sm',
};

export function ValidatorBadge({ size = 'md', className = '' }: ValidatorBadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-purple-600 text-white font-bold ${sizeClasses[size]} ${className}`}
      title="Ethos Validator"
    >
      V
    </span>
  );
}
