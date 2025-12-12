'use client';

import {
  AutoCompleteField,
  BooleanField,
  Button,
  Col,
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
import { PlusIcon, X } from 'lucide-react';
import { logger } from '@/logger';

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
    colors: ['#000000'],
    filter: {},
    name: '',
    ordering: 0,
    randomData: false,
    styleId: '',
    type: COLLECTION_TYPE_TOPIC
  };

  const initialValues: CollectionBodyType = useMemo(() => {
    let parsedColors: string[] = ['#000000', '#000000'];

    if (data?.color) {
      try {
        if (typeof data.color === 'string') {
          parsedColors = JSON.parse(data.color);
        } else if (Array.isArray(data.color)) {
          parsedColors = data.color;
        } else {
          parsedColors = [data.color];
        }
      } catch (error) {
        parsedColors = [data.color as string];
        logger.error('Error while parsing color', error);
      }
    }

    return {
      colors: parsedColors,
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
        ordering: collectionListQuery.data?.data.totalElements ?? 0,
        colors: values.colors
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
          const colors = form.watch('colors') || ['#000000', '#000000'];

          const addColor = () => {
            const currentColors = form.getValues('colors') || [];
            form.setValue('colors', [...currentColors, '#000000'], {
              shouldDirty: true,
              shouldValidate: true
            });
          };

          const removeColor = (index: number) => {
            const currentColors = form.getValues('colors') || [];
            if (currentColors.length > 1) {
              form.setValue(
                'colors',
                currentColors.filter((_, i) => i !== index),
                {
                  shouldDirty: true,
                  shouldValidate: true
                }
              );
            }
          };

          const updateColor = (index: number, color: string) => {
            const currentColors = form.getValues('colors') || [];
            const newColors = [...currentColors];
            newColors[index] = color;
            form.setValue('colors', newColors, {
              shouldDirty: true,
              shouldValidate: true
            });
          };

          const type = form.watch('type');

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
                    disabled={isEditing}
                  />
                </Col>
              </Row>
              <Row>
                <Col span={12} className='pr-2!'>
                  <div className='space-y-2'>
                    <label className='ml-2 text-sm font-medium'>
                      Màu <span className='text-red-500'>*</span>
                    </label>
                    <div className='mt-1 space-y-2'>
                      {colors.map((color: string, index: number) => (
                        <div key={index} className='flex items-center gap-2'>
                          <div className='flex-1'>
                            <input
                              type='color'
                              value={color}
                              onChange={(e) =>
                                updateColor(index, e.target.value)
                              }
                              className='h-10 w-full cursor-pointer rounded border border-gray-300'
                            />
                          </div>
                          <input
                            type='text'
                            value={color}
                            onChange={(e) => updateColor(index, e.target.value)}
                            className='w-28 rounded border border-gray-300 px-3 py-2 text-sm uppercase'
                            placeholder='#000000'
                          />
                          {colors.length > 1 && (
                            <Button
                              type='button'
                              variant='outline'
                              onClick={() => removeColor(index)}
                              className='border-red-500 text-red-500 hover:bg-red-50'
                            >
                              <X className='size-4' />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type='button'
                        variant='outline'
                        onClick={addColor}
                        className='w-full'
                      >
                        <PlusIcon className='size-4' />
                        Thêm màu
                      </Button>
                    </div>
                  </div>
                </Col>
                {type === COLLECTION_TYPE_SECTION && (
                  <Col span={12}>
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
                )}
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
