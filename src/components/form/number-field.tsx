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
import {
  type ComponentPropsWithoutRef,
  type ForwardedRef,
  type ReactNode,
  forwardRef,
  useRef
} from 'react';

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

  // Handle decimal separator (replace comma with dot for internal processing)
  const normalized = stringValue.replace(',', '.');

  // Split into integer and decimal parts
  const parts = normalized.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  // Format integer part with thousand separators (dot)
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  // Return with decimal part if exists and isFloat is true
  if (decimalPart !== undefined && isFloat) {
    return `${formattedInteger},${decimalPart}`;
  }

  return formattedInteger;
};

const parseFormattedNumber = (value: string): string => {
  // Remove thousand separators (dots) and replace decimal comma with dot
  return value.replace(/\./g, '').replace(',', '.');
};

function NumberFieldInner<T extends FieldValues>(
  {
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
    ...inputProps
  }: NumberFieldProps<T>,
  ref: ForwardedRef<HTMLInputElement>
) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem
          className={cn(
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
            <div className='relative' ref={containerRef}>
              <Input
                placeholder={placeholder}
                type='text'
                inputMode={isFloat ? 'decimal' : 'numeric'}
                disabled={disabled}
                readOnly={readOnly}
                {...inputProps}
                min={min}
                value={formatNumberWithSeparator(field.value, isFloat)}
                ref={ref}
                className={cn(
                  className,
                  'text-sm font-normal shadow-none transition-all duration-200 ease-linear placeholder:text-gray-300 focus-visible:border-transparent focus-visible:ring-2',
                  {
                    'pl-10': prefixIcon,
                    'pr-10': suffixIcon,
                    'cursor-not-allowed border border-solid border-gray-300 bg-gray-200/50 text-gray-500 dark:border-zinc-500/50':
                      disabled,
                    'border-red-500 focus-visible:ring-red-500':
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

                  // Allow only numbers, dots (thousand separator), and comma (decimal separator if isFloat)
                  const allowedChars = isFloat ? /[0-9.,]/g : /[0-9.]/g;
                  const filtered = raw.match(allowedChars)?.join('') || '';

                  // Prevent multiple commas
                  if (isFloat && (filtered.match(/,/g) || []).length > 1) {
                    return;
                  }

                  // Parse the formatted number back to a clean number string
                  const parsed = parseFormattedNumber(filtered);

                  // Validate it's a valid number
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

const NumberField = forwardRef(NumberFieldInner) as <T extends FieldValues>(
  props: NumberFieldProps<T> & { ref?: ForwardedRef<HTMLInputElement> }
) => ReturnType<typeof NumberFieldInner>;

export default NumberField;
