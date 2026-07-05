'use client';

import {
  useId,
  useLayoutEffect,
  useRef,
  type ChangeEvent,
  type ClipboardEvent,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type Ref
} from 'react';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

/** Fixed HH:mm:ss.SSS mask — colons/dot never move, only the digit slots do. */
const TIME_MASK_TEMPLATE = '00:00:00.000';
const TIME_MASK_DIGIT_INDEXES = [0, 1, 3, 4, 6, 7, 9, 10, 11];
const TIME_MASK_MAX_DIGIT: Record<number, number> = { 3: 5, 6: 5 };
const TIME_MASK_PATTERN = /^\d{2}:\d{2}:\d{2}\.\d{3}$/;

type TimeMaskFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  description?: string;
  className?: string;
  formItemClassName?: string;
  labelClassName?: string;
  required?: boolean;
  disabled?: boolean;
  ref?: Ref<HTMLInputElement>;
} & Omit<
  ComponentPropsWithoutRef<'input'>,
  | 'name'
  | 'defaultValue'
  | 'value'
  | 'type'
  | 'onChange'
  | 'onKeyDown'
  | 'onPaste'
  | 'onFocus'
  | 'onClick'
  | 'onBlur'
>;

function nearestDigitIndex(index: number): number {
  for (let i = index; i < TIME_MASK_TEMPLATE.length; i++) {
    if (TIME_MASK_DIGIT_INDEXES.includes(i)) return i;
  }
  return TIME_MASK_DIGIT_INDEXES[TIME_MASK_DIGIT_INDEXES.length - 1];
}

function advanceDigitIndex(index: number): number {
  const pos = TIME_MASK_DIGIT_INDEXES.indexOf(index);
  if (pos === -1 || pos === TIME_MASK_DIGIT_INDEXES.length - 1) {
    return TIME_MASK_TEMPLATE.length;
  }
  return TIME_MASK_DIGIT_INDEXES[pos + 1];
}

function retreatDigitIndex(index: number): number {
  const pos = TIME_MASK_DIGIT_INDEXES.indexOf(index);
  if (pos <= 0) return TIME_MASK_DIGIT_INDEXES[0];
  return TIME_MASK_DIGIT_INDEXES[pos - 1];
}

function setCharAt(value: string, index: number, char: string): string {
  return value.slice(0, index) + char + value.slice(index + 1);
}

export function TimeMaskField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
  className,
  formItemClassName,
  labelClassName,
  required,
  disabled,
  ref,
  ...inputProps
}: TimeMaskFieldProps<T>) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const selectionRef = useRef<[number, number] | null>(null);

  useLayoutEffect(() => {
    if (!selectionRef.current || !inputRef.current) return;
    const [start, end] = selectionRef.current;
    inputRef.current.setSelectionRange(start, end);
    selectionRef.current = null;
  });

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const value: string = field.value ?? '';
        const current = TIME_MASK_PATTERN.test(value)
          ? value
          : TIME_MASK_TEMPLATE;

        const highlight = (index: number) => {
          const range: [number, number] =
            index >= TIME_MASK_TEMPLATE.length
              ? [TIME_MASK_TEMPLATE.length, TIME_MASK_TEMPLATE.length]
              : [index, index + 1];
          selectionRef.current = range;

          // Focus/click don't change the field value, so no re-render follows
          // to run the layout effect — apply the selection immediately too.
          const el = inputRef.current;
          if (el) {
            el.setSelectionRange(range[0], range[1]);
            setTimeout(() => el.setSelectionRange(range[0], range[1]), 0);
          }
        };

        const commit = (nextValue: string, caretIndex: number) => {
          field.onChange(nextValue);
          highlight(caretIndex);
        };

        const handleFocus = () => {
          if (!value) return;
          highlight(nearestDigitIndex(inputRef.current?.selectionStart ?? 0));
        };

        const handleClick = () => {
          if (!value) return;
          highlight(nearestDigitIndex(inputRef.current?.selectionStart ?? 0));
        };

        const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
          if (disabled || e.ctrlKey || e.metaKey) return;

          const el = inputRef.current;
          const selStart = el?.selectionStart ?? 0;
          const selEnd = el?.selectionEnd ?? selStart;

          if (/^\d$/.test(e.key)) {
            e.preventDefault();
            const index = nearestDigitIndex(selStart);
            const max = TIME_MASK_MAX_DIGIT[index];
            if (max !== undefined && Number(e.key) > max) return;
            commit(setCharAt(current, index, e.key), advanceDigitIndex(index));
            return;
          }

          if (e.key === 'Backspace') {
            e.preventDefault();
            if (selEnd > selStart + 1) {
              let next = current;
              for (let i = selStart; i < selEnd; i++) {
                if (TIME_MASK_DIGIT_INDEXES.includes(i)) {
                  next = setCharAt(next, i, '0');
                }
              }
              commit(next, nearestDigitIndex(selStart));
              return;
            }
            const index = retreatDigitIndex(nearestDigitIndex(selStart));
            commit(setCharAt(current, index, '0'), index);
            return;
          }

          if (e.key === 'Delete') {
            e.preventDefault();
            const index = nearestDigitIndex(selStart);
            commit(setCharAt(current, index, '0'), index);
            return;
          }

          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            highlight(retreatDigitIndex(nearestDigitIndex(selStart)));
            return;
          }

          if (e.key === 'ArrowRight') {
            e.preventDefault();
            const nextIndex = advanceDigitIndex(nearestDigitIndex(selStart));
            highlight(
              nextIndex >= TIME_MASK_TEMPLATE.length
                ? TIME_MASK_DIGIT_INDEXES[TIME_MASK_DIGIT_INDEXES.length - 1]
                : nextIndex
            );
            return;
          }

          if (e.key === 'Home') {
            e.preventDefault();
            highlight(TIME_MASK_DIGIT_INDEXES[0]);
            return;
          }

          if (e.key === 'End') {
            e.preventDefault();
            highlight(
              TIME_MASK_DIGIT_INDEXES[TIME_MASK_DIGIT_INDEXES.length - 1]
            );
            return;
          }

          if (e.key.length === 1) {
            e.preventDefault();
          }
        };

        const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
          e.preventDefault();
          if (disabled) return;

          const digits = e.clipboardData
            .getData('text')
            .replace(/\D/g, '')
            .slice(0, TIME_MASK_DIGIT_INDEXES.length);
          if (!digits) return;

          let next = TIME_MASK_TEMPLATE;
          digits.split('').forEach((digit, i) => {
            const index = TIME_MASK_DIGIT_INDEXES[i];
            const max = TIME_MASK_MAX_DIGIT[index];
            next = setCharAt(
              next,
              index,
              max !== undefined && Number(digit) > max ? String(max) : digit
            );
          });

          const caretIndex =
            digits.length >= TIME_MASK_DIGIT_INDEXES.length
              ? TIME_MASK_TEMPLATE.length
              : TIME_MASK_DIGIT_INDEXES[digits.length];
          commit(next, caretIndex);
        };

        // Fallback for edits that bypass keydown (IME, mobile keyboards, autofill).
        const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
          const raw = e.target.value;
          let diffIndex = -1;

          if (raw.length === current.length) {
            for (let i = 0; i < current.length; i++) {
              if (current[i] !== raw[i]) {
                diffIndex = i;
                break;
              }
            }
          }

          if (
            diffIndex !== -1 &&
            TIME_MASK_DIGIT_INDEXES.includes(diffIndex) &&
            /^\d$/.test(raw[diffIndex])
          ) {
            const max = TIME_MASK_MAX_DIGIT[diffIndex];
            if (max === undefined || Number(raw[diffIndex]) <= max) {
              commit(
                setCharAt(current, diffIndex, raw[diffIndex]),
                advanceDigitIndex(diffIndex)
              );
              return;
            }
          }

          commit(
            current,
            nearestDigitIndex(inputRef.current?.selectionStart ?? 0)
          );
        };

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
                htmlFor={id}
                className={cn(
                  'ml-2',
                  { 'cursor-not-allowed opacity-50': disabled },
                  labelClassName
                )}
              >
                {label}
                {required && <span className='text-destructive'>*</span>}
              </FormLabel>
            )}
            <FormControl>
              <div>
                <Input
                  id={id}
                  inputMode='numeric'
                  autoComplete='off'
                  placeholder={placeholder}
                  disabled={disabled}
                  {...inputProps}
                  value={value}
                  ref={(node) => {
                    inputRef.current = node;
                    if (typeof ref === 'function') ref(node);
                    else if (ref) ref.current = node;
                  }}
                  className={cn(
                    'text-sm font-normal shadow-none transition-all duration-200 ease-linear placeholder:text-gray-300 focus-visible:border-transparent focus-visible:ring-2 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-50 disabled:select-none',
                    {
                      'border-rose-500 focus-visible:ring-rose-500':
                        !!fieldState.error,
                      'focus-visible:ring-sporty-blue': !fieldState.error
                    },
                    className
                  )}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                  onFocus={handleFocus}
                  onClick={handleClick}
                  onChange={handleChange}
                  onBlur={field.onBlur}
                />
                {description && (
                  <FormDescription>{description}</FormDescription>
                )}
                {fieldState.error && (
                  <div className='animate-in fade-in -mb-6 ml-2 flex min-h-6 items-end'>
                    <FormMessage className='leading-5.5' />
                  </div>
                )}
              </div>
            </FormControl>
          </FormItem>
        );
      }}
    />
  );
}
