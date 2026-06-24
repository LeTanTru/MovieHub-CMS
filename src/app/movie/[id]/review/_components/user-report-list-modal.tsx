'use client';

import { AvatarField } from '@/components/form';
import { Modal } from '@/components/modal';
import { BaseTable } from '@/components/table';
import { apiConfig, FieldTypes, objectNames, queryKeys } from '@/constants';
import { useListBase } from '@/hooks';
import { userReportSearchSchema } from '@/schema-validations';
import type {
  Column,
  SearchFormProps,
  UserReportResType,
  UserReportSearchType,
  UserResType
} from '@/types';
import { convertUTCToLocal, getLastWord, renderImageUrl } from '@/utils';

type UserReportListModalProps = {
  reviewId: string;
  isOpen: boolean;
  onClose: () => void;
};

export function UserReportListModal({
  reviewId,
  isOpen,
  onClose
}: UserReportListModalProps) {
  const { data, pagination, loading, handlers } = useListBase<
    UserReportResType,
    UserReportSearchType
  >({
    apiConfig: apiConfig.userReport,
    options: {
      queryKey: `${queryKeys.USER_REPORT}-review-${reviewId}`,
      objectName: objectNames.USER_REPORT,
      enabled: isOpen,
      defaultFilters: {
        objectId: reviewId
      },
      notShowFromSearchParams: ['objectId'],
      syncSearchParams: false
    }
  });

  const columns: Column<UserReportResType>[] = [
    {
      title: '#',
      dataIndex: 'user',
      width: 60,
      align: 'center',
      render: (_, record) => (
        <AvatarField
          disablePreview={!record.user?.avatarPath}
          src={renderImageUrl(record.user?.avatarPath)}
          alt={getLastWord(
            record.user?.fullName || record.user?.username || ''
          )}
        />
      )
    },
    {
      title: 'Người báo cáo',
      dataIndex: 'user',
      render: (_, record) => {
        const u = record.user;
        return (
          <div className='flex flex-col'>
            <span>{u?.fullName || u?.username || 'N/A'}</span>
            <span
              className='line-clamp-1 block truncate text-xs text-gray-500'
              title={u?.email}
            >
              {u?.email}
            </span>
          </div>
        );
      }
    },
    {
      title: 'Loại vi phạm',
      dataIndex: 'type',
      width: 140,
      align: 'center',
      render: (val) => (
        <span className='line-clamp-1 block truncate'>
          {String(val ?? 'N/A')}
        </span>
      )
    },
    {
      title: 'Nội dung báo cáo',
      dataIndex: 'content',
      render: (val) => {
        const value = val as string;
        return (
          <span className='line-clamp-2 block' title={value}>
            {value || 'N/A'}
          </span>
        );
      }
    },
    {
      title: 'Ngày báo cáo',
      dataIndex: 'createdDate',
      width: 180,
      align: 'center',
      render: (val) => {
        const dateStr = val as string;
        return (
          <span
            className='line-clamp-1 block truncate'
            title={convertUTCToLocal(dateStr)}
          >
            {convertUTCToLocal(dateStr)}
          </span>
        );
      }
    },
    handlers.renderActionColumn({
      actions: {
        delete: handlers.hasPermission({
          requiredPermissions: [apiConfig.userReport.delete.permissionCode]
        })
      },
      columnProps: { width: 150 }
    })
  ];

  const searchFields: SearchFormProps<UserReportSearchType>['searchFields'] = [
    {
      key: 'authorId',
      placeholder: 'Người báo cáo',
      type: FieldTypes.AUTO_COMPLETE,
      apiConfig: apiConfig.user.autoComplete,
      searchParams: ['fullName'],
      mappingData: (option) => {
        const user = option as UserResType;
        return {
          label: user.fullName,
          value: user.id
        };
      },
      submitOnChanged: true
    }
  ];

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      className='top-1/2 w-350 max-w-[95vw] -translate-y-1/2'
    >
      <Modal.Header>Danh sách báo cáo vi phạm</Modal.Header>
      <Modal.Body scrollable className='min-h-[80vh] p-4'>
        <div className='mb-4 flex items-center gap-2'>
          <div className='flex-1'>
            {handlers.renderSearchForm({
              searchFields,
              schema: userReportSearchSchema
            })}
          </div>
          {handlers.renderReloadButton()}
        </div>
        <BaseTable
          columns={columns}
          dataSource={data || []}
          pagination={pagination}
          loading={loading}
          changePagination={handlers.changePagination}
        />
      </Modal.Body>
    </Modal>
  );
}
