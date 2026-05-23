'use client';

import './auto-complete-field.css';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  type Control,
  type FieldPath,
  type FieldValues,
  useWatch
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
import type { ApiConfig, ApiResponseList } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { http } from '@/utils';
import {
  DEFAULT_TABLE_PAGE_START,
  INITIAL_AUTO_COMPLETE_SIZE,
  MAX_PAGE_SIZE
} from '@/constants';
import debounce from 'lodash/debounce';
import Image from 'next/image';
import { emptyData } from '@/assets';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { CircleLoading } from '@/components/loading';

type AutoCompleteOption<T = unknown> = {
  label: string;
  value: string | number;
  prefix?: ReactNode;
  extra?: T;
};

type AutoCompleteFieldProps<
  TFieldValues extends FieldValues,
  TOption extends Record<string, unknown>
> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  searchParams: (keyof TOption)[] | string[];
  initialParams?: Record<string, string | number | boolean | null | undefined>;
  placeholder?: string;
  description?: string;
  className?: string;
  formItemClassName?: string;
  required?: boolean;
  allowClear?: boolean;
  searchText?: string;
  notFoundContent?: ReactNode;
  labelClassName?: string;
  disabled?: boolean;
  apiConfig: ApiConfig;
  fetchAll?: boolean;
  initialOptionParamName?: string;
  onValueChange?: (value: string | number | null) => void;
  mappingData: (option: TOption) => AutoCompleteOption | null;
  renderOption?: (option: AutoCompleteOption<TOption>) => ReactNode;
};

const EMPTY_INITIAL_PARAMS: Record<
  string,
  string | number | boolean | null | undefined
> = {};
const AUTO_COMPLETE_DEBOUNCE_MS = 400;
const POPOVER_SIDE_OFFSET = 8;
const EMPTY_STATE_IMAGE_WIDTH = 120;
const EMPTY_STATE_IMAGE_HEIGHT = 50;
const HIGHLIGHTED_INDEX_NONE = -1;

export function AutoCompleteField<
  TFieldValues extends FieldValues,
  TOption extends Record<string, unknown>
>({
  control,
  name,
  label,
  searchParams,
  initialParams = EMPTY_INITIAL_PARAMS,
  placeholder,
  description,
  className,
  formItemClassName,
  required,
  allowClear = false,
  searchText,
  notFoundContent = 'Không có dữ liệu',
  labelClassName,
  disabled = false,
  apiConfig,
  fetchAll = false,
  initialOptionParamName,
  onValueChange,
  mappingData,
  renderOption
}: AutoCompleteFieldProps<TFieldValues, TOption>) {
  const [open, setOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [selectedOption, setSelectedOption] =
    useState<AutoCompleteOption<TOption> | null>(null);
  const [initialOption, setInitialOption] =
    useState<AutoCompleteOption<TOption> | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(
    HIGHLIGHTED_INDEX_NONE
  );
  const commandInputRef = useRef<HTMLInputElement>(null);
  const initialFetched = useRef(false);
  const commandRef = useRef<HTMLDivElement>(null);

  const fieldValue = useWatch({ control, name });

  const updateSearch = useMemo(
    () =>
      debounce(
        (val: string) => setDebouncedSearch(val),
        AUTO_COMPLETE_DEBOUNCE_MS
      ),
    []
  );

  useEffect(() => {
    updateSearch(search);
  }, [search, updateSearch]);

  const query = useQuery({
    queryKey: [name, debouncedSearch, initialParams],
    queryFn: () => {
      const isSearching = debouncedSearch.trim() !== '';

      const params: Record<
        string,
        string | number | boolean | null | undefined
      > = {
        page: DEFAULT_TABLE_PAGE_START,
        size:
          isSearching || fetchAll ? MAX_PAGE_SIZE : INITIAL_AUTO_COMPLETE_SIZE,
        ...initialParams
      };
      if (debouncedSearch) {
        searchParams.forEach((field) => {
          params[field as string] = debouncedSearch;
        });
      }
      return http.get<ApiResponseList<TOption>>(apiConfig, { params });
    },
    enabled: open
  });

  const loading = query.isLoading || query.isFetching;

  useEffect(() => {
    if (debouncedSearch !== '') {
      query.refetch();
    }
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const options: AutoCompleteOption<TOption>[] = (
    query.data?.data.content || []
  ).reduce((acc: AutoCompleteOption<TOption>[], item) => {
    const mapped = mappingData(item);
    if (mapped) {
      acc.push({ ...mapped, extra: item });
    }
    return acc;
  }, []);

  useEffect(() => {
    if (
      !fieldValue ||
      initialFetched.current ||
      selectedOption?.value === fieldValue
    )
      return;

    const getInitialOptions = async () => {
      const res = await http.get<ApiResponseList<TOption>>(apiConfig, {
        params: { [initialOptionParamName || 'id']: fieldValue }
      });
      if (res.result && res.data.content.length > 0) {
        const mapped = mappingData(res.data.content[0]);
        if (mapped) {
          const optionWithExtra = { ...mapped, extra: res.data.content[0] };
          setSelectedOption(optionWithExtra);
          setInitialOption(optionWithExtra);
        }
      }
    };

    getInitialOptions();
    initialFetched.current = true;
  }, [
    apiConfig,
    fieldValue,
    initialOptionParamName,
    mappingData,
    selectedOption?.value
  ]);

  const combinedOptions: AutoCompleteOption<TOption>[] = useMemo(() => {
    const opts = options.filter((opt) => initialOption?.value !== opt.value);
    return initialOption ? [initialOption, ...opts] : opts;
  }, [options, initialOption]);

  useEffect(() => {
    if (!fieldValue) {
      setSelectedOption(null);
      setInitialOption(null);
      setSearch('');
    }
  }, [fieldValue]);

  useEffect(() => {
    if (!search) {
      setHighlightedIndex(HIGHLIGHTED_INDEX_NONE);
    }
  }, [search]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const selectedValue = field.value;

        const toggleValue = (val: string | number) => {
          field.onChange(val.toString());
          const picked = combinedOptions.find((o) => o.value === val);
          if (picked) setSelectedOption(picked);
          onValueChange?.(val);
          setOpen(false);
          setSearch('');
        };

        const clearValue = () => {
          field.onChange('');
          setSelectedOption(null);
          onValueChange?.('');
          setOpen(false);
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
                      aria-controls='combobox'
                      aria-expanded={open}
                      aria-label='Select'
                      disabled={disabled}
                      title={selectedOption?.label ?? ''}
                      className={cn(
                        'hover:border-input focus-visible:border-input focus-visible:ring-main-color w-full justify-between border px-3! py-0 text-black hover:text-black focus-visible:border-transparent focus-visible:ring-2',
                        {
                          'ring-main-color border-transparent! ring-2': open,
                          '[&>div>span]:text-gray-300': fieldState.invalid,
                          'border-rose-500 ring-rose-500': !!fieldState.error
                        },
                        className
                      )}
                    >
                      {selectedOption ? (
                        <div
                          className={cn(
                            'flex min-w-0 flex-1 items-center gap-2',
                            {
                              'opacity-50': disabled
                            }
                          )}
                        >
                          {selectedOption.prefix}
                          <span className='truncate text-black'>
                            {selectedOption.label}
                          </span>
                        </div>
                      ) : (
                        <span className='opacity-30'>{placeholder}</span>
                      )}

                      {field.value && allowClear && !disabled ? (
                        <span
                          role='button'
                          onClick={(e) => {
                            e.stopPropagation();
                            clearValue();
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.stopPropagation();
                              clearValue();
                            }
                          }}
                          className='bg-accent ml-2 flex size-4 shrink-0 items-center justify-center rounded-full px-0 hover:opacity-80'
                        >
                          <X className='size-3' />
                        </span>
                      ) : (
                        <ChevronDown className='ml-0 size-4 shrink-0 text-gray-300' />
                      )}
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent
                    sideOffset={POPOVER_SIDE_OFFSET}
                    className='scrollbar-none max-h-[60vh] w-(--radix-popover-trigger-width) overflow-auto p-0'
                  >
                    <Command
                      shouldFilter={false}
                      className='bg-background'
                      ref={commandRef}
                    >
                      <CommandInput
                        placeholder={searchText}
                        value={search}
                        onValueChange={setSearch}
                        ref={commandInputRef}
                        onKeyDown={(e) => {
                          if (combinedOptions.length === 0) return;
                          switch (e.key) {
                            case 'ArrowDown':
                              e.preventDefault();
                              setHighlightedIndex((prev) =>
                                prev < combinedOptions.length - 1 ? prev + 1 : 0
                              );
                              break;
                            case 'ArrowUp':
                              e.preventDefault();
                              setHighlightedIndex((prev) =>
                                prev > 0 ? prev - 1 : combinedOptions.length - 1
                              );
                              break;
                            case 'Enter':
                              e.preventDefault();
                              const selected =
                                combinedOptions[highlightedIndex];
                              if (selected) toggleValue(selected.value);
                              break;
                            case 'Escape':
                              setOpen(false);
                              break;
                          }
                        }}
                      />
                      {options.length === 0 && !loading ? (
                        <CommandEmpty className='mx-auto h-50 pt-2 pb-4 text-center text-sm'>
                          <Image
                            src={emptyData.src}
                            width={EMPTY_STATE_IMAGE_WIDTH}
                            height={EMPTY_STATE_IMAGE_HEIGHT}
                            className='mx-auto h-auto'
                            alt={notFoundContent as string}
                          />
                          {notFoundContent}
                        </CommandEmpty>
                      ) : (
                        <CommandGroup
                          onMouseLeave={() => {
                            setHighlightedIndex(HIGHLIGHTED_INDEX_NONE);
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
                          {loading ? (
                            <CircleLoading className='stroke-main-color mx-auto my-2' />
                          ) : (
                            combinedOptions.map((opt, idx) => {
                              const value = opt.value;
                              const isSelected = value === selectedValue;
                              return (
                                <CommandItem
                                  key={opt.value}
                                  onSelect={() => toggleValue(opt.value)}
                                  onMouseEnter={() => setHighlightedIndex(idx)}
                                  onMouseLeave={() =>
                                    setHighlightedIndex(HIGHLIGHTED_INDEX_NONE)
                                  }
                                  title={opt.label}
                                  className={cn(
                                    'block cursor-pointer truncate rounded transition-all duration-200 ease-linear',
                                    {
                                      'bg-accent text-accent-foreground':
                                        highlightedIndex === idx,
                                      'bg-main-color/10': isSelected
                                    }
                                  )}
                                >
                                  {renderOption ? (
                                    renderOption(opt)
                                  ) : (
                                    <>
                                      {opt.prefix && (
                                        <span className='mr-1 font-mono text-xs opacity-70'>
                                          {opt.prefix}
                                        </span>
                                      )}
                                      {opt.label}
                                    </>
                                  )}
                                </CommandItem>
                              );
                            })
                          )}
                        </CommandGroup>
                      )}
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
