import { UserAvatar } from './UserAvatar';

interface AvatarData {
  id: string;
  src?: string | null;
  name?: string | null;
  isCaptain?: boolean;
}

interface OverlappingAvatarsProps {
  avatars: AvatarData[];
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
  showCaptainBadge?: boolean;
}

const sizeConfig = {
  sm: { avatarSize: 'sm' as const, ringClass: 'ring-2', overflowSize: 'w-6 h-6 text-xs' },
  md: { avatarSize: 'sm' as const, ringClass: 'ring-2', overflowSize: 'w-8 h-8 text-xs' },
  lg: { avatarSize: 'md' as const, ringClass: 'ring-2', overflowSize: 'w-10 h-10 text-sm' },
};

export function OverlappingAvatars({
  avatars,
  maxDisplay = 5,
  size = 'md',
  showCaptainBadge = true,
}: OverlappingAvatarsProps) {
  const config = sizeConfig[size];
  const displayAvatars = avatars.slice(0, maxDisplay);
  const remainingCount = avatars.length - maxDisplay;

  return (
    <div className="flex items-center">
      {displayAvatars.map((avatar, index) => (
        <div
          key={avatar.id}
          className={`relative ${index > 0 ? '-ml-2' : ''}`}
          style={{ zIndex: maxDisplay - index }}
        >
          <UserAvatar
            src={avatar.src}
            name={avatar.name}
            size={config.avatarSize}
            className={`${config.ringClass} ring-space-800`}
          />
          {showCaptainBadge && avatar.isCaptain && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-space-800">
              C
            </div>
          )}
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className={`-ml-2 flex items-center justify-center rounded-full bg-space-600 text-hull-300 ${config.ringClass} ring-space-800 ${config.overflowSize}`}
          style={{ zIndex: 0 }}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
