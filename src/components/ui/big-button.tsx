/**
 * BigButton Component
 * Large, touch-friendly buttons for non-tech-savvy technicians
 * Minimum 60px height for easy tapping on mobile devices
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BigButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'secondary';
  icon?: React.ComponentType<{ className?: string }>;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
}

const variantStyles = {
  default: 'bg-blue-600 hover:bg-blue-700 text-white',
  success: 'bg-green-600 hover:bg-green-700 text-white',
  warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
};

export const BigButton = React.forwardRef<HTMLButtonElement, BigButtonProps>(
  ({ className, variant = 'default', icon: Icon, iconPosition = 'left', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          'flex items-center justify-center gap-3 px-6 py-4',
          'min-h-[60px] w-full rounded-xl font-semibold text-lg',
          'transition-all duration-200 shadow-md hover:shadow-lg',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
          'active:scale-95',
          // Variant styles
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {Icon && iconPosition === 'left' && <Icon className="h-6 w-6" />}
        <span>{children}</span>
        {Icon && iconPosition === 'right' && <Icon className="h-6 w-6" />}
      </button>
    );
  }
);

BigButton.displayName = 'BigButton';
