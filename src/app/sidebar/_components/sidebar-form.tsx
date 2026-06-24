'use client';

import {
  AutoCompleteField,
  CheckboxField,
  Col,
  ColorPickerField,
  RichTextField,
  Row,
  UploadImageField
} from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { PageWrapper } from '@/components/layout';
import { CircleLoading } from '@/components/loading';
import { apiConfig, ErrorCode, objectNames, queryKeys } from '@/constants';
import { useFileUploadManager, useSaveBase } from '@/hooks';
import { useDeleteFileMutation, useUploadLogoMutation } from '@/queries';
import { route } from '@/routes';
import { movieSidebarSchema } from '@/schema-validations';
import type {
  MovieResType,
  MovieSidebarBodyType,
  MovieSidebarResType
} from '@/types';
import { renderImageUrl, renderListPageUrl } from '@/utils';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';

const defaultValues: MovieSidebarBodyType = {
  active: true,
  description: '',
  mainColor: '#000000',
  mobileThumbnailUrl: '',
  movieId: '',
  webThumbnailUrl: ''
};

export function SidebarForm() {
  const { id } = useParams<{
    id: string;
  }>();

  const { mutateAsync: uploadImage, isPending } = useUploadLogoMutation();
  const { mutateAsync: deleteFileMutate } = useDeleteFileMutation();

  const {
    data,
    loading,
    isEditing,
    queryString,
    responseCode,
    onFormChange,
    handleSubmit,
    renderActions
  } = useSaveBase<MovieSidebarResType, MovieSidebarBodyType>({
    apiConfig: apiConfig.sidebar,
    options: {
      queryKey: queryKeys.SIDEBAR,
      objectName: objectNames.SIDEBAR,
      listPageUrl: route.sidebar.getList.path,
      pathParams: {
        id
      },
      mode: id === 'create' ? 'create' : 'edit'
    }
  });

  const webImageManager = useFileUploadManager({
    initialUrl: data?.webThumbnailUrl,
    deleteFileMutate: deleteFileMutate,
    isEditing,
    onOpen: true
  });

  const mobileImageManager = useFileUploadManager({
    initialUrl: data?.mobileThumbnailUrl,
    deleteFileMutate: deleteFileMutate,
    isEditing,
    onOpen: true
  });

  const initialValues: MovieSidebarBodyType = useMemo(
    () => ({
      description: data?.description ?? defaultValues.description,
      active: data?.active ?? defaultValues.active,
      mainColor: data?.mainColor ?? defaultValues.mainColor,
      mobileThumbnailUrl:
        data?.mobileThumbnailUrl ?? defaultValues.mobileThumbnailUrl,
      movieId: data?.movie?.id?.toString() ?? defaultValues.movieId,
      webThumbnailUrl: data?.webThumbnailUrl ?? defaultValues.webThumbnailUrl
    }),
    [
      data?.active,
      data?.description,
      data?.mainColor,
      data?.mobileThumbnailUrl,
      data?.movie?.id,
      data?.webThumbnailUrl
    ]
  );

  const handleCancel = async () => {
    await Promise.all([
      webImageManager.handleCancel(),
      mobileImageManager.handleCancel()
    ]);
  };

  const onSubmit = async (values: MovieSidebarBodyType) => {
    await Promise.all([
      webImageManager.handleSubmit(),
      mobileImageManager.handleSubmit(),
      handleSubmit({
        ...values,
        webThumbnailUrl: webImageManager.currentUrl,
        mobileThumbnailUrl: mobileImageManager.currentUrl
      })
    ]);
  };

  return (
    <PageWrapper
      breadcrumbs={[
        {
          label: 'Phim hot',
          href: renderListPageUrl(route.sidebar.getList.path, queryString)
        },
        {
          label: `${!isEditing ? 'Thêm mới' : 'Cập nhật'} phim`
        }
      ]}
      notFound={responseCode === ErrorCode.MOVIE_ITEM_ERROR_NOT_FOUND}
      notFoundContent='Không tìm thấy phim này'
    >
      <BaseForm
        onSubmit={onSubmit}
        defaultValues={defaultValues}
        schema={movieSidebarSchema}
        initialValues={initialValues}
        onFormChange={onFormChange}
      >
        {(form) => {
          return (
            <>
              <Row>
                <Col className='grid-c-6'>
                  <UploadImageField
                    value={renderImageUrl(webImageManager.currentUrl)}
                    loading={isPending}
                    control={form.control}
                    name='webThumbnailUrl'
                    onChange={webImageManager.trackUpload}
                    size={150}
                    uploadImageFn={async (file) => {
                      const res = await uploadImage({
                        file
                      });
                      return res.data?.filePath ?? '';
                    }}
                    deleteImageFn={webImageManager.handleDeleteOnClick}
                    label='Thumbnail web (Thumnail - 16:9)'
                    aspect={16 / 9}
                    originalSize
                    defaultCrop
                    required
                  />
                </Col>
                <Col className='grid-c-6'>
                  <UploadImageField
                    value={renderImageUrl(mobileImageManager.currentUrl)}
                    loading={isPending}
                    control={form.control}
                    name='mobileThumbnailUrl'
                    onChange={mobileImageManager.trackUpload}
                    size={150}
                    uploadImageFn={async (file) => {
                      const res = await uploadImage({
                        file
                      });
                      return res.data?.filePath ?? '';
                    }}
                    deleteImageFn={mobileImageManager.handleDeleteOnClick}
                    label='Thumbnail mobile (2:3)'
                    aspect={2 / 3}
                    required
                    originalSize
                    defaultCrop
                  />
                </Col>
              </Row>
              <Row>
                <Col className='grid-c-6'>
                  <AutoCompleteField
                    control={form.control}
                    name='movieId'
                    apiConfig={apiConfig.movie.autoComplete}
                    mappingData={(item: MovieResType) => ({
                      label: item.title,
                      value: item.id.toString()
                    })}
                    searchParams={['title']}
                    allowClear
                    label='Phim'
                    placeholder='Phim'
                    required
                  />
                </Col>
                <Col className='grid-c-6'>
                  <ColorPickerField
                    control={form.control}
                    name='mainColor'
                    label='Màu chủ đạo'
                    required
                  />
                </Col>
              </Row>
              <Row>
                <Col className='grid-c-6'>
                  <CheckboxField
                    control={form.control}
                    name='active'
                    label='Hiện'
                    required
                  />
                </Col>
              </Row>
              <Row>
                <Col className='grid-c-12'>
                  <RichTextField
                    control={form.control}
                    name='description'
                    label='Mô tả'
                    placeholder='Mô tả'
                    required
                  />
                </Col>
              </Row>

              <>
                {renderActions(form, {
                  onCancel: handleCancel
                })}
              </>
              {loading && (
                <div className='absolute inset-0 z-10 flex justify-center bg-white/80'>
                  <CircleLoading className='stroke-sporty-blue mt-20' />
                </div>
              )}
            </>
          );
        }}
      </BaseForm>
    </PageWrapper>
  );
}
