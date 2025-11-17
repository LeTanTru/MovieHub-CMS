'use client';

import { AvatarField } from '@/components/form';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { BaseTable } from '@/components/table';
import {
  ageRatingOptions,
  apiConfig,
  countryOptions,
  DEFAULT_DATE_FORMAT,
  ErrorCode,
  FieldTypes,
  movieTypeOptions
} from '@/constants';
import { useListBase } from '@/hooks';
import { movieSearchSchema } from '@/schemaValidations';
import {
  Column,
  MovieResType,
  MovieSearchType,
  SearchFormProps
} from '@/types';
import { formatDate, notify, renderImageUrl } from '@/utils';
import { AiOutlineFileImage } from 'react-icons/ai';

export default function MovieList({ queryKey }: { queryKey: string }) {
  const { data, pagination, loading, handlers } = useListBase<
    MovieResType,
    MovieSearchType
  >({
    apiConfig: apiConfig.movie,
    options: {
      queryKey,
      objectName: 'phim'
    },
    override: (handlers) => {
      handlers.handleDeleteError = (code) => {
        if (code === ErrorCode.MOVIE_ERROR_HAS_ITEM) {
          notify.error('Phim này có mục phim đang liên kết');
        }
      };
    }
  });

  const columns: Column<MovieResType>[] = [
    {
      title: '#',
      dataIndex: 'thumbnailUrl',
      width: 80,
      align: 'center',
      render: (value) => (
        <AvatarField
          size={50}
          disablePreview={!value}
          src={renderImageUrl(value)}
          className='rounded'
          previewClassName='rounded'
          icon={<AiOutlineFileImage className='size-7 text-slate-800' />}
        />
      )
    },
    {
      title: 'Tiêu đề',
      render: (_, record) => (
        <>
          <span
            className='line-clamp-1 block truncate'
            title={`${record.title}`}
          >
            {record.title}
          </span>
          <span
            className='line-clamp-1 block truncate text-xs text-zinc-500'
            title={`${record.title}`}
          >
            {record.originalTitle}
          </span>
        </>
      )
    },
    {
      title: 'Thể loại',
      dataIndex: 'type',
      render: (value) => {
        const label = movieTypeOptions.find(
          (type) => type.value === value
        )?.label;
        return (
          <span className='line-clamp-1 block truncate' title={label}>
            {label ?? '------'}
          </span>
        );
      },
      align: 'center',
      width: 120
    },
    {
      title: 'Ngày phát hành',
      dataIndex: 'releaseDate',
      render: (value) => formatDate(value, DEFAULT_DATE_FORMAT) ?? '---',
      align: 'center',
      width: 150
    },
    {
      title: 'Độ tuổi',
      dataIndex: 'ageRating',
      render: (value) => {
        const label = ageRatingOptions.find(
          (ageRating) => ageRating.value === value
        )?.label;
        return (
          <span className='line-clamp-1 block truncate' title={label}>
            {label ?? '------'}
          </span>
        );
      },
      align: 'center',
      width: 120
    },
    {
      title: 'Quốc gia',
      dataIndex: 'country',
      render: (value) => {
        const label = countryOptions.find(
          (country) => country.value === value
        )?.label;
        return (
          <span className='line-clamp-1 block truncate' title={label}>
            {label ?? '------'}
          </span>
        );
      },
      align: 'center',
      width: 120
    },
    handlers.renderActionColumn({
      actions: { edit: true, delete: true }
    })
  ];

  const searchFields: SearchFormProps<MovieSearchType>['searchFields'] = [
    { key: 'title', placeholder: 'Tiêu đề' },
    {
      key: 'type',
      placeholder: 'Thể loại',
      type: FieldTypes.SELECT,
      options: movieTypeOptions
    },
    {
      key: 'ageRating',
      placeholder: 'Độ tuổi',
      type: FieldTypes.SELECT,
      options: ageRatingOptions
    }
  ];

  return (
    <PageWrapper breadcrumbs={[{ label: 'Phim' }]}>
      <ListPageWrapper
        searchForm={handlers.renderSearchForm({
          searchFields,
          schema: movieSearchSchema
        })}
        addButton={handlers.renderAddButton()}
        reloadButton={handlers.renderReloadButton()}
      >
        <BaseTable
          columns={columns}
          dataSource={data || []}
          pagination={pagination}
          loading={loading}
          changePagination={handlers.changePagination}
        />
      </ListPageWrapper>
    </PageWrapper>
  );
}
