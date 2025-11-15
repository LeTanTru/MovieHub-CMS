'use client';

import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Control,
  FieldPath,
  FieldValues,
  useController
} from 'react-hook-form';
import { cn } from '@/lib/utils';
import { ReactNode, useState, useEffect } from 'react';
import Button from '@/components/form/button';
import ToolTip from '@/components/form/tooltip';

type NumberFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  description?: string;
  className?: string;
  formItemClassName?: string;
  required?: boolean;
  labelClassName?: string;
  disabled?: boolean;
  readOnly?: boolean;
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
  step?: number;
  min?: number;
  max?: number;
  allowNegative?: boolean;
  delimiter?: string;
  isFloat?: boolean;
};

export default function NumberField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
  className,
  formItemClassName,
  required,
  labelClassName,
  disabled,
  readOnly = false,
  prefixIcon,
  suffixIcon,
  step = 1,
  min,
  max,
  allowNegative = false,
  delimiter = '.',
  isFloat = false
}: NumberFieldProps<T>) {
  const { field, fieldState } = useController({ control, name });

  const [raw, setRaw] = useState<string>(
    field.value !== undefined ? formatNumber(Number(field.value)) : '0'
  );

  useEffect(() => {
    if (field.value !== undefined) {
      setRaw(formatNumber(Number(field.value)));
    } else {
      setRaw('0');
    }
  }, [field.value, isFloat]);

  function formatNumber(value: number) {
    if (isFloat) {
      return value.toString().replace('.', delimiter);
    }
    const intVal = Math.trunc(value);
    return intVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, delimiter);
  }

  function parseNumber(value: string) {
    const normalized = value.replace(new RegExp(`\\${delimiter}`, 'g'), '.');
    const parsed = isFloat
      ? parseFloat(normalized)
      : parseInt(normalized.replace(/\./g, ''), 10);
    return isNaN(parsed) ? undefined : parsed;
  }

  function commit(val: number) {
    let next = val;
    if (!allowNegative && next < 0)
      next = min !== undefined ? Math.max(min, 0) : 0;
    if (min !== undefined && next < min) next = min;
    if (max !== undefined && next > max) next = max;

    field.onChange(next);
    setRaw(formatNumber(next));
  }

  const increment = () => commit((field.value ?? 0) + step);
  const decrement = () => commit((field.value ?? 0) - step);

  return (
    <FormField
      control={control}
      name={name}
      render={() => (
        <FormItem
          className={cn(
            'relative',
            { 'cursor-not-allowed': disabled },
            formItemClassName
          )}
        >
          {label && (
            <FormLabel
              className={cn('ml-2 gap-1.5', labelClassName, {
                'opacity-50 select-none': disabled
              })}
            >
              {label} {required && <span className='text-destructive'>*</span>}
            </FormLabel>
          )}

          <FormControl>
            <div className='relative flex items-center'>
              <div className='relative flex-1'>
                {prefixIcon && (
                  <div className='text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2'>
                    {prefixIcon}
                  </div>
                )}
                <Input
                  placeholder={placeholder}
                  type='text'
                  disabled={disabled}
                  readOnly={readOnly}
                  value={raw}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRaw(val);

                    const parsed = parseNumber(val);
                    if (parsed !== undefined) {
                      field.onChange(parsed);
                    } else if (val === '' || val === '.' || val === '-') {
                      field.onChange(undefined);
                    }
                  }}
                  onBlur={() => {
                    if (field.value !== undefined) {
                      setRaw(formatNumber(field.value));
                    } else {
                      setRaw('0');
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      increment();
                    }
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      decrement();
                    }
                  }}
                  className={cn(
                    className,
                    'pt-0! pb-0 font-normal shadow-none',
                    {
                      'pl-10': prefixIcon,
                      'pr-10': suffixIcon,
                      'cursor-not-allowed border border-solid border-gray-300 bg-gray-200/80 text-gray-500':
                        disabled,
                      'border-red-500 focus-visible:border-red-500 focus-visible:ring-[1px] focus-visible:ring-red-500':
                        fieldState.error,
                      'focus-visible:ring-dodger-blue focus-visible:border-transparent focus-visible:ring-2':
                        !fieldState.error
                    }
                  )}
                />
                {suffixIcon && (
                  <div className='text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2'>
                    {suffixIcon}
                  </div>
                )}
              </div>

              <div className='ml-1 flex flex-col gap-1'>
                <ToolTip title='Tăng'>
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    onClick={increment}
                    disabled={
                      disabled ||
                      (max !== undefined && (field.value ?? 0) >= max)
                    }
                    className='h-4 w-4 rounded'
                  >
                    +
                  </Button>
                </ToolTip>
                <ToolTip title='Giảm'>
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    onClick={decrement}
                    disabled={
                      disabled ||
                      (min !== undefined && (field.value ?? 0) <= min)
                    }
                    className='h-4 w-4 rounded'
                  >
                    –
                  </Button>
                </ToolTip>
              </div>
            </div>
          </FormControl>

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
