import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import type { ComponentProps } from 'react';
import { CircleLoading } from '@/components/loading';

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-normal disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all ease-linear duration-200 disabled:pointer-events-auto disabled:cursor-not-allowed focus-visible:ring-0",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary/80 disabled:bg-primary/80 disabled:hover:bg-primary/80',
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/80 focus-visible:ring-destructive/20 hover:opacity-80 disabled:bg-destructive/80 disabled:hover:bg-destructive/80',
        outline:
          'border border-input bg-transparent hover:text-gray-400 hover:border-input/50 disabled:hover:text-black disabled:hover:bg-transparent disabled:border-gray-200 disabled:hover:border-gray-200 dark:hover:text-white dark:disabled:border-gray-400 dark:border-gray-200 dark:hover:border-gray-400 dark:hover:text-gray-400 dark:disabled:hover:text-gray-400 dark:disabled:text-gray-400',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:text-gray-400 disabled:text-gray-400',
        ghost:
          'hover:bg-accent hover:text-accent-foreground disabled:hover:bg-transparent disabled:hover:text-gray-400 disabled:text-gray-400',
        link: 'text-primary underline-offset-4 hover:underline',
        primary:
          'bg-main-color text-primary-foreground hover:bg-main-color/80 disabled:bg-main-color/80 disabled:hover:bg-main-color/80 disabled:text-primary-foreground/80'
      },
      size: {
        default: 'h-9 px-4 has-[>svg]:px-4 py-2',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export default function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  children,
  ...props
}: ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot='button'
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <CircleLoading className='size-5 stroke-2' aria-hidden='true' />
      ) : (
        children
      )}
    </Comp>
  );
}
