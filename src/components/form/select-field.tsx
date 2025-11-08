'use client';

import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/form';
import Image from 'next/image';
import { emptyData } from '@/assets';
import { useEffect, useState } from 'react';

type SelectFieldProps<
  TFieldValues extends FieldValues,
  TOption extends Record<string, any>
> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  placeholder?: string;
  options: TOption[];
  description?: string;
  className?: string;
  required?: boolean;
  multiple?: boolean;
  getLabel: (option: TOption) => string | number;
  getValue: (option: TOption) => string | number;
  getPrefix?: (option: TOption) => React.ReactNode;
  allowClear?: boolean;
  searchText?: string;
  notFoundContent?: React.ReactNode;
  labelClassName?: string;
  disabled?: boolean;
  onValueChange?: (value: string | number | (string | number)[]) => void;
};

const normalizeText = (text: string): string => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

export default function SelectField<
  TFieldValues extends FieldValues,
  TOption extends Record<string, any>
>({
  control,
  name,
  label,
  placeholder,
  options,
  description,
  className,
  required,
  multiple = false,
  getLabel,
  getValue,
  getPrefix,
  allowClear,
  searchText,
  notFoundContent = 'Không có kết quả nào',
  labelClassName,
  disabled = false,
  onValueChange
}: SelectFieldProps<TFieldValues, TOption>) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  function isFuzzyMatch(input: string, target: string): boolean {
    let i = 0,
      j = 0;
    while (i < input.length && j < target.length) {
      if (input[i] === target[j]) i++;
      j++;
    }
    return i === input.length;
  }

  const normalizedSearch = normalizeText(searchValue);

  const filteredOptions = options.filter((option) => {
    const label = String(getLabel(option));
    const normalizedLabel = normalizeText(label);
    return isFuzzyMatch(normalizedSearch, normalizedLabel);
  });

  useEffect(() => {
    if (!searchValue) {
      setHighlightedIndex(-1);
    }
  }, [searchValue]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const selectedValues: (string | number)[] =
          field.value === undefined
            ? []
            : multiple
              ? Array.isArray(field.value)
                ? field.value
                : []
              : [field.value].filter(
                  (item) => item !== undefined && item !== null
                );

        const toggleValue = (val: string | number) => {
          if (multiple) {
            const next = selectedValues.includes(val)
              ? selectedValues.filter((v) => v !== val)
              : [...selectedValues, val];
            field.onChange(next);
            onValueChange?.(next);
          } else {
            field.onChange(val);
            onValueChange?.(val);
            setOpen(false);
          }
        };

        return (
          <FormItem
            className={cn('relative', className, {
              'cursor-not-allowed select-none': disabled
            })}
          >
            {label && (
              <FormLabel
                className={cn('ml-1 gap-1.5', labelClassName, {
                  'opacity-50 select-none': disabled
                })}
              >
                {label}
                {required && <span className='text-destructive'>*</span>}
              </FormLabel>
            )}
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  type='button'
                  variant='outline'
                  role='combobox'
                  aria-label='Select'
                  disabled={disabled}
                  className={cn(
                    'w-full flex-wrap justify-between truncate border px-3 py-0 text-black focus:ring-0 focus-visible:shadow-none',
                    {
                      'pl-1!': selectedValues.length > 1,
                      'cursor-not-allowed border border-solid border-gray-300 bg-gray-200/80 text-gray-500':
                        disabled,
                      'border-dodger-blue ring-dodger-blue ring-1': open,
                      '[&>div>span]:text-gray-300': fieldState.invalid,
                      'border-red-500 ring-red-500': fieldState.invalid
                    }
                  )}
                >
                  {multiple ? (
                    selectedValues.length > 0 ? (
                      <div className='flex flex-wrap gap-2'>
                        {selectedValues.map((val) => {
                          const opt = options.find((o) => getValue(o) === val);
                          if (!opt) return null;
                          return (
                            <div
                              key={val}
                              className='bg-accent text-accent-foreground flex items-center rounded-lg py-1 text-sm'
                            >
                              {getPrefix?.(opt) && (
                                <span className='mr-1 font-mono text-xs opacity-70'>
                                  {getPrefix(opt)}
                                </span>
                              )}
                              {getLabel(opt)}
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  field.onChange(
                                    selectedValues.filter((v) => v !== val)
                                  );
                                }}
                                className='hover:text-destructive ml-2 cursor-pointer text-lg leading-none'
                              >
                                <X />
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className='text-gray-300'>{placeholder}</span>
                    )
                  ) : selectedValues.length === 1 ? (
                    (() => {
                      const val = selectedValues[0];
                      const opt = options.find((o) => getValue(o) === val);
                      return opt ? (
                        <div className='flex min-w-0 flex-1 items-center gap-2'>
                          {getPrefix?.(opt)}
                          <span className='block truncate'>
                            {getLabel(opt)}
                          </span>
                        </div>
                      ) : (
                        <span className='text-gray-300'>{placeholder}</span>
                      );
                    })()
                  ) : (
                    <span className='text-gray-300'>{placeholder}</span>
                  )}

                  {selectedValues.length > 0 && allowClear ? (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        field.onChange(multiple ? [] : null);
                        setOpen(false);
                      }}
                      className='bg-accent ml-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-full hover:opacity-80'
                    >
                      <X className='size-3' />
                    </span>
                  ) : (
                    <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                  )}
                </Button>
              </PopoverTrigger>

              {description && (
                <FormDescription className='ml-1.5'>
                  {description}
                </FormDescription>
              )}

              <PopoverContent className='w-(--radix-popover-trigger-width) p-0'>
                <Command className='bg-background' shouldFilter={false}>
                  <CommandInput
                    placeholder={searchText}
                    value={searchValue}
                    onValueChange={setSearchValue}
                    onKeyDown={(e) => {
                      if (filteredOptions.length === 0) return;
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setHighlightedIndex((prev) =>
                          prev < filteredOptions.length - 1 ? prev + 1 : 0
                        );
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setHighlightedIndex((prev) =>
                          prev > 0 ? prev - 1 : filteredOptions.length - 1
                        );
                      } else if (e.key === 'Enter') {
                        e.preventDefault();
                        const selected = filteredOptions[highlightedIndex];
                        if (selected) {
                          toggleValue(getValue(selected));
                        }
                      }
                    }}
                  />
                  <CommandEmpty className='mx-auto pt-2 pb-2 text-center text-sm'>
                    <Image
                      src={emptyData.src}
                      width={120}
                      height={50}
                      className='mx-auto mb-2'
                      alt={notFoundContent as string}
                    />
                    {notFoundContent}
                  </CommandEmpty>
                  <CommandGroup className='max-h-100 overflow-y-auto max-[1560px]:max-h-50'>
                    {filteredOptions.map((opt, idx) => {
                      const val = getValue(opt);
                      return (
                        <CommandItem
                          onMouseEnter={() => setHighlightedIndex(idx)}
                          key={val}
                          onSelect={() => toggleValue(val)}
                          className={cn(
                            'block cursor-pointer truncate rounded transition-all',
                            {
                              'bg-accent text-accent-foreground':
                                highlightedIndex === idx ||
                                selectedValues.includes(val)
                            }
                          )}
                        >
                          {getPrefix?.(opt) && (
                            <span className='mr-1 font-mono text-xs opacity-70'>
                              {getPrefix(opt)}
                            </span>
                          )}
                          {getLabel(opt) ?? 'Không có kết quả nào'}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
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
