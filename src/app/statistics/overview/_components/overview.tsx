'use client';

import {
  StatisticsDateFilter,
  ChartGradients,
  getGradientIdByIndex,
  getGradientColorFromId,
  CustomTooltip
} from '@/app/statistics/_components';
import { PageWrapper } from '@/components/layout';
import { CircleLoading } from '@/components/loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

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
  Sector,
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
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [hoveredPieIndex, setHoveredPieIndex] = useState<number | null>(null);

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
      icon: Users,
      gradient: 'from-blue-500 to-indigo-500',
      iconBg: 'bg-blue-50 text-blue-600',
      glow: 'shadow-blue-500/5'
    },
    {
      label: 'Phim',
      value: formatStatisticsValue(data?.totalMovies),
      icon: Clapperboard,
      gradient: 'from-violet-500 to-fuchsia-500',
      iconBg: 'bg-purple-50 text-purple-600',
      glow: 'shadow-purple-500/5'
    },
    {
      label: 'Lượt xem',
      value: formatStatisticsValue(data?.totalViews),
      icon: Eye,
      gradient: 'from-emerald-500 to-teal-600',
      iconBg: 'bg-emerald-50 text-emerald-600',
      glow: 'shadow-emerald-500/5'
    },
    {
      label: 'Bình luận',
      value: formatStatisticsValue(data?.totalComments),
      icon: MessageCircle,
      gradient: 'from-orange-500 to-amber-500',
      iconBg: 'bg-orange-50 text-orange-600',
      glow: 'shadow-orange-500/5'
    },
    {
      label: 'Review',
      value: formatStatisticsValue(data?.totalReviews),
      icon: Star,
      gradient: 'from-rose-500 to-red-600',
      iconBg: 'bg-rose-50 text-rose-600',
      glow: 'shadow-rose-500/5'
    },
    {
      label: 'Yêu thích',
      value: formatStatisticsValue(data?.totalFavourites),
      icon: Heart,
      gradient: 'from-pink-500 to-rose-500',
      iconBg: 'bg-pink-50 text-pink-600',
      glow: 'shadow-pink-500/5'
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

  const renderActiveShape = (props: {
    cx?: number;
    cy?: number;
    innerRadius?: number;
    outerRadius?: number;
    startAngle?: number;
    endAngle?: number;
    fill?: string;
  }) => {
    const {
      cx = 0,
      cy = 0,
      innerRadius = 0,
      outerRadius = 0,
      startAngle = 0,
      endAngle = 0,
      fill
    } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 2}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

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
                className={`relative overflow-hidden rounded-xl border border-zinc-100 bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${metric.glow}`}
              >
                <div
                  className={`absolute top-0 right-0 left-0 h-1 bg-gradient-to-r ${metric.gradient}`}
                />
                <CardContent className='flex items-center justify-between p-5'>
                  <div>
                    <p className='text-xs font-semibold tracking-wider text-zinc-400 uppercase'>
                      {metric.label}
                    </p>
                    {data ? (
                      <p className='mt-2 text-3xl font-extrabold tracking-tight text-zinc-900'>
                        {metric.value}
                      </p>
                    ) : (
                      <Skeleton className='mt-2.5 h-8 w-24' />
                    )}
                  </div>
                  <div
                    className={`flex size-11 items-center justify-center rounded-xl transition-transform duration-300 hover:scale-110 ${metric.iconBg}`}
                  >
                    <metric.icon className='size-5.5' />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className='mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]'>
            <Card className='rounded-xl border-zinc-100 bg-white/90 shadow-sm backdrop-blur-sm'>
              <CardHeader className='p-4 pb-2'>
                <CardTitle className='text-base font-semibold text-zinc-900'>
                  Tương tác nội dung
                </CardTitle>
              </CardHeader>
              <CardContent className='h-80 p-4 pt-0'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={interactionData}>
                    <ChartGradients />
                    <CartesianGrid
                      strokeDasharray='4 4'
                      stroke='#e2e8f0'
                      strokeOpacity={0.4}
                      vertical={false}
                    />
                    <XAxis
                      dataKey='name'
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: '#888888', fontWeight: 500 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: '#888888', fontWeight: 500 }}
                      tickFormatter={(value) =>
                        formatStatisticsValue(Number(value))
                      }
                    />
                    <Tooltip
                      content={
                        <CustomTooltip
                          valueFormatter={(value) =>
                            formatStatisticsValue(toChartNumber(value))
                          }
                        />
                      }
                    />
                    <Bar
                      dataKey='value'
                      radius={[8, 8, 0, 0]}
                      onMouseEnter={(_data, index) => setHoveredBarIndex(index)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                    >
                      {interactionData.map((_entry, index) => {
                        const fill = `url(#${getGradientIdByIndex(index)})`;
                        const opacity =
                          hoveredBarIndex === null || hoveredBarIndex === index
                            ? 1
                            : 0.4;
                        return (
                          <Cell
                            key={index}
                            fill={fill}
                            opacity={opacity}
                            className='transition-opacity duration-200'
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className='rounded-xl border-zinc-100 bg-white/90 shadow-sm backdrop-blur-sm'>
              <CardHeader className='p-4 pb-2'>
                <CardTitle className='text-base font-semibold text-zinc-900'>
                  Cơ cấu phim
                </CardTitle>
              </CardHeader>
              <CardContent className='p-4 pt-0'>
                <div className='relative flex h-56 w-full items-center justify-center'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <ChartGradients />
                      <Pie
                        data={movieTypeData}
                        dataKey='value'
                        nameKey='name'
                        innerRadius={70}
                        outerRadius={95}
                        paddingAngle={4}
                        activeShape={renderActiveShape}
                        onMouseEnter={(_data, index) =>
                          setHoveredPieIndex(index)
                        }
                        onMouseLeave={() => setHoveredPieIndex(null)}
                      >
                        {movieTypeData.map((_entry, index) => (
                          <Cell
                            key={index}
                            fill={`url(#${getGradientIdByIndex(index)})`}
                            stroke='none'
                            style={{
                              filter:
                                hoveredPieIndex === index
                                  ? 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.15))'
                                  : 'none',
                              transition: 'all 0.2s ease-in-out'
                            }}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={
                          <CustomTooltip
                            valueFormatter={(value) =>
                              formatStatisticsValue(toChartNumber(value))
                            }
                          />
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className='pointer-events-none absolute flex flex-col items-center justify-center text-center'>
                    <span className='text-[10px] font-semibold tracking-wider text-zinc-400 uppercase'>
                      Tổng phim
                    </span>
                    <span className='mt-0.5 text-xl font-extrabold text-zinc-900'>
                      {formatStatisticsValue(data?.totalMovies)}
                    </span>
                  </div>
                </div>
                <div className='grid gap-2 text-sm'>
                  {movieTypeData.map((item, index) => (
                    <div
                      key={item.name}
                      className='flex items-center justify-between rounded-xl border border-zinc-100/50 bg-zinc-50/50 px-3.5 py-2'
                    >
                      <span className='flex items-center gap-2 font-medium text-zinc-600'>
                        <span
                          className='size-2.5 rounded-full shadow-sm'
                          style={{
                            backgroundColor: getGradientColorFromId(
                              `url(#${getGradientIdByIndex(index)})`
                            )
                          }}
                        />
                        {item.name}
                      </span>
                      <span className='font-bold text-zinc-900'>
                        {formatStatisticsValue(item.value)}
                      </span>
                    </div>
                  ))}
                  <div className='flex items-center justify-between rounded-xl border border-zinc-100/50 bg-zinc-50/50 px-3.5 py-2'>
                    <span className='font-medium text-zinc-600'>
                      Điểm trung bình
                    </span>
                    <span className='font-bold text-zinc-900'>
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
