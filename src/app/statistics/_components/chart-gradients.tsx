'use client';

import {
  NameType,
  ValueType
} from 'recharts/types/component/DefaultTooltipContent';

export function ChartGradients() {
  return (
    <defs>
      <linearGradient id='colorBlue' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0%' stopColor='#1678ff' stopOpacity={0.95} />
        <stop offset='100%' stopColor='#6366f1' stopOpacity={0.75} />
      </linearGradient>
      <linearGradient id='colorGreen' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0%' stopColor='#10b981' stopOpacity={0.95} />
        <stop offset='100%' stopColor='#059669' stopOpacity={0.75} />
      </linearGradient>
      <linearGradient id='colorOrange' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0%' stopColor='#f97316' stopOpacity={0.95} />
        <stop offset='100%' stopColor='#d97706' stopOpacity={0.75} />
      </linearGradient>
      <linearGradient id='colorRed' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0%' stopColor='#f43f5e' stopOpacity={0.95} />
        <stop offset='100%' stopColor='#e11d48' stopOpacity={0.75} />
      </linearGradient>
      <linearGradient id='colorPurple' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0%' stopColor='#8b5cf6' stopOpacity={0.95} />
        <stop offset='100%' stopColor='#d946ef' stopOpacity={0.75} />
      </linearGradient>
      <linearGradient id='colorCyan' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0%' stopColor='#06b6d4' stopOpacity={0.95} />
        <stop offset='100%' stopColor='#0284c7' stopOpacity={0.75} />
      </linearGradient>
      <linearGradient id='colorYellow' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0%' stopColor='#eab308' stopOpacity={0.95} />
        <stop offset='100%' stopColor='#ca8a04' stopOpacity={0.75} />
      </linearGradient>
      <linearGradient id='colorSlate' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0%' stopColor='#64748b' stopOpacity={0.95} />
        <stop offset='100%' stopColor='#475569' stopOpacity={0.75} />
      </linearGradient>
    </defs>
  );
}

export const gradientIds = [
  'colorBlue',
  'colorGreen',
  'colorOrange',
  'colorRed',
  'colorPurple',
  'colorCyan',
  'colorYellow',
  'colorSlate'
];

export function getGradientIdByIndex(index: number): string {
  return gradientIds[index % gradientIds.length];
}

export function getGradientColorFromId(fill: string): string {
  const match = fill.match(/url\(#([^)]+)\)/);
  if (match) {
    const id = match[1];
    switch (id) {
      case 'colorBlue':
        return '#1678ff';
      case 'colorGreen':
        return '#10b981';
      case 'colorOrange':
        return '#f97316';
      case 'colorRed':
        return '#f43f5e';
      case 'colorPurple':
        return '#8b5cf6';
      case 'colorCyan':
        return '#06b6d4';
      case 'colorYellow':
        return '#eab308';
      case 'colorSlate':
        return '#64748b';
    }
  }
  return fill;
}

export interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: NameType;
    value?: ValueType;
    color?: string;
    fill?: string;
    payload?: Record<string, unknown>;
  }>;
  label?: string | number | null | undefined;
  valueFormatter?: (value: ValueType) => string;
}

export function CustomTooltip({
  active,
  payload,
  label,
  valueFormatter
}: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className='min-w-[120px] rounded-xl border border-zinc-200/50 bg-white/85 p-3 shadow-lg backdrop-blur-md'>
      {label && (
        <p className='mb-1.5 text-[11px] font-semibold text-zinc-500'>
          {label}
        </p>
      )}
      <div className='flex flex-col gap-1.5'>
        {payload.map((item, index) => {
          const value =
            valueFormatter && item.value !== undefined
              ? valueFormatter(item.value)
              : item.value;
          const fillStr = item.fill ? String(item.fill) : '';
          const payloadFill =
            item.payload &&
            typeof item.payload === 'object' &&
            'fill' in item.payload
              ? String(item.payload.fill)
              : '';
          const color = fillStr.startsWith('url(')
            ? getGradientColorFromId(fillStr)
            : item.color || payloadFill || '#1678ff';
          return (
            <div
              key={index}
              className='flex items-center justify-between gap-4'
            >
              <div className='flex min-w-0 items-center gap-1.5'>
                <span
                  className='size-2.5 shrink-0 rounded-full shadow-sm'
                  style={{ backgroundColor: color }}
                />
                <span className='max-w-[150px] truncate text-[12px] font-medium text-zinc-600'>
                  {item.name !== undefined && item.name !== null
                    ? String(item.name)
                    : label !== undefined && label !== null
                      ? String(label)
                      : ''}
                </span>
              </div>
              <span className='text-[12px] font-bold text-zinc-950'>
                {value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
