'use client';

import {
  useId,
  type ReactNode,
  type TextareaHTMLAttributes,
  type Ref
} from 'react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import {
  type Control,
  type FieldPath,
  type FieldValues,
  useWatch
} from 'react-hook-form';
import { cn } from '@/lib/utils';

type TextAreaFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string | ReactNode;
  placeholder?: string;
  className?: string;
  labelClassName?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  rows?: number;
  maxRows?: number;
  ref?: Ref<HTMLTextAreaElement>;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

const TextAreaField = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder = '',
  className,
  labelClassName,
  required = false,
  disabled = false,
  readOnly = false,
  maxLength,
  rows = 8,
  ref,
  ...rest
}: TextAreaFieldProps<T>) => {
  const id = useId();

  const fieldValue = useWatch({ control, name });
  const charCount = String(fieldValue || '').length;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className='relative'>
          <div className='relative'>
            {label && (
              <FormLabel
                htmlFor={id}
                className={cn('mb-2 ml-2', labelClassName)}
              >
                {label}
                {required && <span className='text-destructive'>*</span>}
              </FormLabel>
            )}

            <FormControl>
              <div>
                <Textarea
                  id={id}
                  placeholder={placeholder}
                  disabled={disabled}
                  readOnly={readOnly}
                  maxLength={maxLength}
                  rows={rows}
                  className={cn(
                    'focus-visible:ring-main-color scrollbar-none field-sizing-fixed w-full pt-4 break-all shadow-none transition-all duration-200 ease-linear placeholder:text-gray-300 focus-visible:border-transparent focus-visible:ring-2 aria-invalid:ring-transparent',
                    {
                      'border-red-500 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-red-500':
                        !!fieldState.error
                    },
                    className
                  )}
                  {...field}
                  {...rest}
                  ref={ref}
                  onChange={(e) => {
                    field.onChange(e);
                    rest.onChange?.(e);
                  }}
                />
                {maxLength && (
                  <div className='text-muted-foreground absolute top-1 right-1.5 text-xs leading-none'>
                    {charCount}/{maxLength}
                  </div>
                )}
                {fieldState.error && (
                  <div className='animate-in fade-in -mb-6 ml-2 flex min-h-6 items-end'>
                    <FormMessage className='leading-5.5' />
                  </div>
                )}
              </div>
            </FormControl>
          </div>
        </FormItem>
      )}
    />
  );
};

export default TextAreaField;
