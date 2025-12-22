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
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { ComponentPropsWithoutRef, ReactNode, forwardRef } from 'react';

type InputFieldProps<T extends FieldValues> = {
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

const InputField = forwardRef<HTMLInputElement, InputFieldProps<any>>(
  <T extends FieldValues>(
    {
      control,
      name,
      label,
      placeholder,
      description,
      type = 'text',
      className,
      formItemClassName,
      required,
      labelClassName,
      disabled,
      readOnly = false,
      prefixIcon,
      suffixIcon,
      ...inputProps
    }: InputFieldProps<T>,
    ref: React.ForwardedRef<HTMLInputElement>
  ) => {
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
                className={cn('ml-2 gap-1.5', labelClassName, {
                  'opacity-50 select-none': disabled
                })}
              >
                {label}
                {required && <span className='text-destructive'>*</span>}
              </FormLabel>
            )}
            <FormControl>
              <div className='relative'>
                {prefixIcon && (
                  <div className='text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2'>
                    {prefixIcon}
                  </div>
                )}
                <Input
                  placeholder={placeholder}
                  type={type}
                  disabled={disabled}
                  readOnly={readOnly}
                  {...field}
                  {...inputProps}
                  ref={ref}
                  className={cn(
                    className,
                    'pt-0! font-normal shadow-none placeholder:text-gray-300 focus-visible:border-transparent focus-visible:ring-2',
                    {
                      'pl-10': prefixIcon,
                      'pr-10': suffixIcon,
                      'cursor-not-allowed border border-solid border-gray-300 bg-gray-200/50 text-gray-500':
                        disabled,
                      'border-red-500 focus-visible:border-red-500 focus-visible:ring-[1px] focus-visible:ring-red-500':
                        fieldState.error,
                      'pb-0': !field.value
                    },
                    !fieldState.error &&
                      'focus-visible:ring-dodger-blue focus-visible:border-transparent'
                  )}
                />
                {suffixIcon && (
                  <div className='text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2'>
                    {suffixIcon}
                  </div>
                )}
                {fieldState.error && (
                  <div className='animate-in fade-in absolute -bottom-6 left-2 z-0 mt-1 text-sm text-red-500'>
                    <FormMessage />
                  </div>
                )}
              </div>
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
          </FormItem>
        )}
      />
    );
  }
);

InputField.displayName = 'InputField';

export default InputField;
