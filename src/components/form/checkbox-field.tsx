'use client';

import { Control } from 'react-hook-form';
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

type CheckboxFieldProps = {
  control: Control<any>;
  name: string;
  label: string | React.ReactNode;
  description?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  labelClassName?: string;
  itemClassName?: string;
  checkboxClassName?: string;
};

export default function CheckboxField({
  control,
  name,
  label,
  description,
  className,
  disabled,
  required,
  labelClassName,
  itemClassName,
  checkboxClassName
}: CheckboxFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn('relative flex flex-col space-y-1', className)}>
          <div className={cn('flex items-center space-x-2', itemClassName)}>
            <FormControl>
              <Checkbox
                id={field.name}
                className={cn(
                  'cursor-pointer transition-colors duration-300 ease-in-out',
                  'data-[state=checked]:bg-primary',
                  'data-[state=unchecked]:bg-muted',
                  disabled && 'cursor-not-allowed',
                  checkboxClassName
                )}
                checked={!!field.value}
                onCheckedChange={field.onChange}
                disabled={disabled}
              />
            </FormControl>
            <FormLabel
              htmlFor={field.name}
              className={cn(
                disabled && 'text-muted-foreground',
                'cursor-pointer gap-1',
                labelClassName
              )}
            >
              {label}
              {required && <span className='text-destructive'>*</span>}
            </FormLabel>
          </div>
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
