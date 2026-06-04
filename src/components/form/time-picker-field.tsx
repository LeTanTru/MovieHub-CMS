'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { useState } from 'react';
import { Button } from '@/components/form';
import { X } from 'lucide-react';

type TimePickerFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  required?: boolean;
  format?: 'HH:mm:ss' | 'HH:mm' | 'mm:ss';
  placeholder?: string;
  className?: string;
  formItemClassName?: string;
  labelClassName?: string;
  disabled?: boolean;
  clearable?: boolean;
  description?: string;
  onChange?: (value: string) => void;
};

export function TimePickerField<T extends FieldValues>({
  control,
  name,
  label,
  required,
  format: timeFormat = 'HH:mm:ss',
  placeholder,
  className,
  formItemClassName,
  labelClassName,
  disabled = false,
  clearable = true,
  description,
  onChange
}: TimePickerFieldProps<T>) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const seconds = Array.from({ length: 60 }, (_, i) => i);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const showHour = timeFormat.includes('HH');
  const showMinute = timeFormat.includes('mm');
  const showSecond = timeFormat.includes('ss');

  return (
    <FormField
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const isNumberValue = typeof field.value === 'number';
        const hasValue =
          field.value !== null &&
          field.value !== undefined &&
          field.value !== '' &&
          field.value !== 0;

        let hour = 0,
          minute = 0,
          second = 0;

        if (isNumberValue) {
          hour = Math.floor(field.value / 3600);
          minute = Math.floor((field.value % 3600) / 60);
          second = field.value % 60;
        } else if (typeof field.value === 'string') {
          const parts = field.value.split(':').map((v: string) => parseInt(v));
          hour = isNaN(parts[0]) ? 0 : parts[0];
          minute = isNaN(parts[1]) ? 0 : parts[1];
          second = isNaN(parts[2]) ? 0 : parts[2];
        }

        const updateTime = (
          type: 'hour' | 'minute' | 'second',
          val: number
        ) => {
          const hh = type === 'hour' ? val : hour;
          const mm = type === 'minute' ? val : minute;
          const ss = type === 'second' ? val : second;

          let formattedTime = '';
          if (timeFormat === 'HH:mm:ss')
            formattedTime = `${pad(hh)}:${pad(mm)}:${pad(ss)}`;
          else if (timeFormat === 'HH:mm')
            formattedTime = `${pad(hh)}:${pad(mm)}`;
          else if (timeFormat === 'mm:ss')
            formattedTime = `${pad(mm)}:${pad(ss)}`;

          if (isNumberValue) {
            const totalSeconds = hh * 3600 + mm * 60 + ss;
            field.onChange(totalSeconds);
            onChange?.(formattedTime);
          } else {
            field.onChange(formattedTime);
            onChange?.(formattedTime);
          }
        };

        const handleClear = (
          e:
            | React.MouseEvent<HTMLSpanElement>
            | React.KeyboardEvent<HTMLSpanElement>
        ) => {
          e.stopPropagation();
          field.onChange(isNumberValue ? 0 : '');
          onChange?.('');
        };

        return (
          <FormItem
            className={cn(
              'relative',
              { 'cursor-not-allowed select-none': disabled },
              formItemClassName
            )}
          >
            {label && (
              <FormLabel
                className={cn('ml-2', labelClassName, {
                  'opacity-50 select-none': disabled
                })}
              >
                {label}
                {required && <span className='text-destructive'>*</span>}
              </FormLabel>
            )}
            <FormControl>
              <div>
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                  <PopoverTrigger
                    asChild
                    className={cn({
                      'cursor-not-allowed': disabled
                    })}
                  >
                    <Button
                      disabled={disabled}
                      variant='outline'
                      role='combobox'
                      aria-controls='combobox'
                      aria-expanded={isOpen}
                      aria-label='Select time'
                      className={cn(
                        'w-full justify-between text-left font-normal text-black opacity-100',
                        'focus:ring-0 focus-visible:border-gray-200 focus-visible:ring-0',
                        'data-[state=open]:border-sporty-blue data-[state=open]:ring-sporty-blue hover:border-input px-3! shadow-none hover:text-black data-[state=open]:ring-1',
                        {
                          'text-gray-300 hover:text-gray-300': !field.value,
                          'border-rose-500 hover:border-rose-500 focus-visible:border-rose-500 focus-visible:ring-[1px] focus-visible:ring-rose-500 data-[state=open]:border-rose-500 data-[state=open]:ring-1 data-[state=open]:ring-rose-500':
                            fieldState.error
                        },
                        className
                      )}
                    >
                      <span
                        suppressHydrationWarning
                        className={cn({
                          'text-gray-300': !hasValue,
                          'opacity-50': disabled
                        })}
                      >
                        {field.value
                          ? formatDisplay(hour, minute, second)
                          : placeholder}
                      </span>
                      {clearable && hasValue && !disabled && (
                        <span
                          role='button'
                          aria-label='Clear time'
                          onClick={handleClear}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleClear(e);
                            }
                          }}
                          className='rounded-full p-0.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'
                        >
                          <X className='size-3.5' />
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    sideOffset={8}
                    className='w-auto p-0'
                    side='bottom'
                    align='start'
                  >
                    <div className='flex flex-col divide-y sm:h-62.5 sm:flex-row sm:divide-x sm:divide-y-0'>
                      {showHour && (
                        <ScrollArea className='w-64 sm:w-auto'>
                          <div className='flex p-2 sm:flex-col'>
                            {hours.map((h) => (
                              <Button
                                key={h}
                                size='icon'
                                variant={hour === h ? 'primary' : 'ghost'}
                                className='aspect-square shrink-0 sm:w-full'
                                onClick={() => updateTime('hour', h)}
                                ref={(el) => {
                                  if (hour === h && el) {
                                    el.scrollIntoView({
                                      block: 'center',
                                      behavior: 'smooth'
                                    });
                                  }
                                }}
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
                                variant={minute === m ? 'primary' : 'ghost'}
                                className='aspect-square shrink-0 sm:w-full'
                                onClick={() => updateTime('minute', m)}
                                ref={(el) => {
                                  if (minute === m && el) {
                                    el.scrollIntoView({
                                      block: 'center',
                                      behavior: 'smooth'
                                    });
                                  }
                                }}
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
                                variant={second === s ? 'primary' : 'ghost'}
                                className='aspect-square shrink-0 sm:w-full'
                                onClick={() => updateTime('second', s)}
                                ref={(el) => {
                                  if (second === s && el) {
                                    el.scrollIntoView({
                                      block: 'center',
                                      behavior: 'smooth'
                                    });
                                  }
                                }}
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
                    {clearable && (
                      <div className='border-t p-2'>
                        <Button
                          variant='outline'
                          className='w-full'
                          onClick={() => {
                            field.onChange(isNumberValue ? null : '');
                            onChange?.('');
                            setIsOpen(false);
                          }}
                        >
                          Xóa
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
                {description && (
                  <FormDescription>{description}</FormDescription>
                )}
                <div className='animate-in fade-in -mb-6 ml-2 flex min-h-6 items-end'>
                  <FormMessage className='leading-5.5' />
                </div>
              </div>
            </FormControl>
          </FormItem>
        );
      }}
    />
  );
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function formatDisplay(h: number, m: number, s: number) {
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
