'use client';

import { Button, ToolTip } from '@/components/form';
import { ConfirmModal } from '@/components/modal';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib';
import type { SubtitleType } from '@/types';
import { m } from 'framer-motion';
import { type KeyboardEvent, type MouseEvent } from 'react';
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';

type SubtitleItemProps = {
  isActive: boolean;
  isSelected: boolean;
  subtitle: SubtitleType;
  rowIndex: number;
  onSelect: (id: string, index: number) => void;
  onEdit: (subtitle: SubtitleType) => void;
  onDelete: (id: string) => void;
};

export function SubtitleItem({
  isActive,
  isSelected,
  subtitle,
  rowIndex,
  onSelect,
  onEdit,
  onDelete
}: SubtitleItemProps) {
  const virtualIndex = rowIndex - 1;

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
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => {
    e.stopPropagation();

    if (!isSelected) {
      onSelect(subtitle.id, virtualIndex);
    }

    onEdit(subtitle);
  };

  const handleDelete = (id: string) => {
    onDelete(id);
  };

  return (
    <m.div
      role='button'
      tabIndex={0}
      className={cn(
        'my-1 cursor-pointer rounded-md border border-transparent bg-white p-2 shadow-sm transition-colors duration-200 ease-linear outline-none',
        {
          'ring-sporty-blue border-sporty-blue bg-sporty-blue/10 ring-1':
            isSelected || isActive
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
      <div className='flex items-center gap-1'>
        <span className='flex h-5 min-w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 p-1.5 text-[11px] leading-normal font-bold text-white'>
          {rowIndex}
        </span>
        <div className='flex w-full items-center gap-1 text-xs'>
          <span>{subtitle.start.trim()}</span>
          <div className='h-px shrink-0 grow bg-gray-400'></div>
          <span>{subtitle.end.trim()}</span>
        </div>
        <Separator className='h-4! w-px! bg-gray-400' orientation='vertical' />
        <ToolTip title='Cập nhật'>
          <Button
            size='sm'
            variant='ghost'
            className='text-sporty-blue hover:text-sporty-blue/80 p-0! hover:bg-transparent'
            onClick={handleEditClick}
          >
            <AiOutlineEdit size={16} />
          </Button>
        </ToolTip>
        <Separator className='h-4! w-px! bg-gray-400' orientation='vertical' />
        <ToolTip title='Xóa'>
          <ConfirmModal
            message='Bạn có chắc chắn muốn xóa dòng phụ đề này không?'
            onConfirm={() => handleDelete(subtitle.id)}
            trigger={
              <Button
                size='sm'
                variant='ghost'
                className='p-0! text-rose-500 hover:bg-transparent hover:text-rose-500/80'
              >
                <AiOutlineDelete size={16} />
              </Button>
            }
          />
        </ToolTip>
      </div>

      <p className='text-justify'>{subtitle.text}</p>
    </m.div>
  );
}
