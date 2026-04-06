'use client';

import {
  Col,
  ColorPickerField,
  InputField,
  Row,
  SelectField,
  TextAreaField
} from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { PageWrapper } from '@/components/layout';
import { CircleLoading } from '@/components/loading';
import { NoData } from '@/components/no-data';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DEFAULT_TABLE_PAGE_START,
  ErrorCode,
  apiConfig,
  groupErrorMaps,
  groupKinds,
  MAX_PAGE_SIZE,
  queryKeys,
  GROUP_KIND_ADMIN
} from '@/constants';
import { useSaveBase } from '@/hooks';
import { cn } from '@/lib';
import { useGroupPermissionListQuery, usePermissionListQuery } from '@/queries';
import { route } from '@/routes';
import { groupSchema } from '@/schemaValidations';
import type { GroupBodyType, GroupResType, PermissionResType } from '@/types';
import { renderListPageUrl } from '@/utils';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import type { UseFormReturn } from 'react-hook-form';

export default function GroupForm() {
  const { id } = useParams<{ id: string }>();

  const {
    data,
    loading,
    isEditing,
    queryString,
    responseCode,
    onFormChange,
    handleSubmit,
    renderActions
  } = useSaveBase<GroupResType, GroupBodyType>({
    apiConfig: {
      create: apiConfig.group.create,
      update: apiConfig.group.update,
      getById: apiConfig.group.getById
    },
    options: {
      queryKey: queryKeys.GROUP,
      objectName: 'vai trò',
      listPageUrl: route.group.getList.path,
      pathParams: {
        id
      },
      mode: id === 'create' ? 'create' : 'edit'
    }
  });

  const { data: permissionListData } = usePermissionListQuery({
    page: DEFAULT_TABLE_PAGE_START,
    size: MAX_PAGE_SIZE
  });

  const { data: groupPermissionListData } = useGroupPermissionListQuery({
    page: DEFAULT_TABLE_PAGE_START,
    size: MAX_PAGE_SIZE
  });

  const groupPermissions = useMemo(() => {
    return groupPermissionListData?.data?.content || [];
  }, [groupPermissionListData?.data?.content]);
  const permissions = permissionListData?.data.content;

  const groupedPermissions = (permissions || []).reduce((acc, permission) => {
    const group = permission.groupPermission.name || 'Unknown';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(permission);
    return acc;
  }, {} as any);

  (groupPermissions || [])
    .map((group) => group.name)
    .forEach((groupName) => {
      if (!groupedPermissions[groupName]) {
        groupedPermissions[groupName] = [];
      }
    });

  const sortedGroupPermissions = useMemo(() => {
    return [...groupPermissions].sort((a, b) => a.ordering - b.ordering);
  }, [groupPermissions]);

  const defaultValues: GroupBodyType = {
    name: '',
    permissions: [],
    description: '',
    color: ''
  };

  const initialValues: GroupBodyType = useMemo(
    () => ({
      description: data?.description ?? '',
      name: data?.name ?? '',
      permissions: data?.permissions?.map((g) => g.id.toString()) ?? [],
      kind: data?.kind ?? GROUP_KIND_ADMIN,
      color: data?.color ?? '#000000'
    }),
    [data?.description, data?.kind, data?.name, data?.permissions, data?.color]
  );

  const onSubmit = async (
    values: GroupBodyType,
    form: UseFormReturn<GroupBodyType>
  ) => {
    await handleSubmit(values, form, groupErrorMaps);
  };

  return (
    <PageWrapper
      breadcrumbs={[
        {
          label: 'Vai trò',
          href: renderListPageUrl(route.group.getList.path, queryString)
        },
        { label: `${!data ? 'Thêm mới' : 'Cập nhật'} vai trò` }
      ]}
      notFound={responseCode === ErrorCode.GROUP_ERROR_NOT_FOUND}
      notFoundContent='Không tìm thấy vai trò này'
    >
      <BaseForm
        defaultValues={defaultValues}
        initialValues={initialValues}
        onSubmit={onSubmit}
        schema={groupSchema}
        onFormChange={onFormChange}
      >
        {(form) => (
          <>
            <Row>
              <Col className='grid-c-6'>
                <InputField
                  control={form.control}
                  name='name'
                  label='Tên nhóm'
                  placeholder='Nhập tên nhóm'
                  required
                />
              </Col>
              {!isEditing && (
                <Col className='grid-c-6'>
                  <SelectField
                    getLabel={(option) => option.label}
                    getValue={(option) => option.value}
                    options={groupKinds}
                    control={form.control}
                    name='kind'
                    label='Nhóm'
                    placeholder='Chọn nhóm'
                    required
                  />
                </Col>
              )}
            </Row>
            <Row>
              <Col className='grid-c-12'>
                <ColorPickerField
                  control={form.control}
                  name='color'
                  label='Màu'
                  required
                />
              </Col>
            </Row>
            <Row>
              <Col className='grid-c-12'>
                <TextAreaField
                  control={form.control}
                  name='description'
                  label='Mô tả'
                  placeholder='Nhập mô tả'
                  required
                />
              </Col>
            </Row>
            <Row>
              <Col className='grid-c-12 gap-y-4'>
                {sortedGroupPermissions.map((groupPermission) => {
                  const group = groupPermission.name;
                  const permissions = groupedPermissions[group];
                  return (
                    <Card key={group} className='text-sm'>
                      <CardHeader className='flex flex-row items-center gap-x-2 border-b px-4 py-2'>
                        <Checkbox
                          id={`select-all-${group}`}
                          checked={
                            permissions.length > 0 &&
                            permissions.every((p: PermissionResType) =>
                              (form.watch('permissions') || []).includes(
                                p.id.toString()
                              )
                            )
                              ? true
                              : (form.watch('permissions') || []).some((id) =>
                                    permissions
                                      .map((p: PermissionResType) =>
                                        p.id.toString()
                                      )
                                      .includes(id)
                                  )
                                ? 'indeterminate'
                                : false
                          }
                          onCheckedChange={(checked) => {
                            const selected = form.watch('permissions') || [];
                            if (checked === true) {
                              const newIds = Array.from(
                                new Set([
                                  ...selected,
                                  ...permissions.map((p: PermissionResType) =>
                                    p.id.toString()
                                  )
                                ])
                              );
                              form.setValue('permissions', newIds, {
                                shouldDirty: true
                              });
                            } else {
                              const newIds = selected.filter(
                                (id) =>
                                  !permissions
                                    .map((p: PermissionResType) =>
                                      p.id.toString()
                                    )
                                    .includes(id)
                              );
                              form.setValue('permissions', newIds, {
                                shouldDirty: true
                              });
                            }
                          }}
                          className='data-[state=checked]:bg-main-color [&>span[data-state=indeterminate]]:bg-main-color mb-0! cursor-pointer transition-all duration-100 ease-linear data-[state=checked]:border-transparent data-[state=indeterminate]:bg-transparent [&>span[data-state=indeterminate]]:m-auto [&>span[data-state=indeterminate]]:h-1/2 [&>span[data-state=indeterminate]]:w-1/2 [&>span[data-state=indeterminate]>svg]:hidden'
                        />
                        <label
                          className='cursor-pointer select-none'
                          htmlFor={`select-all-${group}`}
                        >
                          {group}
                        </label>
                      </CardHeader>
                      <CardContent className='p-4'>
                        <div
                          className={cn('grid gap-4', {
                            'grid-cols-5 max-[1560px]:grid-cols-4 max-[1366px]:grid-cols-3':
                              permissions?.length > 0
                          })}
                        >
                          {permissions?.length > 0 ? (
                            permissions.map((permission: PermissionResType) => {
                              const selected = form.watch('permissions') || [];

                              const handleToggle = (
                                checked: boolean | 'indeterminate'
                              ) => {
                                if (checked === true) {
                                  form.setValue(
                                    'permissions',
                                    [...selected, permission.id.toString()],
                                    {
                                      shouldDirty: true
                                    }
                                  );
                                } else {
                                  form.setValue(
                                    'permissions',
                                    selected.filter(
                                      (id) => id !== permission.id.toString()
                                    ),
                                    { shouldDirty: true }
                                  );
                                }
                              };

                              return (
                                <div
                                  key={permission.id.toString()}
                                  className='flex items-center gap-x-2'
                                >
                                  <Checkbox
                                    checked={selected.includes(
                                      permission.id.toString()
                                    )}
                                    onCheckedChange={handleToggle}
                                    id={permission.id.toString()}
                                    className={
                                      'data-[state=checked]:bg-main-color data-[state=checked]:border-main-color cursor-pointer transition-all duration-100 ease-linear data-[state=unchecked]:text-white'
                                    }
                                  />
                                  <label
                                    className='cursor-pointer select-none'
                                    htmlFor={permission.id.toString()}
                                  >
                                    {permission.name}
                                  </label>
                                </div>
                              );
                            })
                          ) : (
                            <NoData
                              content='Không có dữ liệu'
                              className='min-h-[30vh] [&_img]:w-40'
                            />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </Col>
            </Row>
            <>{renderActions(form)}</>
            {loading && (
              <div className='absolute inset-0 z-10 flex justify-center bg-white/80'>
                <CircleLoading className='stroke-main-color mt-20' />
              </div>
            )}
          </>
        )}
      </BaseForm>
    </PageWrapper>
  );
}
