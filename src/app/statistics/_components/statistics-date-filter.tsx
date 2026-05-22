'use client';

import { Button, DateTimePickerField } from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { overviewSearchSchema } from '@/schemaValidations';
import type { OverviewSearchType } from '@/types';
import { BrushCleaning, Search } from 'lucide-react';

type StatisticsDateFilterProps = {
  initialValues: OverviewSearchType;
  onSubmit: (values: OverviewSearchType) => void;
  onReset: () => void;
};

const defaultValues: OverviewSearchType = {
  fromDate: '',
  toDate: ''
};

export const StatisticsDateFilter = ({
  initialValues,
  onSubmit,
  onReset
}: StatisticsDateFilterProps) => {
  return (
    <BaseForm<OverviewSearchType>
      defaultValues={defaultValues}
      initialValues={initialValues}
      schema={overviewSearchSchema}
      onSubmit={onSubmit}
      className='rounded-none bg-transparent p-0'
    >
      {(form) => (
        <div className='grid gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]'>
          <DateTimePickerField
            control={form.control}
            name='fromDate'
            placeholder='Từ ngày'
            allowClear
          />
          <DateTimePickerField
            control={form.control}
            name='toDate'
            placeholder='Đến ngày'
            allowClear
          />
          <div className='flex gap-2'>
            <Button type='submit' variant='primary' aria-label='Tìm kiếm'>
              <Search />
            </Button>
            <Button
              type='button'
              aria-label='Xóa bộ lọc'
              onClick={() => {
                form.reset(defaultValues);
                onReset();
              }}
              className='hover:[&>svg]:stroke-main-color hover:border-main-color border border-gray-300 bg-white hover:bg-transparent [&>svg]:stroke-black'
            >
              <BrushCleaning className='transition-all duration-200 ease-linear' />
            </Button>
          </div>
        </div>
      )}
    </BaseForm>
  );
};
