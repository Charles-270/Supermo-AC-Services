/**
 * Material Icon Component
 * Wrapper for Google Material Icons
 */

import { cn } from '@/lib/utils';

interface MaterialIconProps {
  icon: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-3xl',
  xl: 'text-4xl',
};

export function MaterialIcon({ icon, className, size = 'md' }: MaterialIconProps) {
  return (
    <span className={cn('material-icons', sizeClasses[size], className)}>
      {icon}
    </span>
  );
}