'use client';

import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { cn } from '@/lib/utils';
import {
  type ComponentPropsWithoutRef,
  type ForwardedRef,
  type ReactNode,
  forwardRef,
  useEffect,
  useRef,
  useState
} from 'react';
import { Check } from 'lucide-react';
import { AnimatePresence, m } from 'framer-motion';
import { EMPTY_ARRAY } from '@/constants';

type InputFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  description?: string;
  className?: string;
  formItemClassName?: string;
  required?: boolean;
  labelClassName?: string;
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
  options?: string[];
  allowCustomInput?: boolean;
  onOptionSelect?: (value: string) => void;
} & Omit<ComponentPropsWithoutRef<'input'>, 'name' | 'defaultValue'>;

const toNumberIfPossible = (value: string): string | number => {
  const num = Number(value);
  return !isNaN(num) && value.trim() !== '' ? num : value;
};

function InputFieldInner<T extends FieldValues>(
  {
    control,
    name,
    label,
    placeholder,
    description,
    type = 'text',
    className,
    formItemClassName,
    required,
    labelClassName,
    disabled,
    readOnly = false,
    prefixIcon,
    suffixIcon,
    options = EMPTY_ARRAY,
    allowCustomInput = true,
    onOptionSelect,
    ...inputProps
  }: InputFieldProps<T>,
  ref: ForwardedRef<HTMLInputElement>
) {
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>(options);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFilterOptions = (inputValue: string) => {
    if (!inputValue) {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter((option) =>
        option.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem
          className={cn(
            { 'cursor-not-allowed select-none': disabled },
            formItemClassName
          )}
        >
          {label && (
            <FormLabel
              className={cn('ml-2', labelClassName, {
                'opacity-50 select-none': disabled
              })}
            >
              {label}
              {required && <span className='text-destructive'>*</span>}
            </FormLabel>
          )}
          <FormControl>
            <div className='relative' ref={containerRef}>
              {prefixIcon && (
                <div className='text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2'>
                  {prefixIcon}
                </div>
              )}
              <Input
                placeholder={placeholder}
                type={type}
                disabled={disabled}
                readOnly={readOnly}
                {...field}
                {...inputProps}
                value={field.value ?? ''}
                ref={ref}
                className={cn(
                  className,
                  'text-sm font-normal shadow-none transition-all duration-200 ease-linear placeholder:text-gray-300 focus-visible:border-transparent focus-visible:ring-2',
                  {
                    'pl-10': prefixIcon,
                    'pr-10': suffixIcon,
                    'cursor-not-allowed border border-solid border-gray-300 bg-gray-200/50 text-gray-500 dark:border-zinc-500/50':
                      disabled,
                    'border-red-500 focus-visible:ring-red-500':
                      !!fieldState.error,
                    'focus-visible:ring-main-color': !fieldState.error
                  }
                )}
                onChange={(e) => {
                  const raw = e.target.value;
                  const transformed =
                    type === 'number' ? toNumberIfPossible(raw) : raw;
                  field.onChange(transformed);
                  if (options.length > 0) {
                    handleFilterOptions(raw);
                    setShowOptions(true);
                  }
                }}
                onFocus={() => {
                  if (options.length > 0) {
                    handleFilterOptions(field.value || '');
                    setShowOptions(true);
                  }
                }}
              />
              {/* Options Dropdown */}
              <AnimatePresence>
                {showOptions &&
                  filteredOptions.length > 0 &&
                  !disabled &&
                  !readOnly && (
                    <m.div
                      initial={{
                        opacity: 0,
                        rotateX: -15,
                        scale: 0.95
                      }}
                      animate={{
                        opacity: 1,
                        rotateX: 0,
                        scale: 1
                      }}
                      exit={{
                        opacity: 0,
                        rotateX: -15,
                        scale: 0.95
                      }}
                      transition={{
                        duration: 0.2,
                        ease: 'linear'
                      }}
                      style={{
                        transformPerspective: 1000,
                        transformOrigin: 'top center'
                      }}
                      className='absolute top-full left-0 z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white p-1 shadow-[0px_0px_10px_5px] shadow-gray-200'
                    >
                      {filteredOptions.map((option, index) => (
                        <div
                          key={index}
                          role='option'
                          className={cn(
                            'relative flex cursor-pointer items-center rounded p-2 text-sm transition-all duration-200 ease-linear hover:bg-gray-100',
                            field.value === option && 'bg-gray-50'
                          )}
                          onClick={() => {
                            field.onChange(option);
                            onOptionSelect?.(option);
                            setShowOptions(false);
                          }}
                          aria-selected={field.value === option}
                        >
                          <span className='flex-1'>{option}</span>
                          {field.value === option && (
                            <Check className='text-main-color h-4 w-4' />
                          )}
                        </div>
                      ))}
                      {allowCustomInput &&
                        field.value &&
                        !filteredOptions.includes(field.value) && (
                          <div className='border-t border-gray-200 px-3 py-2 text-sm text-gray-500'>
                            Press Enter to use:{' '}
                            <span className='font-medium'>{field.value}</span>
                          </div>
                        )}
                    </m.div>
                  )}
              </AnimatePresence>
              {suffixIcon && (
                <div className='text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2'>
                  {suffixIcon}
                </div>
              )}
              {description && <FormDescription>{description}</FormDescription>}
              {fieldState.error && (
                <div className='animate-in fade-in -mb-6 ml-2 flex min-h-6 items-end'>
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

const InputField = forwardRef(InputFieldInner) as <T extends FieldValues>(
  props: InputFieldProps<T> & { ref?: ForwardedRef<HTMLInputElement> }
) => ReturnType<typeof InputFieldInner>;

export default InputField;
