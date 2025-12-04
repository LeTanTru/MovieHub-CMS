'use client';

import {
  AutoCompleteField,
  BooleanField,
  Button,
  Col,
  ColorPickerField,
  FieldSet,
  InputField,
  MultiSelectField,
  Row,
  SelectField
} from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { PageWrapper } from '@/components/layout';
import { CircleLoading } from '@/components/loading';
import {
  ageRatingOptions,
  apiConfig,
  COLLECTION_TYPE_SECTION,
  COLLECTION_TYPE_TOPIC,
  collectionErrorMaps,
  collectionTypeOptions,
  countryOptions,
  ErrorCode,
  languageOptions,
  movieTypeOptions
} from '@/constants';
import { useSaveBase } from '@/hooks';
import { useCategoryListQuery, useCollectionListQuery } from '@/queries';
import { route } from '@/routes';
import { collectionSchema } from '@/schemaValidations';
import { CollectionBodyType, CollectionResType, StyleResType } from '@/types';
import { renderListPageUrl } from '@/utils';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';

export default function CollectionForm({ queryKey }: { queryKey: string }) {
  const { id } = useParams<{ id: string }>();

  const categoryListQuery = useCategoryListQuery();
  const collectionListQuery = useCollectionListQuery();

  const categories =
    categoryListQuery?.data?.data?.content
      ?.map((category) => ({
        value: category.id.toString(),
        label: category.name
      }))
      .sort((a, b) => a.label.localeCompare(b.label)) || [];

  const {
    data,
    loading,
    isEditing,
    queryString,
    responseCode,
    handleSubmit,
    renderActions
  } = useSaveBase<CollectionResType, CollectionBodyType>({
    apiConfig: apiConfig.collection,
    options: {
      queryKey,
      objectName: 'bộ sưu tập',
      listPageUrl: route.collection.getList.path,
      pathParams: {
        id
      },
      mode: id === 'create' ? 'create' : 'edit'
    }
  });

  const defaultValues: CollectionBodyType = {
    color: '#000000',
    filter: {},
    name: '',
    ordering: 0,
    randomData: false,
    styleId: '',
    type: COLLECTION_TYPE_TOPIC
  };

  const initialValues: CollectionBodyType = useMemo(() => {
    return {
      color: data?.color ?? '#000000',
      filter: data?.filter ? JSON.parse(data?.filter) : {},
      name: data?.name ?? '',
      ordering: data?.ordering ?? 0,
      randomData: false,
      styleId: data?.style?.id?.toString() ?? '',
      type: data?.type ?? COLLECTION_TYPE_TOPIC
    };
  }, [data]);

  const onSubmit = async (
    values: CollectionBodyType,
    form: UseFormReturn<CollectionBodyType>
  ) => {
    if (!values.styleId && values.type === COLLECTION_TYPE_SECTION) {
      form.setError('styleId', { message: 'Bắt buộc' });
    } else {
      const payload = {
        ...values,
        filter: JSON.stringify(values.filter),
        ordering: collectionListQuery.data?.data.totalElements ?? 0
      };
      await handleSubmit(payload as any, form, collectionErrorMaps);
    }
  };

  return (
    <PageWrapper
      breadcrumbs={[
        {
          label: 'Bộ sưu tập',
          href: renderListPageUrl(route.collection.getList.path, queryString)
        },
        { label: `${!isEditing ? 'Thêm mới' : 'Cập nhật'} bộ sưu tập` }
      ]}
      notFound={responseCode === ErrorCode.COLLECTION_ERROR_NOT_FOUND}
      notFoundContent={'Không tìm thấy bộ sưu tập này'}
    >
      <BaseForm
        onSubmit={onSubmit}
        defaultValues={defaultValues}
        schema={collectionSchema}
        initialValues={initialValues}
      >
        {(form) => {
          return (
            <>
              <Row>
                <Col>
                  <InputField
                    control={form.control}
                    name='name'
                    label='Tên thiết kế'
                    placeholder='Tên thiết kế'
                    required
                  />
                </Col>
                <Col>
                  <SelectField
                    control={form.control}
                    name='type'
                    label='Loại'
                    placeholder='Loại'
                    required
                    options={collectionTypeOptions}
                  />
                </Col>
              </Row>
              <Row>
                <Col>
                  <ColorPickerField
                    control={form.control}
                    name='color'
                    label='Màu'
                    required
                  />
                </Col>
                <Col>
                  <AutoCompleteField<any, StyleResType>
                    control={form.control}
                    name='styleId'
                    label='Thiết kế'
                    placeholder='Thiết kế'
                    required
                    apiConfig={apiConfig.style.getList}
                    mappingData={(item) => ({
                      label: item.name,
                      value: item.id.toString()
                    })}
                    searchParams={['name']}
                    fetchAll
                  />
                </Col>
              </Row>
              <FieldSet title='Bộ lọc'>
                <Row>
                  <Col>
                    <SelectField
                      name='filter.type'
                      control={form.control}
                      label='Thể loại phim'
                      options={movieTypeOptions}
                      placeholder='Thể loại phim'
                    />
                  </Col>
                  <Col>
                    <SelectField
                      name='filter.ageRating'
                      control={form.control}
                      label='Độ tuổi'
                      options={ageRatingOptions}
                      placeholder='Độ tuổi'
                      getLabel={(opt) => `${opt.label} - ${opt.mean}`}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <SelectField
                      name='filter.country'
                      control={form.control}
                      label='Quốc gia'
                      options={countryOptions}
                      placeholder='Quốc gia'
                    />
                  </Col>
                  <Col>
                    <SelectField
                      name='filter.language'
                      control={form.control}
                      label='Ngôn ngữ'
                      options={languageOptions}
                      placeholder='Ngôn ngữ'
                    />
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <MultiSelectField
                      control={form.control}
                      name='filter.categoryIds'
                      label='Danh mục'
                      placeholder='Danh mục'
                      options={categories}
                    />
                  </Col>
                  <Col className='mt-6 justify-end'>
                    <BooleanField
                      name='filter.isFeatured'
                      control={form.control}
                      label='Nổi bật'
                    />
                  </Col>
                </Row>
                <Row className='mb-0 justify-end'>
                  <Col span={4}>
                    <Button
                      type='button'
                      variant='primary'
                      onClick={() => {
                        form.setValue('filter.ageRating', 0, {
                          shouldDirty: true
                        });
                        form.setValue('filter.categoryIds', [], {
                          shouldDirty: true
                        });
                        form.setValue('filter.country', '', {
                          shouldDirty: true
                        });
                        form.setValue('filter.language', '', {
                          shouldDirty: true
                        });
                        form.setValue('filter.isFeatured', false, {
                          shouldDirty: true
                        });
                        form.setValue('filter.type', 0, { shouldDirty: true });
                      }}
                    >
                      Đặt lại bộ lọc
                    </Button>
                  </Col>
                </Row>
              </FieldSet>

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
