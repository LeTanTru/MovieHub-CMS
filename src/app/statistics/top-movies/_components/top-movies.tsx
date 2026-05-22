'use client';

import { StatisticsDateFilter } from '@/app/statistics/_components';
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
import { chartColors, topMovieSortOptions } from '@/constants';
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
  getMetricBySort,
  toChartNumber
} from '@/utils';
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

const defaultDateFilters: OverviewSearchType = {
  fromDate: '',
  toDate: ''
};

const pageSize = 10;

export const TopMovies = () => {
  const [dateFilters, setDateFilters] =
    useState<OverviewSearchType>(defaultDateFilters);
  const [sortBy, setSortBy] = useState<TopMoviesSortBy>('viewCount');
  const [currentPage, setCurrentPage] = useState(1);

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
  const activeSortLabel =
    topMovieSortOptions.find((option) => option.value === sortBy)?.label ?? '';

  const chartData = movies.map((movie) => ({
    name: movie.title,
    value: movie[sortBy]
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
              Xếp hạng phim theo lượt xem, bình luận, review hoặc điểm đánh giá.
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

        <div className='relative grid gap-3 xl:grid-cols-[minmax(0,1fr)_420px]'>
          {isFetching && (
            <div className='absolute inset-0 z-10 flex items-start justify-center rounded-lg bg-white/70 pt-24'>
              <CircleLoading className='stroke-main-color' />
            </div>
          )}

          <Card className='overflow-hidden rounded-lg border-zinc-100 shadow-none'>
            <CardHeader className='border-b p-4'>
              <CardTitle className='text-base'>{activeSortLabel}</CardTitle>
            </CardHeader>
            <CardContent className='p-0'>
              <div className='overflow-x-auto'>
                <Table className='min-w-220'>
                  <TableHeader className='bg-zinc-50'>
                    <TableRow>
                      <TableHead className='w-20 p-4 text-center'>
                        Hạng
                      </TableHead>
                      <TableHead className='p-4'>Phim</TableHead>
                      <TableHead className='p-4 text-right'>Lượt xem</TableHead>
                      <TableHead className='p-4 text-right'>
                        Bình luận
                      </TableHead>
                      <TableHead className='p-4 text-right'>Review</TableHead>
                      <TableHead className='p-4 text-right'>Điểm</TableHead>
                      <TableHead className='p-4 text-right'>
                        Chỉ số chính
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movies.length ? (
                      movies.map((movie, index) => (
                        <TableRow key={movie.id} className='hover:bg-zinc-50'>
                          <TableCell className='px-4 text-center font-medium'>
                            {(currentPage - 1) * pageSize + index + 1}
                          </TableCell>
                          <TableCell className='px-4'>
                            <div className='flex min-w-0 items-center gap-3'>
                              <div className='relative aspect-video w-20 shrink-0 overflow-hidden rounded bg-zinc-100'>
                                {movie.thumbnailUrl ? (
                                  <Image
                                    src={renderImageUrl(movie.thumbnailUrl)}
                                    alt={movie.title}
                                    fill
                                    sizes='420px'
                                    unoptimized
                                    className='aspect-video object-cover'
                                  />
                                ) : null}
                              </div>
                              <span
                                className='line-clamp-2 font-medium text-zinc-950'
                                title={movie.title}
                              >
                                {movie.title}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className='px-4 text-right'>
                            {formatStatisticsValue(movie.viewCount)}
                          </TableCell>
                          <TableCell className='px-4 text-right'>
                            {formatStatisticsValue(movie.commentCount)}
                          </TableCell>
                          <TableCell className='px-4 text-right'>
                            {formatStatisticsValue(movie.reviewCount)}
                          </TableCell>
                          <TableCell className='px-4 text-right'>
                            {formatRating(movie.averageRating)}
                          </TableCell>
                          <TableCell className='text-main-color px-4 text-right font-semibold'>
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

          <Card className='rounded-lg border-zinc-100 shadow-none'>
            <CardHeader className='p-4 pb-2'>
              <CardTitle className='text-base'>Biểu đồ top phim</CardTitle>
            </CardHeader>
            <CardContent className='h-96 p-4 pt-0'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={chartData} layout='vertical'>
                  <CartesianGrid strokeDasharray='3 3' horizontal={false} />
                  <XAxis
                    type='number'
                    tickLine={false}
                    axisLine={false}
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
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value) =>
                      sortBy === 'averageRating'
                        ? formatRating(toChartNumber(value))
                        : formatStatisticsValue(toChartNumber(value))
                    }
                  />
                  <Bar dataKey='value' radius={[0, 6, 6, 0]}>
                    {chartData.map((_entry, index) => (
                      <Cell
                        key={index}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
};
