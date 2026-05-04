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
import { OptionType } from '@/types';

type RadioGroupFieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  options: OptionType[];
  direction?: 'row' | 'col';
  required?: boolean;
  className?: string;
  radioGroupClassName?: string;
  itemClassName?: string;
  labelClassName?: string;
  formItemClassName?: string;
  disabled?: boolean;
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
  labelClassName,
  formItemClassName,
  disabled
}: RadioGroupFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem
          className={cn(
            'relative space-y-3',
            {
              'cursor-not-allowed select-none': disabled
            },
            formItemClassName
          )}
        >
          {label && (
            <FormLabel
              className={cn('ml-2', labelClassName, {
                'pointer-events-none opacity-50 select-none': disabled
              })}
            >
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
                        'linear transition-all duration-200 data-[state=checked]:bg-sky-600!',
                        {
                          'pointer-events-none cursor-not-allowed opacity-50 select-none':
                            disabled
                        },
                        itemClassName
                      )}
                      value={String(option.value)}
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
            <div className='animate-in fade-in -mb-6 ml-2 flex min-h-6 items-end'>
              <FormMessage className='leading-5.5' />
            </div>
          )}
        </FormItem>
      )}
    />
  );
}
