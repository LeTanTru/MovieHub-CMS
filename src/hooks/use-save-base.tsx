import { Button, Col, Row } from '@/components/form';
import { ConfirmModal } from '@/components/modal';
import { storageKeys } from '@/constants';
import useDisclosure from '@/hooks/use-disclosure';
import useNavigate from '@/hooks/use-navigate';
import useQueryParams from '@/hooks/use-query-params';
import type { ApiConfig, ApiResponse, ErrorMaps } from '@/types';
import {
  applyFormErrors,
  http,
  invalidateQueries,
  notify,
  removeData,
  setData
} from '@/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { ArrowLeftFromLine, Save } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
type HandlerType<T> = {
  // additionParams: () => { [key: string]: any };
  handleSubmitSuccess: () => void;
  handleSubmitError: (code: string) => void;
};

type UseSaveBaseProps<R, T> = {
  apiConfig: {
    getById?: ApiConfig;
    create?: ApiConfig;
    update?: ApiConfig;
  };
  options: {
    objectName: string;
    listPageUrl?: string;
    queryKey: string;
    pathParams: { [key: string]: any };
    mode: 'create' | 'edit';
    showNotify?: boolean;
  };
  override?: (handlers: HandlerType<T>) => HandlerType<T> | void;
};

const useSaveBase = <R extends FieldValues, T extends FieldValues>({
  apiConfig,
  options: {
    objectName = '',
    listPageUrl = '',
    queryKey,
    pathParams,
    mode,
    showNotify = true
  },
  override
}: UseSaveBaseProps<R, T>) => {
  const isCreate = mode === 'create';
  const navigate = useNavigate();
  const pendingHref = useRef<string | null>(null);
  const [isFormChanged, setIsFormChanged] = useState<boolean>(false);

  const { searchParams, queryString, serializeParams } = useQueryParams();
  const {
    opened: openedDialog,
    open: showDialog,
    close: closeDialog
  } = useDisclosure();

  const itemQuery = useQuery({
    queryKey: [queryKey, pathParams],
    queryFn: () =>
      apiConfig.getById
        ? http.get<ApiResponse<R>>(apiConfig.getById, {
            pathParams
          })
        : Promise.resolve({ data: undefined } as any),
    enabled: !isCreate,
    staleTime: 60 * 1000
  });

  const data: R = itemQuery.data?.data;

  const createMutation = useMutation({
    mutationKey: [`create-${queryKey}`],
    mutationFn: (body: T) =>
      apiConfig.create
        ? http.post<ApiResponse<any>>(apiConfig.create, {
            body
          })
        : Promise.resolve({ result: false, code: 'NO_API_CONFIG' } as any)
  });

  const updateMutation = useMutation({
    mutationKey: [`update-${queryKey}`],
    mutationFn: (body: T) =>
      apiConfig.update
        ? http.put<ApiResponse<any>>(apiConfig.update, {
            body
          })
        : Promise.resolve({ result: false, code: 'NO_API_CONFIG' } as any)
  });

  const getBackPath = () => {
    const query = serializeParams(searchParams);
    const backPath = query ? `${listPageUrl}?${query}` : listPageUrl;
    return backPath;
  };

  const mutation = isCreate ? createMutation : updateMutation;
  const handleSubmit = async (
    values: T,
    form?: UseFormReturn<T>,
    errorMaps?: ErrorMaps<T>
  ) => {
    return await mutation.mutateAsync(
      isCreate
        ? { ...values }
        : { ...values, id: values.id ?? data?.id ?? pathParams.id },
      {
        onSuccess: async (res) => {
          if (res.result) {
            setIsFormChanged(false);
            handlers.handleSubmitSuccess();
            if (showNotify)
              notify.success(
                `${isCreate ? 'Thêm mới' : 'Cập nhật'} ${objectName} thành công`
              );
            if (listPageUrl) {
              navigate.push(getBackPath());
            }
            invalidateQueries([queryKey, `${queryKey}-list`]);
          } else {
            const code = res.code;
            if (code && errorMaps?.[code] && form) {
              applyFormErrors(form, code, errorMaps);
            } else {
              handlers.handleSubmitError(code);
            }
          }
        },
        onError: (error) => {
          if (isAxiosError(error)) {
            const errCode = error?.response?.data?.code;
            if (errCode && errorMaps && form)
              applyFormErrors(form, errCode, errorMaps);
          }
        }
      }
    );
  };

  const onFormChange = (isFormChanged: boolean) => {
    setIsFormChanged(isFormChanged);
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isFormChanged) return;

      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload, true);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload, true);
    };
  }, [isFormChanged]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!isFormChanged) return;

      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      if (
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:')
      )
        return;

      e.preventDefault();
      e.stopPropagation();

      const previousPath = anchor.getAttribute('data-previous-path');
      if (previousPath) {
        setData(storageKeys.PREVIOUS_PATH, previousPath);
      }

      pendingHref.current = href;
      showDialog();
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [isFormChanged, showDialog]);

  const handleConfirmLeave = () => {
    if (pendingHref.current) {
      navigate.push(pendingHref.current);
      pendingHref.current = null;
    }
    closeDialog();
    setIsFormChanged(false);
  };

  const handleCancelLeave = () => {
    closeDialog();
    pendingHref.current = null;
    removeData(storageKeys.PREVIOUS_PATH);
  };

  const renderActions = (
    form: UseFormReturn<T>,
    options?: { onCancel?: () => void; disabled?: boolean }
  ) => {
    const handleCancel = () => {
      if (listPageUrl) {
        navigate.push(getBackPath());
      } else {
        options?.onCancel?.();
      }
    };

    return (
      <>
        <Row className='mb-0 justify-end'>
          <Col className='w-40'>
            {!form.formState.isDirty ? (
              <Button
                type='button'
                variant='outline'
                onClick={handleCancel}
                className='border-rose-500 text-rose-500 hover:border-rose-500/50 hover:text-rose-500/50'
              >
                <ArrowLeftFromLine />
                Hủy
              </Button>
            ) : (
              <ConfirmModal
                message='Bạn có chắc chắn muốn hủy không ?'
                onConfirm={() => {
                  if (listPageUrl) {
                    navigate.push(listPageUrl);
                  }
                  options?.onCancel?.();
                }}
                trigger={
                  <Button
                    type='button'
                    variant='outline'
                    className='border-rose-500 text-rose-500 hover:border-rose-500/50 hover:text-rose-500/50'
                  >
                    <ArrowLeftFromLine />
                    Hủy
                  </Button>
                }
              />
            )}
          </Col>
          <Col className='w-40'>
            <Button
              disabled={
                !form.formState.isDirty ||
                mutation.isPending ||
                options?.disabled
              }
              type='submit'
              variant='primary'
              loading={mutation.isPending}
            >
              <Save />
              {isCreate ? 'Thêm' : 'Cập nhật'}
            </Button>
          </Col>
        </Row>
        {/* Dialog for asking before leaving page */}
        <ConfirmModal
          open={openedDialog}
          onOpenChange={(v) => {
            if (!v) handleCancelLeave();
          }}
          message='Bạn có chắc chắn muốn rời khỏi trang này không ?'
          onConfirm={handleConfirmLeave}
          onCancel={handleCancelLeave}
          className='w-105'
        />
      </>
    );
  };

  const handleSubmitSuccess = () => {
    setIsFormChanged(false);
  };

  const handleSubmitError = (code: string) => {};

  const extendableHandlers = (): HandlerType<T> => {
    let handlers: HandlerType<T> = {
      handleSubmitSuccess,
      handleSubmitError
    };

    const overridden = override?.(handlers);
    if (overridden) {
      handlers = overridden;
    }

    return handlers;
  };

  const handlers = extendableHandlers();

  return {
    data,
    handlers,
    itemQuery,
    queryString,
    isFormChanged,
    isEditing: !isCreate,
    loading: itemQuery.isLoading || itemQuery.isFetching || mutation.isPending,
    responseCode: itemQuery.data?.code,
    handleSubmit,
    renderActions,
    onFormChange
  };
};

export default useSaveBase;
