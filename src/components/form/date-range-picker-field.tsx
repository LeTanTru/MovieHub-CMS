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
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { Button } from '@/components/form';
import { CalendarIcon } from 'lucide-react';
import { format, Locale } from 'date-fns';
import { vi } from 'date-fns/locale';

type DateRangePickerFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  description?: string;
  required?: boolean;
  className?: string;
  formItemClassName?: string;
  format?: string;
  labelClassName?: string;
  disabled?: boolean;
};

export const DateRangePickerField = <T extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  className,
  formItemClassName,
  format: dateFormat = 'dd/MM/yyyy',
  labelClassName,
  disabled
}: DateRangePickerFieldProps<T>) => {
  const calendarLocale: Locale = vi;
  return (
    <FormField
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormItem
          className={cn(
            'relative flex flex-col',
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  disabled={disabled}
                  variant='outline'
                  role='combobox'
                  aria-controls='combobox'
                  aria-expanded={field.value ? 'true' : 'false'}
                  aria-label='Select date range'
                  className={cn(
                    'w-full justify-between text-left font-normal text-black opacity-100',
                    'focus:ring-0 focus-visible:border-gray-200 focus-visible:ring-0',
                    'data-[state=open]:border-main-color data-[state=open]:ring-main-color hover:border-input px-3! shadow-none hover:text-black data-[state=open]:ring-1',
                    {
                      'text-gray-300 hover:text-gray-300': !field.value,
                      'border-rose-500 hover:border-rose-500 focus-visible:border-rose-500 focus-visible:ring-[1px] focus-visible:ring-rose-500 data-[state=open]:border-rose-500 data-[state=open]:ring-1 data-[state=open]:ring-rose-500':
                        fieldState.error
                    },
                    className
                  )}
                >
                  {field.value?.from ? (
                    field.value.to ? (
                      <>
                        {format(field.value.from, dateFormat)} -{' '}
                        {format(field.value.to, dateFormat)}
                      </>
                    ) : (
                      format(field.value.from, dateFormat)
                    )
                  ) : (
                    <span>Chọn khoảng thời gian</span>
                  )}
                  <CalendarIcon
                    className={cn({
                      'text-gray-300': !field.value && !disabled,
                      'opacity-50': disabled
                    })}
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                sideOffset={8}
                className='w-auto p-0'
                align='start'
              >
                <Calendar
                  initialFocus
                  locale={calendarLocale}
                  mode='range'
                  defaultMonth={field.value?.from}
                  selected={field.value}
                  onSelect={field.onChange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            {description && <FormDescription>{description}</FormDescription>}
            {fieldState.error && (
              <div className='animate-in fade-in -mb-6 ml-2 flex min-h-6 items-end'>
                <FormMessage className='leading-5.5' />
              </div>
            )}
          </FormControl>
        </FormItem>
      )}
    />
  );
};
