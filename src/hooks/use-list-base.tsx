'use client';

import { Button, ToolTip } from '@/components/form';
import { HasPermission } from '@/components/has-permission';
import { SearchForm } from '@/components/search-form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import {
  DEFAULT_TABLE_PAGE_SIZE,
  DEFAULT_TABLE_PAGE_START,
  FieldTypes,
  statusOptions as defaultStatusOptions
} from '@/constants';
import useNavigate from '@/hooks/use-navigate';
import useQueryParams from '@/hooks/use-query-params';
import useValidatePermission from '@/hooks/use-validate-permission';
import { logger } from '@/logger';
import {
  ApiConfig,
  ApiResponse,
  ApiResponseList,
  BaseSearchType,
  Column,
  OptionType,
  PaginationType,
  SearchFormProps
} from '@/types';
import { convertUTCToLocal, http, notify } from '@/utils';
import { Separator } from '@radix-ui/react-separator';
import {
  keepPreviousData,
  useMutation,
  useInfiniteQuery,
  useQueryClient
} from '@tanstack/react-query';
import { Info, PlusIcon, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';

type HandlerType<T extends { id: string }, S extends BaseSearchType> = {
  changePagination: (page: number) => void;
  renderActionColumn: (options?: {
    actions?: Record<'edit' | 'delete' | string, ActionCondition<T>>;
    buttonProps?: Record<string, any>;
    columnProps?: Record<string, any>;
  }) => Column<T>;
  additionalParams: () => Partial<S>;
  additionalPathParams: () => Record<string, any>;
  additionalColumns: () => React.ReactNode | any;
  renderAddButton: () => React.ReactNode | any;
  renderSearchForm: ({
    searchFields,
    schema
  }: {
    searchFields: SearchFormProps<S>['searchFields'];
    schema: SearchFormProps<S>['schema'];
  }) => React.ReactNode | any;
  renderStatusColumn: ({
    statusOptions,
    columnProps
  }?: {
    statusOptions?: OptionType[];
    columnProps?: Record<string, any>;
  }) => Column<T>;
  setQueryParam: (key: keyof S, value: S[keyof S] | null) => void;
  handleEditClick: (id: string) => void;
  handleDeleteClick: (
    id: string,
    options?: { onSuccess?: () => void; onError?: (code: string) => void }
  ) => void;
  invalidateQueries: () => void;
  renderReloadButton: () => React.ReactNode;
  changeQueryFilter: (filter: Partial<S>) => void;
  handleDeleteError: (code: string) => void;
  hasPermission: ({
    requiredPermissions,
    requiredKind,
    excludeKind,
    userKind,
    path,
    separate
  }: {
    requiredPermissions: string[];
    requiredKind?: number | undefined;
    excludeKind?: string[] | undefined;
    userKind?: number | undefined;
    path?: string | undefined;
    separate?: boolean | undefined;
  }) => boolean;
  setData: (data: T[]) => void;
  loadMore: () => void;
  handleScrollLoadMore: (e: React.UIEvent<HTMLElement>) => void;
  setHiddenFilter: (key: keyof S, value: S[keyof S] | null) => void;
  setHiddenFilters: (filters: Partial<S>) => void;
};

type ActionCondition<T> = boolean | ((record: T) => boolean);

type UseListBaseProps<T extends { id: string }, S extends BaseSearchType> = {
  apiConfig: {
    getList: ApiConfig;
    getById?: ApiConfig;
    create?: ApiConfig;
    update?: ApiConfig;
    delete?: ApiConfig;
  };
  options: {
    queryKey: string;
    objectName: string;
    pageSize?: number;
    defaultFilters?: Partial<S>;
    enabled?: boolean;
    excludeFromQueryFilter?: string[];
    notShowFromSearchParams?: string[];
    showNotify?: boolean;
    defaultHiddenFilters?: Partial<S>;
    useInfiniteScroll?: boolean;
  };
  override?: (handlers: HandlerType<T, S>) => HandlerType<T, S> | void;
};

export default function useListBase<
  T extends { id: string },
  S extends BaseSearchType
>({ apiConfig, options, override }: UseListBaseProps<T, S>) {
  const {
    queryKey = '',
    objectName = '',
    pageSize = DEFAULT_TABLE_PAGE_SIZE,
    defaultFilters = {} as Partial<S>,
    enabled = true,
    excludeFromQueryFilter = [],
    notShowFromSearchParams = [],
    showNotify = true,
    defaultHiddenFilters = {} as Partial<S>,
    useInfiniteScroll = false
  } = options;
  const navigate = useNavigate();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [data, setData] = useState<T[]>([]);
  const [hiddenFilters, setHiddenFiltersState] =
    useState<Partial<S>>(defaultHiddenFilters);
  const { hasPermission } = useValidatePermission();

  const [pagination, setPagination] = useState<PaginationType>({
    current: DEFAULT_TABLE_PAGE_START,
    pageSize: DEFAULT_TABLE_PAGE_SIZE,
    total: 0
  });
  const {
    searchParams,
    queryString,
    setQueryParams,
    setQueryParam,
    serializeParams
  } = useQueryParams<S>();

  // Combined current params with default params
  const mergedSearchParams = useMemo(() => {
    return { ...defaultFilters, ...searchParams };
  }, [searchParams, defaultFilters]);

  // Filter params which will not be filtered by
  const queryFilter = useMemo(() => {
    const filteredParams = Object.fromEntries(
      Object.entries({
        ...mergedSearchParams,
        ...hiddenFilters,
        page: mergedSearchParams.page
          ? Number(mergedSearchParams.page) - 1
          : DEFAULT_TABLE_PAGE_START,
        size: pageSize
      }).filter(([key]) => !excludeFromQueryFilter.includes(key))
    );

    return {
      ...filteredParams
    } as S;
  }, [mergedSearchParams, hiddenFilters, pageSize, excludeFromQueryFilter]);

  // Clear undefined | null params
  useEffect(() => {
    Object.entries(defaultFilters).forEach(([key, value]) => {
      if (
        (searchParams[key as keyof S] === undefined ||
          searchParams[key as keyof S] === null) &&
        !notShowFromSearchParams.includes(key)
      ) {
        setQueryParam(key as keyof S, value as S[keyof S]);
      }
    });
  }, [defaultFilters, notShowFromSearchParams, searchParams, setQueryParam]);

  const additionalPathParams = () => ({});

  const additionalParams = () => ({});

  // Infinite Query for infinite scroll
  const infiniteQuery = useInfiniteQuery({
    queryKey: [`${queryKey}-infinite`, queryFilter],
    queryFn: ({ pageParam = 0 }) =>
      http.get<ApiResponseList<T>>(apiConfig.getList, {
        params: {
          ...queryFilter,
          ...handlers.additionalParams(),
          page: pageParam,
          size: pageSize
        },
        pathParams: { ...handlers.additionalPathParams() }
      }),
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length - 1;
      const totalPages = lastPage.data.totalPages ?? 0;
      return currentPage < totalPages - 1 ? currentPage + 1 : undefined;
    },
    initialPageParam: 0,
    enabled: enabled && useInfiniteScroll,
    placeholderData: keepPreviousData
  });

  // Regular query for pagination
  const listQuery = useInfiniteQuery({
    queryKey: [`${queryKey}-list`, queryFilter],
    queryFn: ({ pageParam = 0 }) =>
      http.get<ApiResponseList<T>>(apiConfig.getList, {
        params: {
          ...queryFilter,
          ...handlers.additionalParams(),
          page: pageParam,
          size: pageSize
        },
        pathParams: { ...handlers.additionalPathParams() }
      }),
    getNextPageParam: () => undefined,
    initialPageParam: queryFilter.page || 0,
    enabled: enabled && !useInfiniteScroll,
    placeholderData: keepPreviousData
  });

  const activeQuery = useInfiniteScroll ? infiniteQuery : listQuery;

  const deleteMutation = useMutation({
    mutationKey: [`delete-${queryKey}`],
    mutationFn: (id: string) =>
      http.delete<ApiResponse<any>>(apiConfig.delete as ApiConfig, {
        pathParams: {
          id
        }
      })
  });

  // Update data from query results
  useEffect(() => {
    if (useInfiniteScroll) {
      const allData =
        infiniteQuery.data?.pages.flatMap((page) => page.data.content || []) ||
        [];
      setData(allData);
    } else {
      const firstPage = listQuery.data?.pages[0];
      setData(firstPage?.data.content || []);
    }
  }, [useInfiniteScroll, infiniteQuery.data, listQuery.data]);

  // Pagination
  const current = searchParams['page'];
  useEffect(() => {
    if (!useInfiniteScroll) {
      const firstPage = listQuery.data?.pages[0];
      setPagination((p) => ({
        ...p,
        current: current ? Number(current) : DEFAULT_TABLE_PAGE_START + 1,
        total: firstPage?.data.totalPages ?? 0
      }));
    }
  }, [current, listQuery.data, useInfiniteScroll]);

  const changePagination = (page: number) => {
    setPagination({ ...pagination, current: page });

    setQueryParams({
      ...searchParams,
      page
    } as Partial<S>);
    if (page === 1) {
      setQueryParam('page', null);
    }
  };

  const handleEditClick = (id: string) => {
    const query = serializeParams(searchParams);
    const path = query ? `${pathname}/${id}?${query}` : `${pathname}/${id}`;
    navigate(path);
  };

  const handleDeleteClick = async (
    id: string,
    options?: { onSuccess?: () => void; onError?: (code: string) => void }
  ) => {
    await deleteMutation.mutateAsync(id, {
      onSuccess: (res) => {
        if (res.result) {
          if (showNotify) notify.success(`Xoá ${objectName} thành công`);
          queryClient.invalidateQueries({ queryKey: [`${queryKey}-list`] });
          queryClient.invalidateQueries({
            queryKey: [`${queryKey}-infinite`]
          });
          options?.onSuccess?.();
        } else {
          if (res.code) {
            if (options?.onError) options?.onError(res.code);
            else handlers.handleDeleteError(res.code);
          } else notify.error(`Xoá ${objectName} thất bại`);
        }
      },
      onError: (error: Error) => {
        logger.error(`Error while deleting ${queryKey}: `, error);
        notify.error('Có lỗi xảy ra khi xóa');
      }
    });
  };

  const handleDeleteError = (code: string) => {
    if (code) notify.error('Có lỗi xảy ra');
  };

  const additionalColumns = () => ({});

  const actionColumn = () => ({
    edit: (record: T, buttonProps?: Record<string, any>) => {
      if (
        !apiConfig.update ||
        !apiConfig.update.permissionCode ||
        !hasPermission({
          requiredPermissions: [apiConfig.update.permissionCode]
        })
      )
        return null;

      return (
        <ToolTip title={`Cập nhật ${objectName}`} sideOffset={0}>
          <span>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleEditClick(record.id);
              }}
              className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
              {...buttonProps}
            >
              <AiOutlineEdit className='text-dodger-blue size-4' />
            </Button>
          </span>
        </ToolTip>
      );
    },
    delete: (record: T, buttonProps?: Record<string, any>) => {
      if (
        !apiConfig.delete ||
        !apiConfig.delete.permissionCode ||
        !hasPermission({
          requiredPermissions: [apiConfig.delete.permissionCode]
        })
      )
        return null;

      return (
        <AlertDialog>
          <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
            <span>
              <ToolTip title={`Xóa ${objectName}`} sideOffset={0}>
                <Button
                  className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
                  {...buttonProps}
                >
                  <AiOutlineDelete className='text-destructive size-4' />
                </Button>
              </ToolTip>
            </span>
          </AlertDialogTrigger>
          <AlertDialogContent className='data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-0! data-[state=closed]:slide-out-to-top-0! data-[state=open]:slide-in-from-left-0! data-[state=open]:slide-in-from-top-0! top-[30%] max-w-md p-4'>
            <AlertDialogHeader>
              <AlertDialogTitle className='content flex flex-nowrap items-center gap-2 text-sm font-normal'>
                <Info className='size-8 fill-orange-500 stroke-white' />
                Bạn có chắc chắn muốn xóa {objectName} này không ?
              </AlertDialogTitle>
              <AlertDialogDescription></AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button
                  onClick={(e) => e.stopPropagation()}
                  variant='outline'
                  className='w-20 border-red-500 text-red-500 transition-all duration-200 ease-linear hover:bg-transparent hover:text-red-500/80'
                >
                  Không
                </Button>
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(record.id);
                }}
                className='bg-dodger-blue hover:bg-dodger-blue/80 w-20 cursor-pointer transition-all duration-200 ease-linear'
              >
                Có
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    }
  });

  const renderActionColumn = (options?: {
    actions?: Record<'edit' | 'delete' | string, ActionCondition<T>>;
    buttonProps?: Record<string, any>;
    columnProps?: Record<string, any>;
  }): Column<T> => {
    const extraColumns = handlers.additionalColumns?.() || {};
    const actionsObj: Record<
      string,
      (record: T, buttonProps?: any) => React.ReactNode
    > = { ...actionColumn(), ...extraColumns };

    return {
      title: 'Hành động',
      align: 'center' as const,
      width: 120,
      ...options?.columnProps,
      render: (_: any, record: T) => {
        if (!options?.actions) return null;

        const actions = Object.keys(options.actions)
          .filter((key) => {
            const condition = options.actions?.[key];
            if (typeof condition === 'function') return condition(record);
            return condition === true;
          })
          .map((key) => actionsObj[key]?.(record, options?.buttonProps))
          .filter(Boolean);

        return (
          <div className='flex items-center justify-center gap-2'>
            {actions.map((action, idx) => (
              <div key={idx} className='flex items-center'>
                {action}
                {idx < actions.length - 1 && (
                  <Separator
                    orientation='vertical'
                    className='-mr-2 h-4! w-px bg-gray-200'
                  />
                )}
              </div>
            ))}
          </div>
        );
      }
    };
  };

  const renderStatusColumn = (options?: {
    statusOptions?: OptionType[];
    columnProps?: Record<string, any>;
  }): Column<T> => {
    return {
      title: 'Trạng thái',
      width: 150,
      dataIndex: 'status',
      align: 'center',
      ...options?.columnProps,
      render: (value) => {
        const status = (options?.statusOptions || defaultStatusOptions).find(
          (st) => st.value === value
        );
        return (
          <Badge
            className='text-sm font-normal'
            style={{ backgroundColor: status?.color }}
          >
            {status?.label}
          </Badge>
        );
      }
    };
  };

  const renderAddButton = () => {
    if (!apiConfig.create || !apiConfig.create.permissionCode) return null;
    let path = `${pathname}/create`;
    if (Object.keys(searchParams).length > 0)
      path = `${path}?${serializeParams(searchParams)}`;
    return (
      <HasPermission requiredPermissions={[apiConfig.create.permissionCode]}>
        <Link href={path}>
          <Button variant={'primary'}>
            <PlusIcon />
            Thêm mới
          </Button>
        </Link>
      </HasPermission>
    );
  };

  const changeQueryFilter = (filters: Partial<S>) => {
    const preservedParams = Object.fromEntries(
      Object.entries(searchParams).filter(([key]) =>
        excludeFromQueryFilter.includes(key)
      )
    );

    const filteredValues = Object.fromEntries(
      Object.entries(filters).filter(
        ([key]) => !notShowFromSearchParams.includes(key)
      )
    );

    setQueryParams({ ...filteredValues, ...preservedParams } as Partial<S>);
  };

  const renderSearchForm = ({
    searchFields,
    schema
  }: {
    searchFields: SearchFormProps<S>['searchFields'];
    schema: SearchFormProps<S>['schema'];
  }) => {
    // Set value for search fields
    const mergedValues = {
      ...queryFilter,
      ...Object.fromEntries(
        Object.entries(searchParams).map(([key, value]) => {
          const field = searchFields.find((f) => f.key === key);
          if (!field) return [key, value];

          switch (field.type) {
            case FieldTypes.NUMBER:
              return [key, value ? Number(value) : undefined];
            case FieldTypes.SELECT ||
              FieldTypes.AUTOCOMPLETE ||
              FieldTypes.MULTI_SELECT:
              const option = field.options?.find(
                (opt: any) => String(opt.value) === String(value)
              );
              return [key, option ? option.value : value];
            case FieldTypes.DATE:
              return [key, convertUTCToLocal(value)];
            default:
              return [key, value];
          }
        })
      )
    };

    // Handle search
    const handleSearchSubmit = (values: Partial<S>) => {
      handlers.changeQueryFilter(values);
    };

    // Handle reset
    const handleSearchReset = () => {
      if (Object.keys(searchParams).length === 0) return;

      setPagination({
        current: DEFAULT_TABLE_PAGE_START + 1,
        pageSize: DEFAULT_TABLE_PAGE_SIZE,
        total: 0
      });

      const preservedParams = Object.fromEntries(
        Object.entries(searchParams).filter(([key]) =>
          excludeFromQueryFilter.includes(key)
        )
      );

      const filteredValues = Object.fromEntries(
        Object.entries(defaultFilters).filter(
          ([key]) => !notShowFromSearchParams.includes(key)
        )
      );

      setQueryParams({ ...(filteredValues as Partial<S>), ...preservedParams });
    };

    return (
      <SearchForm<S>
        initialValues={mergedValues}
        searchFields={searchFields}
        schema={schema}
        handleSearchSubmit={handleSearchSubmit}
        handleSearchReset={handleSearchReset}
      />
    );
  };

  const invalidateQueries = () => {
    queryClient.invalidateQueries({
      queryKey: [`${queryKey}-list`, queryFilter]
    });
    queryClient.invalidateQueries({
      queryKey: [`${queryKey}-infinite`, queryFilter]
    });
  };

  const renderReloadButton = () => (
    <Button
      disabled={activeQuery.isFetching}
      onClick={() => activeQuery.refetch()}
      variant={'primary'}
    >
      <RefreshCcw />
    </Button>
  );

  // Load more using useInfiniteQuery
  const loadMore = () => {
    if (
      useInfiniteScroll &&
      infiniteQuery.hasNextPage &&
      !infiniteQuery.isFetchingNextPage
    ) {
      infiniteQuery.fetchNextPage();
    }
  };

  const handleScrollLoadMore = (e: React.UIEvent<HTMLElement>) => {
    const target = e.currentTarget;

    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 100) {
      loadMore();
    }
  };

  const setHiddenFilter = (key: keyof S, value: S[keyof S] | null) => {
    setHiddenFiltersState((prev) => {
      const newFilters = { ...prev };
      if (value === null || value === undefined) {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }
      return newFilters;
    });

    setPagination((p) => ({ ...p, current: 1 }));
    setQueryParam('page', null);
  };

  const setHiddenFilters = (filters: Partial<S>) => {
    setHiddenFiltersState((prev) => ({
      ...prev,
      ...filters
    }));

    setPagination((p) => ({ ...p, current: 1 }));
    setQueryParam('page', null);
  };

  // Get total elements and total pages from active query
  const totalElements = useMemo(() => {
    if (useInfiniteScroll) {
      return infiniteQuery.data?.pages[0]?.data.totalElements ?? 0;
    }
    return listQuery.data?.pages[0]?.data.totalElements ?? 0;
  }, [useInfiniteScroll, infiniteQuery.data, listQuery.data]);

  const totalPages = useMemo(() => {
    if (useInfiniteScroll) {
      return infiniteQuery.data?.pages[0]?.data.totalPages ?? 0;
    }
    return listQuery.data?.pages[0]?.data.totalPages ?? 0;
  }, [useInfiniteScroll, infiniteQuery.data, listQuery.data]);

  const totalLeft = useMemo(() => {
    const currentPageList = infiniteQuery.data?.pageParams;
    if (currentPageList?.length) {
      const currentPage = currentPageList[currentPageList.length - 1] as number;
      return totalElements - (currentPage + 1) * pageSize;
    }
    return 0;
  }, [infiniteQuery.data?.pageParams, pageSize, totalElements]);

  const extendableHandlers = (): HandlerType<T, S> => {
    const handlers: HandlerType<T, S> = {
      changePagination,
      renderActionColumn,
      additionalParams,
      additionalPathParams,
      additionalColumns,
      renderAddButton,
      renderSearchForm,
      renderStatusColumn,
      setQueryParam,
      handleEditClick,
      handleDeleteClick,
      invalidateQueries,
      renderReloadButton,
      changeQueryFilter,
      handleDeleteError,
      hasPermission,
      setData,
      loadMore,
      handleScrollLoadMore,
      setHiddenFilter,
      setHiddenFilters
    };

    override?.(handlers);
    return handlers;
  };

  const handlers = extendableHandlers();

  return {
    data,
    pagination,
    loading: useInfiniteScroll
      ? activeQuery.isLoading
      : activeQuery.isLoading || deleteMutation.isPending,
    handlers,
    queryFilter,
    listQuery: activeQuery,
    queryString,
    isFetchingMore: useInfiniteScroll
      ? infiniteQuery.isFetchingNextPage
      : false,
    hasMore: useInfiniteScroll ? infiniteQuery.hasNextPage : false,
    totalPages,
    totalElements,
    totalLeft
  };
}
