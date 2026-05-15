import { Button, ToolTip } from '@/components/form';
import { HasPermission } from '@/components/has-permission';
import { SearchForm } from '@/components/search-form';
import { ConfirmModal } from '@/components/modal';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import type {
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
import {
  keepPreviousData,
  useMutation,
  useInfiniteQuery
} from '@tanstack/react-query';
import { PlusIcon, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  type ReactNode,
  type UIEvent,
  useEffect,
  useMemo,
  useState
} from 'react';
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import { getQueryClient } from '@/components/providers/query-provider';

type HandlerType<T extends { id: string }, S extends BaseSearchType> = {
  changePagination: (page: number) => void;
  renderActionColumn: (options?: {
    actions?: Record<'edit' | 'delete' | string, ActionCondition<T>>;
    buttonProps?: Record<string, any>;
    columnProps?: Record<string, any>;
  }) => Column<T>;
  additionalParams: () => Partial<S>;
  additionalPathParams: () => Record<string, any>;
  additionalColumns: () => ReactNode | any;
  renderAddButton: () => ReactNode | any;
  renderSearchForm: ({
    searchFields,
    schema
  }: {
    searchFields: SearchFormProps<S>['searchFields'];
    schema: SearchFormProps<S>['schema'];
  }) => ReactNode | any;
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
  renderReloadButton: () => ReactNode;
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
  handleScrollLoadMore: (e: UIEvent<HTMLElement>) => void;
  mappingData: (response: ApiResponseList<T>) => ApiResponseList<T>;
};

type ActionCondition<T> = boolean | ((record: T) => boolean);

type UseInfiniteListBaseProps<
  T extends { id: string },
  S extends BaseSearchType
> = {
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
  };
  override?: (handlers: HandlerType<T, S>) => HandlerType<T, S> | void;
};

const TABLE_ACTION_COLUMN_WIDTH = 120;
const TABLE_STATUS_COLUMN_WIDTH = 150;
const STATUS_COLOR_ALPHA = 80;
const STATUS_BACKGROUND_ALPHA = 10;
const INFINITE_SCROLL_THRESHOLD = 100;

const useInfiniteListBase = <
  T extends { id: string },
  S extends BaseSearchType
>({
  apiConfig,
  options,
  override
}: UseInfiniteListBaseProps<T, S>) => {
  const {
    queryKey = '',
    objectName = '',
    pageSize = DEFAULT_TABLE_PAGE_SIZE,
    defaultFilters = {} as Partial<S>,
    enabled = true,
    excludeFromQueryFilter = [],
    notShowFromSearchParams = [],
    showNotify = true
  } = options;
  const navigate = useNavigate();
  const pathname = usePathname();
  const queryClient = getQueryClient();
  const [data, setData] = useState<T[]>([]);
  const hasPermission = useValidatePermission();

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
        page: mergedSearchParams.page
          ? Number(mergedSearchParams.page) - 1
          : DEFAULT_TABLE_PAGE_START,
        size: pageSize
      }).filter(([key]) => !excludeFromQueryFilter.includes(key))
    );

    return {
      ...filteredParams
    } as S;
  }, [mergedSearchParams, pageSize, excludeFromQueryFilter]);

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
          page: pageParam,
          size: pageSize,
          ...handlers.additionalParams()
        },
        pathParams: { ...handlers.additionalPathParams() }
      }),
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length - 1;
      const totalPages = lastPage.data.totalPages ?? 0;
      return currentPage < totalPages - 1 ? currentPage + 1 : undefined;
    },
    initialPageParam: 0,
    enabled,
    placeholderData: keepPreviousData
  });

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
    const allData =
      infiniteQuery.data?.pages.flatMap((page) => page.data.content || []) ||
      [];
    setData(allData);
  }, [infiniteQuery.data]);

  const changePagination = (page: number) => {
    setPagination((prev) => ({ ...prev, current: page }));

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
    navigate.push(path);
  };

  const handleDeleteClick = async (
    id: string,
    options?: { onSuccess?: () => void; onError?: (code: string) => void }
  ) => {
    await deleteMutation.mutateAsync(id, {
      onSuccess: async (res) => {
        if (res.result) {
          if (showNotify) notify.success(`Xoá ${objectName} thành công`);
          options?.onSuccess?.();
          await queryClient.invalidateQueries({
            queryKey: [`${queryKey}-infinite`]
          });
        } else {
          if (res.code) {
            if (options?.onError) options?.onError(res.code);
            else handlers.handleDeleteError(res.code);
          } else notify.error(`Xoá ${objectName} thất bại`);
        }
      },
      onError: (error: Error) => {
        logger.error('[DELETE_ERROR]', queryKey, error);
        notify.error(`Xoá ${objectName} thất bại`);
      }
    });
  };

  const handleDeleteError = (code: string) => {
    if (code) notify.error('Có lỗi xảy ra');
  };

  const additionalColumns = () => ({});

  const actionColumn = () => ({
    edit: (record: T, buttonProps?: Record<string, any>) => {
      // if (
      //   !apiConfig.update ||
      //   !apiConfig.update.permissionCode ||
      //   !hasPermission({
      //     requiredPermissions: [apiConfig.update.permissionCode]
      //   })
      // )
      //   return null;

      return (
        <ToolTip title={`Cập nhật ${objectName}`} sideOffset={0}>
          <span>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleEditClick(record.id);
              }}
              className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
              variant='ghost'
              {...buttonProps}
            >
              <AiOutlineEdit className='text-main-color size-4' />
            </Button>
          </span>
        </ToolTip>
      );
    },
    delete: (record: T, buttonProps?: Record<string, any>) => {
      // if (
      //   !apiConfig.delete ||
      //   !apiConfig.delete.permissionCode ||
      //   !hasPermission({
      //     requiredPermissions: [apiConfig.delete.permissionCode]
      //   })
      // )
      //   return null;

      return (
        <ToolTip title={`Xóa ${objectName}`} sideOffset={0}>
          <ConfirmModal
            message={`Bạn có chắc chắn muốn xóa ${objectName} này không ?`}
            onConfirm={() => handleDeleteClick(record.id)}
            trigger={
              <Button
                className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
                variant='ghost'
                {...buttonProps}
              >
                <AiOutlineDelete className='text-destructive size-4' />
              </Button>
            }
          />
        </ToolTip>
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
      (record: T, buttonProps?: any) => ReactNode
    > = { ...actionColumn(), ...extraColumns };

    return {
      title: 'Hành động',
      align: 'center' as const,
      width: TABLE_ACTION_COLUMN_WIDTH,
      ...options?.columnProps,
      render: (_: any, record: T) => {
        if (!options?.actions) return null;

        const actions = Object.keys(options.actions).flatMap((key) => {
          const condition = options.actions?.[key];

          const isValid =
            typeof condition === 'function'
              ? condition(record)
              : condition === true;

          if (!isValid) return [];

          const action = actionsObj[key]?.(record, options?.buttonProps);

          return action ? [action] : [];
        });

        return (
          <div className='flex items-center justify-center gap-2'>
            {actions.length
              ? actions.map((action, idx) => (
                  <div key={idx} className='flex items-center'>
                    {action}
                    {idx < actions.length - 1 && (
                      <Separator
                        orientation='vertical'
                        className='-mr-2 h-4! w-px bg-gray-200'
                      />
                    )}
                  </div>
                ))
              : 'N/A'}
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
      width: TABLE_STATUS_COLUMN_WIDTH,
      dataIndex: 'status',
      align: 'center',
      ...options?.columnProps,
      render: (value) => {
        const status = (options?.statusOptions || defaultStatusOptions).find(
          (st) => st.value === value
        );
        return (
          <Badge
            className='border border-solid text-sm font-medium'
            variant='outline'
            style={{
              borderColor: `${status?.color}${STATUS_COLOR_ALPHA}`,
              color: `${status?.color}`,
              backgroundColor: `${status?.color}${STATUS_BACKGROUND_ALPHA}`
            }}
          >
            {status?.label || 'N/A'}
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
          <Button variant='primary'>
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
            case FieldTypes.SELECT:
            case FieldTypes.AUTO_COMPLETE: {
              const option = field.options?.find(
                (opt: any) => String(opt.value) === String(value)
              );
              return [key, option ? option.value : value];
            }
            case FieldTypes.MULTI_SELECT:
              return [key, value?.split(',')];
            case FieldTypes.DATE:
              return [key, convertUTCToLocal(value)];
            case FieldTypes.BOOLEAN:
              return [key, Boolean(value)];
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

    const resetSearchValues = Object.fromEntries(
      Object.entries(defaultFilters).filter(
        ([key]) => !notShowFromSearchParams.includes(key)
      )
    ) as Partial<S>;

    // Handle reset
    const handleSearchReset = () => {
      const preservedParams = Object.fromEntries(
        Object.entries(searchParams).filter(([key]) =>
          excludeFromQueryFilter.includes(key)
        )
      );

      const resetParams = {
        ...resetSearchValues,
        ...preservedParams
      };

      if (serializeParams(searchParams) === serializeParams(resetParams))
        return;

      setPagination({
        current: DEFAULT_TABLE_PAGE_START + 1,
        pageSize: DEFAULT_TABLE_PAGE_SIZE,
        total: 0
      });

      setQueryParams(resetParams);
    };

    return (
      <SearchForm<S>
        initialValues={mergedValues}
        resetValues={resetSearchValues}
        searchFields={searchFields}
        schema={schema}
        handleSearchSubmit={handleSearchSubmit}
        handleSearchReset={handleSearchReset}
      />
    );
  };

  const invalidateQueries = async () => {
    await queryClient.invalidateQueries({
      queryKey: [`${queryKey}-infinite`, queryFilter]
    });
  };

  const renderReloadButton = () => (
    <Button
      disabled={infiniteQuery.isFetching}
      onClick={() => infiniteQuery.refetch()}
      variant='primary'
      loading={infiniteQuery.isFetching}
      iconClassName='size-4'
    >
      <RefreshCcw />
    </Button>
  );

  // Load more using useInfiniteQuery
  const loadMore = () => {
    if (infiniteQuery.hasNextPage && !infiniteQuery.isFetchingNextPage) {
      infiniteQuery.fetchNextPage();
    }
  };

  const handleScrollLoadMore = (e: UIEvent<HTMLElement>) => {
    const target = e.currentTarget;

    if (
      target.scrollTop + target.clientHeight >=
      target.scrollHeight - INFINITE_SCROLL_THRESHOLD
    ) {
      loadMore();
    }
  };

  const totalElements = useMemo(() => {
    return infiniteQuery.data?.pages[0]?.data.totalElements ?? 0;
  }, [infiniteQuery.data]);

  const totalPages = useMemo(() => {
    return infiniteQuery.data?.pages[0]?.data.totalPages ?? 0;
  }, [infiniteQuery.data]);

  const totalLeft = useMemo(() => {
    const currentPageList = infiniteQuery.data?.pageParams;
    if (currentPageList?.length) {
      const currentPage = currentPageList[currentPageList.length - 1] as number;
      return totalElements - (currentPage + 1) * pageSize;
    }
    return 0;
  }, [infiniteQuery.data?.pageParams, pageSize, totalElements]);

  const mappingData = (response: ApiResponseList<T>) => {
    return response;
  };

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
      mappingData
    };

    override?.(handlers);
    return handlers;
  };

  const handlers = extendableHandlers();

  return {
    data,
    pagination,
    loading: infiniteQuery.isLoading,
    deleting: deleteMutation.isPending,
    fetching: infiniteQuery.isFetching,
    handlers,
    queryFilter,
    listQuery: infiniteQuery,
    queryString,
    isFetchingMore: infiniteQuery.isFetchingNextPage,
    hasMore: infiniteQuery.hasNextPage,
    totalPages,
    totalElements,
    totalLeft
  };
};

export default useInfiniteListBase;
