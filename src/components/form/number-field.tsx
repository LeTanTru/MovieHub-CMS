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
} & Omit<ComponentPropsWithoutRef<'input'>, 'name' | 'defaultValue'>;

const toNumberIfPossible = (value: string): string | number => {
  const num = Number(value);
  return !isNaN(num) && value.trim() !== '' ? num : value;
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
                type='number'
                inputMode='numeric'
                disabled={disabled}
                readOnly={readOnly}
                {...field}
                {...inputProps}
                min={min}
                value={
                  field.value !== undefined && field.value !== ''
                    ? String(field.value).replace(/^0+(?=\d)/, '')
                    : ''
                }
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
                  const stripped = raw.replace(/^0+(?=\d)/, '');
                  field.onChange(toNumberIfPossible(stripped));
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
