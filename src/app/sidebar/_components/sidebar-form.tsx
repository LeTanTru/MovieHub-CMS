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
import { useSaveBase } from '@/hooks';
import { useUploadLogoMutation } from '@/queries';
import { route } from '@/routes';
import { movieSidebarSchema } from '@/schemaValidations';
import {
  MovieResType,
  MovieSidebarBodyType,
  MovieSidebarResType
} from '@/types';
import { renderImageUrl, renderListPageUrl } from '@/utils';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

export default function SidebarForm({ queryKey }: { queryKey: string }) {
  const [webThumbnailUrl, setWebThumbnailUrl] = useState<string>('');
  const [mobileThumbnailUrl, setMobileThumbnailUrl] = useState<string>('');

  const uploadImageMutation = useUploadLogoMutation();
  const { id } = useParams<{
    id: string;
  }>();

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

  const onSubmit = async (values: MovieSidebarBodyType) => {
    await handleSubmit({
      ...values
    });
  };

  useEffect(() => {
    if (data?.webThumbnailUrl) setWebThumbnailUrl(data?.webThumbnailUrl);
  }, [data?.webThumbnailUrl]);

  useEffect(() => {
    if (data?.mobileThumbnailUrl)
      setMobileThumbnailUrl(data?.mobileThumbnailUrl);
  }, [data?.mobileThumbnailUrl]);

  return (
    <PageWrapper
      breadcrumbs={[
        {
          label: 'Phim mới',
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
                    value={renderImageUrl(webThumbnailUrl)}
                    loading={uploadImageMutation.isPending}
                    control={form.control}
                    name='webThumbnailUrl'
                    onChange={(url) => {
                      setWebThumbnailUrl(url);
                    }}
                    size={150}
                    uploadImageFn={async (file: Blob) => {
                      const res = await uploadImageMutation.mutateAsync({
                        file
                      });
                      return res.data?.filePath ?? '';
                    }}
                    label='Ảnh xem trước web (16:9)'
                    aspect={16 / 9}
                    required
                  />
                </Col>
                <Col span={12}>
                  <UploadImageField
                    value={renderImageUrl(mobileThumbnailUrl)}
                    loading={uploadImageMutation.isPending}
                    control={form.control}
                    name='mobileThumbnailUrl'
                    onChange={(url) => {
                      setMobileThumbnailUrl(url);
                    }}
                    size={150}
                    uploadImageFn={async (file: Blob) => {
                      const res = await uploadImageMutation.mutateAsync({
                        file
                      });
                      return res.data?.filePath ?? '';
                    }}
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
                    required
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
