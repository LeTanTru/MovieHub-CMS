'use client';

import {
  AutoCompleteField,
  CheckboxField,
  Col,
  DatePickerField,
  InputField,
  NumberField,
  RichTextField,
  Row,
  SelectField,
  UploadImageField
} from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { CircleLoading } from '@/components/loading';
import { Modal } from '@/components/modal';
import {
  apiConfig,
  DATE_TIME_FORMAT,
  DEFAULT_DATE_FORMAT,
  ErrorCode,
  MOVIE_ITEM_KIND_SEASON,
  MOVIE_TYPE_SERIES,
  MOVIE_TYPE_SINGLE,
  MOVIE_TYPE_TRAILER,
  movieItemErrorMaps,
  movieItemSeriesKindOptions,
  movieItemSingleKindOptions,
  queryKeys,
  STATUS_ACTIVE
} from '@/constants';
import { useFileUploadManager, useQueryParams, useSaveBase } from '@/hooks';
import { useDeleteFileMutation, useUploadLogoMutation } from '@/queries';
import { movieItemSchema } from '@/schemaValidations';
import type {
  MovieItemBodyType,
  MovieItemResType,
  VideoLibraryResType
} from '@/types';
import { formatDate, notify, renderImageUrl } from '@/utils';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';

export default function MovieItemModal({
  open,
  onClose,
  movieItem
}: {
  open: boolean;
  onClose: () => void;
  movieItem?: MovieItemResType | null;
}) {
  const {
    searchParams: { type }
  } = useQueryParams<{ type: string }>();
  const { id: movieId, movieItemId } = useParams<{
    id: string;
    movieItemId: string;
  }>();

  const { mutateAsync: uploadImageMutate, isPending: updateImageLoading } =
    useUploadLogoMutation();
  const { mutateAsync: deleteFileMutate } = useDeleteFileMutation();

  const kindOptions =
    !!type && +type === MOVIE_TYPE_SINGLE
      ? movieItemSingleKindOptions.filter(
          (item) =>
            !movieItemId ||
            (movieItemId && item.value !== MOVIE_ITEM_KIND_SEASON)
        )
      : movieItemSeriesKindOptions.filter(
          (item) =>
            !movieItemId ||
            (movieItemId && item.value !== MOVIE_ITEM_KIND_SEASON)
        );

  let objectName = '';

  if (!!type) {
    const _type = +type;
    if (_type === MOVIE_TYPE_SINGLE) {
      if (movieItemId) {
        objectName = 'trailer';
      } else {
        objectName = 'phần';
      }
    } else if (_type === MOVIE_TYPE_SERIES) {
      if (movieItemId) {
        objectName = 'tập, trailer';
      } else {
        objectName = 'phần';
      }
    }
  }

  const {
    data,
    loading,
    isEditing,
    isFormChanged,
    onFormChange,
    handleSubmit,
    renderActions
  } = useSaveBase<MovieItemResType, MovieItemBodyType>({
    apiConfig: apiConfig.movieItem,
    options: {
      queryKey: queryKeys.MOVIE_ITEM,
      objectName,
      pathParams: {
        id: movieItem?.id
      },
      mode: !movieItem ? 'create' : 'edit'
    },
    override: (handlers) => {
      handlers.handleSubmitError = (code) => {
        if (code === ErrorCode.MOVIE_ITEM_ERROR_PARENT_REQUIRED) {
          notify.error('Vui lòng chọn phần để thêm');
        }
      };
      handlers.handleSubmitSuccess = () => {
        onClose();
      };
    }
  });

  const imageManager = useFileUploadManager({
    initialUrl: data?.thumbnailUrl,
    deleteFileMutate: deleteFileMutate,
    isEditing,
    onOpen: open
  });

  const parentId = movieItemId || data?.parent?.id?.toString();

  const defaultValues: MovieItemBodyType = {
    description: '',
    isLatest: false,
    kind: kindOptions?.[0]?.value,
    label: '',
    movieId: movieId,
    releaseDate: '',
    status: STATUS_ACTIVE,
    title: '',
    parentId: '',
    videoId: '',
    thumbnailUrl: '',
    totalEpisode: 0
  };

  const initialValues: MovieItemBodyType = useMemo(
    () => ({
      description: data?.description ?? '',
      isLatest: data?.isLatest ?? false,
      kind: data?.kind ?? kindOptions?.[0]?.value,
      label: data?.label ?? '',
      movieId: movieId,
      releaseDate: formatDate(data?.releaseDate, DEFAULT_DATE_FORMAT) ?? '',
      status: STATUS_ACTIVE,
      title: data?.title ?? '',
      parentId: parentId,
      thumbnailUrl: data?.thumbnailUrl ?? '',
      videoId: data?.video?.id?.toString() ?? '',
      totalEpisode: data?.totalEpisode ?? 0
    }),
    [
      data?.description,
      data?.isLatest,
      data?.kind,
      data?.label,
      data?.releaseDate,
      data?.thumbnailUrl,
      data?.title,
      data?.totalEpisode,
      data?.video?.id,
      kindOptions,
      movieId,
      parentId
    ]
  );

  const handleCancel = async () => {
    await imageManager.handleCancel();
    onClose();
  };

  const onSubmit = async (
    values: MovieItemBodyType,
    form: UseFormReturn<MovieItemBodyType>
  ) => {
    if (!!type && +type === MOVIE_TYPE_SERIES) {
      if (values.kind === MOVIE_ITEM_KIND_SEASON && !values.totalEpisode) {
        form.setError('totalEpisode', {
          message: 'Tổng số tập là bắt buộc'
        });
        return;
      }
    }

    await Promise.all([
      imageManager.handleSubmit(),
      handleSubmit(
        {
          ...values,
          totalEpisode:
            !!type &&
            +type === MOVIE_TYPE_SERIES &&
            values.kind === MOVIE_ITEM_KIND_SEASON
              ? values.totalEpisode
              : null,
          movieId,
          parentId,
          releaseDate: formatDate(
            values.releaseDate,
            DATE_TIME_FORMAT,
            DEFAULT_DATE_FORMAT
          ),
          thumbnailUrl: imageManager.currentUrl
        },
        form,
        movieItemErrorMaps
      )
    ]);
  };

  const handleClose = () => {
    onClose();
    onFormChange(false);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      bodyWrapperClassName='h-[80vh] max-[1537px]:w-225 max-[1367px]:w-200'
      title={`${isEditing ? 'Cập nhật' : 'Thêm'} ${objectName}`}
      aria-labelledby='movie-item-modal-title'
      scrollable
      confirmOnClose={isFormChanged}
    >
      <BaseForm
        onSubmit={onSubmit}
        defaultValues={defaultValues}
        schema={movieItemSchema}
        initialValues={initialValues}
        onFormChange={onFormChange}
      >
        {(form) => {
          const kind = form.watch('kind');
          return (
            <>
              <Row>
                <Col span={24}>
                  <UploadImageField
                    value={renderImageUrl(imageManager.currentUrl)}
                    loading={updateImageLoading}
                    control={form.control}
                    name='thumbnailUrl'
                    onChange={imageManager.trackUpload}
                    size={150}
                    uploadImageFn={async (file: Blob) => {
                      const res = await uploadImageMutate({
                        file
                      });
                      return res.data?.filePath ?? '';
                    }}
                    deleteImageFn={imageManager.handleDeleteOnClick}
                    label='Ảnh xem trước (16:9)'
                    aspect={16 / 9}
                    defaultCrop={false}
                  />
                </Col>
              </Row>
              <Row>
                <Col>
                  <SelectField
                    options={movieItemId ? kindOptions : [kindOptions[0]]}
                    control={form.control}
                    name='kind'
                    label='Loại'
                    placeholder='Loại'
                    required
                    disabled={
                      isEditing || !movieItemId || kindOptions.length === 1
                    }
                  />
                </Col>
                <Col>
                  <InputField
                    control={form.control}
                    name='title'
                    label='Tiêu đề'
                    placeholder='Tiêu đề'
                    required
                  />
                </Col>
              </Row>
              <Row>
                <Col>
                  <InputField
                    control={form.control}
                    name='label'
                    label='Nhãn'
                    placeholder='Nhãn'
                    required
                  />
                </Col>
                <Col>
                  <DatePickerField
                    control={form.control}
                    name='releaseDate'
                    label='Ngày phát hành'
                    placeholder='Ngày phát hành'
                    required
                  />
                </Col>
              </Row>
              <Row>
                {!!type &&
                  +type === MOVIE_TYPE_SERIES &&
                  kind === MOVIE_ITEM_KIND_SEASON && (
                    <Col>
                      <NumberField
                        control={form.control}
                        name='totalEpisode'
                        label='Tổng số tập'
                        placeholder='Tổng số tập'
                        required
                        min={0}
                      />
                    </Col>
                  )}
                {(kind !== MOVIE_ITEM_KIND_SEASON ||
                  (!!type && +type === MOVIE_TYPE_SINGLE)) && (
                  <Col>
                    <AutoCompleteField
                      apiConfig={apiConfig.videoLibrary.autoComplete}
                      mappingData={(item: VideoLibraryResType) => ({
                        label: item.name,
                        value: item.id.toString()
                      })}
                      searchParams={['name']}
                      control={form.control}
                      name='videoId'
                      label='Video'
                      placeholder='Video'
                    />
                  </Col>
                )}
                {kind !== MOVIE_TYPE_TRAILER && !isEditing && (
                  <Col className='mb-3 justify-end'>
                    <CheckboxField
                      control={form.control}
                      name='isLatest'
                      label='Đánh dấu là mới nhất'
                      required
                    />
                  </Col>
                )}
              </Row>
              <Row>
                <Col span={24}>
                  <RichTextField
                    control={form.control}
                    name='description'
                    label='Mô tả'
                    placeholder='Mô tả'
                    required
                    height={300}
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
                  <CircleLoading className='stroke-main-color mt-20 size-8' />
                </div>
              )}
            </>
          );
        }}
      </BaseForm>
    </Modal>
  );
}
