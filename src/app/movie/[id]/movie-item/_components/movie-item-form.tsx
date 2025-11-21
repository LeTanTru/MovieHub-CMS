'use client';

import {
  AutoCompleteField,
  Col,
  DatePickerField,
  InputField,
  RichTextField,
  Row,
  SelectField
} from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { PageWrapper } from '@/components/layout';
import { CircleLoading } from '@/components/loading';
import {
  apiConfig,
  DATE_TIME_FORMAT,
  DEFAULT_DATE_FORMAT,
  ErrorCode,
  MOVIE_ITEM_KIND_SEASON,
  MOVIE_TYPE_SINGLE,
  movieItemSeriesKindOptions,
  movieItemSingleKindOptions,
  STATUS_ACTIVE,
  storageKeys
} from '@/constants';
import { useQueryParams, useSaveBase } from '@/hooks';
import {
  useMovieItemListQuery,
  useUpdateOrderingMovieItemMutation
} from '@/queries';
import { route } from '@/routes';
import { movieItemSchema } from '@/schemaValidations';
import {
  MovieItemBodyType,
  MovieItemResType,
  VideoLibraryResType
} from '@/types';
import { formatDate, generatePath, getData, renderListPageUrl } from '@/utils';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';

export default function MovieItemForm({ queryKey }: { queryKey: string }) {
  const {
    searchParams: { type }
  } = useQueryParams<{ type: string }>();
  const { id: movieId, movieItemId } = useParams<{
    id: string;
    movieItemId: string;
  }>();

  const movieItemListQuery = useMovieItemListQuery({ movieId });
  const movieItemList = movieItemListQuery.data?.data.content || [];

  const updateOrderingMovieItemMutation = useUpdateOrderingMovieItemMutation();

  const {
    data,
    loading,
    isEditing,
    queryString,
    responseCode,
    handleSubmit,
    renderActions
  } = useSaveBase<MovieItemResType, MovieItemBodyType>({
    apiConfig: apiConfig.movieItem,
    options: {
      queryKey,
      objectName: 'mục phim',
      listPageUrl: generatePath(route.movieItem.getList.path, { id: movieId }),
      pathParams: {
        id: movieItemId
      },
      mode: movieItemId === 'create' ? 'create' : 'edit'
    }
  });

  const defaultValues: MovieItemBodyType = {
    description: '',
    kind: MOVIE_ITEM_KIND_SEASON,
    label: '',
    movieId: movieId,
    ordering: 0,
    releaseDate: '',
    status: STATUS_ACTIVE,
    title: '',
    parentId: '',
    videoId: ''
  };

  const initialValues: MovieItemBodyType = useMemo(() => {
    return {
      description: data?.description ?? '',
      kind: data?.kind ?? MOVIE_ITEM_KIND_SEASON,
      label: data?.label ?? '',
      movieId: movieId,
      ordering: data?.ordering ?? 0,
      releaseDate: formatDate(data?.releaseDate, DEFAULT_DATE_FORMAT) ?? '',
      status: STATUS_ACTIVE,
      title: data?.title ?? '',
      parentId: '',
      videoId: data?.video?.id?.toString() ?? ''
    };
  }, [data, movieId]);

  const onSubmit = async (values: MovieItemBodyType) => {
    let ordering = 0;
    const parentId = getData(storageKeys.SELECTED_MOVIE_ITEM);

    if (!parentId) ordering = movieItemList.length;
    else {
      const orderingList = movieItemList.map((movieItem) => ({
        id: movieItem.id.toString(),
        ordering: movieItem.ordering,
        parentId: movieItem?.parent?.id
      }));
      const parent = orderingList.find(
        (item) => item.id.toString() === parentId
      );
      const newOrderingList = orderingList.map((item) => {
        if (parent && item.ordering <= parent?.ordering) return item;
        return { ...item, ordering: item.ordering + 1 };
      });
      ordering += 1;
      await updateOrderingMovieItemMutation.mutateAsync(newOrderingList);
    }

    await handleSubmit({
      ...values,
      ordering,
      movieId,
      parentId,
      releaseDate: formatDate(
        values.releaseDate,
        DATE_TIME_FORMAT,
        DEFAULT_DATE_FORMAT
      )
    });
  };

  return (
    <PageWrapper
      breadcrumbs={[
        {
          label: 'Phim',
          href: route.movie.getList.path
        },
        {
          label: 'Mục phim',
          href: renderListPageUrl(
            generatePath(route.movieItem.getList.path, { id: movieId }),
            queryString
          )
        },
        {
          label: `${!data ? 'Thêm mới' : 'Cập nhật'} mục phim`
        }
      ]}
      notFound={responseCode === ErrorCode.MOVIE_ITEM_ERROR_NOT_FOUND}
      notFoundContent={`Không tìm thấy phim này`}
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
                <Col>
                  <SelectField
                    options={
                      !!type && +type === MOVIE_TYPE_SINGLE
                        ? movieItemSingleKindOptions
                        : movieItemSeriesKindOptions
                    }
                    control={form.control}
                    name='kind'
                    label='Loại'
                    placeholder='Loại'
                    required
                    disabled={isEditing}
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
                      apiConfig={apiConfig.videoLibary.getList}
                      mappingData={(item: VideoLibraryResType) => ({
                        label: item.name,
                        value: item.id.toString()
                      })}
                      searchParams={['name']}
                      control={form.control}
                      name='videoId'
                      label='Video'
                      placeholder='Video'
                      required
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
