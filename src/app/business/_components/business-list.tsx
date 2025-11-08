'use client';

import DbConfigModal from '@/app/customer/[id]/business/_components/db-config-modal';
import { AvatarField, Button, ToolTip } from '@/components/form';
import { HasPermission } from '@/components/has-permission';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { BaseTable } from '@/components/table';
import {
  apiConfig,
  FieldTypes,
  statusOptions,
  TIME_DATE_FORMAT
} from '@/constants';
import { useDisclosure, useListBase } from '@/hooks';
import { useSnsConfigQuery } from '@/queries';
import { businessSearchSchema } from '@/schemaValidations';
import {
  BusinessResType,
  BusinessSearchType,
  Column,
  SearchFormProps
} from '@/types';
import {
  convertLocalToUTC,
  convertUTCToLocal,
  notify,
  renderImageUrl
} from '@/utils';
import { useState } from 'react';
import {
  AiOutlineApartment,
  AiOutlineFileImage,
  AiOutlineMessage
} from 'react-icons/ai';

export default function BusinessList({ queryKey }: { queryKey: string }) {
  const [selectedRow, setSelectedRow] = useState<BusinessResType | null>(null);
  const dbConfigModal = useDisclosure();
  const [businessId, setBusinessId] = useState<string>('');

  const { data, loading, pagination, handlers } = useListBase<
    BusinessResType,
    BusinessSearchType
  >({
    apiConfig: apiConfig.business,
    options: {
      objectName: 'doanh nghiệp',
      queryKey
    },
    override: (handlers) => {
      handlers.additionalColumns = () => ({
        dbConfig: (
          record: BusinessResType,
          buttonProps?: Record<string, any>
        ) => (
          <HasPermission
            requiredPermissions={[
              apiConfig.dbConfig.getByBusinessId.permissionCode as string
            ]}
          >
            <ToolTip title={'Cấu hình cơ sở dữ liệu'}>
              <span>
                <Button
                  onClick={() => handleOpenDbConfigModal(record)}
                  className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
                  {...buttonProps}
                >
                  <AiOutlineApartment className='text-dodger-blue size-4' />
                </Button>
              </span>
            </ToolTip>
          </HasPermission>
        ),
        configSns: (
          record: BusinessResType,
          buttonProps?: Record<string, any>
        ) => (
          <HasPermission
            requiredPermissions={[
              apiConfig.business.configSns.permissionCode as string
            ]}
          >
            <ToolTip title={'Cấu hình sns'}>
              <span>
                <Button
                  onClick={() => handleConfigSns(record.id)}
                  className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
                  {...buttonProps}
                >
                  <AiOutlineMessage className='text-dodger-blue size-4' />
                </Button>
              </span>
            </ToolTip>
          </HasPermission>
        )
      });
      const changeQueryFilter = handlers.changeQueryFilter;
      handlers.changeQueryFilter = (filter) => {
        const newFilter = { ...filter };

        if (newFilter.expireDateFrom)
          newFilter.expireDateFrom = convertLocalToUTC(
            newFilter.expireDateFrom
          );

        if (newFilter.expireDateTo)
          newFilter.expireDateTo = convertLocalToUTC(newFilter.expireDateTo);

        changeQueryFilter(newFilter);
      };
    }
  });

  const snsConfigQuery = useSnsConfigQuery(businessId);

  const handleConfigSns = async (id: string) => {
    setBusinessId(id);
    await snsConfigQuery.refetch();
    notify.success('Cấu hình sns thành công');
  };

  const handleOpenDbConfigModal = (record: BusinessResType) => {
    setSelectedRow(record);
    dbConfigModal.open();
  };

  const handleCloseDbConfigModal = () => {
    setSelectedRow(null);
    dbConfigModal.close();
  };

  const columns: Column<BusinessResType>[] = [
    {
      title: '#',
      dataIndex: 'logoPath',
      width: 80,
      align: 'center',
      render: (value) => (
        <AvatarField
          size={50}
          disablePreview={!value}
          src={renderImageUrl(value)}
          icon={<AiOutlineFileImage className='size-7 text-slate-800' />}
          previewClassName='rounded'
          zoomSize={350}
          className='rounded'
        />
      )
    },
    {
      title: 'Tên doanh nghiệp',
      dataIndex: 'name',
      render: (value) => <span>{value ?? '---'}</span>
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'createdDate',
      width: 200,
      render: (value) => {
        return (
          <span className='line-clamp-1' title={value}>
            {value ? convertUTCToLocal(value) : '-----'}
          </span>
        );
      }
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'expireDate',
      width: 200,
      render: (value) => {
        return (
          <span className='line-clamp-1' title={value}>
            {value ? convertUTCToLocal(value) : '-----'}
          </span>
        );
      }
    },
    {
      title: 'Ngày gia hạn',
      dataIndex: 'extDate',
      width: 200,
      render: (value) => (
        <span className='line-clamp-1' title={value}>
          {value ? convertUTCToLocal(value) : '-----'}
        </span>
      )
    },
    handlers.renderStatusColumn(),
    handlers.renderActionColumn({
      actions: { edit: true, configSns: true, dbConfig: true, delete: true }
    })
  ];

  const searchFields: SearchFormProps<BusinessSearchType>['searchFields'] = [
    { key: 'businessName', placeholder: 'Tên doanh nghiệp' },
    {
      key: 'expireDateFrom',
      placeholder: 'Hết hạn từ',
      type: FieldTypes.DATE
    },
    {
      key: 'expireDateTo',
      placeholder: 'Hết hạn đến',
      type: FieldTypes.DATE,
      dateFormat: TIME_DATE_FORMAT
    },
    {
      key: 'status',
      placeholder: 'Trạng thái',
      type: FieldTypes.SELECT,
      options: statusOptions
    }
  ];

  return (
    <PageWrapper
      breadcrumbs={[
        {
          label: 'Doanh nghiệp'
        }
      ]}
    >
      <ListPageWrapper
        searchForm={handlers.renderSearchForm({
          searchFields,
          schema: businessSearchSchema
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
      <DbConfigModal
        data={selectedRow}
        onClose={handleCloseDbConfigModal}
        open={dbConfigModal.opened}
      />
    </PageWrapper>
  );
}
