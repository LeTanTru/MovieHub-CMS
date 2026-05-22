'use client';

import { PageWrapper } from '@/components/layout';
import { CircleLoading } from '@/components/loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { chartColors, distributionGroupOptions } from '@/constants';
import { useMovieDistributionQuery } from '@/queries';
import { DistributionGroupBy } from '@/types';
import {
  formatStatisticsValue,
  getDistributionLabel,
  toChartNumber
} from '@/utils';
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

export const MovieDistribution = () => {
  const [groupBy, setGroupBy] = useState<DistributionGroupBy>('type');
  const { data, isFetching } = useMovieDistributionQuery({
    params: { groupBy }
  });

  const chartData = useMemo(
    () =>
      (data ?? []).map((item) => ({
        ...item,
        name: getDistributionLabel(item.label, groupBy)
      })),
    [data, groupBy]
  );

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <PageWrapper breadcrumbs={[{ label: 'Phân bố phim' }]}>
      <div className='bg-list-page-wrapper min-h-[calc(100vh-190px)] rounded-lg p-4'>
        <div className='mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
          <div>
            <h1 className='text-xl font-semibold text-zinc-950'>
              Phân bố phim
            </h1>
            <p className='mt-1 text-sm text-zinc-500'>
              Nhóm dữ liệu phim theo loại, quốc gia, ngôn ngữ hoặc độ tuổi.
            </p>
          </div>
          <Select
            value={groupBy}
            onValueChange={(value) => setGroupBy(value as DistributionGroupBy)}
          >
            <SelectTrigger className='focus-visible:border-input w-full bg-white focus-visible:ring-0 md:w-60'>
              <SelectValue placeholder='Chọn nhóm dữ liệu' />
            </SelectTrigger>
            <SelectContent className='p-0!'>
              <SelectGroup className='p-0!'>
                {distributionGroupOptions.map((option) => (
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
        </div>

        <div className='relative grid gap-3 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]'>
          {isFetching && (
            <div className='absolute inset-0 z-10 flex items-start justify-center rounded-lg bg-white/70 pt-24'>
              <CircleLoading className='stroke-main-color' />
            </div>
          )}

          <Card className='rounded-lg border-zinc-100 shadow-none'>
            <CardHeader className='p-4 pb-2'>
              <CardTitle className='text-base'>Biểu đồ phân bố</CardTitle>
            </CardHeader>
            <CardContent className='h-96 p-4 pt-0'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray='3 3' vertical={false} />
                  <XAxis dataKey='name' tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(value) =>
                      formatStatisticsValue(toChartNumber(value))
                    }
                  />
                  <Bar dataKey='value' radius={[6, 6, 0, 0]}>
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

          <Card className='rounded-lg border-zinc-100 shadow-none'>
            <CardHeader className='p-4 pb-2'>
              <CardTitle className='text-base'>Tỉ trọng</CardTitle>
            </CardHeader>
            <CardContent className='p-4 pt-0'>
              <div className='h-64'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey='value'
                      nameKey='name'
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                    >
                      {chartData.map((_entry, index) => (
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
                {chartData.map((item, index) => (
                  <div
                    key={`${item.label}-${index}`}
                    className='flex items-center justify-between rounded-md bg-zinc-50 px-3 py-2'
                  >
                    <span className='flex min-w-0 items-center gap-2 text-zinc-600'>
                      <span
                        className='size-2 shrink-0 rounded-full'
                        style={{
                          backgroundColor:
                            chartColors[index % chartColors.length]
                        }}
                      />
                      <span className='truncate'>{item.name}</span>
                    </span>
                    <span className='shrink-0 font-medium text-zinc-950'>
                      {formatStatisticsValue(item.value)}
                      <span className='ml-1 text-xs font-normal text-zinc-500'>
                        {total
                          ? `${Math.round((item.value / total) * 100)}%`
                          : '0%'}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
};
