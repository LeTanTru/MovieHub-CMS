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
import { useEffect, useRef, useState } from 'react';

type MultiSelectFieldProps<
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
  getLabel?: (option: TOption) => string | number;
  getValue?: (option: TOption) => string | number;
  getPrefix?: (option: TOption) => React.ReactNode;
  searchText?: string;
  notFoundContent?: React.ReactNode;
  labelClassName?: string;
  disabled?: boolean;
  onValueChange?: (value: Array<string | number>) => void;
};

const normalizeText = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const fuzzyMatch = (text: string, search: string) => {
  const t = normalizeText(text);
  const s = normalizeText(search);

  if (!s) return true;

  const pattern = s.split('').join('.*');
  return new RegExp(pattern).test(t);
};

export default function MultiSelectField<
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
  getLabel = (opt) => opt.label,
  getValue = (opt) => opt.value,
  getPrefix = (opt) => opt.prefix,
  searchText,
  notFoundContent = 'Không có kết quả nào',
  labelClassName,
  disabled = false,
  onValueChange
}: MultiSelectFieldProps<TFieldValues, TOption>) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const commandRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((option) =>
    fuzzyMatch(String(getLabel(option)), searchValue)
  );

  useEffect(() => {
    if (!searchValue) setHighlightedIndex(-1);
  }, [searchValue]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        let selectedValues: Array<string | number> = [];
        if (Array.isArray(field.value)) {
          selectedValues = field.value;
        } else if (typeof field.value === 'string' && field.value) {
          selectedValues = (field.value as string)
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean);
        }

        const handleSelect = (val: string | number) => {
          let newValues: Array<string | number> = [];
          if (selectedValues.includes(val)) {
            newValues = selectedValues.filter((v) => v !== val);
          } else {
            newValues = [...selectedValues, val];
          }
          field.onChange(newValues);
          onValueChange?.(newValues);
        };

        const handleRemove = (val: string | number, e: React.MouseEvent) => {
          e.stopPropagation();
          e.preventDefault();
          const newValues = selectedValues.filter((v) => v !== val);
          field.onChange(newValues);
          onValueChange?.(newValues);
        };

        return (
          <FormItem
            className={cn('relative', className, {
              'cursor-not-allowed select-none': disabled
            })}
          >
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

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  type='button'
                  variant='outline'
                  role='combobox'
                  disabled={disabled}
                  className={cn(
                    'focus-visible:border-dodger-blue h-auto min-h-9 w-full justify-between border px-1! py-1 text-black shadow-none focus:ring-0 focus-visible:border-2',
                    {
                      'cursor-not-allowed border-gray-300 bg-gray-200/80 text-gray-500':
                        disabled,
                      'border-dodger-blue ring-dodger-blue ring-[1px]': open,
                      'border-red-500 ring-red-500': fieldState.invalid
                    }
                  )}
                >
                  {selectedValues.length ? (
                    <div className='flex min-w-0 flex-wrap gap-1'>
                      {selectedValues?.length > 0
                        ? selectedValues.map((val) => {
                            const option = options.find(
                              (o) => getValue(o) === val
                            );
                            if (!option) return null;
                            return (
                              <span
                                key={val}
                                className='flex items-center gap-1 rounded bg-gray-200/60 py-1 pr-1 pl-1.5 text-sm'
                              >
                                {getLabel(option)}
                                <span
                                  className='flex items-center justify-center rounded-sm transition-colors hover:bg-gray-300/60'
                                  onClick={(e) => handleRemove(val, e)}
                                  onMouseDown={(e) => e.stopPropagation()}
                                >
                                  <X className='h-3 w-3' />
                                </span>
                              </span>
                            );
                          })
                        : placeholder}
                    </div>
                  ) : (
                    <span className='truncate pl-2 text-gray-300'>
                      {placeholder}
                    </span>
                  )}
                  <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                </Button>
              </PopoverTrigger>

              {description && (
                <FormDescription className='ml-1.5'>
                  {description}
                </FormDescription>
              )}

              <PopoverContent className='w-(--radix-popover-trigger-width) p-0'>
                <Command
                  className='bg-background'
                  shouldFilter={false}
                  ref={commandRef}
                >
                  <CommandInput
                    placeholder={searchText}
                    value={searchValue}
                    onValueChange={setSearchValue}
                    onKeyDown={(e) => {
                      if (!filteredOptions.length) return;
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
                        const option = filteredOptions[highlightedIndex];
                        if (option) handleSelect(getValue(option));
                      }
                    }}
                  />

                  <CommandEmpty className='mx-auto py-4 text-center text-sm'>
                    <Image
                      src={emptyData.src}
                      width={120}
                      height={50}
                      className='mx-auto mb-2'
                      alt={notFoundContent as string}
                    />
                    {notFoundContent}
                  </CommandEmpty>

                  <CommandGroup
                    className='max-h-100 overflow-y-auto'
                    onMouseLeave={() => {
                      setHighlightedIndex(-1);
                      if (commandRef.current) {
                        const items =
                          commandRef.current.querySelectorAll('[cmdk-item]');
                        items.forEach((item) => {
                          item.setAttribute('data-selected', 'false');
                          item.setAttribute('aria-selected', 'false');
                        });
                      }
                    }}
                  >
                    {filteredOptions.map((opt, idx) => {
                      const val = getValue(opt);
                      const isSelected = selectedValues.includes(val);
                      return (
                        <CommandItem
                          key={val}
                          onMouseEnter={() => setHighlightedIndex(idx)}
                          onMouseLeave={() => setHighlightedIndex(-1)}
                          onSelect={() => handleSelect(val)}
                          className={cn(
                            'block cursor-pointer truncate rounded-none transition-all first:rounded-tl first:rounded-tr last:rounded-br last:rounded-bl data-[state=active]:bg-transparent',
                            {
                              'bg-accent text-accent-foreground':
                                highlightedIndex === idx,
                              'bg-dodger-blue/10': isSelected
                            }
                          )}
                        >
                          {getPrefix?.(opt) && (
                            <span className='mr-1 font-mono text-xs opacity-70'>
                              {getPrefix(opt)}
                            </span>
                          )}
                          {getLabel(opt)}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            {fieldState.error && (
              <div className='animate-in fade-in absolute -bottom-6 left-2 text-sm text-red-500'>
                <FormMessage />
              </div>
            )}
          </FormItem>
        );
      }}
    />
  );
}
