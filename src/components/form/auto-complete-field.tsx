'use client';

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
import { DEFAULT_TABLE_PAGE_SIZE, DEFAULT_TABLE_PAGE_START } from '@/constants';
import debounce from 'lodash/debounce';
import Image from 'next/image';
import { emptyData } from '@/assets';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CircleLoading } from '@/components/loading';

type AutoCompleteOption = {
  label: string;
  value: string | number;
  prefix?: React.ReactNode;
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
  multiple?: boolean;
  allowClear?: boolean;
  searchText?: string;
  notFoundContent?: React.ReactNode;
  labelClassName?: string;
  disabled?: boolean;
  onValueChange?: (value: string | number | (string | number)[]) => void;
  apiConfig: ApiConfig;
  mappingData: (option: TOption) => AutoCompleteOption;
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
  multiple = false,
  allowClear,
  searchText,
  notFoundContent = 'Không có dữ liệu',
  labelClassName,
  disabled = false,
  onValueChange,
  apiConfig,
  mappingData
}: AutoCompleteFieldProps<TFieldValues, TOption>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<AutoCompleteOption[]>(
    []
  );
  const [initialOption, setInitialOption] = useState<AutoCompleteOption | null>(
    null
  );
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const commandInputRef = useRef<HTMLInputElement>(null);
  const initialFetched = useRef(false);

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
      const params: Record<string, any> = {
        page: DEFAULT_TABLE_PAGE_START,
        size: DEFAULT_TABLE_PAGE_SIZE,
        ...initialParams
      };
      if (debouncedSearch) {
        searchParams.forEach((field) => {
          params[field as string] = debouncedSearch;
        });
      }
      return http.get<ApiResponseList<TOption>>(apiConfig, { params });
    },
    enabled: false
  });

  const loading = query.isLoading || query.isFetching;

  const isFirstFetch = useRef(false);
  useEffect(() => {
    if (open && !isFirstFetch.current) {
      query.refetch();
      isFirstFetch.current = true;
    }
  }, [open]);

  useEffect(() => {
    if (debouncedSearch !== '' && open) {
      query.refetch();
    }
  }, [debouncedSearch, open]);

  const options: AutoCompleteOption[] = (query.data?.data.content || []).map(
    mappingData
  );

  useEffect(() => {
    if (!fieldValue || initialFetched.current) return;

    const getInitialOptions = async () => {
      let fetchedOptions: AutoCompleteOption[] = [];

      if (Array.isArray(fieldValue)) {
        const results = await Promise.all(
          fieldValue.map((id: string) =>
            http.get<ApiResponseList<TOption>>(apiConfig, { params: { id } })
          )
        );
        results.forEach((res) => {
          if (res.result && res.data.content.length > 0) {
            fetchedOptions.push(mappingData(res.data.content[0]));
          }
        });
      } else {
        const res = await http.get<ApiResponseList<TOption>>(apiConfig, {
          params: { id: fieldValue }
        });
        if (res.result && res.data.content.length > 0) {
          fetchedOptions.push(mappingData(res.data.content[0]));
        }
      }

      if (fetchedOptions.length > 0) {
        setSelectedOptions(fetchedOptions);
        setInitialOption(fetchedOptions[0]);
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
    if (!fieldValue || (Array.isArray(fieldValue) && fieldValue.length === 0)) {
      setSelectedOptions([]);
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
        const selectedValues: (string | number)[] =
          field.value === undefined
            ? []
            : multiple
              ? Array.isArray(field.value)
                ? field.value
                : []
              : [field.value].filter(Boolean);

        const toggleValue = (val: string | number) => {
          if (multiple) {
            const next = selectedValues.includes(val)
              ? selectedValues.filter((v) => v !== val)
              : [...selectedValues, val];

            field.onChange(next);

            const picked = combinedOptions.find((o) => o.value === val);
            if (picked) {
              setSelectedOptions((prev) => {
                const exist = prev.find((p) => p.value === val);
                return exist
                  ? prev.filter((p) => p.value !== val)
                  : [...prev, picked];
              });
            }

            onValueChange?.(next);
          } else {
            field.onChange(val.toString());
            const picked = combinedOptions.find((o) => o.value === val);
            if (picked) setSelectedOptions([picked]);
            onValueChange?.(val);
            setOpen(false);
          }

          setSearch('');
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
                  title={selectedOptions[0]?.label ?? ''}
                  className={cn(
                    'w-full flex-nowrap justify-between truncate border px-3! py-0 text-black opacity-80 opacity-100 focus:ring-0 focus-visible:border-gray-200 focus-visible:shadow-none focus-visible:ring-0',
                    {
                      'disabled:cursor-not-allowed disabled:opacity-100 disabled:hover:bg-transparent disabled:[&>div>span]:opacity-80':
                        disabled,
                      'border-dodger-blue ring-dodger-blue ring-1': open,
                      '[&>div>span]:text-gray-300': fieldState.invalid,
                      'border-red-500 ring-red-500': fieldState.invalid,
                      'pl-1!': multiple && selectedValues.length
                    }
                  )}
                >
                  {multiple ? (
                    selectedOptions.length > 0 ? (
                      <div className='flex flex-wrap gap-2'>
                        {selectedOptions.map((opt) => {
                          return (
                            <div
                              key={opt.value}
                              className='bg-accent text-accent-foreground flex items-center rounded px-2 py-1 text-sm'
                            >
                              {opt.prefix && (
                                <span className='mr-1 font-mono text-xs opacity-70'>
                                  {opt.prefix}
                                </span>
                              )}
                              {opt.label}
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const next = selectedValues.filter(
                                    (v) => v !== opt.value
                                  );
                                  field.onChange(next);
                                  setSelectedOptions((prev) =>
                                    prev.filter((p) => p.value !== opt.value)
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
                      <span className='opacity-30'>{placeholder}</span>
                    )
                  ) : selectedOptions.length === 1 ? (
                    <div className='flex min-w-0 flex-1 items-center gap-2'>
                      {selectedOptions[0].prefix}
                      <span className='truncate text-black'>
                        {selectedOptions[0].label}
                      </span>
                    </div>
                  ) : (
                    <span className='opacity-30'>{placeholder}</span>
                  )}

                  {selectedValues.length > 0 && allowClear ? (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        field.onChange(multiple ? [] : null);
                        setSelectedOptions([]);
                        setOpen(false);
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

              <PopoverContent className='w-(--radix-popover-trigger-width) p-0'>
                <Command shouldFilter={false} className='bg-background'>
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
                    <CommandEmpty className='mx-auto pt-2 pb-4 text-center text-sm'>
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
                    <CommandGroup>
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
                              'block cursor-pointer truncate rounded',
                              {
                                'bg-accent text-accent-foreground':
                                  selectedValues.includes(opt.value) ||
                                  highlightedIndex === idx
                              }
                            )}
                          >
                            {opt.prefix && (
                              <span className='mr-1 font-mono text-xs opacity-70'>
                                {opt.prefix}
                              </span>
                            )}
                            {opt.label}
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
