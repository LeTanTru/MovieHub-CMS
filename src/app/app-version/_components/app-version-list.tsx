'use client';

import { Button, ToolTip } from '@/components/form';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { BaseTable } from '@/components/table';
import { apiConfig, ErrorCode, FieldTypes } from '@/constants';
import { useListBase } from '@/hooks';
import { cn } from '@/lib';
import { appVersionSearchSchema } from '@/schemaValidations';
import {
  AppVersionResType,
  AppVersionSearchType,
  Column,
  SearchFormProps
} from '@/types';
import { notify, renderFileUrl } from '@/utils';
import { AiOutlineDownload } from 'react-icons/ai';

export default function AppVersionList({ queryKey }: { queryKey: string }) {
  const { data, pagination, loading, handlers } = useListBase<
    AppVersionResType,
    AppVersionSearchType
  >({
    apiConfig: apiConfig.appVersion,
    options: {
      queryKey,
      objectName: 'phiên bản ứng dụng'
    },
    override: (handlers) => {
      handlers.additionalColumns = () => ({
        download: (
          record: AppVersionResType,
          buttonProps: Record<string, any>
        ) => {
          if (!record.filePath) return null;
          return (
            <ToolTip title={'Tải tệp xuống'} sideOffset={0}>
              <span>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadFile(renderFileUrl(record.filePath));
                  }}
                  className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
                  {...buttonProps}
                >
                  <AiOutlineDownload className='text-dodger-blue size-4' />
                </Button>
              </span>
            </ToolTip>
          );
        }
      });
      handlers.handleDeleteError = (code) => {
        if (code === ErrorCode.APP_VERSION_ERROR_NOT_HAVE_LATEST_VERSION) {
          notify.error('Ứng dụng phải có ít nhất một phiên bản');
        }
      };
    }
  });

  const handleDownloadFile = (filePath: string) => {
    const link = document.createElement('a');
    link.href = filePath;
    link.download = filePath.split('/').pop() ?? 'download';
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: Column<AppVersionResType>[] = [
    {
      title: 'Tên phiên bản',
      dataIndex: 'name',
      render: (value) => (
        <span className='line-clamp-1 block truncate' title={value}>
          {value ?? '------'}
        </span>
      )
    },
    {
      title: 'Mã phiên bản',
      dataIndex: 'code',
      render: (value) => (
        <span className='line-clamp-1 block truncate' title={value}>
          {value ?? '------'}
        </span>
      ),
      width: 150,
      align: 'center'
    },
    // {
    //   title: 'Nhật ký thay đổi',
    //   dataIndex: 'changeLog',
    //   render: (value) => (
    //     <span className='line-clamp-1 block truncate' title={value}>
    //       {value ?? '------'}
    //     </span>
    //   ),
    //   width: 250
    // },
    // {
    //   title: 'Bắt buộc cập nhật',
    //   dataIndex: 'forceUpdate',
    //   render: (value) =>
    //     value ? (
    //       <ToolTip title='Không'>
    //         <IoCloseCircleSharp className='text-destructive mx-auto size-5' />
    //       </ToolTip>
    //     ) : (
    //       <ToolTip title='Có'>
    //         <IoCheckmarkCircleSharp className='mx-auto size-5 text-green-500' />
    //       </ToolTip>
    //     ),
    //   align: 'center',
    //   width: 200
    // },
    // {
    //   title: 'Phiên bản mới nhất',
    //   dataIndex: 'isLatest',
    //   render: (value) =>
    //     value ? (
    //       <ToolTip title='Không'>
    //         <IoCloseCircleSharp className='text-destructive mx-auto size-5' />
    //       </ToolTip>
    //     ) : (
    //       <ToolTip title='Có'>
    //         <IoCheckmarkCircleSharp className='mx-auto size-5 text-green-500' />
    //       </ToolTip>
    //     ),
    //   align: 'center',
    //   width: 200
    // },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (_, record) => (
        <div className='flex items-center justify-center gap-2'>
          <span
            className={cn(
              'rounded-md px-2 py-0.5 text-sm',
              record.forceUpdate
                ? 'bg-red-100 text-red-600'
                : 'bg-green-100 text-green-600'
            )}
          >
            {record.forceUpdate
              ? 'Bắt buộc cập nhật'
              : 'Không bắt buộc cập nhật'}
          </span>

          <span
            className={cn(
              'rounded-md px-2 py-0.5 text-sm',
              record.isLatest
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-200 text-gray-600'
            )}
          >
            {record.isLatest ? 'Mới nhất' : 'Cũ'}
          </span>
        </div>
      ),
      width: 300,
      align: 'center'
    },
    handlers.renderActionColumn({
      actions: { download: true, edit: true, delete: true }
    })
  ];

  const searchFields: SearchFormProps<AppVersionSearchType>['searchFields'] = [
    { key: 'name', placeholder: 'Tên phiên bản' },
    { key: 'code', placeholder: 'Mã phiên bản' },
    { key: 'isLatest', placeholder: 'Mới nhất', type: FieldTypes.BOOLEAN },
    {
      key: 'forceUpdate',
      placeholder: 'Bắt buộc cập nhật',
      type: FieldTypes.BOOLEAN
    }
  ];

  return (
    <PageWrapper breadcrumbs={[{ label: 'Danh mục' }]}>
      <ListPageWrapper
        searchForm={handlers.renderSearchForm({
          searchFields,
          schema: appVersionSearchSchema
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
