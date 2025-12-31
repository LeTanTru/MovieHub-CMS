'use client';

import { AutoCompleteField, Col, Row } from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { CircleLoading } from '@/components/loading';
import { Modal } from '@/components/modal';
import {
  apiConfig,
  collectionItemErrorMaps,
  ErrorCode,
  queryKeys
} from '@/constants';
import { useSaveBase } from '@/hooks';
import { collectionItemSchema } from '@/schemaValidations';
import {
  CollectionItemBodyType,
  CollectionItemResType,
  MovieResType
} from '@/types';
import { generatePath, notify } from '@/utils';
import { useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { UseFormReturn } from 'react-hook-form';

export default function CollectionItemModal({
  open,
  close
}: {
  open: boolean;
  close: () => void;
}) {
  const queryClient = useQueryClient();

  const { id: collectionId } = useParams<{
    id: string;
  }>();

  const { loading, isEditing, handleSubmit, renderActions } = useSaveBase<
    CollectionItemResType,
    CollectionItemBodyType
  >({
    apiConfig: apiConfig.collectionItem,
    options: {
      queryKey: queryKeys.COLLECTION_ITEM,
      objectName: 'chi tiết bộ sưu tập',
      pathParams: {},
      mode: 'create'
    },
    override: (handlers) => {
      handlers.handleSubmitSuccess = () => {
        close();
        queryClient.invalidateQueries({
          queryKey: [`${queryKeys.COLLECTION_ITEM}-list`]
        });
        queryClient.invalidateQueries({
          queryKey: [`${queryKeys.COLLECTION_ITEM}`]
        });
      };
      handlers.handleSubmitError = (code) => {
        if (code === ErrorCode.COLLECTION_ITEM_ERROR_MAX_ITEM) {
          notify.error('Số lượng đã đạt tối đa');
        }
      };
    }
  });

  const defaultValues: CollectionItemBodyType = {
    collectionId: collectionId,
    movieId: ''
  };

  const onSubmit = async (
    values: CollectionItemBodyType,
    form: UseFormReturn<CollectionItemBodyType>
  ) => {
    await handleSubmit(values, form, collectionItemErrorMaps);
  };

  return (
    <Modal
      title={`${!isEditing ? 'Thêm mới' : 'Cập nhật'} chi tiết bộ sưu tập`}
      open={open}
      onClose={close}
      className='[&_.content]:bottom-[20%] [&_.content]:h-fit'
    >
      <BaseForm
        onSubmit={onSubmit}
        defaultValues={defaultValues}
        schema={collectionItemSchema}
        className='w-175 p-4'
      >
        {(form) => {
          return (
            <>
              <Row>
                <Col span={24}>
                  <AutoCompleteField<any, MovieResType>
                    control={form.control}
                    name='movieId'
                    label='Tiêu đề phim'
                    placeholder='Tiêu đề phim'
                    required
                    apiConfig={{
                      ...apiConfig.movie.collectionFilter,
                      baseUrl: generatePath(
                        apiConfig.movie.collectionFilter.baseUrl,
                        { collectionId }
                      )
                    }}
                    mappingData={(item) => ({
                      label: item.title,
                      value: item.id.toString()
                    })}
                    searchParams={['title']}
                    fetchAll
                  />
                </Col>
              </Row>

              <>
                {renderActions(form, {
                  onCancel: close
                })}
              </>
              {loading && (
                <div className='absolute inset-0 bg-white/80'>
                  <CircleLoading className='stroke-dodger-blue mt-20 size-8' />
                </div>
              )}
            </>
          );
        }}
      </BaseForm>
    </Modal>
  );
}
