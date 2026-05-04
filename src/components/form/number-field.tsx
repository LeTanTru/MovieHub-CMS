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
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { type ComponentPropsWithoutRef, type ReactNode, type Ref } from 'react';

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
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
  isFloat?: boolean;
  format?: boolean;
  ref?: Ref<HTMLInputElement>;
} & Omit<ComponentPropsWithoutRef<'input'>, 'name' | 'defaultValue'>;

const toNumberIfPossible = (value: string): string | number => {
  const num = Number(value);
  return !isNaN(num) && value.trim() !== '' ? num : value;
};

const formatNumberWithSeparator = (
  value: string | number,
  isFloat: boolean
): string => {
  if (value === '' || value === undefined || value === null) return '';

  const stringValue = String(value);
  const normalized = stringValue.replace(',', '.');
  const parts = normalized.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  if (decimalPart !== undefined && isFloat) {
    return `${formattedInteger},${decimalPart}`;
  }

  return formattedInteger;
};

const parseFormattedNumber = (value: string): string => {
  return value.replace(/\./g, '').replace(',', '.');
};

function NumberField<T extends FieldValues>({
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
  min,
  isFloat = false,
  format = false,
  ref,
  ...inputProps
}: NumberFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
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
            <div className='relative'>
              <Input
                placeholder={placeholder}
                type='number'
                inputMode={isFloat ? 'decimal' : 'numeric'}
                disabled={disabled}
                readOnly={readOnly}
                {...inputProps}
                min={min}
                value={
                  format
                    ? formatNumberWithSeparator(field.value, isFloat)
                    : field.value
                }
                ref={ref}
                className={cn(
                  className,
                  'text-sm font-normal shadow-none transition-all duration-200 ease-linear placeholder:text-gray-300 focus-visible:border-transparent focus-visible:ring-2 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-50 disabled:select-none',
                  {
                    'pl-10': prefixIcon,
                    'pr-10': suffixIcon,
                    'border-rose-500 focus-visible:ring-rose-500':
                      !!fieldState.error,
                    'focus-visible:ring-main-color': !fieldState.error
                  }
                )}
                onChange={(e) => {
                  const raw = e.target.value;

                  if (raw === '') {
                    field.onChange(
                      min !== undefined && !isNaN(Number(min))
                        ? Number(min)
                        : ''
                    );
                    return;
                  }

                  const allowedChars = isFloat ? /[0-9.,]/g : /[0-9.]/g;
                  const filtered = raw.match(allowedChars)?.join('') || '';

                  if (isFloat && (filtered.match(/,/g) || []).length > 1) {
                    return;
                  }

                  const parsed = parseFormattedNumber(filtered);

                  if (parsed && !isNaN(Number(parsed))) {
                    const stripped = parsed.replace(/^0+(?=\d)/, '');
                    field.onChange(toNumberIfPossible(stripped));
                  }
                }}
              />
              {description && <FormDescription>{description}</FormDescription>}
              {fieldState.error && (
                <div className='animate-in fade-in -mb-6 ml-2 flex min-h-6 items-end'>
                  <FormMessage className='leading-5.5' />
                </div>
              )}
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
}

export default NumberField;
