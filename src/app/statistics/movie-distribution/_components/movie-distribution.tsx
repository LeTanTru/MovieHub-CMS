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
import {
  ChartGradients,
  getGradientIdByIndex,
  getGradientColorFromId,
  CustomTooltip
} from '@/app/statistics/_components';
import { distributionGroupOptions } from '@/constants';
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
  Sector,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

export function MovieDistribution() {
  const [groupBy, setGroupBy] = useState<DistributionGroupBy>('type');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [hoveredPieIndex, setHoveredPieIndex] = useState<number | null>(null);

  const { data, isFetching } = useMovieDistributionQuery({
    params: { groupBy }
  });

  const chartData = useMemo(
    () =>
      (data ?? []).map((item) => {
        const distributionLabel = getDistributionLabel(item.label, groupBy);

        if (
          distributionLabel &&
          typeof distributionLabel === 'object' &&
          'label' in distributionLabel
        ) {
          return {
            ...item,
            name: distributionLabel.label,
            tooltipLabel: distributionLabel.mean
          };
        }

        return {
          ...item,
          name: distributionLabel ?? item.label,
          tooltipLabel: undefined
        };
      }),
    [data, groupBy]
  );

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

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

  const centerLabel =
    hoveredPieIndex !== null && chartData[hoveredPieIndex]
      ? chartData[hoveredPieIndex].name
      : 'Tổng phim';

  const centerValue =
    hoveredPieIndex !== null && chartData[hoveredPieIndex]
      ? total
        ? `${Math.round((chartData[hoveredPieIndex].value / total) * 100)}%`
        : '0%'
      : formatStatisticsValue(total);

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
              <CircleLoading className='stroke-sporty-blue' />
            </div>
          )}

          <Card className='rounded-xl border-zinc-100 bg-white/90 shadow-sm backdrop-blur-sm'>
            <CardHeader className='p-4 pb-2'>
              <CardTitle className='text-base font-semibold text-zinc-900'>
                Biểu đồ phân bố
              </CardTitle>
            </CardHeader>
            <CardContent className='h-96 p-4 pt-0'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={chartData}>
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
                    name='Số lượng'
                    radius={[8, 8, 0, 0]}
                    animationDuration={1500}
                    onMouseEnter={(_data, index) => setHoveredBarIndex(index)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                  >
                    {chartData.map((_entry, index) => {
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
                Tỉ trọng
              </CardTitle>
            </CardHeader>
            <CardContent className='p-4 pt-0'>
              <div className='relative flex h-64 w-full items-center justify-center'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <ChartGradients />
                    <Pie
                      data={chartData}
                      dataKey='value'
                      nameKey='name'
                      label={
                        groupBy === 'ageRating'
                          ? ({ name }) => String(name)
                          : false
                      }
                      labelLine={false}
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                      activeShape={renderActiveShape}
                      onMouseEnter={(_data, index) => setHoveredPieIndex(index)}
                      onMouseLeave={() => setHoveredPieIndex(null)}
                    >
                      {chartData.map((_entry, index) => (
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
                <div className='pointer-events-none absolute flex max-w-[120px] flex-col items-center justify-center px-1 text-center'>
                  <span className='w-full truncate text-[10px] font-semibold tracking-wider text-zinc-400 uppercase'>
                    {centerLabel}
                  </span>
                  <span className='mt-0.5 w-full truncate text-2xl font-extrabold text-zinc-900'>
                    {centerValue}
                  </span>
                </div>
              </div>
              <div className='scrollbar-none grid max-h-52 gap-2 overflow-y-auto pr-1 text-sm'>
                {chartData.map((item, index) => (
                  <div
                    key={`${item.label}-${index}`}
                    className='flex items-center justify-between rounded-xl border border-zinc-100/50 bg-zinc-50/50 px-3.5 py-2'
                  >
                    <span className='flex min-w-0 items-center gap-2 font-medium text-zinc-600'>
                      <span
                        className='size-2.5 shrink-0 rounded-full shadow-sm'
                        style={{
                          backgroundColor: getGradientColorFromId(
                            `url(#${getGradientIdByIndex(index)})`
                          )
                        }}
                      />
                      <span
                        title={
                          item.tooltipLabel
                            ? `${item.name} - ${item.tooltipLabel}`
                            : item.name
                        }
                        className='truncate'
                      >
                        {item.name}
                        {item.tooltipLabel && ` - ${item.tooltipLabel}`}
                      </span>
                    </span>
                    <span className='shrink-0 font-bold text-zinc-900'>
                      {formatStatisticsValue(item.value)}
                      <span className='ml-1 text-xs font-normal text-zinc-400'>
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
}
