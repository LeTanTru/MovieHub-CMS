'use client';

import './auto-complete-field.css';
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Control, FieldPath, FieldValues, useWatch } from 'react-hook-form';
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
import { ApiConfig, ApiResponseList } from '@/types';
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
import { useEffect, useMemo, useRef, useState } from 'react';
import { CircleLoading } from '@/components/loading';

type AutoCompleteOption<T = any> = {
  label: string;
  value: string | number;
  prefix?: React.ReactNode;
  extra?: T;
};

type AutoCompleteFieldProps<
  TFieldValues extends FieldValues,
  TOption extends Record<string, any>
> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  searchParams: (keyof TOption)[] | string[];
  initialParams?: Record<string, any>;
  placeholder?: string;
  description?: string;
  className?: string;
  required?: boolean;
  allowClear?: boolean;
  searchText?: string;
  notFoundContent?: React.ReactNode;
  labelClassName?: string;
  disabled?: boolean;
  apiConfig: ApiConfig;
  fetchAll?: boolean;
  onValueChange?: (value: string | number | null) => void;
  mappingData: (option: TOption) => AutoCompleteOption | null;
  renderOption?: (option: AutoCompleteOption<TOption>) => React.ReactNode;
};

export default function AutoCompleteField<
  TFieldValues extends FieldValues,
  TOption extends Record<string, any>
>({
  control,
  name,
  label,
  searchParams,
  initialParams = {},
  placeholder,
  description,
  className,
  required,
  allowClear,
  searchText,
  notFoundContent = 'Không có dữ liệu',
  labelClassName,
  disabled = false,
  apiConfig,
  fetchAll = false,
  onValueChange,
  mappingData,
  renderOption
}: AutoCompleteFieldProps<TFieldValues, TOption>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedOption, setSelectedOption] =
    useState<AutoCompleteOption | null>(null);
  const [initialOption, setInitialOption] = useState<AutoCompleteOption | null>(
    null
  );
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const commandInputRef = useRef<HTMLInputElement>(null);
  const initialFetched = useRef(false);
  const commandRef = useRef<HTMLDivElement>(null);

  const fieldValue = useWatch({ control, name });

  const updateSearch = useMemo(
    () => debounce((val: string) => setDebouncedSearch(val), 400),
    []
  );

  useEffect(() => {
    updateSearch(search);
  }, [search, updateSearch]);

  const query = useQuery({
    queryKey: [name, debouncedSearch, initialParams],
    queryFn: () => {
      const isSearching = debouncedSearch.trim() !== '';

      const params: Record<string, any> = {
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
    enabled: true
  });

  const loading = query.isLoading || query.isFetching;

  useEffect(() => {
    if (debouncedSearch !== '') {
      query.refetch();
    }
  }, [debouncedSearch]);

  const options: AutoCompleteOption<TOption>[] = (
    query.data?.data.content || []
  )
    .map((item) => {
      const mapped = mappingData(item);
      return mapped ? { ...mapped, extra: item } : null;
    })
    .filter((item) => item !== null);

  useEffect(() => {
    if (
      !fieldValue ||
      initialFetched.current ||
      selectedOption?.value === fieldValue
    )
      return;

    const getInitialOptions = async () => {
      const res = await http.get<ApiResponseList<TOption>>(apiConfig, {
        params: { id: fieldValue }
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
  }, [apiConfig, fieldValue, mappingData]);

  const combinedOptions: AutoCompleteOption[] = useMemo(() => {
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
      setHighlightedIndex(-1);
    }
  }, [search]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
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
            className={cn('relative', className, {
              'cursor-not-allowed': disabled
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
                  title={selectedOption?.label ?? ''}
                  className={cn(
                    'w-full flex-nowrap justify-between truncate border px-3! py-0 text-black opacity-80 opacity-100 focus:ring-0 focus-visible:border-gray-200 focus-visible:shadow-none focus-visible:ring-0',
                    {
                      'disabled:cursor-not-allowed disabled:opacity-100 disabled:hover:bg-transparent disabled:[&>div>span]:opacity-80':
                        disabled,
                      'border-dodger-blue ring-dodger-blue ring-1': open,
                      '[&>div>span]:text-gray-300': fieldState.invalid,
                      'border-red-500 ring-red-500': fieldState.invalid
                    }
                  )}
                >
                  {selectedOption ? (
                    <div className='flex min-w-0 flex-1 items-center gap-2'>
                      {selectedOption.prefix}
                      <span className='truncate text-black'>
                        {selectedOption.label}
                      </span>
                    </div>
                  ) : (
                    <span className='opacity-30'>{placeholder}</span>
                  )}

                  {field.value && allowClear ? (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        clearValue();
                      }}
                      className='bg-accent ml-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-full px-0 hover:opacity-80'
                    >
                      <X className='size-3' />
                    </span>
                  ) : (
                    <ChevronDown className='ml-0 h-4 w-4 shrink-0 opacity-50' />
                  )}
                </Button>
              </PopoverTrigger>

              {description && (
                <FormDescription className='ml-1.5'>
                  {description}
                </FormDescription>
              )}

              <PopoverContent className='scroll-bar max-h-[60vh] w-(--radix-popover-trigger-width) overflow-auto p-0'>
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
                          const selected = combinedOptions[highlightedIndex];
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
                        width={120}
                        height={50}
                        className='mx-auto'
                        alt={notFoundContent as string}
                      />
                      {notFoundContent}
                    </CommandEmpty>
                  ) : (
                    <CommandGroup
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
                      {loading ? (
                        <CircleLoading className='stroke-dodger-blue my-2 size-7' />
                      ) : (
                        combinedOptions.map((opt, idx) => (
                          <CommandItem
                            key={opt.value}
                            onSelect={() => toggleValue(opt.value)}
                            onMouseEnter={() => setHighlightedIndex(idx)}
                            onMouseLeave={() => setHighlightedIndex(-1)}
                            title={opt.label}
                            className={cn(
                              'block cursor-pointer truncate rounded transition-all duration-200 ease-linear',
                              {
                                'bg-accent text-accent-foreground':
                                  field.value === opt.value ||
                                  highlightedIndex === idx
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
                        ))
                      )}
                    </CommandGroup>
                  )}
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
