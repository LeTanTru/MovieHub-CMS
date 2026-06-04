'use client';

import { AiOutlineEdit } from 'react-icons/ai';
import { Button } from '@/components/form';
import { cn } from '@/lib';
import { m } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { useDisclosure } from '@/hooks';
import SubtitleModal from './subtitle-modal';
import {
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent
} from 'react';
import type { SubtitleType } from '@/types';

type SubtitleItemProps = {
  isActive: boolean;
  isSelected: boolean;
  subtitle: SubtitleType;
  rowIndex: number;
  onSelect: (id: string, index: number) => void;
  onVttChange: (
    e: ChangeEvent<HTMLTextAreaElement>,
    targetSubtitle: SubtitleType
  ) => void;
};

export function SubtitleItem({
  isActive,
  isSelected,
  subtitle,
  rowIndex,
  onSelect,
  onVttChange
}: SubtitleItemProps) {
  const virtualIndex = rowIndex - 1;

  const {
    opened: openedSubtitle,
    open: openSubtitle,
    close: closeSubtitle
  } = useDisclosure();

  const [selectedSubtitle, setSelectedSubtitle] = useState<SubtitleType>();

  const handleSelect = () => {
    if (isSelected) return;

    onSelect(subtitle.id, virtualIndex);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect();
    }
  };

  const handleEditClick = (
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
    subtitle: SubtitleType
  ) => {
    if (isSelected) {
      e.stopPropagation();
    }

    setSelectedSubtitle(subtitle);
    openSubtitle();
  };

  return (
    <>
      <m.div
        role='button'
        tabIndex={0}
        className={cn(
          'cursor-pointer rounded-md p-2 shadow-[0_0_4px_1px_rgba(0,0,0,0.1)] transition-colors duration-200 ease-linear outline-none',
          {
            'ring-sporty-blue ring-2': isActive || isSelected
          }
        )}
        whileHover={{
          translateY: -2
        }}
        transition={{
          duration: 0.2,
          ease: 'linear'
        }}
        onClick={handleSelect}
        onKeyDown={handleKeyDown}
      >
        <div className='mb-1.5 flex items-center gap-1'>
          <span className='flex h-5 min-w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 p-1.5 text-[11px] leading-normal font-bold text-white'>
            {rowIndex}
          </span>
          <div className='flex w-full items-center gap-1 text-xs'>
            <span>{subtitle.start.trim()}</span>
            <div className='h-px shrink-0 grow bg-gray-400'></div>
            <span>{subtitle.end.trim()}</span>
          </div>
          <Separator
            className='h-4! w-px! bg-gray-400'
            orientation='vertical'
          />
          <Button
            size='sm'
            variant='ghost'
            className='hover:text-sporty-blue p-0! hover:bg-transparent'
            onClick={(e) => handleEditClick(e, subtitle)}
          >
            <AiOutlineEdit size={16} />
          </Button>
        </div>

        <p className='text-justify'>{subtitle.text}</p>
      </m.div>
      {selectedSubtitle && (
        <SubtitleModal
          open={openedSubtitle}
          subtitle={selectedSubtitle}
          onClose={closeSubtitle}
        />
      )}
    </>
  );
}
