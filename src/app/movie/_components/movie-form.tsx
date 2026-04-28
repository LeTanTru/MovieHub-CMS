'use client';

import {
  BooleanField,
  Col,
  DateTimePickerField,
  InputField,
  MultiSelectField,
  RichTextField,
  Row,
  SelectField,
  TimePickerField,
  UploadImageField
} from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { PageWrapper } from '@/components/layout';
import { CircleLoading } from '@/components/loading';
import {
  ageRatingOptions,
  apiConfig,
  countryOptions,
  ErrorCode,
  languageOptions,
  MOVIE_TYPE_SERIES,
  movieTypeOptions,
  queryKeys,
  SEND_NOTIFICATION_FOR_ALL_USERS,
  sendForOptions,
  STATUS_ACTIVE
} from '@/constants';
import { useFileUploadManager, useSaveBase } from '@/hooks';
import { logger } from '@/logger';
import {
  useCategoryListQuery,
  useDeleteFileMutation,
  useUploadLogoMutation
} from '@/queries';
import { route } from '@/routes';
import { movieSchema } from '@/schemaValidations';
import type { MetadataType, MovieBodyType, MovieResType } from '@/types';
import {
  convertLocalToUTC,
  convertUTCToLocal,
  renderImageUrl,
  renderListPageUrl
} from '@/utils';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';

export default function MovieForm() {
  const { id } = useParams<{ id: string }>();

  const { data: categoryListData, isLoading: categoryLoading } =
    useCategoryListQuery();

  const categoryList =
    categoryListData?.data?.content
      ?.map((category) => ({
        value: category.id.toString(),
        label: category.name
      }))
      .sort((a, b) => a.label.localeCompare(b.label)) || [];

  const { mutateAsync: uploadImageMutate } = useUploadLogoMutation();
  const { mutateAsync: deleteFileMutate } = useDeleteFileMutation();

  const [posterLoading, setPosterLoading] = useState(false);
  const [thumbnailLoading, setThumbnailLoading] = useState(false);
  const [imageTitleLoading, setImageTitleLoading] = useState(false);

  const {
    data,
    loading,
    isEditing,
    queryString,
    responseCode,
    onFormChange,
    handleSubmit,
    renderActions
  } = useSaveBase<MovieResType, MovieBodyType>({
    apiConfig: apiConfig.movie,
    options: {
      queryKey: queryKeys.MOVIE,
      objectName: 'phim',
      listPageUrl: route.movie.getList.path,
      pathParams: {
        id
      },
      mode: id === 'create' ? 'create' : 'edit'
    }
  });

  const posterImageManager = useFileUploadManager({
    initialUrl: data?.posterUrl,
    deleteFileMutate: deleteFileMutate,
    isEditing,
    onOpen: true
  });

  const thumbnailImageManager = useFileUploadManager({
    initialUrl: data?.thumbnailUrl,
    deleteFileMutate: deleteFileMutate,
    isEditing,
    onOpen: true
  });

  const imageTitleManager = useFileUploadManager({
    initialUrl: data?.imageTitleUrl,
    deleteFileMutate: deleteFileMutate,
    isEditing,
    onOpen: true
  });

  const defaultValues: MovieBodyType = {
    ageRating: 0,
    categoryIds: [],
    country: '',
    description: '',
    duration: 0,
    isFeatured: false,
    language: '',
    originalTitle: '',
    posterUrl: '',
    releaseDate: '',
    sendNotificationConfig: {
      isSendNotification: false,
      scheduleAt: '',
      sendFor: SEND_NOTIFICATION_FOR_ALL_USERS,
      title: ''
    },
    status: STATUS_ACTIVE,
    thumbnailUrl: '',
    title: '',
    type: 0,
    year: new Date().getFullYear()
  };

  const getDuration = (metadata: string) => {
    if (!metadata) return 0;
    try {
      const metadataObj: MetadataType = JSON.parse(metadata);
      return metadataObj.duration || 0;
    } catch (error) {
      logger.error('[METADATA_PARSE_ERROR]', error);
      return 0;
    }
  };

  const initialValues: MovieBodyType = useMemo(
    () => ({
      ageRating: data?.ageRating ?? 0,
      categoryIds:
        data?.categories
          ?.sort((a, b) => a.name.localeCompare(b.name))
          .map((category) => category.id.toString()) ?? [],
      country: data?.country ?? '',
      description: data?.description ?? '',
      duration: getDuration(data?.metadata ?? ''),
      imageTitleUrl: data?.imageTitleUrl ?? '',
      isFeatured: data?.isFeatured ?? false,
      language: data?.language ?? '',
      originalTitle: data?.originalTitle ?? '',
      posterUrl: data?.posterUrl ?? '',
      releaseDate: convertUTCToLocal(data?.releaseDate) ?? '',
      sendNotificationConfig: data?.sendNotificationConfig
        ? {
            isSendNotification:
              data.sendNotificationConfig.isSendNotification ?? false,
            scheduleAt: data.sendNotificationConfig.scheduleAt
              ? convertUTCToLocal(data.sendNotificationConfig.scheduleAt)
              : '',
            sendFor:
              data.sendNotificationConfig.sendFor ??
              SEND_NOTIFICATION_FOR_ALL_USERS,
            title: data.sendNotificationConfig.title ?? ''
          }
        : {
            isSendNotification: false,
            scheduleAt: '',
            sendFor: SEND_NOTIFICATION_FOR_ALL_USERS,
            title: ''
          },
      status: STATUS_ACTIVE,
      thumbnailUrl: data?.thumbnailUrl ?? '',
      title: data?.title ?? '',
      type: data?.type ?? 0,
      year: data?.year ?? new Date().getFullYear()
    }),
    [
      data?.ageRating,
      data?.categories,
      data?.country,
      data?.description,
      data?.imageTitleUrl,
      data?.isFeatured,
      data?.language,
      data?.metadata,
      data?.originalTitle,
      data?.posterUrl,
      data?.releaseDate,
      data?.sendNotificationConfig,
      data?.thumbnailUrl,
      data?.title,
      data?.type,
      data?.year
    ]
  );

  const handleCancel = async () => {
    await Promise.all([
      posterImageManager.handleCancel(),
      thumbnailImageManager.handleCancel(),
      imageTitleManager.handleCancel()
    ]);
  };

  const onSubmit = async (values: MovieBodyType) => {
    const sendNotificationConfig = values.sendNotificationConfig
      ?.isSendNotification
      ? {
          isSendNotification: values.sendNotificationConfig.isSendNotification,
          scheduleAt: convertLocalToUTC(
            values.sendNotificationConfig.scheduleAt || ''
          ),
          sendFor: values.sendNotificationConfig.sendFor,
          title: values.sendNotificationConfig.title
        }
      : null;

    await Promise.all([
      posterImageManager.handleSubmit(),
      thumbnailImageManager.handleSubmit(),
      imageTitleManager.handleSubmit(),
      handleSubmit({
        ...values,
        releaseDate: convertLocalToUTC(values.releaseDate),
        sendNotificationConfig,
        thumbnailUrl: thumbnailImageManager.currentUrl,
        posterUrl: posterImageManager.currentUrl,
        imageTitleUrl: imageTitleManager.currentUrl
      })
    ]);
  };

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearOptions = [];
    for (let year = 1900; year <= currentYear; year++) {
      yearOptions.push({
        value: year,
        label: year.toString()
      });
    }
    return yearOptions.reverse();
  }, []);

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
      notFoundContent='Không tìm thấy phim này'
    >
      <BaseForm
        onSubmit={onSubmit}
        defaultValues={defaultValues}
        schema={movieSchema}
        initialValues={initialValues}
        onFormChange={onFormChange}
      >
        {(form) => (
          <>
            <Row>
              <Col className='grid-c-4'>
                <UploadImageField
                  value={renderImageUrl(posterImageManager.currentUrl)}
                  loading={posterLoading}
                  control={form.control}
                  name='posterUrl'
                  onChange={posterImageManager.trackUpload}
                  size={150}
                  uploadImageFn={async (file) => {
                    setPosterLoading(true);
                    try {
                      const res = await uploadImageMutate({ file });
                      return res.data?.filePath ?? '';
                    } finally {
                      setPosterLoading(false);
                    }
                  }}
                  deleteImageFn={posterImageManager.handleDeleteOnClick}
                  label='Ảnh bìa (2:3 - Poster)'
                  aspect={2 / 3}
                  required
                  defaultCrop={false}
                />
              </Col>
              <Col className='grid-c-4'>
                <UploadImageField
                  value={renderImageUrl(thumbnailImageManager.currentUrl)}
                  loading={thumbnailLoading}
                  control={form.control}
                  name='thumbnailUrl'
                  onChange={thumbnailImageManager.trackUpload}
                  size={150}
                  uploadImageFn={async (file) => {
                    setThumbnailLoading(true);
                    try {
                      const res = await uploadImageMutate({ file });
                      return res.data?.filePath ?? '';
                    } finally {
                      setThumbnailLoading(false);
                    }
                  }}
                  deleteImageFn={thumbnailImageManager.handleDeleteOnClick}
                  label='Ảnh xem trước (16:9 - Thumbnail)'
                  aspect={16 / 9}
                  required
                  defaultCrop={false}
                />
              </Col>
              <Col className='grid-c-4'>
                <UploadImageField
                  value={renderImageUrl(imageTitleManager.currentUrl)}
                  loading={imageTitleLoading}
                  control={form.control}
                  name='imageTitleUrl'
                  onChange={imageTitleManager.trackUpload}
                  size={150}
                  uploadImageFn={async (file) => {
                    setImageTitleLoading(true);
                    try {
                      const res = await uploadImageMutate({ file });
                      return res.data?.filePath ?? '';
                    } finally {
                      setImageTitleLoading(false);
                    }
                  }}
                  deleteImageFn={imageTitleManager.handleDeleteOnClick}
                  label='Ảnh tiêu đề (Image title)'
                  allowCustomAspect
                  originalSize
                  defaultCrop={false}
                />
              </Col>
            </Row>
            <Row>
              <Col className='grid-c-6'>
                <InputField
                  control={form.control}
                  name='title'
                  label='Tiêu đề'
                  placeholder='Tiêu đề'
                  required
                />
              </Col>
              <Col className='grid-c-6'>
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
              <Col className='grid-c-6'>
                <SelectField
                  options={countryOptions}
                  control={form.control}
                  name='country'
                  label='Quốc gia'
                  placeholder='Quốc gia'
                  required
                />
              </Col>
              <Col className='grid-c-6'>
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
              <Col className='grid-c-6'>
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
              <Col className='grid-c-6'>
                <SelectField
                  options={movieTypeOptions}
                  control={form.control}
                  name='type'
                  label='Phim'
                  placeholder='Phim'
                  required
                  disabled={isEditing}
                />
              </Col>
            </Row>
            <Row>
              <Col className='grid-c-6'>
                <DateTimePickerField
                  control={form.control}
                  name='releaseDate'
                  label='Ngày phát hành'
                  placeholder='Ngày phát hành'
                  required
                />
              </Col>
              <Col className='grid-c-6'>
                <MultiSelectField
                  control={form.control}
                  name='categoryIds'
                  label='Thể loại'
                  placeholder='Thể loại'
                  required
                  options={categoryList}
                />
              </Col>
            </Row>
            <Row>
              <Col className='grid-c-6'>
                <SelectField
                  options={years}
                  control={form.control}
                  name='year'
                  label='Năm sản xuất'
                  placeholder='Năm sản xuất'
                  required
                />
              </Col>
              <Col className='grid-c-6'>
                {form.watch('type') === MOVIE_TYPE_SERIES && (
                  <TimePickerField
                    control={form.control}
                    name='duration'
                    label='Thời lượng trung bình mỗi tập'
                    placeholder='Thời lượng trung bình mỗi tập'
                    required
                  />
                )}
              </Col>
            </Row>
            <Row>
              <Col className='grid-c-6'>
                <BooleanField
                  control={form.control}
                  name='isFeatured'
                  label='Hot'
                  required
                />
              </Col>
              <Col className='grid-c-3'>
                <BooleanField
                  control={form.control}
                  name='sendNotificationConfig.isSendNotification'
                  label='Gửi thông báo'
                />
              </Col>
            </Row>
            {form.watch('sendNotificationConfig.isSendNotification') && (
              <>
                <Row>
                  <Col className='grid-c-6'>
                    <DateTimePickerField
                      control={form.control}
                      name='sendNotificationConfig.scheduleAt'
                      label='Thời gian gửi'
                      placeholder='Thời gian gửi'
                    />
                  </Col>
                  <Col className='grid-c-6'>
                    <SelectField
                      options={sendForOptions}
                      control={form.control}
                      name='sendNotificationConfig.sendFor'
                      label='Gửi cho'
                      placeholder='Gửi cho'
                    />
                  </Col>
                </Row>
                <Row>
                  <Col className='grid-c-6'>
                    <InputField
                      control={form.control}
                      name='sendNotificationConfig.title'
                      label='Tiêu đề thông báo'
                      placeholder='Tiêu đề thông báo'
                    />
                  </Col>
                </Row>
              </>
            )}
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
            {(loading || categoryLoading) && (
              <div className='absolute inset-0 z-10 flex justify-center bg-white/80'>
                <CircleLoading className='stroke-main-color mt-20' />
              </div>
            )}
          </>
        )}
      </BaseForm>
    </PageWrapper>
  );
}
