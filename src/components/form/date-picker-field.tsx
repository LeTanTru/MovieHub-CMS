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
import { CalendarIcon } from 'lucide-react';
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
import { DropdownProps } from 'react-day-picker/';
import { DEFAULT_DATE_FORMAT } from '@/constants';
import { vi } from 'date-fns/locale';
import { format, parse, isValid, Locale } from 'date-fns';

type DatePickerFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  description?: string;
  className?: string;
  format?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  labelClassName?: string;
};

export default function DatePickerField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  format: dateFormat = DEFAULT_DATE_FORMAT,
  disabled,
  required,
  placeholder,
  labelClassName
}: DatePickerFieldProps<T>) {
  const calendarLocale: Locale = vi;
  const [open, setOpen] = useState(false);
  // const [popoverWidth, setPopoverWidth] = useState<number | undefined>();
  const triggerRef = useRef<HTMLButtonElement>(null);

  // useEffect(() => {
  //   if (triggerRef.current) {
  //     setPopoverWidth(triggerRef.current.offsetWidth);
  //   }
  // }, [open]);

  const parseDate = (value: string) => {
    if (!value) return undefined;
    const parsed = parse(value, DEFAULT_DATE_FORMAT, new Date(), {
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
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    ref={triggerRef}
                    variant='outline'
                    className={cn(
                      'w-full justify-between text-left font-normal text-black opacity-100',
                      'focus:ring-0 focus-visible:border-gray-200 focus-visible:ring-0',
                      'data-[state=open]:border-dodger-blue data-[state=open]:ring-dodger-blue px-3! shadow-none data-[state=open]:ring-1',
                      !field.value && 'text-gray-300',
                      {
                        'border-red-500 focus-visible:border-red-500 focus-visible:ring-[1px] focus-visible:ring-red-500 data-[state=open]:border-red-500 data-[state=open]:ring-1 data-[state=open]:ring-red-500':
                          fieldState.error
                      }
                    )}
                    disabled={disabled}
                  >
                    <span suppressHydrationWarning>
                      {(() => {
                        const parsed = parseDate(field.value);
                        return parsed && !isNaN(parsed.getTime())
                          ? format(parsed, dateFormat)
                          : (placeholder ?? 'Chọn ngày');
                      })()}
                    </span>
                    <CalendarIcon className='mr-1 h-4 w-4' />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent
                className='w-90 origin-top space-y-2 p-4'
                align='center'
              >
                <Calendar
                  locale={calendarLocale}
                  className='w-full'
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
                      'data-[selected-single=true]:bg-dodger-blue data-[selected-single=true]:text-white cursor-pointer ring-0! !focus-visible:ring-0 !focus-visible:ring-offset-0',
                    button_next:
                      'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 transition-all ease-linear duration-200 outline-none focus-visible:border-transparent focus-visible:ring-transparent focus-visible:ring-0 hover:bg-transparent size-8 -mr-2 aria-disabled:opacity-50 p-0 select-none rdp-button_previous cursor-pointer hover:text-dodger-blue',
                    button_previous:
                      'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 transition-all ease-linear duration-200 outline-none focus-visible:border-transparent focus-visible:ring-transparent focus-visible:ring-0 hover:bg-transparent size-8 -ml-2 aria-disabled:opacity-50 p-0 select-none rdp-button_previous cursor-pointer hover:text-dodger-blue'
                  }}
                  captionLayout='dropdown'
                  defaultMonth={parsedValue ?? new Date()}
                  startMonth={new Date(1700, 0)}
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
                    field.onChange(format(firstDay, dateFormat));
                  }}
                />
                <Button
                  type='button'
                  variant='outline'
                  className='w-full'
                  onClick={() => {
                    const today = new Date();
                    field.onChange(format(today, dateFormat));
                    setOpen(false);
                  }}
                >
                  Hôm nay
                </Button>
              </PopoverContent>
            </Popover>
            {description && <FormDescription>{description}</FormDescription>}
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
