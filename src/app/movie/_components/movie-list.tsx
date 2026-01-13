'use client';

import { Button, ImageField, ToolTip } from '@/components/form';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { BaseTable } from '@/components/table';
import {
  ageRatingOptions,
  apiConfig,
  countryOptions,
  DEFAULT_DATE_FORMAT,
  ErrorCode,
  FieldTypes,
  languageOptions,
  movieTypeOptions
} from '@/constants';
import { useListBase, useNavigate, useQueryParams } from '@/hooks';
import { cn } from '@/lib';
import { useCategoryListQuery } from '@/queries';
import { route } from '@/routes';
import { movieSearchSchema } from '@/schemaValidations';
import type {
  Column,
  MovieResType,
  MovieSearchType,
  SearchFormProps
} from '@/types';
import {
  formatDate,
  generatePath,
  notify,
  renderImageUrl,
  renderListPageUrl
} from '@/utils';
import { MessageSquareMore, Star } from 'lucide-react';
import Link from 'next/link';
import { AiOutlineUser } from 'react-icons/ai';

export default function MovieList({ queryKey }: { queryKey: string }) {
  const navigate = useNavigate(false);
  const categoryListQuery = useCategoryListQuery();

  const categories =
    categoryListQuery?.data?.data?.content
      ?.map((category) => ({
        value: category.id.toString(),
        label: category.name
      }))
      .sort((a, b) => a.label.localeCompare(b.label)) || [];
  const { serializeParams } = useQueryParams();

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
          return (
            <ToolTip title={`Diễn viên & đạo diễn`} sideOffset={0}>
              <span>
                <Button
                  onClick={() =>
                    navigate(
                      renderListPageUrl(
                        generatePath(route.moviePerson.getList.path, {
                          id: record.id
                        }),
                        serializeParams({ movieTitle: record.title })
                      )
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
        },
        comment: (record: MovieResType, buttonProps?: Record<string, any>) => {
          return (
            <ToolTip title={`Bình luận`} sideOffset={0}>
              <span>
                <Button
                  onClick={() =>
                    navigate(
                      renderListPageUrl(
                        generatePath(route.comment.getList.path, {
                          id: record.id
                        }),
                        serializeParams({ movieTitle: record.title })
                      )
                    )
                  }
                  className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
                  {...buttonProps}
                >
                  <MessageSquareMore className='text-dodger-blue size-4' />
                </Button>
              </span>
            </ToolTip>
          );
        },
        review: (record: MovieResType, buttonProps?: Record<string, any>) => {
          return (
            <ToolTip title={`Đánh giá`} sideOffset={0}>
              <span>
                <Button
                  onClick={() =>
                    navigate(
                      renderListPageUrl(
                        generatePath(route.review.getList.path, {
                          id: record.id
                        }),
                        serializeParams({ movieTitle: record.title })
                      )
                    )
                  }
                  className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
                  {...buttonProps}
                >
                  <Star className='text-dodger-blue size-4' />
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
      render: (value) => {
        return (
          <ImageField disablePreview={!value} src={renderImageUrl(value)} />
        );
      }
    },
    {
      title: 'Tiêu đề',
      render: (_, record) => (
        <>
          <Link
            href={`${generatePath(route.movieItem.getList.path, {
              id: record.id
            })}?${serializeParams({ type: record.type, movieTitle: record.title })}`}
            className={cn(
              'text-dodger-blue line-clamp-1 block flex items-center gap-x-1 truncate',
              {
                'highlight-animated': record.isFeatured
              }
            )}
            title={record.title}
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
        return ageRating ? (
          <ToolTip title={ageRating?.mean} sideOffset={0}>
            <span className='line-clamp-1 block truncate'>
              {ageRating?.label}
            </span>
          </ToolTip>
        ) : (
          '------'
        );
      },
      align: 'center',
      width: 120
    },
    {
      title: 'Ngôn ngữ',
      dataIndex: 'language',
      render: (value) => {
        const label = languageOptions.find(
          (language) => language.value === value
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
      actions: {
        person: handlers.hasPermission({
          requiredPermissions: [
            apiConfig.moviePerson.getList.permissionCode as string
          ]
        }),
        comment: handlers.hasPermission({
          requiredPermissions: [
            apiConfig.comment.getList.permissionCode as string
          ]
        }),
        review: handlers.hasPermission({
          requiredPermissions: [
            apiConfig.review.getList.permissionCode as string
          ]
        }),
        edit: true,
        delete: true
      },
      columnProps: { width: 180 }
    })
  ];

  const searchFields: SearchFormProps<MovieSearchType>['searchFields'] = [
    { key: 'title', placeholder: 'Tiêu đề' },
    {
      key: 'categoryIds',
      placeholder: 'Danh mục',
      type: FieldTypes.MULTI_SELECT,
      options: categories
    },
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
      options: ageRatingOptions.map((ageRating) => ({
        label: `${ageRating.label} - ${ageRating.mean}`,
        value: ageRating.value
      }))
    },
    {
      key: 'language',
      placeholder: 'Ngôn ngữ',
      type: FieldTypes.SELECT,
      options: languageOptions
    },
    {
      key: 'country',
      placeholder: 'Quốc gia',
      type: FieldTypes.SELECT,
      options: countryOptions
    },
    {
      key: 'isFeatured',
      placeholder: 'Nổi bật',
      type: FieldTypes.BOOLEAN
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
