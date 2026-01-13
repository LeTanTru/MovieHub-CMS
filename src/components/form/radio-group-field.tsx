'use client';

import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib';

export type Option = {
  value: string;
  label: string;
};

type RadioGroupFieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  options: Option[];
  direction?: 'row' | 'col';
  required?: boolean;
  className?: string;
  radioGroupClassName?: string;
  itemClassName?: string;
  labelClassName?: string;
};

export default function RadioGroupField<T extends FieldValues>({
  name,
  control,
  label,
  options,
  direction = 'col',
  required,
  className,
  radioGroupClassName,
  itemClassName,
  labelClassName
}: RadioGroupFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className='relative space-y-3'>
          {label && (
            <FormLabel className={cn('ml-1 gap-2', labelClassName)}>
              {label}
              {required && <span className='text-destructive'>*</span>}
            </FormLabel>
          )}
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className={cn(`flex flex-${direction} gap-3`, className)}
            >
              {options.map((option) => (
                <FormItem
                  key={option.value}
                  className={cn(
                    'flex items-center gap-3 space-y-0',
                    radioGroupClassName
                  )}
                >
                  <FormControl>
                    <RadioGroupItem
                      className={cn(
                        'linear transition-all duration-200 data-[state=checked]:bg-blue-600!',
                        itemClassName
                      )}
                      value={option.value}
                    />
                  </FormControl>
                  <FormLabel className='cursor-pointer font-normal'>
                    {option.label}
                  </FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
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
