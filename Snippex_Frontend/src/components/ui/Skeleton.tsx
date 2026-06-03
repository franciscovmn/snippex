import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  radius?: string | number;
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ width = '100%', height = 12, radius = 6, className = '' }) => {
  return (
    <span
      className={`skeleton ${className}`.trim()}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
};

/** Várias linhas de texto em skeleton. */
export const SkeletonText: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <div className="skeleton-text" aria-hidden="true">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} height={12} width={i === lines - 1 ? '60%' : '100%'} />
    ))}
  </div>
);

export default Skeleton;
