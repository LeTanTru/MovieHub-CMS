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

export type Option = {
  label: string;
  value: string;
};

type CheckboxGroupFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  description?: string;
  options?: Option[];
  className?: string;
  disabled?: boolean;
  required?: boolean;
  labelClassName?: string;
  itemClassName?: string;
};

export default function CheckboxGroupField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  options,
  className,
  disabled,
  required,
  labelClassName,
  itemClassName
}: CheckboxGroupFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        return (
          <FormItem className={cn('relative space-y-2', className)}>
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
            <div className='flex flex-wrap gap-4'>
              {(options || field.value).map((option) => {
                const isChecked = field.value?.includes(option.value);
                return (
                  <FormItem
                    key={option.value}
                    className={cn(
                      'flex items-center space-y-0 space-x-1',
                      itemClassName
                    )}
                  >
                    <FormControl>
                      <Checkbox
                        className={cn(
                          'cursor-pointer transition-colors duration-300 ease-in-out',
                          'data-[state=checked]:bg-primary',
                          'data-[state=unchecked]:bg-muted',
                          disabled && 'cursor-not-allowed opacity-50'
                        )}
                        checked={isChecked}
                        disabled={disabled}
                        onCheckedChange={(checked) => {
                          const newValue = checked
                            ? [...(field.value || []), option.value]
                            : field.value?.filter(
                                (v: string) => v !== option.value
                              );
                          field.onChange(newValue);
                        }}
                      />
                    </FormControl>
                    <FormLabel
                      htmlFor={`${name}-${option.value}`}
                      className={cn(
                        'cursor-pointer font-normal',
                        disabled && 'text-muted-foreground'
                      )}
                    >
                      {option.label}
                    </FormLabel>
                  </FormItem>
                );
              })}
            </div>
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
