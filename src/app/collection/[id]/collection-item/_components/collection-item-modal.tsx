'use client';

import { AutoCompleteField, Col, Row } from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { CircleLoading } from '@/components/loading';
import { Modal } from '@/components/modal';
import {
  apiConfig,
  collectionItemErrorMaps,
  ErrorCode,
  objectNames,
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

type CollectionItemModalProps = {
  open: boolean;
  onClose: () => void;
};

export const CollectionItemModal = ({
  open,
  onClose
}: CollectionItemModalProps) => {
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
      objectName: objectNames.MOVIE,
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

  const handleCancel = () => {
    onClose();
    onFormChange(false);
  };

  return (
    <Modal
      open={open}
      onClose={handleCancel}
      aria-labelledby='collection-item-modal-title'
      confirmOnClose={isFormChanged}
    >
      <Modal.Header>
        {`${!isEditing ? 'Thêm mới' : 'Cập nhật'} phim`}
      </Modal.Header>
      <Modal.Body>
        <BaseForm
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          schema={collectionItemSchema}
          onFormChange={onFormChange}
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
                    onCancel: handleCancel
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
      </Modal.Body>
      <Modal.Confirm message='Bạn có chắc chắn muốn hủy không ?' />
    </Modal>
  );
};
