'use client';

import {
  AutoCompleteField,
  BooleanField,
  Col,
  ColorPickerField,
  RichTextField,
  Row,
  UploadImageField
} from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { PageWrapper } from '@/components/layout';
import { CircleLoading } from '@/components/loading';
import { apiConfig, ErrorCode } from '@/constants';
import { useFileUploadManager, useSaveBase } from '@/hooks';
import { useDeleteFileMutation, useUploadLogoMutation } from '@/queries';
import { route } from '@/routes';
import { movieSidebarSchema } from '@/schemaValidations';
import {
  MovieResType,
  MovieSidebarBodyType,
  MovieSidebarResType
} from '@/types';
import { renderImageUrl, renderListPageUrl } from '@/utils';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';

export default function SidebarForm({ queryKey }: { queryKey: string }) {
  const { id } = useParams<{
    id: string;
  }>();

  const uploadImageMutation = useUploadLogoMutation();
  const deleteFileMutation = useDeleteFileMutation();

  const {
    data,
    loading,
    isEditing,
    queryString,
    responseCode,
    handleSubmit,
    renderActions
  } = useSaveBase<MovieSidebarResType, MovieSidebarBodyType>({
    apiConfig: apiConfig.sidebar,
    options: {
      queryKey,
      objectName: 'phim',
      listPageUrl: route.sidebar.getList.path,
      pathParams: {
        id
      },
      mode: id === 'create' ? 'create' : 'edit'
    }
  });

  const webImageManager = useFileUploadManager({
    initialUrl: data?.webThumbnailUrl,
    deleteFileMutation: deleteFileMutation,
    isEditing,
    onOpen: true
  });

  const mobileImageManager = useFileUploadManager({
    initialUrl: data?.mobileThumbnailUrl,
    deleteFileMutation: deleteFileMutation,
    isEditing,
    onOpen: true
  });

  const defaultValues: MovieSidebarBodyType = {
    active: true,
    description: '',
    mainColor: '#000000',
    mobileThumbnailUrl: '',
    movieId: '',
    webThumbnailUrl: ''
  };

  const initialValues: MovieSidebarBodyType = useMemo(() => {
    return {
      description: data?.description ?? '',
      active: data?.active ?? false,
      mainColor: data?.mainColor ?? '#000000',
      mobileThumbnailUrl: data?.mobileThumbnailUrl || '',
      movieId: data?.movie?.id?.toString() ?? '',
      webThumbnailUrl: data?.webThumbnailUrl || ''
    };
  }, [data]);

  const handleCancel = async () => {
    await webImageManager.handleCancel();
    await mobileImageManager.handleCancel();
  };

  const onSubmit = async (values: MovieSidebarBodyType) => {
    await webImageManager.handleSubmit();
    await mobileImageManager.handleSubmit();

    await handleSubmit({
      ...values,
      webThumbnailUrl: webImageManager.currentUrl,
      mobileThumbnailUrl: mobileImageManager.currentUrl
    });
  };

  return (
    <PageWrapper
      breadcrumbs={[
        {
          label: 'Phim nổi bật',
          href: renderListPageUrl(route.sidebar.getList.path, queryString)
        },
        {
          label: `${!isEditing ? 'Thêm mới' : 'Cập nhật'} phim`
        }
      ]}
      notFound={responseCode === ErrorCode.MOVIE_ITEM_ERROR_NOT_FOUND}
      notFoundContent={`Không tìm thấy phim này`}
    >
      <BaseForm
        onSubmit={onSubmit}
        defaultValues={defaultValues}
        schema={movieSidebarSchema}
        initialValues={initialValues}
      >
        {(form) => {
          return (
            <>
              <Row>
                <Col span={12}>
                  <UploadImageField
                    value={renderImageUrl(webImageManager.currentUrl)}
                    loading={uploadImageMutation.isPending}
                    control={form.control}
                    name='webThumbnailUrl'
                    onChange={webImageManager.trackUpload}
                    size={150}
                    uploadImageFn={async (file: Blob) => {
                      const res = await uploadImageMutation.mutateAsync({
                        file
                      });
                      return res.data?.filePath ?? '';
                    }}
                    deleteImageFn={webImageManager.handleDeleteOnClick}
                    label='Ảnh xem trước web (16:9)'
                    aspect={16 / 9}
                    required
                  />
                </Col>
                <Col span={12}>
                  <UploadImageField
                    value={renderImageUrl(mobileImageManager.currentUrl)}
                    loading={uploadImageMutation.isPending}
                    control={form.control}
                    name='mobileThumbnailUrl'
                    onChange={mobileImageManager.trackUpload}
                    size={150}
                    uploadImageFn={async (file: Blob) => {
                      const res = await uploadImageMutation.mutateAsync({
                        file
                      });
                      return res.data?.filePath ?? '';
                    }}
                    deleteImageFn={mobileImageManager.handleDeleteOnClick}
                    label='Ảnh xem trước mobile (2:3)'
                    aspect={2 / 3}
                    required
                    defaultCrop
                  />
                </Col>
              </Row>
              <Row>
                <Col>
                  <AutoCompleteField<any, MovieResType>
                    control={form.control}
                    name='movieId'
                    apiConfig={apiConfig.movie.getList}
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
                <Col>
                  <ColorPickerField
                    control={form.control}
                    name='mainColor'
                    label='Màu chủ đạo'
                    required
                  />
                </Col>
              </Row>
              <Row>
                <Col>
                  <BooleanField
                    control={form.control}
                    name='active'
                    label='Hiện'
                    required
                  />
                </Col>
              </Row>
              <Row>
                <Col span={24}>
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
