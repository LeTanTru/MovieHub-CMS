'use client';

import {
  AutoCompleteField,
  Col,
  DatePickerField,
  InputField,
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
  MOVIE_ITEM_KIND_EPISODE,
  MOVIE_ITEM_KIND_SEASON,
  MOVIE_TYPE_SINGLE,
  movieItemSeriesKindOptions,
  movieItemSingleKindOptions,
  queryKeys,
  STATUS_ACTIVE
} from '@/constants';
import { useFileUploadManager, useQueryParams, useSaveBase } from '@/hooks';
import {
  useDeleteFileMutation,
  useMovieItemListQuery,
  useUploadLogoMutation
} from '@/queries';
import { movieItemSchema } from '@/schemaValidations';
import {
  MovieItemBodyType,
  MovieItemResType,
  VideoLibraryResType
} from '@/types';
import { formatDate, notify, renderImageUrl } from '@/utils';
import { useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';

export default function MovieItemModal({
  open,
  close,
  movieItem
}: {
  open: boolean;
  close: () => void;
  movieItem?: MovieItemResType | null;
}) {
  const queryClient = useQueryClient();

  const {
    searchParams: { type }
  } = useQueryParams<{ type: string }>();
  const { id: movieId, movieItemId } = useParams<{
    id: string;
    movieItemId: string;
  }>();

  const uploadImageMutation = useUploadLogoMutation();
  const deleteFileMutation = useDeleteFileMutation();

  const movieItemListQuery = useMovieItemListQuery({
    params: {
      movieId,
      excludeKind: MOVIE_ITEM_KIND_SEASON,
      parentId: movieItemId
    },
    enabled: open
  });
  const movieItemList = movieItemListQuery.data?.data.content || [];

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

  const { data, loading, isEditing, handleSubmit, renderActions } = useSaveBase<
    MovieItemResType,
    MovieItemBodyType
  >({
    apiConfig: apiConfig.movieItem,
    options: {
      queryKey: queryKeys.MOVIE_ITEM,
      objectName: 'mùa',
      pathParams: {
        id: movieItem?.id
      },
      mode: !movieItem ? 'create' : 'edit'
    },
    override: (handlers) => {
      handlers.handleSubmitError = (code) => {
        if (code === ErrorCode.MOVIE_ITEM_ERROR_PARENT_REQUIRED) {
          notify.error('Vui lòng chọn mùa để thêm');
        }
      };
      handlers.handleSubmitSuccess = () => {
        close();
        queryClient.invalidateQueries({
          queryKey: [`${queryKeys.MOVIE_ITEM}-list`]
        });
        queryClient.invalidateQueries({ queryKey: [queryKeys.MOVIE_ITEM] });
      };
    }
  });

  const imageManager = useFileUploadManager({
    initialUrl: data?.thumbnailUrl,
    deleteFileMutation: deleteFileMutation,
    isEditing,
    onOpen: open
  });

  const parentId = movieItemId || data?.parent?.id?.toString();

  const defaultValues: MovieItemBodyType = {
    description: '',
    kind: kindOptions?.[0]?.value,
    label: '',
    movieId: movieId,
    ordering: 0,
    releaseDate: '',
    status: STATUS_ACTIVE,
    title: '',
    parentId: '',
    videoId: '',
    thumbnailUrl: ''
  };

  const initialValues: MovieItemBodyType = useMemo(() => {
    return {
      description: data?.description ?? '',
      kind: data?.kind ?? kindOptions?.[0]?.value,
      label: data?.label ?? '',
      movieId: movieId,
      ordering: data?.ordering ?? 0,
      releaseDate: formatDate(data?.releaseDate, DEFAULT_DATE_FORMAT) ?? '',
      status: STATUS_ACTIVE,
      title: data?.title ?? '',
      parentId: parentId,
      thumbnailUrl: data?.thumbnailUrl ?? '',
      videoId: data?.video?.id?.toString() ?? ''
    };
  }, [data]);

  const handleCancel = async () => {
    await imageManager.handleCancel();
    close();
  };

  const onSubmit = async (values: MovieItemBodyType) => {
    await imageManager.handleSubmit();

    await handleSubmit({
      ...values,
      ordering: movieItemList.length,
      movieId,
      parentId,
      releaseDate: formatDate(
        values.releaseDate,
        DATE_TIME_FORMAT,
        DEFAULT_DATE_FORMAT
      ),
      thumbnailUrl: imageManager.currentUrl
    });
  };

  return (
    <Modal
      open={open}
      onClose={close}
      width={800}
      title={`${isEditing ? 'Cập nhật' : 'Thêm'} ${movieItem ? (movieItem.kind === MOVIE_ITEM_KIND_EPISODE ? 'tập' : 'trailer') : 'tập/trailer'}`}
    >
      <BaseForm
        onSubmit={onSubmit}
        defaultValues={defaultValues}
        schema={movieItemSchema}
        initialValues={initialValues}
      >
        {(form) => {
          const kind = form.watch('kind');
          return (
            <>
              <Row>
                <Col span={24}>
                  <UploadImageField
                    value={renderImageUrl(imageManager.currentUrl)}
                    loading={uploadImageMutation.isPending}
                    control={form.control}
                    name='thumbnailUrl'
                    onChange={imageManager.trackUpload}
                    size={150}
                    uploadImageFn={async (file: Blob) => {
                      const res = await uploadImageMutation.mutateAsync({
                        file
                      });
                      return res.data?.filePath ?? '';
                    }}
                    deleteImageFn={imageManager.handleDeleteOnClick}
                    label='Ảnh xem trước (16:9)'
                    aspect={16 / 9}
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
                    disabled={isEditing || !movieItemId}
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
              {kind !== MOVIE_ITEM_KIND_SEASON ||
              (!!type && +type === MOVIE_TYPE_SINGLE) ? (
                <Row>
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
                </Row>
              ) : null}
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
                  <CircleLoading className='stroke-dodger-blue mt-20 size-8' />
                </div>
              )}
            </>
          );
        }}
      </BaseForm>
    </Modal>
  );
}
