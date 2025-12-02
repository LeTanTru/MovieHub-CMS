'use client';

import {
  BooleanField,
  Col,
  DatePickerField,
  InputField,
  MultiSelectField,
  RichTextField,
  Row,
  SelectField,
  UploadImageField
} from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { PageWrapper } from '@/components/layout';
import { CircleLoading } from '@/components/loading';
import {
  ageRatingOptions,
  apiConfig,
  countryOptions,
  DATE_TIME_FORMAT,
  DEFAULT_DATE_FORMAT,
  ErrorCode,
  languageOptions,
  movieTypeOptions,
  STATUS_ACTIVE
} from '@/constants';
import { useSaveBase } from '@/hooks';
import { logger } from '@/logger';
import {
  useCategoryListQuery,
  useDeleteFileMutation,
  useUploadLogoMutation
} from '@/queries';
import { route } from '@/routes';
import { movieSchema } from '@/schemaValidations';
import { MovieBodyType, MovieResType } from '@/types';
import { formatDate, renderImageUrl, renderListPageUrl } from '@/utils';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

export default function MovieForm({ queryKey }: { queryKey: string }) {
  const { id } = useParams<{ id: string }>();

  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [posterUrl, setPosterUrl] = useState<string>('');
  const [uploadedThumbnailImages, setUploadedThumbnailImages] = useState<
    string[]
  >([]);

  const [uploadedPosterImages, setUploadedPosterImages] = useState<string[]>(
    []
  );

  const categoryListQuery = useCategoryListQuery();

  const categories =
    categoryListQuery?.data?.data?.content
      ?.map((category) => ({
        value: category.id.toString(),
        label: category.name
      }))
      .sort((a, b) => a.label.localeCompare(b.label)) || [];

  const uploadImageMutation = useUploadLogoMutation();
  const deleteImageMutation = useDeleteFileMutation();

  const {
    data,
    loading,
    isEditing,
    queryString,
    responseCode,
    handleSubmit,
    renderActions
  } = useSaveBase<MovieResType, MovieBodyType>({
    apiConfig: apiConfig.movie,
    options: {
      queryKey,
      objectName: 'phim',
      listPageUrl: route.movie.getList.path,
      pathParams: {
        id
      },
      mode: id === 'create' ? 'create' : 'edit'
    }
  });

  const defaultValues: MovieBodyType = {
    ageRating: 0,
    categoryIds: [],
    country: '',
    description: '',
    isFeatured: false,
    language: '',
    originalTitle: '',
    posterUrl: '',
    releaseDate: '',
    status: STATUS_ACTIVE,
    thumbnailUrl: '',
    title: '',
    type: 0
  };

  const initialValues: MovieBodyType = useMemo(() => {
    return {
      ageRating: data?.ageRating ?? 0,
      categoryIds:
        data?.categories
          ?.sort((a, b) => a.name.localeCompare(b.name))
          .map((category) => category.id.toString()) ?? [],
      country: data?.country ?? '',
      description: data?.description ?? '',
      isFeatured: data?.isFeatured ?? false,
      language: data?.language ?? '',
      originalTitle: data?.originalTitle ?? '',
      posterUrl: data?.posterUrl ?? '',
      releaseDate: formatDate(data?.releaseDate, DEFAULT_DATE_FORMAT) ?? '',
      status: STATUS_ACTIVE,
      thumbnailUrl: data?.thumbnailUrl ?? '',
      title: data?.title ?? '',
      type: data?.type ?? 0
    };
  }, [data]);

  const deleteFiles = async (files: string[]) => {
    const validFiles = files.filter(Boolean);
    if (!validFiles.length) return;
    await Promise.all(
      validFiles.map((filePath) =>
        deleteImageMutation.mutateAsync({ filePath }).catch((err) => {
          logger.error('Failed to delete file:', filePath, err);
        })
      )
    );
  };

  const handleDeleteFiles = async () => {
    const filesToDelete = [
      ...uploadedThumbnailImages.slice(1),
      ...uploadedPosterImages.slice(1)
    ];
    await deleteFiles(filesToDelete);
  };

  const onSubmit = async (values: MovieBodyType) => {
    const filesToDelete = [
      ...(data?.thumbnailUrl && !thumbnailUrl
        ? uploadedThumbnailImages
        : uploadedThumbnailImages.slice(0, uploadedThumbnailImages.length - 1)),
      ...(data?.posterUrl && !posterUrl
        ? uploadedPosterImages
        : uploadedPosterImages.slice(0, uploadedPosterImages.length - 1))
    ];

    await deleteFiles(filesToDelete.filter(Boolean));

    await handleSubmit({
      ...values,
      releaseDate: formatDate(
        values.releaseDate,
        DATE_TIME_FORMAT,
        DEFAULT_DATE_FORMAT
      ),
      thumbnailUrl: thumbnailUrl,
      posterUrl: posterUrl
    });
  };

  useEffect(() => {
    const url = data?.thumbnailUrl || '';
    setThumbnailUrl(url);
    setUploadedThumbnailImages(url ? [url] : []);
  }, [data?.thumbnailUrl]);

  useEffect(() => {
    const url = data?.posterUrl || '';
    setPosterUrl(url);
    setUploadedPosterImages(url ? [url] : []);
  }, [data?.posterUrl]);

  return (
    <PageWrapper
      breadcrumbs={[
        {
          label: 'Phim',
          href: renderListPageUrl(route.movie.getList.path, queryString)
        },
        {
          label: `${!isEditing ? 'Thêm mới' : 'Cập nhật'} phim`
        }
      ]}
      notFound={responseCode === ErrorCode.MOVIE_ERROR_NOT_FOUND}
      notFoundContent={`Không tìm thấy phim này`}
    >
      <BaseForm
        onSubmit={onSubmit}
        defaultValues={defaultValues}
        schema={movieSchema}
        initialValues={initialValues}
      >
        {(form) => (
          <>
            <Row>
              <Col span={12}>
                <UploadImageField
                  value={renderImageUrl(posterUrl)}
                  loading={uploadImageMutation.isPending}
                  control={form.control}
                  name='posterUrl'
                  onChange={(url) => {
                    setPosterUrl(url);
                    setUploadedPosterImages((prev) =>
                      url ? [...prev, url] : [...prev]
                    );
                  }}
                  size={150}
                  uploadImageFn={async (file: Blob) => {
                    const res = await uploadImageMutation.mutateAsync({
                      file
                    });
                    return res.data?.filePath ?? '';
                  }}
                  deleteImageFn={
                    data?.posterUrl
                      ? undefined
                      : () =>
                          deleteImageMutation.mutateAsync({
                            filePath: posterUrl
                          })
                  }
                  label='Ảnh xem trước'
                  aspect={2 / 3}
                  defaultCrop
                  required
                />
              </Col>
              <Col span={12}>
                <UploadImageField
                  value={renderImageUrl(thumbnailUrl)}
                  loading={uploadImageMutation.isPending}
                  control={form.control}
                  name='thumbnailUrl'
                  onChange={(url) => {
                    setThumbnailUrl(url);
                    setUploadedThumbnailImages((prev) =>
                      url ? [...prev, url] : [...prev]
                    );
                  }}
                  size={150}
                  uploadImageFn={async (file: Blob) => {
                    const res = await uploadImageMutation.mutateAsync({ file });
                    return res.data?.filePath ?? '';
                  }}
                  deleteImageFn={
                    data?.thumbnailUrl
                      ? undefined
                      : () =>
                          deleteImageMutation.mutateAsync({
                            filePath: thumbnailUrl
                          })
                  }
                  label='Ảnh bìa (16:9)'
                  aspect={16 / 9}
                  required
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <InputField
                  control={form.control}
                  name='title'
                  label='Tiêu đề'
                  placeholder='Tiêu đề'
                  required
                />
              </Col>
              <Col>
                <InputField
                  control={form.control}
                  name='originalTitle'
                  label='Tiêu đề gốc'
                  placeholder='Tiêu đề gốc'
                  required
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <SelectField
                  options={countryOptions}
                  control={form.control}
                  name='country'
                  label='Quốc gia'
                  placeholder='Quốc gia'
                  required
                />
              </Col>
              <Col>
                <SelectField
                  options={languageOptions}
                  control={form.control}
                  name='language'
                  label='Ngôn ngữ'
                  placeholder='Ngôn ngữ'
                  required
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <SelectField
                  options={ageRatingOptions}
                  control={form.control}
                  name='ageRating'
                  label='Độ tuổi'
                  placeholder='Độ tuổi'
                  required
                  getLabel={(opt) => `${opt.label} - ${opt.mean}`}
                />
              </Col>
              <Col>
                <SelectField
                  options={movieTypeOptions}
                  control={form.control}
                  name='type'
                  label='Thể loại'
                  placeholder='Thể loại'
                  required
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <DatePickerField
                  control={form.control}
                  name='releaseDate'
                  label='Ngày phát hành'
                  placeholder='Ngày phát hành'
                  required
                />
              </Col>
              <Col>
                <MultiSelectField
                  control={form.control}
                  name='categoryIds'
                  label='Danh mục'
                  placeholder='Danh mục'
                  required
                  options={categories}
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <BooleanField
                  control={form.control}
                  name='isFeatured'
                  label='Nổi bật'
                  required
                  labelClassName='ml-2'
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
                onCancel: handleDeleteFiles
              })}
            </>
            {(loading || categoryListQuery.isLoading) && (
              <div className='absolute inset-0 bg-white/80'>
                <CircleLoading className='stroke-dodger-blue mt-20 size-8' />
              </div>
            )}
          </>
        )}
      </BaseForm>
    </PageWrapper>
  );
}
