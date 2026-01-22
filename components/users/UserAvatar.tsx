import { ValidatorBadge } from './ValidatorBadge';

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isValidator?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
};

const badgeSizeMap = {
  sm: 'sm' as const,
  md: 'sm' as const,
  lg: 'md' as const,
  xl: 'lg' as const,
};

export function UserAvatar({ src, name, size = 'md', className = '', isValidator = false }: UserAvatarProps) {
  const initial = (name || '?').charAt(0).toUpperCase();
  const classes = `${sizeClasses[size]} ${className}`;

  const avatar = src ? (
    <img
      src={src}
      alt={name || ''}
      className={`${classes} rounded-full object-cover`}
    />
  ) : (
    <div className={`${classes} rounded-full bg-space-700 flex items-center justify-center`}>
      <span className="text-hull-400 font-semibold">{initial}</span>
    </div>
  );

  if (isValidator) {
    return (
      <div className="relative inline-block">
        {avatar}
        <div className="absolute -bottom-0.5 -right-0.5">
          <ValidatorBadge size={badgeSizeMap[size]} />
        </div>
      </div>
    );
  }

  return avatar;
}
