'use client';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
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
import {
  useEffect,
  useState,
  useRef,
  type ReactNode,
  type MouseEvent
} from 'react';

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
  getPrefix?: (option: TOption) => ReactNode;
  allowClear?: boolean;
  searchText?: string;
  notFoundContent?: ReactNode;
  labelClassName?: string;
  disabled?: boolean;
  onValueChange?: (value: string | number | null) => void;
  renderOption?: (option: TOption) => ReactNode;
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
  allowClear,
  searchText,
  notFoundContent = 'Không có kết quả nào',
  labelClassName,
  disabled = false,
  renderOption,
  getLabel = (opt) => opt.label,
  getValue = (opt) => opt.value,
  getPrefix = (opt) => opt.prefix,
  onValueChange
}: SelectFieldProps<TFieldValues, TOption>) {
  const [open, setOpen] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
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
        const selectedValue = field.value;
        const selectedOption = options.find(
          (o) => getValue(o) === selectedValue
        );

        const handleSelect = (val: string | number) => {
          field.onChange(val);
          onValueChange?.(val);
          setOpen(false);
        };

        const handleClear = (e: MouseEvent) => {
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
                className={cn('ml-2', labelClassName, {
                  'opacity-50 select-none': disabled
                })}
              >
                {label}
                {required && <span className='text-destructive'>*</span>}
              </FormLabel>
            )}

            <FormControl>
              <div>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type='button'
                      variant='outline'
                      role='combobox'
                      aria-label='Select'
                      disabled={disabled}
                      className={cn(
                        'hover:border-input focus-visible:border-input dark:hover:border-input dark:bg-input/30 dark:border-input focus-visible:ring-main-color w-full justify-between border px-3! py-0 text-black hover:text-black focus-visible:border-transparent focus-visible:ring-2 dark:text-white dark:hover:text-white',
                        {
                          'ring-main-color border-transparent! ring-2': open,
                          '[&>div>span]:text-gray-300': fieldState.invalid,
                          'border-red-500 ring-red-500': !!fieldState.error
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
                  <PopoverContent
                    sideOffset={8}
                    className='dark:bg-charade w-(--radix-popover-trigger-width) border-none p-0 shadow-[0px_0px_10px_2px] shadow-gray-200 dark:shadow-neutral-800'
                  >
                    <Command
                      ref={commandRef}
                      className='dark:bg-input/30 bg-background'
                      shouldFilter={false}
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

                      <CommandGroup
                        className='max-h-100 overflow-y-auto'
                        onMouseLeave={() => {
                          setHighlightedIndex(-1);
                          if (commandRef.current) {
                            const items =
                              commandRef.current.querySelectorAll(
                                '[cmdk-item]'
                              );
                            items.forEach((item) => {
                              item.setAttribute('data-selected', 'false');
                              item.setAttribute('aria-selected', 'false');
                            });
                          }
                        }}
                      >
                        {filteredOptions.map((opt, idx) => {
                          const val = getValue(opt);
                          const isSelected = val === selectedValue;
                          return (
                            <CommandItem
                              key={val}
                              onMouseEnter={() => setHighlightedIndex(idx)}
                              onSelect={() => handleSelect(val)}
                              className={cn(
                                'dark:hover:bg-main-color/30 block cursor-pointer truncate rounded transition-all duration-200 ease-linear',
                                {
                                  'bg-accent text-accent-foreground dark:bg-main-color/10':
                                    highlightedIndex === idx,
                                  'dark:bg-main-color/30 bg-main-color/10':
                                    isSelected
                                }
                              )}
                            >
                              {renderOption ? (
                                renderOption(opt)
                              ) : (
                                <>
                                  {getPrefix?.(opt) && (
                                    <span className='mr-1 font-mono text-xs opacity-70'>
                                      {getPrefix(opt)}
                                    </span>
                                  )}
                                  {getLabel(opt)}
                                </>
                              )}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
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
