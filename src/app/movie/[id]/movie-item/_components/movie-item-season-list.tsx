'use client';

import { ImageField } from '@/components/form';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { DragDropTable } from '@/components/table';
import {
  apiConfig,
  DEFAULT_DATE_FORMAT,
  MAX_PAGE_SIZE,
  MOVIE_ITEM_KIND_SEASON,
  movieItemKindOptions
} from '@/constants';
import { useDragDrop, useListBase, useNavigate, useQueryParams } from '@/hooks';
import { cn } from '@/lib';
import { route } from '@/routes';
import { movieItemSearchSchema } from '@/schemaValidations';
import {
  Column,
  MovieItemResType,
  MovieItemSearchType,
  SearchFormProps
} from '@/types';
import {
  formatDate,
  generatePath,
  renderImageUrl,
  renderListPageUrl
} from '@/utils';
import { useParams } from 'next/navigation';

export default function MovieItemSeasonList({
  queryKey
}: {
  queryKey: string;
}) {
  const navigate = useNavigate();
  const { id: movieId } = useParams<{ id: string }>();
  const { searchParams, serializeParams } = useQueryParams<{
    type: string;
    movieTitle: string;
  }>();

  const { data, loading, handlers } = useListBase<
    MovieItemResType,
    MovieItemSearchType
  >({
    apiConfig: apiConfig.movieItem,
    options: {
      queryKey,
      objectName: 'mùa',
      excludeFromQueryFilter: ['type', 'movieTitle'],
      defaultFilters: {
        movieId,
        kind: MOVIE_ITEM_KIND_SEASON
      },
      notShowFromSearchParams: ['movieId', 'kind']
    },
    override: (handlers) => {
      handlers.additionalParams = () => ({
        size: MAX_PAGE_SIZE
      });
    }
  });

  const {
    sortColumn,
    loading: loadingUpdateOrdering,
    sortedData,
    onDragEnd
  } = useDragDrop<MovieItemResType>({
    key: `${queryKey}-list`,
    objectName: 'mùa',
    data,
    apiConfig: apiConfig.movieItem.updateOrdering,
    sortField: 'ordering',
    updateOnDragEnd: true
  });

  const columns: Column<MovieItemResType>[] = [
    ...(sortedData.length > 1 ? [sortColumn] : []),
    {
      title: '#',
      dataIndex: 'thumbnailUrl',
      width: 80,
      align: 'center',
      render: (value) => (
        <ImageField
          disablePreview={!value}
          src={renderImageUrl(value)}
          className='rounded'
          previewClassName='rounded'
        />
      )
    },
    {
      title: 'Tiêu đề mùa',
      dataIndex: 'title',
      render: (value, record) => (
        <span
          className={cn('line-clamp-1 block truncate uppercase')}
          title={`${record.kind === MOVIE_ITEM_KIND_SEASON && `Mùa ${record.label}: ${value}`}`}
        >
          <span className='font-bold'>
            {record.kind === MOVIE_ITEM_KIND_SEASON && `Mùa ${record.label}:`}
          </span>
          &nbsp;
          <span>{value}</span>
        </span>
      )
    },
    {
      title: 'Ngày phát hành',
      dataIndex: 'releaseDate',
      width: 150,
      render: (value) => formatDate(value, DEFAULT_DATE_FORMAT),
      align: 'center'
    },
    {
      title: 'Loại mục phim',
      dataIndex: 'kind',
      width: 150,
      render: (value) => {
        const label = movieItemKindOptions.find(
          (kind) => kind.value === value
        )?.label;
        return label ?? '------';
      },
      align: 'center'
    },
    handlers.renderActionColumn({
      actions: {
        edit: true,
        delete: true
      },
      columnProps: {
        fixed: true
      }
    })
  ];

  const searchFields: SearchFormProps<MovieItemSearchType>['searchFields'] = [
    { key: 'title', placeholder: 'Tiêu đề mùa' }
  ];

  const handleViewDetail = (record: MovieItemResType) => {
    navigate(
      renderListPageUrl(
        generatePath(route.movieItem.getDetailList.path, {
          id: movieId,
          parentId: record.id
        }),
        serializeParams({
          type: searchParams.type,
          movieTitle: searchParams.movieTitle,
          season: record.title
        })
      )
    );
  };

  return (
    <PageWrapper
      breadcrumbs={[
        { label: 'Phim', href: route.movie.getList.path },
        { label: searchParams.movieTitle ?? 'Mùa' }
      ]}
    >
      <ListPageWrapper
        searchForm={handlers.renderSearchForm({
          searchFields,
          schema: movieItemSearchSchema
        })}
        addButton={handlers.renderAddButton()}
        reloadButton={handlers.renderReloadButton()}
      >
        <DragDropTable
          columns={columns}
          dataSource={sortedData}
          loading={loading || loadingUpdateOrdering}
          onDragEnd={onDragEnd}
          onSelectRow={handleViewDetail}
          rowClassName={() => 'cursor-pointer'}
        />
      </ListPageWrapper>
    </PageWrapper>
  );
}
