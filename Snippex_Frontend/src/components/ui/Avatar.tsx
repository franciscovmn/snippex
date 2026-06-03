import React from 'react';

interface AvatarProps {
  name?: string | null;
  size?: number;
  title?: string;
}

function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

const Avatar: React.FC<AvatarProps> = ({ name, size = 32, title }) => {
  return (
    <span
      className="avatar"
      title={title ?? name ?? undefined}
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.4)) }}
    >
      {getInitials(name)}
    </span>
  );
};

export default Avatar;
