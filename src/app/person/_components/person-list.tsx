'use client';

import { AvatarField } from '@/components/form';
import { ListPageWrapper } from '@/components/layout';
import { BaseTable } from '@/components/table';
import {
  apiConfig,
  countryOptions,
  DATE_FORMAT,
  ErrorCode,
  FieldTypes,
  genderOptions,
  objectNames,
  PERSON_KIND_ACTOR,
  queryKeys
} from '@/constants';
import { useListBase } from '@/hooks';
import { personSearchSchema } from '@/schemaValidations';
import type {
  Column,
  PersonResType,
  PersonSearchType,
  SearchFormProps
} from '@/types';
import { formatDate, getLastWord, notify, renderImageUrl } from '@/utils';

type PersonListProps = { kind: number };

export function PersonList({ kind }: PersonListProps) {
  const { data, pagination, loading, handlers } = useListBase<
    PersonResType,
    PersonSearchType
  >({
    apiConfig: apiConfig.person,
    options: {
      queryKey: queryKeys.PERSON,
      objectName:
        kind === PERSON_KIND_ACTOR
          ? objectNames.PERSON_ACTOR
          : objectNames.PERSON_DIRECTOR,
      defaultFilters: { kind },
      notShowFromSearchParams: ['kind', 'page', 'size']
    },
    override: (handlers) => {
      handlers.handleDeleteError = (code) => {
        if (code === ErrorCode.PERSON_ERROR_MOVIE_PERSON_EXIST) {
          const message =
            kind === PERSON_KIND_ACTOR
              ? 'Diễn viên này có phim đang liên kết'
              : 'Đạo diễn này có phim đang liên kết';
          notify.error(message);
        }
      };
    }
  });

  const columns: Column<PersonResType>[] = [
    {
      title: '#',
      dataIndex: 'avatarPath',
      width: 80,
      align: 'center',
      render: (value, record) => (
        <AvatarField
          disablePreview={!value}
          src={renderImageUrl(value)}
          alt={getLastWord(record.name)}
        />
      )
    },
    {
      title: kind === PERSON_KIND_ACTOR ? 'Tên diễn viên' : 'Tên đạo diễn',
      render: (_, record) => (
        <>
          <span
            className='line-clamp-1 block truncate'
            title={record.otherName}
          >
            {record.otherName}
          </span>
          <span
            className='line-clamp-1 block truncate text-xs text-zinc-500'
            title={record.name}
          >
            {record.name}
          </span>
        </>
      )
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'dateOfBirth',
      render: (value) => formatDate(value, DATE_FORMAT) || 'N/A',
      align: 'center',
      width: 120
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      render: (value) => {
        const label = genderOptions.find(
          (gender) => gender.value === value
        )?.label;
        return (
          <span className='line-clamp-1 block truncate' title={label}>
            {label || 'N/A'}
          </span>
        );
      },
      width: 100,
      align: 'center'
    },
    {
      title: 'Quốc tịch',
      dataIndex: 'country',
      render: (value) => {
        const label = countryOptions.find(
          (country) => country.value === value
        )?.label;
        return (
          <span className='line-clamp-1 block truncate' title={label}>
            {label || 'N/A'}
          </span>
        );
      },
      align: 'center',
      width: 120
    },
    handlers.renderActionColumn({
      actions: {
        edit: handlers.hasPermission({
          requiredPermissions: [apiConfig.person.update.permissionCode]
        }),
        delete: handlers.hasPermission({
          requiredPermissions: [apiConfig.person.delete.permissionCode]
        })
      }
    })
  ];

  const searchFields: SearchFormProps<PersonSearchType>['searchFields'] = [
    { key: 'name', placeholder: 'Tên' },
    { key: 'otherName', placeholder: 'Nghệ danh' },
    {
      key: 'country',
      placeholder: 'Quốc tịch',
      type: FieldTypes.SELECT,
      options: countryOptions,
      submitOnChanged: true
    },
    {
      key: 'gender',
      placeholder: 'Giới tính',
      type: FieldTypes.SELECT,
      options: genderOptions,
      submitOnChanged: true
    }
  ];

  return (
    <ListPageWrapper
      searchForm={handlers.renderSearchForm({
        searchFields,
        schema: personSearchSchema
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
  );
}
