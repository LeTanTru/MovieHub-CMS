import { Button } from '@/components/form/button';
import { ToolTip } from '@/components/form/tooltip';
import { HasPermission } from '@/components/has-permission';
import { SearchForm } from '@/components/search-form';
import { ConfirmModal } from '@/components/modal';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DEFAULT_TABLE_PAGE_SIZE,
  DEFAULT_TABLE_PAGE_START,
  FieldTypes,
  PARENT_PREFIX_PARAM,
  statusOptions as defaultStatusOptions
} from '@/constants';
import { useNavigate } from '@/hooks/use-navigate';
import { useQueryParams } from '@/hooks/use-query-params';
import { useValidatePermission } from '@/hooks/use-validate-permission';
import { logger } from '@/logger';
import type {
  ApiConfig,
  ApiResponseList,
  ApiResponseNoData,
  BaseSearchType,
  Column,
  OptionType,
  PaginationType,
  SearchFormProps
} from '@/types';
import {
  convertUTCToLocal,
  http,
  invalidateQueries as invalidateQueryUtil,
  notify
} from '@/utils';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { PlusIcon, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode, useEffect, useState } from 'react';
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';

type HandlerType<T extends { id: string }, S extends BaseSearchType> = {
  changePagination: (page: number) => void;
  renderActionColumn: (options?: {
    actions?: Record<'edit' | 'delete' | string, ActionCondition<T>>;
    buttonProps?: Record<string, unknown>;
    columnProps?: Record<string, unknown>;
  }) => Column<T>;
  additionalParams: () => Partial<S>;
  additionalPathParams: () => Record<string, string | number>;
  additionalColumns: () => Record<
    string,
    (record: T, buttonProps?: Record<string, unknown>) => ReactNode
  >;
  renderAddButton: () => ReactNode;
  renderSearchForm: ({
    searchFields,
    schema
  }: {
    searchFields: SearchFormProps<S>['searchFields'];
    schema: SearchFormProps<S>['schema'];
  }) => ReactNode;
  renderStatusColumn: (options?: {
    statusOptions?: OptionType[];
    columnProps?: Record<string, unknown>;
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
  };
  override?: (handlers: HandlerType<T, S>) => HandlerType<T, S> | void;
};

const TABLE_ACTION_COLUMN_WIDTH = 120;
const TABLE_STATUS_COLUMN_WIDTH = 150;
const STATUS_COLOR_ALPHA = 80;
const STATUS_BACKGROUND_ALPHA = 10;

/**
 * Hook to manage a paginated list page with filtering, pagination, and delete operations.
 *
 * @param params - The list base configurations.
 * @param params.apiConfig - Endpoints for list, CRUD, and delete operations.
 * @param params.options - Listing behavior options like page size, filters, permissions, etc.
 * @param params.override - Callback to override standard event handlers.
 */
export const useListBase = <
  T extends { id: string },
  S extends BaseSearchType
>({
  apiConfig,
  options,
  override
}: UseListBaseProps<T, S>) => {
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
  const [data, setData] = useState<T[]>([]);
  const hasPermission = useValidatePermission();

  const [pagination, setPagination] = useState<PaginationType>({
    currentPage: DEFAULT_TABLE_PAGE_START,
    pageSize: DEFAULT_TABLE_PAGE_SIZE,
    totalPages: 0
  });

  const {
    searchParams,
    queryString,
    setQueryParams,
    setQueryParam,
    serializeParams
  } = useQueryParams<S>();

  // check if param is excluded from query filter
  const isExcluded = (key: string) =>
    excludeFromQueryFilter.includes(key) || key.startsWith(PARENT_PREFIX_PARAM);

  // Combined current params with default params
  const mergedSearchParams = { ...defaultFilters, ...searchParams };

  // Filter params which will not be filtered by
  const queryFilter = {
    ...Object.fromEntries(
      Object.entries({
        ...mergedSearchParams,
        page: mergedSearchParams.page
          ? Number(mergedSearchParams.page) - 1
          : DEFAULT_TABLE_PAGE_START,
        size: pageSize
      }).filter(([key]) => !isExcluded(key))
    )
  } as S;

  // Clear undefined | null params and remove excluded params
  useEffect(() => {
    let hasChanges = false;
    const newParams = { ...searchParams };

    // 1. Add missing default filters
    Object.entries(defaultFilters).forEach(([key, value]) => {
      const isMissing =
        newParams[key as keyof S] === undefined ||
        newParams[key as keyof S] === null;

      if (isMissing && !notShowFromSearchParams.includes(key)) {
        newParams[key as keyof S] = value as S[keyof S];
        hasChanges = true;
      }
    });

    // 2. Remove any params that are in notShowFromSearchParams
    notShowFromSearchParams.forEach((key) => {
      if (
        newParams[key as keyof S] !== undefined &&
        newParams[key as keyof S] !== null
      ) {
        delete newParams[key as keyof S];
        hasChanges = true;
      }
    });

    if (!hasChanges) return;

    setQueryParams(newParams as Partial<S>);
  }, [defaultFilters, notShowFromSearchParams, searchParams, setQueryParams]);

  const additionalPathParams = () => ({});

  const additionalParams = () => ({});

  // Regular query for pagination
  const listQuery = useQuery({
    queryKey: [`${queryKey}-list`, queryFilter],
    queryFn: ({ signal }) =>
      http.get<ApiResponseList<T>>(apiConfig.getList, {
        params: {
          ...queryFilter,
          ...handlers.additionalParams()
        },
        pathParams: { ...handlers.additionalPathParams() },
        signal
      }),
    enabled,
    placeholderData: keepPreviousData,
    select: (data) => data.data
  });

  const deleteMutation = useMutation({
    mutationKey: [`delete-${queryKey}`],
    mutationFn: (id: string) =>
      http.delete<ApiResponseNoData>(apiConfig.delete as ApiConfig, {
        pathParams: {
          id
        }
      })
  });

  // Update data from query results
  useEffect(() => {
    setData(listQuery.data?.content || []);
  }, [listQuery.data?.content]);

  // Pagination
  const currentPage = searchParams['page'];
  useEffect(() => {
    setPagination((p) => ({
      ...p,
      currentPage: currentPage
        ? Number(currentPage)
        : DEFAULT_TABLE_PAGE_START + 1,
      totalPages: listQuery.data?.totalPages ?? 0
    }));
  }, [currentPage, listQuery.data?.totalPages]);

  const changePagination = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));

    // page === 1, not show on query params
    setQueryParams({
      ...searchParams,
      page: page === 1 ? null : page
    } as Partial<S>);
  };

  const handleEditClick = (id: string) => {
    const query = serializeParams(searchParams);
    const path = query ? `${pathname}/${id}?${query}` : `${pathname}/${id}`;
    navigate.push(path);
  };

  const handleDeleteClick = (
    id: string,
    options?: { onSuccess?: () => void; onError?: (code: string) => void }
  ) => {
    deleteMutation.mutate(id, {
      onSuccess: (res) => {
        if (res.result) {
          if (showNotify) notify.success(`Xoá ${objectName} thành công`);
          options?.onSuccess?.();
          invalidateQueryUtil([`${queryKey}-list`]);
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
    edit: (record: T, buttonProps?: Record<string, unknown>) => {
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
              <AiOutlineEdit className='text-sporty-blue size-4' />
            </Button>
          </span>
        </ToolTip>
      );
    },
    delete: (record: T, buttonProps?: Record<string, unknown>) => {
      return (
        <ConfirmModal
          message={`Bạn có chắc chắn muốn xóa ${objectName} này không ?`}
          onConfirm={() => handleDeleteClick(record.id)}
          trigger={
            <span>
              <ToolTip title={`Xóa ${objectName}`} sideOffset={0}>
                <Button
                  className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
                  variant='ghost'
                  {...buttonProps}
                >
                  <AiOutlineDelete className='text-destructive size-4' />
                </Button>
              </ToolTip>
            </span>
          }
        />
      );
    }
  });

  const renderActionColumn = (options?: {
    actions?: Record<'edit' | 'delete' | string, ActionCondition<T>>;
    buttonProps?: Record<string, unknown>;
    columnProps?: Record<string, unknown>;
  }): Column<T> => {
    const extraColumns = handlers.additionalColumns?.() || {};
    const actionsObj: Record<
      string,
      (record: T, buttonProps?: Record<string, unknown>) => ReactNode
    > = { ...actionColumn(), ...extraColumns };

    return {
      title: 'Hành động',
      align: 'center' as const,
      width: TABLE_ACTION_COLUMN_WIDTH,
      ...options?.columnProps,
      render: (_: unknown, record: T) => {
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
    columnProps?: Record<string, unknown>;
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
      Object.entries(searchParams).filter(([key]) => isExcluded(key))
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
        Object.entries(searchParams)
          .filter(([key]) => !key.startsWith(PARENT_PREFIX_PARAM))
          .map(([key, value]) => {
            const field = searchFields.find((f) => f.key === key);
            if (!field) return [key, value];

            switch (field.type) {
              case FieldTypes.NUMBER:
                return [key, value ? Number(value) : undefined];
              case FieldTypes.SELECT:
              case FieldTypes.AUTO_COMPLETE: {
                const option = field.options?.find(
                  (opt: OptionType) => String(opt.value) === String(value)
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
        Object.entries(searchParams).filter(([key]) => isExcluded(key))
      );

      const resetParams = {
        ...resetSearchValues,
        ...preservedParams
      };

      if (serializeParams(searchParams) === serializeParams(resetParams))
        return;

      setPagination({
        currentPage: DEFAULT_TABLE_PAGE_START + 1,
        pageSize: DEFAULT_TABLE_PAGE_SIZE,
        totalPages: 0
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

  const invalidateQueries = () => {
    invalidateQueryUtil([`${queryKey}-list`, queryFilter]);
  };

  const renderReloadButton = () => (
    <Button
      disabled={listQuery.isFetching}
      onClick={() => listQuery.refetch()}
      variant='primary'
      loading={listQuery.isFetching}
      iconClassName='size-4'
    >
      <RefreshCcw />
    </Button>
  );

  const totalElements = listQuery.data?.totalElements ?? 0;

  const totalPages = listQuery.data?.totalPages ?? 0;

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
      setData
    };

    override?.(handlers);
    return handlers;
  };

  const handlers = extendableHandlers();

  return {
    data,
    pagination,
    loading: listQuery.isLoading,
    deleting: deleteMutation.isPending,
    fetching: listQuery.isFetching,
    handlers,
    queryFilter,
    listQuery,
    queryString,
    totalPages,
    totalElements
  };
};
