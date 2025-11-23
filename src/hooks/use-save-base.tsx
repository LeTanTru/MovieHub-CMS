'use client';

import { Button, Col, Row } from '@/components/form';
import { CircleLoading } from '@/components/loading';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import useNavigate from '@/hooks/use-navigate';
import useQueryParams from '@/hooks/use-query-params';
import { ApiConfig, ApiResponse, ErrorMaps } from '@/types';
import { applyFormErrors, http, notify } from '@/utils';
import { AlertDialogCancel } from '@radix-ui/react-alert-dialog';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { ArrowLeftFromLine, Info, Save } from 'lucide-react';
import { useEffect } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';

type HandlerType<T> = {
  additionParams: () => { [key: string]: any };
};

type UseSaveBaseProps<R, T> = {
  apiConfig: {
    getById: ApiConfig;
    create: ApiConfig;
    update: ApiConfig;
  };
  options: {
    objectName: string;
    listPageUrl?: string;
    queryKey: string;
    enabled?: boolean;
    pathParams: { [key: string]: any };
    mode: 'create' | 'edit';
  };
  override?: (handlers: HandlerType<T>) => HandlerType<T> | void;
};

export default function useSaveBase<
  R extends FieldValues,
  T extends FieldValues
>({
  apiConfig,
  options: {
    queryKey = '',
    objectName = '',
    listPageUrl = '',
    enabled = true,
    pathParams,
    mode
  },
  override
}: UseSaveBaseProps<R, T>) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isCreate = mode === 'create';
  const { searchParams, queryString, serializeParams } = useQueryParams();

  const itemQuery = useQuery({
    queryKey: [queryKey, pathParams],
    queryFn: () =>
      http.get<ApiResponse<R>>(apiConfig.getById, {
        pathParams
      }),
    enabled: false
  });

  const data = itemQuery.data?.data;

  useEffect(() => {
    if (!isCreate && enabled) itemQuery.refetch();
  }, [enabled, mode]);

  const createMutation = useMutation({
    mutationKey: [`create-${queryKey}`],
    mutationFn: (body: T) =>
      http.get<ApiResponse<any>>(apiConfig.create, {
        body
      })
    // onSuccess: (res) => {
    //   if (res.result) {
    //     notify.success(`Thêm mới ${objectName} thành công`);
    //     queryClient.invalidateQueries({
    //       queryKey: [queryKey, detailId]
    //     });
    //   } else {
    //     logger.error(`Error while creating ${objectName}:`, res);
    //     // notify.error(`Thêm mới ${objectName} thất bại`);
    //   }
    // },
    // onError: (error) => {
    //   logger.error(`Error while creating ${queryKey}:`, error);
    //   // notify.error(`Có lỗi xảy ra khi thêm mới ${objectName}`);
    // }
  });

  const updateMutation = useMutation({
    mutationKey: [`update-${queryKey}`],
    mutationFn: (body: T) =>
      http.get<ApiResponse<any>>(apiConfig.update, {
        body
      })
    // onSuccess: (res) => {
    //   if (res.result) {
    //     queryClient.invalidateQueries({
    //       queryKey: [queryKey, detailId]
    //     });
    //     notify.success(`Cập nhật ${objectName} thành công`);
    //   } else {
    //     logger.error(`Error while creating ${objectName}:`, res);
    //     // notify.error(`Cập nhật ${objectName} thất bại`);
    //   }
    // },
    // onError: (error) => {
    //   logger.error(`Error while updating ${queryKey}:`, error);
    //   // notify.error(`Có lỗi xảy ra khi cập nhật ${objectName}`);
    // }
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
            notify.success(
              `${isCreate ? 'Thêm mới' : 'Cập nhật'} ${objectName} thành công`
            );
            if (listPageUrl) {
              navigate(getBackPath());
            }
          } else {
            const code = res.code;
            if (code && errorMaps && form) {
              applyFormErrors(form, code, errorMaps);
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
    <Row className='my-0 justify-end gap-x-4 *:px-0'>
      <Col span={3}>
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
                  Bạn có chắc chắn muốn quay lại không ?
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
                    } else {
                      options?.onCancel?.();
                    }
                  }}
                  className='bg-dodger-blue hover:bg-dodger-blue/80 cursor-pointer transition-all duration-200 ease-linear'
                >
                  Có
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </Col>
      <Col span={3}>
        <Button
          disabled={!form.formState.isDirty || mutation.isPending}
          type='submit'
          variant={'primary'}
        >
          {mutation.isPending ? (
            <CircleLoading />
          ) : (
            <>
              <Save />
              {isCreate ? 'Thêm' : 'Cập nhật'}
            </>
          )}
        </Button>
      </Col>
    </Row>
  );

  return {
    data,
    itemQuery,
    isEditing: !isCreate,
    loading: itemQuery.isLoading || itemQuery.isFetching,
    queryString,
    handleSubmit,
    renderActions,
    responseCode: itemQuery.data?.code
  };
}
