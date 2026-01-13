'use client';

import { Button, Col, Row } from '@/components/form';
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
import useNavigate from '@/hooks/use-navigate';
import useQueryParams from '@/hooks/use-query-params';
import type { ApiConfig, ApiResponse, ErrorMaps } from '@/types';
import { applyFormErrors, http, notify } from '@/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { ArrowLeftFromLine, Info, Save } from 'lucide-react';
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
    queryKey = '',
    objectName = '',
    listPageUrl = '',
    pathParams,
    mode,
    showNotify = true
  },
  override
}: UseSaveBaseProps<R, T>) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isCreate = mode === 'create';
  const { searchParams, queryString, serializeParams } = useQueryParams();

  const itemQuery = useQuery({
    queryKey: [queryKey, pathParams],
    queryFn: () =>
      apiConfig.getById
        ? http.get<ApiResponse<R>>(apiConfig.getById, {
            pathParams
          })
        : Promise.resolve({ data: undefined } as any),
    enabled: !isCreate
  });

  const data: R = itemQuery.data?.data;

  const createMutation = useMutation({
    mutationKey: [`create-${queryKey}`],
    mutationFn: (body: T) =>
      apiConfig.create
        ? http.get<ApiResponse<any>>(apiConfig.create, {
            body
          })
        : Promise.resolve({ result: false, code: 'NO_API_CONFIG' } as any)
  });

  const updateMutation = useMutation({
    mutationKey: [`update-${queryKey}`],
    mutationFn: (body: T) =>
      apiConfig.update
        ? http.get<ApiResponse<any>>(apiConfig.update, {
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
        onSuccess: (res) => {
          if (res.result) {
            queryClient.invalidateQueries({
              queryKey: [queryKey, pathParams.id]
            });
            if (showNotify)
              notify.success(
                `${isCreate ? 'Thêm mới' : 'Cập nhật'} ${objectName} thành công`
              );
            if (listPageUrl) {
              navigate(getBackPath());
            }
            handlers.handleSubmitSuccess();
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

  const renderActions = (
    form: UseFormReturn<T>,
    options?: { onCancel?: () => void }
  ) => (
    <Row className='mx-0 my-0 justify-end gap-x-4 *:px-0'>
      <Col className='w-40!'>
        {!form.formState.isDirty ? (
          <Button
            type='button'
            variant={'ghost'}
            onClick={() => {
              if (listPageUrl) {
                navigate(getBackPath());
              } else {
                options?.onCancel?.();
              }
            }}
            className='border border-red-500 text-red-500 hover:border-red-500/50 hover:bg-transparent! hover:text-red-500/50'
          >
            <ArrowLeftFromLine />
            Hủy
          </Button>
        ) : (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type='button'
                variant={'ghost'}
                className='border border-red-500 text-red-500 hover:border-red-500/50 hover:bg-transparent! hover:text-red-500/50'
              >
                <ArrowLeftFromLine />
                Hủy
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className='data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-0! data-[state=closed]:slide-out-to-top-0! data-[state=open]:slide-in-from-left-0! data-[state=open]:slide-in-from-top-0! top-[30%] max-w-lg p-4'>
              <AlertDialogHeader>
                <AlertDialogTitle className='flex items-center gap-2 text-sm font-normal'>
                  <Info className='size-8 fill-orange-500 stroke-white' />
                  Bạn có chắc chắn muốn hủy không ?
                </AlertDialogTitle>
                <AlertDialogDescription></AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel asChild>
                  <Button
                    variant='outline'
                    className='border-red-500 text-red-500 transition-all duration-200 ease-linear hover:bg-transparent hover:text-red-500/80'
                  >
                    Không
                  </Button>
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    if (listPageUrl) {
                      navigate(listPageUrl);
                    }
                    options?.onCancel?.();
                  }}
                  className='bg-dodger-blue hover:bg-dodger-blue/80 w-20! cursor-pointer transition-all duration-200 ease-linear'
                >
                  Có
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </Col>
      <Col className='w-40!'>
        <Button
          disabled={!form.formState.isDirty || mutation.isPending}
          type='submit'
          variant={'primary'}
          loading={mutation.isPending}
        >
          <Save />
          {isCreate ? 'Thêm' : 'Cập nhật'}
        </Button>
      </Col>
    </Row>
  );

  const handleSubmitSuccess = () => {};

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
    isEditing: !isCreate,
    loading: itemQuery.isLoading || itemQuery.isFetching,
    responseCode: itemQuery.data?.code,
    handleSubmit,
    renderActions
  };
};

export default useSaveBase;
