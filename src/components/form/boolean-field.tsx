'use client';

import { Check, X } from 'lucide-react';
import { useId } from 'react';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib';

type BooleanFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  required?: boolean;
  labelClassName?: string;
  className?: string;
  disabled?: boolean;
};

export default function BooleanField<T extends FieldValues>({
  control,
  name,
  label,
  required,
  className,
  labelClassName,
  disabled
}: BooleanFieldProps<T>) {
  const id = useId();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn('flex h-full items-center space-x-2', className)}
        >
          {label && (
            <FormLabel
              htmlFor={id}
              className={cn('ml-2 cursor-pointer gap-1.5', labelClassName, {
                'opacity-50 select-none': disabled
              })}
            >
              {label}
              {required && <span className='text-destructive'>*</span>}
            </FormLabel>
          )}

          <FormControl>
            <div className='relative inline-grid h-6 w-12.5 grid-cols-[1fr_1fr] items-center text-sm font-medium'>
              <Switch
                id={id}
                disabled={disabled}
                checked={field.value}
                onCheckedChange={field.onChange}
                className='peer data-[state=checked]:bg-dodger-blue absolute inset-0 h-[inherit] w-auto cursor-pointer data-[state=unchecked]:bg-gray-300 [&_span]:z-10 [&_span]:size-5.5 [&_span]:transition-transform [&_span]:duration-300 [&_span]:ease-[cubic-bezier(0.16,1,0.3,1)] [&_span]:data-[state=checked]:translate-x-[calc(100%+7px)] [&_span]:data-[state=checked]:rtl:-translate-x-full'
              />
              <span className='relative flex min-w-7 items-center justify-center text-center text-white transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] peer-data-[state=checked]:invisible peer-data-[state=unchecked]:translate-x-[calc(100%-5px)] peer-data-[state=unchecked]:rtl:-translate-x-full'>
                <X size={16} aria-hidden='true' />
              </span>
              <span className='peer-data-[state=checked]:text-background relative me-0.5 flex min-w-7 items-center justify-center text-center text-white transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] peer-data-[state=checked]:-translate-x-full peer-data-[state=unchecked]:invisible peer-data-[state=checked]:rtl:translate-x-full'>
                <Check size={16} aria-hidden='true' />
              </span>
            </div>
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
