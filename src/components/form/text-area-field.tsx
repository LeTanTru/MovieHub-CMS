'use client';

import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ForwardedRef,
  useImperativeHandle,
  type ReactNode,
  type TextareaHTMLAttributes,
  type ReactElement
} from 'react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
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
  floatLabel?: boolean;
  maxLength?: number;
  rows?: number;
  maxRows?: number;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

const TextAreaField = <T extends FieldValues>(
  {
    control,
    name,
    label,
    placeholder = '',
    className,
    labelClassName,
    required = false,
    disabled = false,
    readOnly = false,
    floatLabel = false,
    maxLength,
    rows = 8,
    maxRows = 15,
    ...rest
  }: TextAreaFieldProps<T>,
  ref: ForwardedRef<HTMLTextAreaElement>
) => {
  const id = useId();
  const internalRef = useRef<HTMLTextAreaElement | null>(null);
  const [charCount, setCharCount] = useState(0);

  // expose internal ref ra ngoài
  useImperativeHandle(ref, () => internalRef.current!);

  const resizeTextarea = () => {
    if (!internalRef.current) return;
    internalRef.current.style.height = 'auto';
    const scrollHeight = internalRef.current.scrollHeight;
    const lineHeight = parseInt(
      window.getComputedStyle(internalRef.current).lineHeight || '20'
    );
    const maxHeight = maxRows ? maxRows * lineHeight : Infinity;
    internalRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
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
                className={cn(
                  'mb-2 ml-2 gap-0',
                  {
                    'origin-start text-muted-foreground/70 group-focus-within:text-foreground has-[+textarea:not(:placeholder-shown)]:text-foreground has-aria-invalid:border-destructive/60 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40 has-aria-invalid:border-destructive bg-background absolute top-0 block translate-y-2 cursor-text rounded px-1 text-sm transition-all group-focus-within:pointer-events-none group-focus-within:-translate-y-1/2 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium has-[+textarea:not(:placeholder-shown)]:pointer-events-none has-[+textarea:not(:placeholder-shown)]:-translate-y-1/2 has-[+textarea:not(:placeholder-shown)]:cursor-default has-[+textarea:not(:placeholder-shown)]:text-xs has-[+textarea:not(:placeholder-shown)]:font-medium':
                      floatLabel
                  },
                  labelClassName
                )}
              >
                {label}
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
                  'focus-visible:ring-dodger-blue min-h-40 shadow-none transition-all duration-200 ease-linear placeholder:text-gray-300 focus-visible:border-transparent focus-visible:ring-2 aria-invalid:ring-transparent',
                  {
                    'focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-red-500!':
                      !!fieldState.error
                  },
                  className
                )}
                {...field}
                {...rest}
                ref={internalRef}
                onChange={(e) => {
                  field.onChange(e);
                  setCharCount(e.target.value.length);
                  resizeTextarea();
                  rest.onChange?.(e);
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
};

export default forwardRef(TextAreaField) as <T extends FieldValues>(
  props: TextAreaFieldProps<T> & {
    ref?: ForwardedRef<HTMLTextAreaElement>;
  }
) => ReactElement;
