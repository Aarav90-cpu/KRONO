import React, { useState, useEffect } from 'react';

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  alt?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-24 h-24 text-2xl',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name = 'User',
  size = 'md',
  className = '',
  alt,
}) => {
  const [imgError, setImgError] = useState(false);

  // Reset error state if src changes
  useEffect(() => {
    setImgError(false);
  }, [src]);

  // Generate fallback avatar URL or letter
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || 'User'
  )}&background=059669&color=ffffff&bold=true`;

  const effectiveSrc = !imgError && src && src.trim() !== '' ? src : fallbackUrl;

  return (
    <div
      className={`relative shrink-0 rounded-full overflow-hidden bg-surface-container border border-border-glass-dark ${
        sizeClasses[size]
      } ${className}`}
    >
      <img
        src={effectiveSrc}
        alt={alt || name || 'Avatar'}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        loading="lazy"
        onError={() => setImgError(true)}
        className="w-full h-full object-cover"
      />
    </div>
  );
};
