'use client';

import { Calendar } from '@/components/ui/calendar';
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
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Button } from '@/components/form';
import type { DropdownProps } from 'react-day-picker';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { DATE_TIME_FORMAT, DATE_FORMAT } from '@/constants';
import { type ChangeEvent, useState } from 'react';
import { CalendarIcon, X } from 'lucide-react';
import { format, isValid, Locale, parse } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useIsMounted } from '@/hooks';

type DateTimePickerFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  description?: string;
  required?: boolean;
  format?: string;
  labelClassName?: string;
  disabled?: boolean;
  placeholder?: string;
  clearable?: boolean;
  className?: string;
  formItemClassName?: string;
};

export default function DateTimePickerField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  format: dateFormat = DATE_TIME_FORMAT,
  labelClassName,
  disabled,
  placeholder,
  className,
  formItemClassName,
  clearable = true
}: DateTimePickerFieldProps<T>) {
  const isMounted = useIsMounted();

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const seconds = Array.from({ length: 60 }, (_, i) => i);
  const [open, setOpen] = useState<boolean>(false);
  const calendarLocale: Locale = vi;

  const parseDate = (value: string) => {
    if (!value) return undefined;

    const parsedDateTime = parse(value, DATE_TIME_FORMAT, new Date());
    if (isValid(parsedDateTime)) return parsedDateTime;

    const parsedDate = parse(value, DATE_FORMAT, new Date());
    if (isValid(parsedDate)) return parsedDate;

    return new Date(value);
  };

  if (!isMounted) return null;

  return (
    <FormField
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const date = parseDate(field.value);
        const hasValue = !!field.value;

        const updateFieldValue = (d: Date) => {
          field.onChange(format(d, dateFormat));
        };

        const handleClear = (
          e:
            | React.MouseEvent<HTMLSpanElement>
            | React.KeyboardEvent<HTMLSpanElement>
        ) => {
          e.stopPropagation();
          field.onChange('');
        };

        const handleDateSelect = (selected: Date | undefined) => {
          if (selected) {
            const current = date ?? new Date();
            const updated = new Date(current);
            updated.setFullYear(
              selected.getFullYear(),
              selected.getMonth(),
              selected.getDate()
            );
            updateFieldValue(updated);
          }
        };

        const handleTimeChange = (
          type: 'hour' | 'minute' | 'second',
          val: number
        ) => {
          const current = date ?? new Date();
          if (type === 'hour') current.setHours(val);
          if (type === 'minute') current.setMinutes(val);
          if (type === 'second') current.setSeconds(val);
          updateFieldValue(current);
        };

        const getSelectedTime = () => {
          const d = date ?? new Date();
          return {
            hour: d.getHours(),
            minute: d.getMinutes(),
            second: d.getSeconds()
          };
        };

        const { hour, minute, second } = getSelectedTime();

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
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      disabled={disabled}
                      variant='outline'
                      role='combobox'
                      aria-controls='combobox'
                      aria-expanded={open}
                      aria-label='Select date and time'
                      className={cn(
                        'hover:border-input focus-visible:border-input focus-visible:ring-main-color w-full justify-between border px-3! py-0 text-black hover:text-black focus-visible:border-transparent focus-visible:ring-2 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-50 disabled:select-none',
                        {
                          'ring-main-color border-transparent! ring-2': open,
                          '[&>div>span]:text-gray-300': fieldState.invalid,
                          'border-rose-500 ring-rose-500': !!fieldState.error
                        },
                        className
                      )}
                    >
                      <span
                        suppressHydrationWarning
                        className={cn({
                          'text-gray-300': !hasValue && !disabled,
                          'opacity-50': disabled
                        })}
                      >
                        {(() => {
                          const parsed = parseDate(field.value);
                          return parsed && !isNaN(parsed.getTime())
                            ? format(parsed, dateFormat)
                            : (placeholder ?? 'Chọn ngày');
                        })()}
                      </span>
                      <span
                        className={cn('flex items-center gap-1', {
                          'opacity-50': disabled
                        })}
                      >
                        {clearable && hasValue && !disabled && (
                          <span
                            role='button'
                            aria-label='Clear date'
                            onClick={handleClear}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleClear(e);
                              }
                            }}
                            className='rounded-full p-0.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'
                          >
                            <X className='h-3.5 w-3.5' />
                          </span>
                        )}
                        <CalendarIcon
                          className={cn('h-4 w-4', {
                            'opacity-50': disabled
                          })}
                        />
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent sideOffset={8} className='w-120 p-2'>
                    <div className='sm:flex'>
                      <Calendar
                        className='w-full flex-1 p-0'
                        classNames={{
                          day_button:
                            'data-[selected-single=true]:bg-main-color data-[selected-single=true]:text-white cursor-pointer ring-0! !focus-visible:ring-0 !focus-visible:ring-offset-0',
                          button_next:
                            'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 transition-all ease-linear duration-200 outline-none focus-visible:border-transparent focus-visible:ring-transparent focus-visible:ring-0 hover:bg-transparent size-8 -mr-2 aria-disabled:opacity-50 p-0 select-none rdp-button_previous cursor-pointer hover:text-main-color',
                          button_previous:
                            'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 transition-all ease-linear duration-200 outline-none focus-visible:border-transparent focus-visible:ring-transparent focus-visible:ring-0 hover:bg-transparent size-8 -ml-2 aria-disabled:opacity-50 p-0 select-none rdp-button_previous cursor-pointer hover:text-main-color'
                        }}
                        locale={calendarLocale}
                        mode='single'
                        selected={date}
                        onSelect={handleDateSelect}
                        initialFocus
                        captionLayout='dropdown'
                        defaultMonth={date ?? new Date()}
                        startMonth={new Date(1900, 0)}
                        endMonth={new Date(2050, 12)}
                        components={{ Dropdown: CustomSelectDropdown }}
                        formatters={{
                          formatMonthDropdown: (date) =>
                            date.toLocaleString('vi-VN', { month: 'long' })
                        }}
                        onMonthChange={(month: Date) => {
                          // Preserve the current day when changing month/year
                          const currentDate = date || new Date();
                          const currentDay = currentDate.getDate();

                          // Get the last day of the new month
                          const lastDayOfNewMonth = new Date(
                            month.getFullYear(),
                            month.getMonth() + 1,
                            0
                          ).getDate();

                          // Use the current day, but clamp it if it exceeds the new month's days
                          const validDay = Math.min(
                            currentDay,
                            lastDayOfNewMonth
                          );

                          const newDate = new Date(
                            month.getFullYear(),
                            month.getMonth(),
                            validDay,
                            currentDate.getHours(),
                            currentDate.getMinutes(),
                            currentDate.getSeconds()
                          );

                          updateFieldValue(newDate);
                        }}
                      />
                      <div className='flex flex-col divide-y sm:h-85 sm:flex-row sm:divide-x sm:divide-y-0'>
                        {/* Hour */}
                        <ScrollArea className='w-64 sm:w-auto'>
                          <div className='flex p-2 sm:flex-col'>
                            {hours.map((h) => (
                              <Button
                                key={h}
                                size='icon'
                                variant={hour === h ? 'primary' : 'ghost'}
                                className='aspect-square shrink-0 sm:w-full'
                                onClick={() => handleTimeChange('hour', h)}
                                ref={(el) => {
                                  if (hour === h && el) {
                                    el.scrollIntoView({
                                      block: 'center',
                                      behavior: 'smooth'
                                    });
                                  }
                                }}
                              >
                                {String(h).padStart(2, '0')}
                              </Button>
                            ))}
                          </div>
                          <ScrollBar
                            orientation='horizontal'
                            className='sm:hidden'
                          />
                        </ScrollArea>
                        {/* Minute */}
                        <ScrollArea className='w-64 sm:w-auto'>
                          <div className='flex p-2 sm:flex-col'>
                            {minutes.map((m) => (
                              <Button
                                key={m}
                                size='icon'
                                variant={minute === m ? 'primary' : 'ghost'}
                                className='aspect-square shrink-0 sm:w-full'
                                onClick={() => handleTimeChange('minute', m)}
                                ref={(el) => {
                                  if (minute === m && el) {
                                    el.scrollIntoView({
                                      block: 'center',
                                      behavior: 'smooth'
                                    });
                                  }
                                }}
                              >
                                {String(m).padStart(2, '0')}
                              </Button>
                            ))}
                          </div>
                          <ScrollBar
                            orientation='horizontal'
                            className='sm:hidden'
                          />
                        </ScrollArea>
                        {/* Second */}
                        <ScrollArea className='w-64 sm:w-auto'>
                          <div className='flex p-2 sm:flex-col'>
                            {seconds.map((s) => (
                              <Button
                                key={s}
                                size='icon'
                                variant={second === s ? 'primary' : 'ghost'}
                                className='aspect-square shrink-0 sm:w-full'
                                onClick={() => handleTimeChange('second', s)}
                                ref={(el) => {
                                  if (second === s && el) {
                                    el.scrollIntoView({
                                      block: 'center',
                                      behavior: 'smooth'
                                    });
                                  }
                                }}
                              >
                                {String(s).padStart(2, '0')}
                              </Button>
                            ))}
                          </div>
                          <ScrollBar
                            orientation='horizontal'
                            className='sm:hidden'
                          />
                        </ScrollArea>
                      </div>
                    </div>
                    <div className='flex justify-center gap-2 border-t pt-2'>
                      {clearable && (
                        <Button
                          size='lg'
                          variant='outline'
                          className='flex-1'
                          onClick={() => {
                            field.onChange('');
                            setOpen(false);
                          }}
                        >
                          Xóa
                        </Button>
                      )}
                      <Button
                        size='lg'
                        variant='primary'
                        className='flex-1'
                        onClick={() => {
                          const now = new Date();
                          updateFieldValue(now);
                          setOpen(false);
                        }}
                      >
                        Hôm nay
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                {description && (
                  <FormDescription>{description}</FormDescription>
                )}
                {fieldState.error && (
                  <div className='animate-in fade-in -mb-6 ml-2 flex min-h-6 items-end'>
                    <FormMessage className='leading-5.5' />
                  </div>
                )}
              </div>
            </FormControl>
          </FormItem>
        );
      }}
    />
  );
}

function CustomSelectDropdown(props: DropdownProps) {
  const { options, value, onChange } = props;

  const handleValueChange = (newValue: string) => {
    if (onChange) {
      const syntheticEvent = {
        target: {
          value: newValue
        }
      } as ChangeEvent<HTMLSelectElement>;
      onChange(syntheticEvent);
    }
  };

  return (
    <Select value={value?.toString()} onValueChange={handleValueChange}>
      <SelectTrigger className='z-9999 cursor-pointer justify-center gap-1!'>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options?.map((option) => (
            <SelectItem
              className='cursor-pointer text-center'
              key={option.value}
              value={option.value.toString()}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
