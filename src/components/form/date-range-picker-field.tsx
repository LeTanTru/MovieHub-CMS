'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { CalendarIcon } from '@radix-ui/react-icons';
import { Calendar } from '@/components/ui/calendar';
import { format, Locale } from 'date-fns';
import { cn } from '@/lib/utils';
import { Control, Controller } from 'react-hook-form';
import { vi } from 'date-fns/locale';
import { Button } from '@/components/form';

type Props = {
  control: Control<any>;
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  className?: string;
  format?: string;
  labelClassName?: string;
  disabled?: boolean;
};

export default function DateRangePickerField({
  control,
  name,
  label,
  description,
  required,
  className,
  format: dateFormat = 'dd/MM/yyyy',
  labelClassName,
  disabled
}: Props) {
  const calendarLocale: Locale = vi;
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormItem className={cn('relative flex flex-col', className)}>
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
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  disabled={disabled}
                  variant='outline'
                  className={cn(
                    'w-full justify-between text-left font-normal shadow-none',
                    !field.value && 'text-muted-foreground',
                    {
                      'border-red-500 focus-visible:border-red-500 focus-visible:ring-[1px] focus-visible:ring-red-500 data-[state=open]:border-red-500 data-[state=open]:ring-1 data-[state=open]:ring-red-500':
                        fieldState.error
                    }
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
                  <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='start'>
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
            <div className='animate-in fade-in absolute -bottom-6 left-2 z-0 mt-1 text-sm text-red-500'>
              <FormMessage />
            </div>
          )}
        </FormItem>
      )}
    />
  );
}
