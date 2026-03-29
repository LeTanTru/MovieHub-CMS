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
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type CheckboxFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string | ReactNode;
  description?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  labelClassName?: string;
  checkboxClassName?: string;
};

export default function CheckboxField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  disabled,
  required,
  labelClassName,
  checkboxClassName
}: CheckboxFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn(className)}>
          <FormControl>
            <div>
              <div className='flex items-center gap-2'>
                <Checkbox
                  id={field.name}
                  className={cn(
                    'cursor-pointer transition-colors duration-300 ease-in-out focus-visible:ring-0',
                    'data-[state=checked]:bg-main-color data-[state=checked]:border-main-color',
                    'data-[state=unchecked]:bg-muted focus-visible:ring-main-color focus-visible:border-transparent focus-visible:ring-2',
                    disabled && 'cursor-not-allowed',
                    checkboxClassName
                  )}
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                />
                <FormLabel
                  htmlFor={field.name}
                  className={cn(
                    disabled && 'text-muted-foreground',
                    'cursor-pointer',
                    labelClassName
                  )}
                >
                  {label}
                  {required && <span className='text-destructive'>*</span>}
                </FormLabel>
              </div>
              {description && <FormDescription>{description}</FormDescription>}
              {fieldState.error && (
                <div className='animate-in fade-in -mb-6 ml-6 flex min-h-6 items-end'>
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
