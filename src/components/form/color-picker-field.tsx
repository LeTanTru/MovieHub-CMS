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
import { cn } from '@/lib';

type ColorPickerFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  labelClassName?: string;
  formItemClassName?: string;
};

export default function ColorPickerField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  disabled,
  required,
  labelClassName,
  formItemClassName
}: ColorPickerFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
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
                  {
                    'cursor-not-allowed opacity-50 select-none': disabled
                  },
                  labelClassName
                )}
              >
                {label}
                {required && <span className='text-destructive'>*</span>}
              </FormLabel>
            )}
            <div className='flex items-center space-x-4'>
              <FormControl>
                <input
                  type='color'
                  value={field.value || '#000000'}
                  onChange={field.onChange}
                  disabled={disabled}
                  className={cn(
                    'border-input bg-background focus-visible:ring-main-color h-10 w-10 cursor-pointer rounded border p-0 transition-all duration-200 ease-linear focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:select-none',
                    className
                  )}
                />
              </FormControl>
              <span className='bg-muted rounded border px-2 py-1 text-sm'>
                {field.value}
              </span>
            </div>
            {description && <FormDescription>{description}</FormDescription>}
            {fieldState.error && (
              <div className='animate-in fade-in -mb-6 ml-2 flex min-h-6 items-end'>
                <FormMessage className='leading-5.5' />
              </div>
            )}
          </FormItem>
        );
      }}
    />
  );
}
