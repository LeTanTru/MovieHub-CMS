'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

type TooltipProps = {
  title: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
};

export default function ToolTip({
  title,
  children,
  side = 'bottom',
  align = 'center',
  sideOffset = 4
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
          className='border-none bg-gray-800 text-white [&>span>svg]:h-2 [&>span>svg]:w-4 [&>span>svg]:fill-gray-800'
        >
          <span className='text-sm'>{title}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
