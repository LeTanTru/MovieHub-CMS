'use client';

import { cn } from '@/lib';
import { SubtitleType } from '@/types';
import { m } from 'framer-motion';
import { ChangeEvent } from 'react';

type SubtitleItemProps = {
  isActive: boolean;
  isSelected: boolean;
  subtitle: SubtitleType;
  rowIndex: number;
  setSelectedSubtitleId: (id: string | null) => void;
  onVttChange: (
    e: ChangeEvent<HTMLTextAreaElement>,
    targetSubtitle: SubtitleType
  ) => void;
  onTimeChange: (id: string, patch: Partial<SubtitleType>) => void;
};

export function SubtitleItem({
  isActive,
  isSelected,
  subtitle,
  rowIndex,
  setSelectedSubtitleId,
  onVttChange,
  onTimeChange
}: SubtitleItemProps) {
  const startValue = subtitle.start.trim();
  const endValue = subtitle.end.trim();

  return (
    <m.div
      className={cn(
        'rounded-md p-2 shadow-[0_0_4px_1px_rgba(0,0,0,0.1)] transition-colors duration-200 ease-linear',
        {
          'ring-main-color ring-2': isActive || isSelected
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
        if (isSelected) return;

        setSelectedSubtitleId(subtitle.id);
      }}
    >
      <div className='mb-1.5 flex items-center gap-2'>
        <span className='flex h-5 min-w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white'>
          {rowIndex}
        </span>
        <div className='flex w-full items-center gap-1 text-xs'>
          <input
            value={startValue}
            type='text'
            size={Math.max(startValue.length, 1)}
            className='focus-visible:ring-main-color w-auto grow-0 rounded border border-gray-200 p-1 text-center text-xs transition-all duration-200 ease-linear focus-visible:border-transparent focus-visible:ring-[1.5px]'
            onChange={() => {}}
          />
          <div className='h-px shrink-0 grow bg-zinc-400'></div>
          <input
            value={endValue}
            type='text'
            size={Math.max(endValue.length, 1)}
            className='focus-visible:ring-main-color w-auto grow-0 rounded border border-gray-200 p-1 text-center text-xs transition-all duration-200 ease-linear focus-visible:border-transparent focus-visible:ring-[1.5px]'
            onChange={() => {}}
          />
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
