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
import type {
  CollectionItemBodyType,
  CollectionItemResType,
  MovieResType
} from '@/types';
import { generatePath, notify } from '@/utils';
import { useParams } from 'next/navigation';
import type { UseFormReturn } from 'react-hook-form';

export default function CollectionItemModal({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { id: collectionId } = useParams<{
    id: string;
  }>();

  const {
    loading,
    isEditing,
    isFormChanged,
    onFormChange,
    handleSubmit,
    renderActions
  } = useSaveBase<CollectionItemResType, CollectionItemBodyType>({
    apiConfig: apiConfig.collectionItem,
    options: {
      queryKey: queryKeys.COLLECTION_ITEM,
      objectName: 'phim',
      pathParams: {},
      mode: 'create'
    },
    override: (handlers) => {
      handlers.handleSubmitSuccess = () => {
        onClose();
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

  const handleClose = () => {
    onClose();
    onFormChange(false);
  };

  return (
    <Modal
      title={`${!isEditing ? 'Thêm mới' : 'Cập nhật'} phim`}
      open={open}
      onClose={handleClose}
      bodyWrapperClassName='w-200 max-[1537px]:w-175 max-[1367px]:w-150 top-1/3 overflow-hidden'
      aria-labelledby='collection-item-modal-title'
      confirmOnClose={isFormChanged}
    >
      <BaseForm
        onSubmit={onSubmit}
        defaultValues={defaultValues}
        schema={collectionItemSchema}
        onFormChange={onFormChange}
        className='rounded-none'
      >
        {(form) => {
          return (
            <>
              <Row>
                <Col className='grid-c-12'>
                  <AutoCompleteField
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
                    mappingData={(item: MovieResType) => ({
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
                  onCancel: onClose
                })}
              </>
              {loading && (
                <div className='absolute inset-0 flex justify-center bg-white/80'>
                  <CircleLoading className='stroke-main-color mt-10' />
                </div>
              )}
            </>
          );
        }}
      </BaseForm>
    </Modal>
  );
}
