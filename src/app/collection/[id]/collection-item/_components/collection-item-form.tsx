'use client';
import { AutoCompleteField, Col, InputField, Row } from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { PageWrapper } from '@/components/layout';
import { CircleLoading } from '@/components/loading';
import { apiConfig, collectionItemErrorMaps, ErrorCode } from '@/constants';
import { useSaveBase } from '@/hooks';
import { route } from '@/routes';
import { collectionItemSchema } from '@/schemaValidations';
import {
  CollectionItemBodyType,
  CollectionItemResType,
  MovieResType
} from '@/types';
import { generatePath, renderListPageUrl } from '@/utils';
import { useParams } from 'next/navigation';
import { UseFormReturn } from 'react-hook-form';

export default function CollectionItemForm({ queryKey }: { queryKey: string }) {
  const { id: collectionId, collectionItemId } = useParams<{
    id: string;
    collectionItemId: string;
  }>();

  const {
    loading,
    isEditing,
    queryString,
    responseCode,
    handleSubmit,
    renderActions
  } = useSaveBase<CollectionItemResType, CollectionItemBodyType>({
    apiConfig: apiConfig.collectionItem,
    options: {
      queryKey,
      objectName: 'chi tiết bộ sưu tập',
      listPageUrl: generatePath(route.collectionItem.getList.path, {
        id: collectionId
      }),
      pathParams: {
        id: collectionItemId
      },
      mode: collectionItemId === 'create' ? 'create' : 'edit'
    }
  });

  const defaultValues: CollectionItemBodyType = {
    collectionId: collectionId,
    movieId: '',
    ordering: 0
  };

  const onSubmit = async (
    values: CollectionItemBodyType,
    form: UseFormReturn<CollectionItemBodyType>
  ) => {
    await handleSubmit(values, form, collectionItemErrorMaps);
  };

  return (
    <PageWrapper
      breadcrumbs={[
        {
          label: 'Bộ sưu tập',
          href: route.collection.getList.path
        },
        {
          label: 'Chi tiết bộ sưu tập',
          href: renderListPageUrl(
            generatePath(route.collectionItem.getList.path, {
              id: collectionId
            }),
            queryString
          )
        },
        { label: `${!isEditing ? 'Thêm mới' : 'Cập nhật'} chi tiết bộ sưu tập` }
      ]}
      notFound={responseCode === ErrorCode.COLLECTION_ITEM_ERROR_NOT_FOUND}
      notFoundContent={'Không tìm thấy bộ sưu tập này'}
    >
      <BaseForm
        onSubmit={onSubmit}
        defaultValues={defaultValues}
        schema={collectionItemSchema}
      >
        {(form) => {
          return (
            <>
              <Row>
                <Col>
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
                  />
                </Col>
              </Row>

              <>{renderActions(form)}</>
              {loading && (
                <div className='absolute inset-0 bg-white/80'>
                  <CircleLoading className='stroke-dodger-blue mt-20 size-8' />
                </div>
              )}
            </>
          );
        }}
      </BaseForm>
    </PageWrapper>
  );
}
