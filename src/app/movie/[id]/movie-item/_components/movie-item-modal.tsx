'use client';

import {
  AutoCompleteField,
  CheckboxField,
  Col,
  DateTimePickerField,
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
  ErrorCode,
  MOVIE_ITEM_KIND_SEASON,
  MOVIE_TYPE_SERIES,
  MOVIE_TYPE_SINGLE,
  MOVIE_TYPE_TRAILER,
  movieItemErrorMaps,
  movieItemSeriesKindOptions,
  movieItemSingleKindOptions,
  queryKeys,
  SEND_NOTIFICATION_FOR_ALL_USERS,
  sendForOptions,
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
import {
  convertLocalToUTC,
  convertUTCToLocal,
  notify,
  renderImageUrl
} from '@/utils';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';

const defaultValues: MovieItemBodyType = {
  description: '',
  isLatest: false,
  kind: 0,
  label: '',
  movieId: '',
  releaseDate: '',
  sendNotificationConfig: {
    isSendNotification: false,
    scheduleAt: '',
    sendFor: SEND_NOTIFICATION_FOR_ALL_USERS,
    title: ''
  },
  status: STATUS_ACTIVE,
  title: '',
  parentId: '',
  videoId: '',
  thumbnailUrl: '',
  totalEpisode: 0
};

type MovieItemModalProps = {
  open: boolean;
  onClose: () => void;
  movieItem?: MovieItemResType | null;
};

export function MovieItemModal({
  open,
  onClose,
  movieItem
}: MovieItemModalProps) {
  const {
    searchParams: { type }
  } = useQueryParams<{ type: string }>();

  const movieType = Number(type || 0);

  const { id: movieId, movieItemId } = useParams<{
    id: string;
    movieItemId: string;
  }>();

  const { mutateAsync: uploadImageMutate, isPending: updateImageLoading } =
    useUploadLogoMutation();
  const { mutateAsync: deleteFileMutate } = useDeleteFileMutation();

  const kindOptions = useMemo(() => {
    const options =
      movieType === MOVIE_TYPE_SINGLE
        ? movieItemSingleKindOptions
        : movieItemSeriesKindOptions;

    return options.filter(
      (item) =>
        !movieItemId || (movieItemId && item.value !== MOVIE_ITEM_KIND_SEASON)
    );
  }, [movieItemId, movieType]);

  const defaultKind = kindOptions?.[0]?.value ?? defaultValues.kind;

  let objectName = '';

  if (movieType === MOVIE_TYPE_SINGLE) {
    if (movieItemId) {
      objectName = 'trailer';
    } else {
      objectName = 'phần';
    }
  } else if (movieType === MOVIE_TYPE_SERIES) {
    if (movieItemId) {
      objectName = 'tập, trailer';
    } else {
      objectName = 'phần';
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
        id: movieItem?.id ?? ''
      },
      mode: !movieItem ? 'create' : 'edit'
    },
    override: (handlers) => {
      handlers.handleSubmitError = (code) => {
        if (code === ErrorCode.MOVIE_ITEM_ERROR_PARENT_REQUIRED) {
          notify.error('Vui lòng chọn phần để thêm');
        } else if (code === ErrorCode.MOVIE_ITEM_EXCEED_TOTAL_EXPISODE) {
          notify.error('Số tập đã vượt quá tổng số tập của phần');
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

  const initialValues: MovieItemBodyType = useMemo(
    () => ({
      description: data?.description ?? defaultValues.description,
      isLatest: data?.isLatest ?? defaultValues.isLatest,
      kind: data?.kind ?? defaultKind,
      label: data?.label ?? defaultValues.label,
      movieId: movieId || defaultValues.movieId,
      releaseDate:
        convertUTCToLocal(data?.releaseDate ?? null) ??
        defaultValues.releaseDate,
      sendNotificationConfig: defaultValues.sendNotificationConfig,
      status: data?.status ?? defaultValues.status,
      title: data?.title ?? defaultValues.title,
      parentId: parentId ?? defaultValues.parentId,
      thumbnailUrl: data?.thumbnailUrl ?? defaultValues.thumbnailUrl,
      videoId: data?.video?.id?.toString() ?? defaultValues.videoId,
      totalEpisode: data?.totalEpisode ?? defaultValues.totalEpisode
    }),
    [
      data?.description,
      data?.isLatest,
      data?.kind,
      data?.label,
      data?.releaseDate,
      data?.status,
      data?.thumbnailUrl,
      data?.title,
      data?.totalEpisode,
      data?.video?.id,
      defaultKind,
      movieId,
      parentId
    ]
  );

  const onSubmit = async (
    values: MovieItemBodyType,
    form: UseFormReturn<MovieItemBodyType>
  ) => {
    await Promise.all([
      imageManager.handleSubmit(),
      handleSubmit(
        {
          ...values,
          totalEpisode:
            movieType === MOVIE_TYPE_SERIES &&
            values.kind === MOVIE_ITEM_KIND_SEASON
              ? values.totalEpisode
              : null,
          movieId,
          parentId,
          releaseDate: convertLocalToUTC(
            values.releaseDate,
            DATE_TIME_FORMAT,
            DATE_TIME_FORMAT
          ),
          thumbnailUrl: imageManager.currentUrl
        },
        form,
        movieItemErrorMaps
      )
    ]);
  };

  const handleCancel = async () => {
    onClose();
    onFormChange(false);
    await imageManager.handleCancel();
  };

  return (
    <Modal
      open={open}
      onClose={handleCancel}
      className='top-20 w-200 max-[1537px]:top-10'
      aria-labelledby='movie-item-modal-title'
      confirmOnClose={isFormChanged}
    >
      <Modal.Header>
        {`${isEditing ? 'Cập nhật' : 'Thêm'} ${objectName}`}
      </Modal.Header>
      <Modal.Body className='max-h-[80vh]' scrollable>
        <BaseForm
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          schema={movieItemSchema(movieType)}
          initialValues={initialValues}
          onFormChange={onFormChange}
        >
          {(form) => {
            const kind = form.watch('kind');
            return (
              <>
                <Row>
                  <Col className='grid-c-12'>
                    <UploadImageField
                      value={renderImageUrl(imageManager.currentUrl)}
                      loading={updateImageLoading}
                      control={form.control}
                      name='thumbnailUrl'
                      onChange={imageManager.trackUpload}
                      size={150}
                      uploadImageFn={async (file) => {
                        const res = await uploadImageMutate({
                          file
                        });
                        return res.data?.filePath ?? '';
                      }}
                      deleteImageFn={imageManager.handleDeleteOnClick}
                      label='Ảnh xem trước (16:9)'
                      aspect={16 / 9}
                      originalSize
                    />
                  </Col>
                </Row>
                <Row>
                  <Col className='grid-c-6'>
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
                  <Col className='grid-c-6'>
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
                  <Col className='grid-c-6'>
                    <InputField
                      control={form.control}
                      name='label'
                      label='Nhãn'
                      placeholder='Nhãn'
                      required
                    />
                  </Col>
                  <Col className='grid-c-6'>
                    <DateTimePickerField
                      control={form.control}
                      name='releaseDate'
                      label='Ngày phát hành'
                      placeholder='Ngày phát hành'
                      required
                      allowClear
                    />
                  </Col>
                </Row>
                <Row>
                  {/* Only show for movie type series and kind season */}
                  {movieType === MOVIE_TYPE_SERIES &&
                    kind === MOVIE_ITEM_KIND_SEASON && (
                      <Col className='grid-c-6'>
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
                  {/* Only show for kind not season or movie type single */}
                  {(kind !== MOVIE_ITEM_KIND_SEASON ||
                    movieType === MOVIE_TYPE_SINGLE) && (
                    <Col className='grid-c-6'>
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
                        allowClear
                      />
                    </Col>
                  )}
                </Row>
                <Row>
                  {!isEditing && (
                    <Col className='grid-c-6'>
                      <CheckboxField
                        control={form.control}
                        name='sendNotificationConfig.isSendNotification'
                        label='Gửi thông báo'
                      />
                    </Col>
                  )}
                  {kind !== MOVIE_TYPE_TRAILER && !isEditing && (
                    <Col className='grid-c-6'>
                      <CheckboxField
                        control={form.control}
                        name='isLatest'
                        label='Đánh dấu là mới nhất'
                        required
                      />
                    </Col>
                  )}
                </Row>
                {!isEditing &&
                  form.watch('sendNotificationConfig.isSendNotification') && (
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
                        <Col className='grid-c-12'>
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
                  <div className='absolute inset-0 z-10 flex justify-center bg-white/80'>
                    <CircleLoading className='stroke-sporty-blue mt-10' />
                  </div>
                )}
              </>
            );
          }}
        </BaseForm>
      </Modal.Body>
      <Modal.Confirm message='Bạn có chắc chắn muốn hủy không ?' />
    </Modal>
  );
}
