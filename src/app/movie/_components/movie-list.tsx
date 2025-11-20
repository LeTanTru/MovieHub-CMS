'use client';

import { AvatarField, Button, ToolTip } from '@/components/form';
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
import { useListBase, useNavigate } from '@/hooks';
import { route } from '@/routes';
import { movieSearchSchema } from '@/schemaValidations';
import {
  Column,
  MovieResType,
  MovieSearchType,
  SearchFormProps
} from '@/types';
import { formatDate, generatePath, notify, renderImageUrl } from '@/utils';
import Link from 'next/link';
import { AiOutlineFileImage, AiOutlineUser } from 'react-icons/ai';

export default function MovieList({ queryKey }: { queryKey: string }) {
  const navigate = useNavigate(false);
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
      handlers.additionalColumns = () => ({
        person: (record: MovieResType, buttonProps?: Record<string, any>) => {
          if (
            !handlers.hasPermission({
              requiredPermissions: [apiConfig.person.getList.permissionCode]
            })
          )
            return null;
          return (
            <ToolTip title={`Diễn viên & đạo diễn`}>
              <span>
                <Button
                  onClick={() =>
                    navigate(
                      generatePath(route.moviePerson.getList.path, {
                        id: record.id
                      })
                    )
                  }
                  className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
                  {...buttonProps}
                >
                  <AiOutlineUser className='text-dodger-blue size-4' />
                </Button>
              </span>
            </ToolTip>
          );
        }
      });
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
          <Link
            href={`${generatePath(route.movieItem.getList.path, {
              id: record.id
            })}?type=${record.type}`}
            className='text-dodger-blue line-clamp-1 block truncate'
            title={`${record.title}`}
          >
            {record.title}
          </Link>
          <span
            className='line-clamp-1 block truncate text-xs text-zinc-500'
            title={`${record.originalTitle}`}
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
        const ageRating = ageRatingOptions.find(
          (ageRating) => ageRating.value === value
        );
        return (
          <span className='line-clamp-1 block truncate' title={ageRating?.mean}>
            {ageRating?.label ?? '------'}
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
      actions: {
        person: handlers.hasPermission({
          requiredPermissions: [
            apiConfig.moviePerson.getList.permissionCode as string
          ]
        }),
        edit: true,
        delete: true
      }
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
