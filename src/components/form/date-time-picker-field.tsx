'use client';

import * as React from 'react';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format, isValid, Locale, parse } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel
} from '@/components/ui/form';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Control, Controller } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Button } from '@/components/form';
import { vi } from 'date-fns/locale';
import { DropdownProps } from 'react-day-picker';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { DATE_TIME_FORMAT } from '@/constants';

type Props = {
  control: Control<any>;
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  format?: string;
  labelClassName?: string;
  disabled?: boolean;
  placeholder?: string;
};

export default function DateTimePickerField({
  control,
  name,
  label,
  description,
  required,
  format: dateFormat = DATE_TIME_FORMAT,
  labelClassName,
  disabled,
  placeholder
}: Props) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const seconds = Array.from({ length: 60 }, (_, i) => i);
  const [isOpen, setIsOpen] = React.useState(false);
  const calendarLocale: Locale = vi;

  const parseDate = (value: string) => {
    if (!value) return undefined;
    const parsed = parse(value, DATE_TIME_FORMAT, new Date(), { locale: vi });
    return isValid(parsed) ? parsed : new Date(value);
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const date = parseDate(field.value);

        const updateFieldValue = (d: Date) => {
          field.onChange(format(d, dateFormat));
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
          <FormItem className='relative'>
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
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    disabled={disabled}
                    variant='outline'
                    className={cn(
                      'w-full justify-between text-left font-normal text-black opacity-100',
                      'focus:ring-0 focus-visible:border-gray-200 focus-visible:ring-0',
                      'data-[state=open]:border-dodger-blue data-[state=open]:ring-dodger-blue shadow-none data-[state=open]:ring-1',
                      {
                        'border-red-500 focus-visible:border-red-500 focus-visible:ring-[1px] focus-visible:ring-red-500 data-[state=open]:border-red-500 data-[state=open]:ring-1 data-[state=open]:ring-red-500':
                          fieldState.error,
                        'text-gray-300': !field.value
                      }
                    )}
                  >
                    <span suppressHydrationWarning>
                      {(() => {
                        const parsed = parseDate(field.value);
                        return parsed && !isNaN(parsed.getTime())
                          ? format(parsed, dateFormat)
                          : (placeholder ?? 'Chọn ngày');
                      })()}
                    </span>
                    <CalendarIcon className='mr-2 h-4 w-4' />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className='w-120 p-0'>
                <div className='sm:flex'>
                  <Calendar
                    className='flex-1'
                    classNames={{
                      day_button:
                        'data-[selected-single=true]:bg-dodger-blue data-[selected-single=true]:text-white cursor-pointer ring-0! !focus-visible:ring-0 !focus-visible:ring-offset-0',
                      button_next:
                        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 transition-all ease-linear duration-200 outline-none focus-visible:border-transparent focus-visible:ring-transparent focus-visible:ring-0 hover:bg-transparent size-8 -mr-2 aria-disabled:opacity-50 p-0 select-none rdp-button_previous cursor-pointer hover:text-dodger-blue',
                      button_previous:
                        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 transition-all ease-linear duration-200 outline-none focus-visible:border-transparent focus-visible:ring-transparent focus-visible:ring-0 hover:bg-transparent size-8 -ml-2 aria-disabled:opacity-50 p-0 select-none rdp-button_previous cursor-pointer hover:text-dodger-blue'
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
                      const firstDay = new Date(
                        month.getFullYear(),
                        month.getMonth(),
                        1
                      );
                      updateFieldValue(firstDay);
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
                <div className='flex justify-end border-t p-2'>
                  <Button
                    size='lg'
                    variant='primary'
                    className='mx-auto'
                    onClick={() => {
                      const now = new Date();
                      updateFieldValue(now);
                      setIsOpen(false);
                    }}
                  >
                    Hôm nay
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            {description && <FormDescription>{description}</FormDescription>}
            {fieldState.error && (
              <div className='animate-in fade-in absolute -bottom-6 left-2 z-0 mt-1 text-sm text-red-500'>
                {fieldState.error.message}
              </div>
            )}
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
      } as React.ChangeEvent<HTMLSelectElement>;
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
