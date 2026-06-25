'use client';

import {
  StatisticsDateFilter,
  StatisticsEmptyState,
  ChartGradients,
  getGradientIdByIndex
} from '@/app/statistics/_components';
import { ImageField } from '@/components/form';
import { PageWrapper } from '@/components/layout';
import { CircleLoading } from '@/components/loading';
import { Pagination } from '@/components/pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { topMovieSortOptions } from '@/constants';
import { useTopMoviesQuery } from '@/queries';
import type {
  OverviewSearchType,
  TopMoviesSearchType,
  TopMoviesSortBy
} from '@/types';
import {
  renderImageUrl,
  convertLocalToUTC,
  formatStatisticsValue,
  formatRating,
  getMetricBySort
} from '@/utils';
import { Star } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import {
  NameType,
  ValueType
} from 'recharts/types/component/DefaultTooltipContent';

const defaultDateFilters: OverviewSearchType = {
  fromDate: '',
  toDate: ''
};

const pageSize = 10;

const renderRankBadge = (rank: number) => {
  if (rank === 1) {
    return (
      <span className='inline-flex size-6 items-center justify-center rounded-full bg-linear-to-br from-yellow-300 via-amber-400 to-yellow-500 text-xs font-bold text-amber-950 shadow-sm ring-2 ring-yellow-200/50'>
        1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className='inline-flex size-6 items-center justify-center rounded-full bg-linear-to-br from-slate-200 via-zinc-300 to-slate-400 text-xs font-bold text-zinc-950 shadow-sm ring-2 ring-zinc-200/50'>
        2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className='inline-flex size-6 items-center justify-center rounded-full bg-linear-to-br from-amber-600/80 via-orange-500/80 to-amber-700/80 text-xs font-bold text-orange-50 shadow-sm ring-2 ring-orange-200/50'>
        3
      </span>
    );
  }
  return (
    <span className='inline-flex size-6 items-center justify-center rounded-full bg-zinc-100 text-xs font-medium text-zinc-500'>
      {rank}
    </span>
  );
};

interface TopMovieTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: NameType;
    value?: ValueType;
    color?: string;
    fill?: string;
    payload?: Record<string, unknown>;
  }>;
  label?: string | number | null | undefined;
  sortBy: TopMoviesSortBy;
  activeSortLabel: string;
}

function TopMovieTooltip({
  active,
  payload,
  label: _label,
  sortBy,
  activeSortLabel
}: TopMovieTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload as {
    name: string;
    value: number;
    thumbnailUrl?: string;
    averageRating?: number;
    viewCount?: number;
    commentCount?: number;
    reviewCount?: number;
  };
  return (
    <div className='flex min-w-[200px] items-center gap-3 rounded-xl border border-zinc-200/50 bg-white/85 p-3 shadow-lg backdrop-blur-md'>
      {data.thumbnailUrl && (
        <div className='relative aspect-video w-16 shrink-0 overflow-hidden rounded border border-white/20 bg-zinc-100 shadow-sm'>
          <Image
            src={renderImageUrl(data.thumbnailUrl)}
            alt={data.name}
            fill
            sizes='80px'
            unoptimized
            className='object-cover'
          />
        </div>
      )}
      <div className='min-w-0 flex-1'>
        <p className='mb-1 line-clamp-2 text-[12px] leading-tight font-semibold text-zinc-950'>
          {data.name}
        </p>
        <div className='flex items-center gap-1.5 text-xs text-zinc-500'>
          <span
            className='size-2 shrink-0 rounded-full'
            style={{ backgroundColor: payload[0].color || '#1678ff' }}
          />
          {sortBy === 'averageRating' ? (
            <div className='flex items-center gap-0.5 text-[12px] font-bold text-zinc-950'>
              <Star className='size-3 fill-amber-400 stroke-amber-500' />
              <span>{formatRating(data.value)}</span>
            </div>
          ) : (
            <span className='text-[12px] font-bold text-zinc-900'>
              {formatStatisticsValue(data.value)}
            </span>
          )}
          <span className='text-[10px] text-zinc-400'>
            ({activeSortLabel.toLowerCase()})
          </span>
        </div>
      </div>
    </div>
  );
}

export function TopMovies() {
  const [dateFilters, setDateFilters] =
    useState<OverviewSearchType>(defaultDateFilters);
  const [sortBy, setSortBy] = useState<TopMoviesSortBy>('viewCount');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const params: TopMoviesSearchType = useMemo(
    () => ({
      fromDate:
        dateFilters.fromDate && dateFilters.fromDate.trim() !== ''
          ? convertLocalToUTC(dateFilters.fromDate)
          : undefined,
      toDate:
        dateFilters.toDate && dateFilters.toDate.trim() !== ''
          ? convertLocalToUTC(dateFilters.toDate)
          : undefined,
      sortBy,
      page: currentPage - 1,
      size: pageSize
    }),
    [currentPage, dateFilters, sortBy]
  );

  const { data, isFetching } = useTopMoviesQuery({ params });
  const movies = data?.content ?? [];
  const isEmpty = data !== undefined && movies.length === 0;
  const activeSortLabel =
    topMovieSortOptions.find((option) => option.value === sortBy)?.label ?? '';

  const chartData = movies.map((movie) => ({
    name: movie.title,
    value: movie[sortBy],
    thumbnailUrl: movie.thumbnailUrl,
    averageRating: movie.averageRating,
    viewCount: movie.viewCount,
    commentCount: movie.commentCount,
    reviewCount: movie.reviewCount
  }));

  const handleDateSubmit = (values: OverviewSearchType) => {
    setCurrentPage(1);
    setDateFilters(values);
  };

  const handleDateReset = () => {
    setCurrentPage(1);
    setDateFilters(defaultDateFilters);
  };

  const handleSortChange = (value: string) => {
    setCurrentPage(1);
    setSortBy(value as TopMoviesSortBy);
  };

  return (
    <PageWrapper breadcrumbs={[{ label: 'Top phim' }]}>
      <div className='bg-list-page-wrapper min-h-[calc(100vh-190px)] rounded-lg p-4'>
        <div className='mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between'>
          <div>
            <h1 className='text-xl font-semibold text-zinc-950'>Top phim</h1>
            <p className='mt-1 text-sm text-zinc-500'>
              Xếp hạng phim theo lượt xem, bình luận, đánh giá hoặc điểm đánh
              giá.
            </p>
          </div>
          <div className='grid gap-2 lg:grid-cols-[220px_minmax(0,560px)]'>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className='focus-visible:border-input w-full bg-white focus-visible:ring-0'>
                <SelectValue placeholder='Chọn tiêu chí' />
              </SelectTrigger>
              <SelectContent className='p-0!'>
                <SelectGroup className='p-0!'>
                  {topMovieSortOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className='cursor-pointer'
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <StatisticsDateFilter
              initialValues={dateFilters}
              onSubmit={handleDateSubmit}
              onReset={handleDateReset}
            />
          </div>
        </div>

        <div className='relative'>
          {isFetching && (
            <div className='absolute inset-0 z-10 flex items-start justify-center rounded-lg bg-white/70 pt-24'>
              <CircleLoading className='stroke-sporty-blue' />
            </div>
          )}

          {isEmpty ? (
            <StatisticsEmptyState content='Không có dữ liệu top phim' />
          ) : (
            <div className='grid gap-3 xl:grid-cols-[minmax(0,1fr)_420px]'>
              <Card className='overflow-hidden rounded-xl border-zinc-100 bg-white/90 shadow-sm backdrop-blur-sm'>
                <CardHeader className='border-b p-4'>
                  <CardTitle className='text-base font-semibold text-zinc-900'>
                    {activeSortLabel}
                  </CardTitle>
                </CardHeader>
                <CardContent className='p-0'>
                  <div className='overflow-x-auto'>
                    <Table className='min-w-220'>
                      <TableHeader className='bg-zinc-50/50'>
                        <TableRow>
                          <TableHead className='text-zinc-750 w-20 p-4 text-center font-semibold'>
                            Hạng
                          </TableHead>
                          <TableHead className='text-zinc-750 p-4 font-semibold'>
                            Phim
                          </TableHead>
                          <TableHead className='text-zinc-750 p-4 text-right font-semibold'>
                            Lượt xem
                          </TableHead>
                          <TableHead className='text-zinc-750 p-4 text-right font-semibold'>
                            Bình luận
                          </TableHead>
                          <TableHead className='text-zinc-750 p-4 text-right font-semibold'>
                            Đánh giá
                          </TableHead>
                          <TableHead className='text-zinc-750 p-4 text-right font-semibold'>
                            Điểm
                          </TableHead>
                          <TableHead className='text-zinc-750 p-4 text-right font-semibold'>
                            Chỉ số chính
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {movies.length ? (
                          movies.map((movie, index) => (
                            <TableRow
                              key={movie.id}
                              className='transition-colors duration-150 hover:bg-zinc-50/50'
                            >
                              <TableCell className='px-4 text-center font-medium'>
                                {renderRankBadge(
                                  (currentPage - 1) * pageSize + index + 1
                                )}
                              </TableCell>
                              <TableCell className='px-4'>
                                <div className='flex min-w-0 items-center gap-3'>
                                  <ImageField
                                    src={
                                      movie.thumbnailUrl
                                        ? renderImageUrl(movie.thumbnailUrl)
                                        : undefined
                                    }
                                    alt={movie.title}
                                    aspect={16 / 9}
                                    className='aspect-video w-20 shrink-0 rounded border border-zinc-100/50 shadow-sm'
                                    imageClassName='object-cover'
                                  />
                                  <span
                                    className='hover:text-sporty-blue line-clamp-2 font-medium text-zinc-900 transition-colors duration-150'
                                    title={movie.title}
                                  >
                                    {movie.title}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className='text-zinc-650 px-4 text-right font-medium'>
                                {formatStatisticsValue(movie.viewCount)}
                              </TableCell>
                              <TableCell className='text-zinc-650 px-4 text-right font-medium'>
                                {formatStatisticsValue(movie.commentCount)}
                              </TableCell>
                              <TableCell className='text-zinc-650 px-4 text-right font-medium'>
                                {formatStatisticsValue(movie.reviewCount)}
                              </TableCell>
                              <TableCell className='px-4 text-right font-bold text-zinc-900'>
                                {formatRating(movie.averageRating)}
                              </TableCell>
                              <TableCell className='text-sporty-blue px-4 text-right font-bold'>
                                {getMetricBySort(movie, sortBy)}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className='h-40 text-center text-zinc-500'
                            >
                              Không có dữ liệu
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={data?.totalPages ?? 0}
                    changePagination={setCurrentPage}
                  />
                </CardContent>
              </Card>

              <Card className='rounded-xl border-zinc-100 bg-white/90 shadow-sm backdrop-blur-sm'>
                <CardHeader className='p-4 pb-2'>
                  <CardTitle className='text-base font-semibold text-zinc-900'>
                    Biểu đồ top phim
                  </CardTitle>
                </CardHeader>
                <CardContent className='h-96 p-4 pt-0'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart data={chartData} layout='vertical'>
                      <ChartGradients />
                      <CartesianGrid
                        strokeDasharray='4 4'
                        stroke='#e2e8f0'
                        strokeOpacity={0.4}
                        horizontal={false}
                      />
                      <XAxis
                        type='number'
                        tickLine={false}
                        axisLine={false}
                        tick={{
                          fontSize: 11,
                          fill: '#888888',
                          fontWeight: 500
                        }}
                        tickFormatter={(value) =>
                          sortBy === 'averageRating'
                            ? formatRating(Number(value))
                            : formatStatisticsValue(Number(value))
                        }
                      />
                      <YAxis
                        type='category'
                        dataKey='name'
                        tickLine={false}
                        axisLine={false}
                        width={120}
                        tick={{
                          fontSize: 11,
                          fill: '#888888',
                          fontWeight: 500
                        }}
                      />
                      <Tooltip
                        content={
                          <TopMovieTooltip
                            sortBy={sortBy}
                            activeSortLabel={activeSortLabel}
                          />
                        }
                      />
                      <Bar
                        dataKey='value'
                        radius={[0, 8, 8, 0]}
                        animationDuration={1500}
                      >
                        {chartData.map((_entry, index) => (
                          <Cell
                            key={index}
                            fill={`url(#${getGradientIdByIndex(index)})`}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
