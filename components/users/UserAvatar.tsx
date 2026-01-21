interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
};

export function UserAvatar({ src, name, size = 'md', className = '' }: UserAvatarProps) {
  const initial = (name || '?').charAt(0).toUpperCase();
  const classes = `${sizeClasses[size]} ${className}`;

  if (src) {
    return (
      <img
        src={src}
        alt={name || ''}
        className={`${classes} rounded-full object-cover`}
      />
    );
  }

  return (
    <div className={`${classes} rounded-full bg-gray-200 flex items-center justify-center`}>
      <span className="text-gray-600 font-semibold">{initial}</span>
    </div>
  );
}
