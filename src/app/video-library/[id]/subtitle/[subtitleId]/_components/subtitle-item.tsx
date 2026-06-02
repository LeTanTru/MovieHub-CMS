'use client';

import { cn } from '@/lib';
import { SubtitleType } from '@/types';
import { m } from 'framer-motion';
import { ChangeEvent } from 'react';

type SubtitleItemProps = {
  isActive: boolean;
  subtitle: SubtitleType;
  rowIndex: number;
  setSelectedSubtitleId: (id: string | null) => void;
  onVttChange: (
    e: ChangeEvent<HTMLTextAreaElement>,
    targetSubtitle: SubtitleType
  ) => void;
};

export function SubtitleItem({
  isActive,
  subtitle,
  rowIndex,
  setSelectedSubtitleId,
  onVttChange
}: SubtitleItemProps) {
  return (
    <m.div
      className={cn(
        'rounded-md p-2 shadow-[0_0_4px_1px_rgba(0,0,0,0.1)] transition-colors duration-200 ease-linear',
        {
          'ring-main-color ring-2': isActive
        }
      )}
      whileHover={{
        translateY: -2
      }}
      transition={{
        duration: 0.2,
        ease: 'linear'
      }}
      onClick={() => {
        if (isActive) return;

        setSelectedSubtitleId(subtitle.id);
      }}
    >
      <div className='mb-1.5 flex items-center gap-2'>
        <span className='flex h-5 min-w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white'>
          {rowIndex + 1}
        </span>
        <div className='flex w-full items-center gap-1 text-xs'>
          <span>{subtitle.start.trim()}</span>
          <div className='h-px flex-1 bg-zinc-400'></div>
          <span>{subtitle.end.trim()}</span>
        </div>
      </div>

      <textarea
        className='w-full resize-none rounded-md border border-gray-200 bg-transparent p-1 text-sm transition-all duration-200 ease-linear outline-none focus-visible:border-gray-200'
        value={subtitle.text}
        rows={4}
        onChange={(e) => onVttChange(e, subtitle)}
        spellCheck={false}
      />
    </m.div>
  );
}
