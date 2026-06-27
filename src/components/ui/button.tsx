import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-primary-500 to-pink-500 text-white shadow-lg shadow-primary-200 hover:from-primary-600 hover:to-pink-600',
        secondary: 'bg-white text-primary-700 border border-primary-200 hover:bg-primary-50',
        outline: 'border border-gray-200 bg-white hover:bg-gray-50',
        ghost: 'hover:bg-primary-50 hover:text-primary-700',
        destructive: 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-200',
        success: 'bg-emerald-500 text-white hover:bg-emerald-600',
      },
      size: {
        default: 'h-11 px-6 py-2',
        sm: 'h-9 rounded-lg px-4 text-xs',
        lg: 'h-13 rounded-2xl px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
