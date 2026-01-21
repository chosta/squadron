'use client';

import { useState, useEffect } from 'react';
import { UserAvatar } from './UserAvatar';

interface UserAvatarWithValidatorProps {
  src?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  ethosProfileId?: number | null;
}

export function UserAvatarWithValidator({
  ethosProfileId,
  ...avatarProps
}: UserAvatarWithValidatorProps) {
  const [isValidator, setIsValidator] = useState(false);

  useEffect(() => {
    if (!ethosProfileId) return;

    fetch('/api/users/validators', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileIds: [ethosProfileId] }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.validators?.[ethosProfileId]) {
          setIsValidator(true);
        }
      })
      .catch(console.error);
  }, [ethosProfileId]);

  return <UserAvatar {...avatarProps} isValidator={isValidator} />;
}
