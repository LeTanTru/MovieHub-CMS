'use client';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  useWatch,
  type Control,
  type FieldPath,
  type FieldValues
} from 'react-hook-form';
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
import { type ReactNode, useEffect, useRef, useState } from 'react';

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
  formItemClassName?: string;
  required?: boolean;
  getLabel?: (option: TOption) => string | number;
  getValue?: (option: TOption) => string | number;
  getPrefix?: (option: TOption) => ReactNode;
  searchText?: string;
  notFoundContent?: ReactNode;
  labelClassName?: string;
  disabled?: boolean;
  onValueChange?: (value: Array<string | number>) => void;
  isMultiLine?: boolean;
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

const measureVisibleCount = (
  selectedValues: Array<string | number>,
  options: any[],
  getValue: (o: any) => string | number,
  getLabel: (o: any) => string | number,
  availableWidth: number
): number => {
  const measurer = document.createElement('div');
  measurer.style.cssText =
    'position:absolute;visibility:hidden;display:flex;gap:4px;top:-9999px;left:-9999px;pointer-events:none;';
  document.body.appendChild(measurer);

  const optionMap = new Map(options.map((o) => [getValue(o), o]));

  let totalWidth = 0;
  let count = 0;

  for (const val of selectedValues) {
    const option = optionMap.get(val);
    if (!option) continue;

    const span = document.createElement('span');
    span.style.cssText =
      'display:inline-flex;align-items:center;gap:4px;padding:4px 4px 4px 6px;font-size:14px;white-space:nowrap;border-radius:4px;flex-shrink:0;';
    const labelSpan = document.createElement('span');
    labelSpan.textContent = String(getLabel(option));
    const iconSpan = document.createElement('span');
    iconSpan.style.cssText = 'width:12px;height:12px;display:inline-block;';
    span.appendChild(labelSpan);
    span.appendChild(iconSpan);
    measurer.appendChild(span);

    const width = span.getBoundingClientRect().width;
    if (totalWidth + width > availableWidth) break;
    totalWidth += width + 4;
    count++;
  }

  document.body.removeChild(measurer);
  return count;
};

export function MultiSelectField<
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
  formItemClassName,
  required,
  getLabel = (opt) => opt.label,
  getValue = (opt) => opt.value,
  getPrefix = (opt) => opt.prefix,
  searchText,
  notFoundContent = 'Không có kết quả nào',
  labelClassName,
  disabled = false,
  onValueChange,
  isMultiLine = false
}: MultiSelectFieldProps<TFieldValues, TOption>) {
  const [open, setOpen] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [visibleCount, setVisibleCount] = useState<number>(0);
  const commandRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const watchedValue = useWatch({ control, name });

  const selectedValues: Array<string | number> = (() => {
    if (Array.isArray(watchedValue)) return watchedValue;
    if (typeof watchedValue === 'string' && watchedValue)
      return (watchedValue as string).split(',').flatMap((v) => {
        const trimmed = v.trim();
        return trimmed ? [trimmed] : [];
      });
    return [];
  })();

  const filteredOptions = options.filter((option) =>
    fuzzyMatch(String(getLabel(option)), searchValue)
  );

  // Measure visible tag count — skip entirely in multiLine mode
  useEffect(() => {
    if (isMultiLine || !triggerRef.current || !selectedValues.length) {
      setVisibleCount(0);
      return;
    }
    // Reserve: chevron (~32px) + +N badge (~44px) + padding (8px)
    const availableWidth = triggerRef.current.clientWidth - 32 - 44 - 8 - 36;
    setVisibleCount(
      measureVisibleCount(
        selectedValues,
        options,
        getValue,
        getLabel,
        availableWidth
      )
    );
  }, [isMultiLine, selectedValues, options, getValue, getLabel]);

  // Re-measure on container resize — skip in multiLine mode
  useEffect(() => {
    if (isMultiLine || !triggerRef.current) return;

    const observer = new ResizeObserver(() => {
      const container = triggerRef.current;
      if (!container || !selectedValues.length) {
        setVisibleCount(0);
        return;
      }
      const availableWidth = container.clientWidth - 32 - 44 - 8;
      setVisibleCount(
        measureVisibleCount(
          selectedValues,
          options,
          getValue,
          getLabel,
          availableWidth
        )
      );
    });

    observer.observe(triggerRef.current);
    return () => observer.disconnect();
  }, [isMultiLine, selectedValues, options, getValue, getLabel]);

  useEffect(() => {
    if (!searchValue) setHighlightedIndex(-1);
  }, [searchValue]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const handleSelect = (val: string | number) => {
          let newValues: Array<string | number> = [];
          if (selectedValues.includes(val)) {
            newValues = selectedValues.filter((v) => v !== val);
          } else {
            newValues = [...selectedValues, val];
          }
          // Sort selected values by their label in the options array
          newValues.sort((a, b) => {
            const labelA = options.find((o) => getValue(o) === a);
            const labelB = options.find((o) => getValue(o) === b);
            const labelCompareA = labelA
              ? normalizeText(String(getLabel(labelA)))
              : '';
            const labelCompareB = labelB
              ? normalizeText(String(getLabel(labelB)))
              : '';
            return labelCompareA.localeCompare(labelCompareB);
          });
          field.onChange(newValues);
          onValueChange?.(newValues);
        };

        const handleRemove = (val: string | number) => {
          const newValues = selectedValues.filter((v) => v !== val);
          field.onChange(newValues);
          onValueChange?.(newValues);
        };

        const hiddenCount = selectedValues.length - visibleCount;

        // multiLine → show all; single line → slice to visibleCount
        const visibleValues = isMultiLine
          ? selectedValues
          : selectedValues.slice(0, visibleCount);

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
                className={cn('ml-2', labelClassName, {
                  'cursor-not-allowed opacity-50': disabled
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
                      ref={triggerRef}
                      type='button'
                      variant='outline'
                      role='combobox'
                      aria-controls='combobox'
                      aria-expanded={open}
                      aria-label='Select'
                      disabled={disabled}
                      className={cn(
                        'hover:border-input focus-visible:border-input focus-visible:ring-main-color w-full justify-between border px-3! py-0 pl-1! text-black hover:text-black focus-visible:border-transparent focus-visible:ring-2 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-50 disabled:select-none',
                        {
                          'ring-main-color border-transparent! ring-2': open,
                          '[&>div>span]:text-gray-300': fieldState.invalid,
                          'border-rose-500 ring-rose-500': !!fieldState.error
                        },
                        className
                      )}
                    >
                      {selectedValues.length ? (
                        <div
                          className={cn(
                            'flex min-w-0 flex-1 items-center gap-1',
                            {
                              'flex-wrap': isMultiLine,
                              'overflow-hidden': !isMultiLine
                            }
                          )}
                        >
                          {visibleValues.map((val) => {
                            const option = options.find(
                              (o) => getValue(o) === val
                            );
                            if (!option) return null;
                            return (
                              <span
                                key={val}
                                className='flex shrink-0 items-center gap-1 rounded bg-gray-200/60 py-1 pr-1 pl-1.5 text-sm'
                              >
                                {getLabel(option)}
                                <span
                                  role='button'
                                  className='flex items-center justify-center rounded-sm transition-colors hover:bg-gray-300/60'
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    handleRemove(val);
                                  }}
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      handleRemove(val);
                                    }
                                  }}
                                >
                                  <X className='size-3' />
                                </span>
                              </span>
                            );
                          })}

                          {/* +N badge — only in single-line mode */}
                          {!isMultiLine && hiddenCount > 0 && (
                            <span className='bg-main-color/15 text-main-color shrink-0 rounded px-1.5 py-[2.2px] text-xs font-medium'>
                              +{hiddenCount}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className='truncate pl-2 text-gray-300'>
                          {placeholder}
                        </span>
                      )}
                      <ChevronDown className='ml-2 shrink-0 opacity-50' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    sideOffset={8}
                    className='w-(--radix-popover-trigger-width) p-0'
                  >
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
                          className='mx-auto mb-2 h-auto'
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
                                  'bg-main-color/10': isSelected
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
