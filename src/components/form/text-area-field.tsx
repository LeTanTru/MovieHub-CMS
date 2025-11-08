'use client';

import { useEffect, useId, useRef, useState } from 'react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { cn } from '@/lib/utils';

type TextAreaFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  floatLabel?: boolean;
  maxLength?: number;
  rows?: number;
  maxRows?: number;
};

export default function TextAreaField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = '',
  className,
  required = false,
  disabled = false,
  readOnly = false,
  floatLabel = false,
  maxLength,
  rows = 8,
  maxRows = 15
}: TextAreaFieldProps<T>) {
  const id = useId();
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const resizeTextarea = () => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    const scrollHeight = textareaRef.current.scrollHeight;
    const lineHeight = parseInt(
      window.getComputedStyle(textareaRef.current).lineHeight || '20'
    );
    const maxHeight = maxRows ? maxRows * lineHeight : Infinity;
    textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
  };
  useEffect(() => {
    resizeTextarea();
  }, [charCount]);
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className='relative'>
          <div className={cn('relative', floatLabel && 'group')}>
            {label && (
              <FormLabel
                htmlFor={id}
                className={cn('mb-2 ml-0.5 gap-0', {
                  'origin-start text-muted-foreground/70 group-focus-within:text-foreground has-[+textarea:not(:placeholder-shown)]:text-foreground has-aria-invalid:border-destructive/60 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40 has-aria-invalid:border-destructive bg-background absolute top-0 block translate-y-2 cursor-text rounded px-1 text-sm transition-all group-focus-within:pointer-events-none group-focus-within:-translate-y-1/2 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium has-[+textarea:not(:placeholder-shown)]:pointer-events-none has-[+textarea:not(:placeholder-shown)]:-translate-y-1/2 has-[+textarea:not(:placeholder-shown)]:cursor-default has-[+textarea:not(:placeholder-shown)]:text-xs has-[+textarea:not(:placeholder-shown)]:font-medium':
                    floatLabel
                })}
              >
                <span className='px-1'>{label}</span>
                {required && <span className='text-destructive ml-1'>*</span>}
              </FormLabel>
            )}

            <FormControl>
              <Textarea
                id={id}
                placeholder={placeholder}
                disabled={disabled}
                readOnly={readOnly}
                maxLength={maxLength}
                rows={rows ?? 4}
                className={cn(
                  floatLabel && 'bg-background pt-6',
                  'focus-visible:ring-dodger-blue field-sizing-fixed shadow-none placeholder:text-gray-300 focus-visible:border-transparent focus-visible:ring-[2px] aria-invalid:ring-transparent',
                  {
                    'aria-invalid:border-1 aria-invalid:border-gray-200 aria-invalid:ring-[2px] aria-invalid:focus-visible:border-transparent aria-invalid:focus-visible:ring-[2px] aria-invalid:focus-visible:ring-red-500':
                      fieldState.invalid && required
                  },
                  className
                )}
                {...field}
                ref={textareaRef}
                onChange={(e) => {
                  field.onChange(e);
                  setCharCount(e.target.value.length);
                  resizeTextarea();
                }}
              />
            </FormControl>

            {maxLength !== undefined && (
              <div className='text-muted-foreground mt-1 text-right text-xs'>
                {maxLength - charCount} còn lại
              </div>
            )}
          </div>
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
