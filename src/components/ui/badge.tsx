import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'green' | 'yellow' | 'red' | 'outline';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variant === 'default' && 'border-primary-200 bg-primary-50 text-primary-700',
        variant === 'green' && 'risk-green',
        variant === 'yellow' && 'risk-yellow',
        variant === 'red' && 'risk-red',
        variant === 'outline' && 'border-gray-200 text-gray-600',
        className
      )}
      {...props}
    />
  );
}

export { Badge };
