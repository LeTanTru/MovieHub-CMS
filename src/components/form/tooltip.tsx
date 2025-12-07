'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { cn } from '@/lib';

type TooltipProps = {
  title: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  className?: string;
};

export default function ToolTip({
  title,
  children,
  side = 'bottom',
  align = 'center',
  sideOffset = 4,
  className
}: TooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          showArrow
          side={side}
          align={align}
          sideOffset={sideOffset}
          className={cn(
            'border-none bg-gray-800 text-white [&>span>svg]:h-2 [&>span>svg]:w-4 [&>span>svg]:fill-gray-800',
            className
          )}
        >
          <span className='text-sm'>{title}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
