'use client';

import { AvatarField } from '@/components/form';
import { ListPageWrapper } from '@/components/layout';
import { BaseTable } from '@/components/table';
import {
  apiConfig,
  countryOptions,
  DEFAULT_DATE_FORMAT,
  ErrorCode,
  FieldTypes,
  genderOptions,
  PERSON_KIND_ACTOR
} from '@/constants';
import { useListBase } from '@/hooks';
import { personSearchSchema } from '@/schemaValidations';
import {
  Column,
  PersonResType,
  PersonSearchType,
  SearchFormProps
} from '@/types';
import { formatDate, notify, renderImageUrl } from '@/utils';

export default function PersonList({
  queryKey,
  kind
}: {
  queryKey: string;
  kind: number;
}) {
  const { data, pagination, loading, handlers } = useListBase<
    PersonResType,
    PersonSearchType
  >({
    apiConfig: apiConfig.person,
    options: {
      queryKey,
      objectName: kind === PERSON_KIND_ACTOR ? 'diễn viên' : 'đạo diễn',
      defaultFilters: { kind },
      notShowFromSearchParams: ['kind', 'page', 'size']
    },
    override: (handlers) => {
      handlers.handleDeleteError = (code) => {
        if (code === ErrorCode.PERSON_ERROR_MOVIE_PERSON_EXISTED) {
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
      render: (value) => (
        <AvatarField disablePreview={!value} src={renderImageUrl(value)} />
      )
    },
    {
      title: kind === PERSON_KIND_ACTOR ? 'Tên diễn viên' : 'Tên đạo diễn',
      render: (_, record) => (
        <>
          <span
            className='line-clamp-1 block truncate'
            title={`${record.otherName}`}
          >
            {record.otherName}
          </span>
          <span
            className='line-clamp-1 block truncate text-xs text-zinc-500'
            title={`${record.name}`}
          >
            {record.name}
          </span>
        </>
      )
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'dateOfBirth',
      render: (value) => formatDate(value, DEFAULT_DATE_FORMAT) || '------',
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
            {label ?? '------'}
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
            {label || '------'}
          </span>
        );
      },
      align: 'center',
      width: 120
    },
    // {
    //   title: 'Vai trò',
    //   dataIndex: 'kinds',
    //   render: (kinds: number[]) => {
    //     const label = kinds
    //       .map(
    //         (kind) =>
    //           personKinds.find((personKind) => personKind.value === kind)?.label
    //       )
    //       .join(', ');
    //     return (
    //       <span className='line-clamp-1 block truncate' title={label}>
    //         {label ?? '------'}
    //       </span>
    //     );
    //   },
    //   width: 200,
    //   align: 'center'
    // },
    handlers.renderActionColumn({
      actions: { edit: true, delete: true }
    })
  ];

  const searchFields: SearchFormProps<PersonSearchType>['searchFields'] = [
    { key: 'name', placeholder: 'Tên' },
    { key: 'otherName', placeholder: 'Nghệ danh' },
    {
      key: 'country',
      placeholder: 'Quốc tịch',
      type: FieldTypes.SELECT,
      options: countryOptions
    },
    {
      key: 'gender',
      placeholder: 'Giới tính',
      type: FieldTypes.SELECT,
      options: genderOptions
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
