'use client';

import {
  AutoCompleteField,
  BooleanField,
  Button,
  CheckboxField,
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
import { useQueryParams, useSaveBase } from '@/hooks';
import { useCategoryListQuery } from '@/queries';
import { route } from '@/routes';
import { collectionSchema } from '@/schemaValidations';
import {
  CollectionSearchType,
  type CollectionBodyType,
  type CollectionResType,
  type StyleResType
} from '@/types';
import { renderListPageUrl } from '@/utils';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { PlusIcon, X } from 'lucide-react';
import { logger } from '@/logger';

export default function CollectionForm({ queryKey }: { queryKey: string }) {
  const { id } = useParams<{ id: string }>();
  const { searchParams } = useQueryParams<CollectionSearchType>();
  const type = searchParams.type;

  const { data: categoryListData } = useCategoryListQuery();

  const categoryList =
    categoryListData?.data?.content
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
    onFormChange,
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
    filter: { limit: 1, noLimit: false },
    name: '',
    randomData: false,
    styleId: '',
    type: COLLECTION_TYPE_SECTION,
    fillData: false
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

    let filter: CollectionBodyType['filter'] = {};

    if (data?.filter) {
      try {
        if (typeof data.filter === 'string') {
          filter = JSON.parse(data.filter);
        } else if (typeof data.filter === 'object') {
          filter = data.filter as CollectionBodyType['filter'];
        }
      } catch (error) {
        logger.error('Error while parsing filter', error);
        filter = {};
      }
    }

    return {
      colors: parsedColors,
      filter: data?.filter
        ? { ...filter, noLimit: filter.limit ? false : true }
        : {},
      name: data?.name ?? '',
      randomData: false,
      styleId: data?.style?.id?.toString() ?? '',
      type: (data?.type ?? type) ? Number(type) : COLLECTION_TYPE_TOPIC,
      fillData: data?.fillData ?? false
    };
  }, [
    data?.color,
    data?.fillData,
    data?.filter,
    data?.name,
    data?.style?.id,
    data?.type,
    type
  ]);

  const onSubmit = async (
    values: CollectionBodyType,
    form: UseFormReturn<CollectionBodyType>
  ) => {
    if (!values.styleId && values.type === COLLECTION_TYPE_SECTION) {
      form.setError('styleId', { message: 'Bắt buộc' });
    } else {
      const { noLimit, ...filterWithoutNoLimit } = values.filter;

      const filterDefaults = {
        type: 0,
        ageRating: 0,
        language: '',
        country: '',
        isFeatured: false,
        categoryIds: [],
        limit: null
      };

      const cleanedFilter = Object.fromEntries(
        Object.entries({
          ...filterWithoutNoLimit,
          limit: noLimit ? null : values.filter.limit
        }).filter(([key, value]) => {
          const defaultValue =
            filterDefaults[key as keyof typeof filterDefaults];
          if (!Array.isArray(value)) return value !== defaultValue;
          return Array.isArray(value) && value.length > 0;
        })
      );

      const payload = {
        ...values,
        filter: JSON.stringify(cleanedFilter),
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
      notFoundContent='Không tìm thấy bộ sưu tập này'
    >
      <BaseForm
        onSubmit={onSubmit}
        defaultValues={defaultValues}
        schema={collectionSchema}
        initialValues={initialValues}
        onFormChange={onFormChange}
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
                <Col span={12}>
                  <InputField
                    control={form.control}
                    name='name'
                    label='Tên bộ sưu tập'
                    placeholder='Tên bộ sưu tập'
                    required
                  />
                </Col>
                <Col span={12}>
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
                <Col span={12}>
                  <div className='space-y-2'>
                    <label className='ml-2 text-sm font-medium'>
                      Màu (chọn ít nhất 2)
                      <span className='text-red-500'>*</span>
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
                          {colors.length > 2 && (
                            <Button
                              type='button'
                              variant='outline'
                              onClick={() => removeColor(index)}
                              className='border-red-500 text-red-500 hover:border-red-500/80 hover:text-red-500/80'
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
                    <AutoCompleteField
                      control={form.control}
                      name='styleId'
                      label='Thiết kế'
                      placeholder='Thiết kế'
                      required
                      apiConfig={apiConfig.style.autoComplete}
                      mappingData={(item: StyleResType) => ({
                        label: item.name,
                        value: item.id.toString()
                      })}
                      searchParams={['name']}
                      fetchAll
                    />
                  </Col>
                )}
              </Row>
              {!isEditing && (
                <Row>
                  <Col span={12}>
                    <BooleanField
                      control={form.control}
                      name='fillData'
                      label='Tự động điền dữ liệu'
                      required
                    />
                  </Col>
                </Row>
              )}
              <FieldSet title='Bộ lọc'>
                <Row>
                  <Col span={12}>
                    <SelectField
                      name='filter.type'
                      control={form.control}
                      label='Thể loại phim'
                      options={movieTypeOptions}
                      placeholder='Thể loại phim'
                    />
                  </Col>
                  <Col span={12}>
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
                  <Col span={12}>
                    <SelectField
                      name='filter.country'
                      control={form.control}
                      label='Quốc gia'
                      options={countryOptions}
                      placeholder='Quốc gia'
                    />
                  </Col>
                  <Col span={12}>
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
                  <Col span={12}>
                    <MultiSelectField
                      control={form.control}
                      name='filter.categoryIds'
                      label='Thể loại'
                      placeholder='Thể loại'
                      options={categoryList}
                    />
                  </Col>
                  <Col span={12}>
                    <Row className='mb-0 h-full items-center justify-between'>
                      <Col span={18} className='my-0'>
                        <InputField
                          control={form.control}
                          name='filter.limit'
                          label='Giới hạn'
                          placeholder='Giới hạn'
                          min={1}
                          disabled={!!form.watch('filter.noLimit')}
                          type='number'
                        />
                      </Col>
                      <Col span={6} className='my-0 mt-4'>
                        <CheckboxField
                          control={form.control}
                          name='filter.noLimit'
                          label='Không giới hạn'
                          checkboxClassName='data-[state=checked]:bg-main-color data-[state=checked]:border-main-color cursor-pointer transition-all duration-100 ease-linear data-[state=unchecked]:text-white'
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row className='mb-0'>
                  <Col className='justify-end'>
                    <BooleanField
                      name='filter.isFeatured'
                      control={form.control}
                      label='Hot'
                    />
                  </Col>
                  <Col className='justify-end'>
                    <BooleanField
                      name='filter.comingSoon'
                      control={form.control}
                      label='Sắp ra mắt'
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
                        form.setValue('filter.limit', 1, { shouldDirty: true });
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
                  <CircleLoading className='stroke-main-color mt-20 size-8' />
                </div>
              )}
            </>
          );
        }}
      </BaseForm>
    </PageWrapper>
  );
}
