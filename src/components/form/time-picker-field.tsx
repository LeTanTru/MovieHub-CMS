'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Control, Controller } from 'react-hook-form';
import React, { useState } from 'react';
import { Button } from '@/components/form';

type Props = {
  control: Control<any>;
  name: string;
  label?: string;
  required?: boolean;
  format?: 'HH:mm:ss' | 'HH:mm' | 'mm:ss';
  placeholder?: string;
  className?: string;
  labelClassName?: string;
  disabled?: boolean;
};

export default function TimePickerField({
  control,
  name,
  label,
  required,
  format: timeFormat = 'HH:mm:ss',
  placeholder,
  className,
  labelClassName,
  disabled = false
}: Props) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const seconds = Array.from({ length: 60 }, (_, i) => i);
  const [isOpen, setIsOpen] = useState(false);

  const showHour = timeFormat.includes('HH');
  const showMinute = timeFormat.includes('mm');
  const showSecond = timeFormat.includes('ss');

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const [h, m, s] = field.value
          ?.split(':')
          .map((v: string) => parseInt(v)) ?? [0, 0, 0];
        const hour = isNaN(h) ? 0 : h;
        const minute = isNaN(m) ? 0 : m;
        const second = isNaN(s) ? 0 : s;

        const updateTime = (
          type: 'hour' | 'minute' | 'second',
          val: number
        ) => {
          const hh = type === 'hour' ? val : hour;
          const mm = type === 'minute' ? val : minute;
          const ss = type === 'second' ? val : second;

          let result = '';
          if (timeFormat === 'HH:mm:ss') {
            result = `${pad(hh)}:${pad(mm)}:${pad(ss)}`;
          } else if (timeFormat === 'HH:mm') {
            result = `${pad(hh)}:${pad(mm)}`;
          } else if (timeFormat === 'mm:ss') {
            result = `${pad(mm)}:${pad(ss)}`;
          }
          field.onChange(result);
        };

        return (
          <FormItem
            className={cn('relative', className, {
              'cursor-not-allowed': disabled
            })}
          >
            {label && (
              <FormLabel
                className={cn('ml-2 gap-1.5', labelClassName, {
                  'opacity-50 select-none': disabled
                })}
              >
                {label}
                {required && <span className='text-destructive'>*</span>}
              </FormLabel>
            )}
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger
                asChild
                className={cn({
                  'cursor-not-allowed': disabled
                })}
              >
                <FormControl>
                  <Button
                    disabled={disabled}
                    variant='outline'
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !field.value && 'text-muted-foreground',
                      {
                        'border-red-500 focus-visible:border-red-500 focus-visible:ring-[1px] focus-visible:ring-red-500 data-[state=open]:border-red-500 data-[state=open]:ring-1 data-[state=open]:ring-red-500':
                          fieldState.error
                      }
                    )}
                  >
                    <span suppressHydrationWarning>
                      {field.value || placeholder || timeFormat}
                    </span>
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent
                className='w-auto p-0'
                side='bottom'
                align='start'
              >
                <div className='flex flex-col divide-y sm:h-[250px] sm:flex-row sm:divide-x sm:divide-y-0'>
                  {showHour && (
                    <ScrollArea className='w-64 sm:w-auto'>
                      <div className='flex p-2 sm:flex-col'>
                        {hours.map((h) => (
                          <Button
                            key={h}
                            size='icon'
                            variant={hour === h ? 'default' : 'ghost'}
                            className='aspect-square shrink-0 sm:w-full'
                            onClick={() => updateTime('hour', h)}
                          >
                            {pad(h)}
                          </Button>
                        ))}
                      </div>
                      <ScrollBar
                        orientation='horizontal'
                        className='sm:hidden'
                      />
                    </ScrollArea>
                  )}
                  {showMinute && (
                    <ScrollArea className='w-64 sm:w-auto'>
                      <div className='flex p-2 sm:flex-col'>
                        {minutes.map((m) => (
                          <Button
                            key={m}
                            size='icon'
                            variant={minute === m ? 'default' : 'ghost'}
                            className='aspect-square shrink-0 sm:w-full'
                            onClick={() => updateTime('minute', m)}
                          >
                            {pad(m)}
                          </Button>
                        ))}
                      </div>
                      <ScrollBar
                        orientation='horizontal'
                        className='sm:hidden'
                      />
                    </ScrollArea>
                  )}
                  {showSecond && (
                    <ScrollArea className='w-64 sm:w-auto'>
                      <div className='flex p-2 sm:flex-col'>
                        {seconds.map((s) => (
                          <Button
                            key={s}
                            size='icon'
                            variant={second === s ? 'default' : 'ghost'}
                            className='aspect-square shrink-0 sm:w-full'
                            onClick={() => updateTime('second', s)}
                          >
                            {pad(s)}
                          </Button>
                        ))}
                      </div>
                      <ScrollBar
                        orientation='horizontal'
                        className='sm:hidden'
                      />
                    </ScrollArea>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            {fieldState.error && (
              <div className='animate-in fade-in absolute -bottom-6 left-2 z-0 mt-1 text-sm text-red-500'>
                <FormMessage />
              </div>
            )}
          </FormItem>
        );
      }}
    />
  );
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}
