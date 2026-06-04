'use client';

import { StatisticsDateFilter } from '@/app/statistics/_components';
import { PageWrapper } from '@/components/layout';
import { CircleLoading } from '@/components/loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { chartColors } from '@/constants';
import { useOverviewQuery } from '@/queries';
import type { OverviewSearchType } from '@/types';
import {
  convertLocalToUTC,
  formatStatisticsValue,
  formatRating,
  toChartNumber
} from '@/utils';
import {
  Clapperboard,
  Eye,
  Heart,
  MessageCircle,
  Star,
  Users
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const defaultFilters: OverviewSearchType = {
  fromDate: '',
  toDate: ''
};

export function Overview() {
  const [filters, setFilters] = useState<OverviewSearchType>(defaultFilters);

  const params = useMemo(
    () => ({
      fromDate:
        filters.fromDate && filters.fromDate.trim() !== ''
          ? convertLocalToUTC(filters.fromDate)
          : undefined,
      toDate:
        filters.toDate && filters.toDate.trim() !== ''
          ? convertLocalToUTC(filters.toDate)
          : undefined
    }),
    [filters]
  );

  const { data, isFetching } = useOverviewQuery({ params });

  const metricCards = [
    {
      label: 'Người dùng',
      value: formatStatisticsValue(data?.totalUsers),
      icon: Users
    },
    {
      label: 'Phim',
      value: formatStatisticsValue(data?.totalMovies),
      icon: Clapperboard
    },
    {
      label: 'Lượt xem',
      value: formatStatisticsValue(data?.totalViews),
      icon: Eye
    },
    {
      label: 'Bình luận',
      value: formatStatisticsValue(data?.totalComments),
      icon: MessageCircle
    },
    {
      label: 'Review',
      value: formatStatisticsValue(data?.totalReviews),
      icon: Star
    },
    {
      label: 'Yêu thích',
      value: formatStatisticsValue(data?.totalFavourites),
      icon: Heart
    }
  ];

  const interactionData = [
    { name: 'Lượt xem', value: data?.totalViews ?? 0 },
    { name: 'Bình luận', value: data?.totalComments ?? 0 },
    { name: 'Review', value: data?.totalReviews ?? 0 },
    { name: 'Yêu thích', value: data?.totalFavourites ?? 0 }
  ];

  const movieTypeData = [
    { name: 'Phim lẻ', value: data?.totalSingleMovies ?? 0 },
    { name: 'Phim bộ', value: data?.totalSeriesMovies ?? 0 }
  ];

  return (
    <PageWrapper breadcrumbs={[{ label: 'Thống kê tổng quan' }]}>
      <div className='bg-list-page-wrapper min-h-[calc(100vh-190px)] rounded-lg p-4'>
        <div className='mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
          <div>
            <h1 className='text-xl font-semibold text-zinc-950'>
              Thống kê tổng quan
            </h1>
            <p className='mt-1 text-sm text-zinc-500'>
              Theo dõi dữ liệu hệ thống theo khoảng thời gian hoặc toàn bộ.
            </p>
          </div>
          <div className='lg:w-[560px]'>
            <StatisticsDateFilter
              initialValues={filters}
              onSubmit={setFilters}
              onReset={() => setFilters(defaultFilters)}
            />
          </div>
        </div>

        <div className='relative'>
          {isFetching && (
            <div className='absolute inset-0 z-10 flex items-start justify-center rounded-lg bg-white/70 pt-24'>
              <CircleLoading className='stroke-sporty-blue' />
            </div>
          )}

          <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
            {metricCards.map((metric) => (
              <Card
                key={metric.label}
                className='rounded-lg border-zinc-100 shadow-none'
              >
                <CardContent className='flex items-center justify-between p-4'>
                  <div>
                    <p className='text-sm text-zinc-500'>{metric.label}</p>
                    {data ? (
                      <p className='mt-2 text-2xl font-semibold text-zinc-950'>
                        {metric.value}
                      </p>
                    ) : (
                      <Skeleton className='mt-2 h-8 w-24' />
                    )}
                  </div>
                  <div className='bg-sporty-blue/10 text-sporty-blue flex size-10 items-center justify-center rounded-md'>
                    <metric.icon className='size-5' />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className='mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]'>
            <Card className='rounded-lg border-zinc-100 shadow-none'>
              <CardHeader className='p-4 pb-2'>
                <CardTitle className='text-base'>Tương tác nội dung</CardTitle>
              </CardHeader>
              <CardContent className='h-80 p-4 pt-0'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={interactionData}>
                    <CartesianGrid strokeDasharray='3 3' vertical={false} />
                    <XAxis dataKey='name' tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip
                      formatter={(value) =>
                        formatStatisticsValue(toChartNumber(value))
                      }
                    />
                    <Bar dataKey='value' radius={[6, 6, 0, 0]}>
                      {interactionData.map((_entry, index) => (
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

            <Card className='rounded-lg border-zinc-100 shadow-none'>
              <CardHeader className='p-4 pb-2'>
                <CardTitle className='text-base'>Cơ cấu phim</CardTitle>
              </CardHeader>
              <CardContent className='p-4 pt-0'>
                <div className='h-56'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={movieTypeData}
                        dataKey='value'
                        nameKey='name'
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        {movieTypeData.map((_entry, index) => (
                          <Cell
                            key={index}
                            fill={chartColors[index % chartColors.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) =>
                          formatStatisticsValue(toChartNumber(value))
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className='grid gap-2 text-sm'>
                  {movieTypeData.map((item, index) => (
                    <div
                      key={item.name}
                      className='flex items-center justify-between rounded-md bg-zinc-50 px-3 py-2'
                    >
                      <span className='flex items-center gap-2 text-zinc-600'>
                        <span
                          className='size-2 rounded-full'
                          style={{
                            backgroundColor:
                              chartColors[index % chartColors.length]
                          }}
                        />
                        {item.name}
                      </span>
                      <span className='font-medium text-zinc-950'>
                        {formatStatisticsValue(item.value)}
                      </span>
                    </div>
                  ))}
                  <div className='flex items-center justify-between rounded-md bg-zinc-50 px-3 py-2'>
                    <span className='text-zinc-600'>Điểm trung bình</span>
                    <span className='font-medium text-zinc-950'>
                      {formatRating(data?.averageRating)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
