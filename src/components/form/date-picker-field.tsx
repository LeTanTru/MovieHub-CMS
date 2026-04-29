'use client';

import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/form';
import { useState, useRef, ChangeEvent } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { DropdownProps } from 'react-day-picker';
import { DATE_FORMAT } from '@/constants';
import { vi } from 'date-fns/locale';
import { format, parse, isValid, Locale } from 'date-fns';

type DatePickerFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  description?: string;
  className?: string;
  formItemClassName?: string;
  format?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  labelClassName?: string;
  clearable?: boolean;
};

export default function DatePickerField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  formItemClassName,
  format: dateFormat = DATE_FORMAT,
  disabled,
  required,
  placeholder,
  labelClassName,
  clearable = true
}: DatePickerFieldProps<T>) {
  const calendarLocale: Locale = vi;
  const [open, setOpen] = useState<boolean>(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const parseDate = (value: string) => {
    if (!value) return undefined;
    const parsed = parse(value, DATE_FORMAT, new Date(), {
      locale: vi
    });
    return isValid(parsed) ? parsed : new Date(value);
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const parsedValue = parseDate(field.value);
        const hasValue = !!field.value;

        const handleClear = (
          e:
            | React.MouseEvent<HTMLSpanElement>
            | React.KeyboardEvent<HTMLSpanElement>
        ) => {
          e.stopPropagation();
          field.onChange('');
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
                className={cn(
                  'ml-2',
                  { 'cursor-not-allowed opacity-50': disabled },
                  labelClassName
                )}
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
                      ref={triggerRef}
                      disabled={disabled}
                      variant='outline'
                      role='combobox'
                      aria-controls='combobox'
                      aria-expanded={field.value ? 'true' : 'false'}
                      aria-label='Select date'
                      className={cn(
                        'hover:border-input focus-visible:border-input focus-visible:ring-main-color w-full justify-between border px-3! py-0 text-black hover:text-black focus-visible:border-transparent focus-visible:ring-2 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-50 disabled:select-none',
                        {
                          'ring-main-color border-transparent! ring-2': open,
                          '[&>div>span]:text-gray-300': fieldState.invalid,
                          'border-red-500 ring-red-500': !!fieldState.error
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
                      <span className={cn('flex items-center gap-1')}>
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
                          className={cn('h-4 w-4', { 'opacity-50': disabled })}
                        />
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className='w-90 p-2'
                    align='center'
                    sideOffset={8}
                  >
                    <Calendar
                      locale={calendarLocale}
                      className='w-full p-0'
                      mode='single'
                      selected={parsedValue}
                      onSelect={(date) => {
                        if (date) {
                          field.onChange(format(date, dateFormat));
                          setOpen(false);
                        }
                      }}
                      classNames={{
                        day_button:
                          'data-[selected-single=true]:bg-main-color data-[selected-single=true]:text-white cursor-pointer ring-0! !focus-visible:ring-0 !focus-visible:ring-offset-0',
                        button_next:
                          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 transition-all ease-linear duration-200 outline-none focus-visible:border-transparent focus-visible:ring-transparent focus-visible:ring-0 hover:bg-transparent size-8 -mr-2 aria-disabled:opacity-50 p-0 select-none rdp-button_previous cursor-pointer hover:text-main-color',
                        button_previous:
                          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 transition-all ease-linear duration-200 outline-none focus-visible:border-transparent focus-visible:ring-transparent focus-visible:ring-0 hover:bg-transparent size-8 -ml-2 aria-disabled:opacity-50 p-0 select-none rdp-button_previous cursor-pointer hover:text-main-color'
                      }}
                      captionLayout='dropdown'
                      defaultMonth={parsedValue ?? new Date()}
                      startMonth={new Date(1900, 0)}
                      endMonth={new Date(new Date().getFullYear(), 12)}
                      components={{ Dropdown: CustomSelectDropdown }}
                      formatters={{
                        formatMonthDropdown: (date) =>
                          date.toLocaleString('vi-VN', { month: 'long' })
                      }}
                      onMonthChange={(month: Date) => {
                        // Preserve the current day when changing month/year
                        const currentDate = parsedValue || new Date();
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
                          validDay
                        );

                        field.onChange(format(newDate, dateFormat));
                      }}
                    />
                    <div className='flex justify-center gap-2 border-t pt-2'>
                      <Button
                        type='button'
                        variant='outline'
                        className='flex-1'
                        onClick={() => {
                          const today = new Date();
                          field.onChange(format(today, dateFormat));
                          setOpen(false);
                        }}
                      >
                        Hôm nay
                      </Button>
                      {clearable && (
                        <Button
                          type='button'
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
