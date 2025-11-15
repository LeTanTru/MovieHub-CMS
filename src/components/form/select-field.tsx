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
  getLabel?: (option: TOption) => string | number;
  getValue?: (option: TOption) => string | number;
  getPrefix?: (option: TOption) => React.ReactNode;
  allowClear?: boolean;
  searchText?: string;
  notFoundContent?: React.ReactNode;
  labelClassName?: string;
  disabled?: boolean;
  onValueChange?: (value: string | number | null) => void;
};

const normalizeText = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

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
  getLabel = (opt) => opt.label,
  getValue = (opt) => opt.value,
  getPrefix = (opt) => opt.prefix,
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

  const normalizedSearch = normalizeText(searchValue);
  const filteredOptions = options.filter((option) => {
    const label = String(getLabel(option));
    return normalizeText(label).includes(normalizedSearch);
  });

  useEffect(() => {
    if (!searchValue) setHighlightedIndex(-1);
  }, [searchValue]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const selectedValue = field.value;
        const selectedOption = options.find(
          (o) => getValue(o) === selectedValue
        );

        const handleSelect = (val: string | number) => {
          field.onChange(val);
          onValueChange?.(val);
          setOpen(false);
        };

        const handleClear = (e: React.MouseEvent) => {
          e.stopPropagation();
          field.onChange(null);
          onValueChange?.(null);
          setOpen(false);
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
                  aria-label='Select'
                  disabled={disabled}
                  className={cn(
                    'focus-visible:border-dodger-blue w-full justify-between border px-3! py-0 text-black shadow-none focus:ring-0 focus-visible:border-2',
                    {
                      'cursor-not-allowed border-gray-300 bg-gray-200/80 text-gray-500':
                        disabled,
                      'border-dodger-blue ring-dodger-blue ring-[1px]': open,
                      '[&>div>span]:text-gray-300': fieldState.invalid,
                      'border-red-500 ring-red-500': fieldState.invalid
                    }
                  )}
                >
                  {selectedOption ? (
                    <div className='flex min-w-0 flex-1 items-center gap-2'>
                      {getPrefix?.(selectedOption)}
                      <span className='block truncate'>
                        {getLabel(selectedOption)}
                      </span>
                    </div>
                  ) : (
                    <span className='text-gray-300'>{placeholder}</span>
                  )}

                  {selectedOption && allowClear ? (
                    <span
                      onClick={handleClear}
                      className='bg-accent ml-2 flex h-4 w-4 items-center justify-center rounded-full hover:opacity-80'
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
                        const selected = filteredOptions[highlightedIndex];
                        if (selected) handleSelect(getValue(selected));
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

                  <CommandGroup className='max-h-100 overflow-y-auto'>
                    {filteredOptions.map((opt, idx) => {
                      const val = getValue(opt);
                      const isSelected = val === selectedValue;
                      return (
                        <CommandItem
                          key={val}
                          onMouseEnter={() => setHighlightedIndex(idx)}
                          onMouseLeave={() => setHighlightedIndex(-1)}
                          onSelect={() => handleSelect(val)}
                          className={cn(
                            'block cursor-pointer truncate rounded transition-all data-[state=active]:bg-transparent',
                            {
                              'bg-accent text-accent-foreground':
                                highlightedIndex === idx || isSelected
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
