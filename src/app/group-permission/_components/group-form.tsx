'use client';

import {
  Button,
  Col,
  InputField,
  Row,
  SelectField,
  TextAreaField
} from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { PageWrapper } from '@/components/layout';
import { NoData } from '@/components/no-data';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DEFAULT_TABLE_PAGE_START,
  ErrorCode,
  groupErrorMaps,
  groupKinds,
  MAX_PAGE_SIZE
} from '@/constants';
import { useNavigate } from '@/hooks';
import { cn } from '@/lib';
import { logger } from '@/logger';
import {
  useCreateGroupMutation,
  useGroupPermissionListQuery,
  useGroupQuery,
  usePermissionListQuery,
  useUpdateGroupMutation
} from '@/queries';
import { route } from '@/routes';
import { groupSchema } from '@/schemaValidations';
import type { GroupBodyType, PermissionResType } from '@/types';
import { applyFormErrors, notify } from '@/utils';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeftFromLine, Save } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import type { UseFormReturn } from 'react-hook-form';

export default function GroupForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isCreate = id === 'create';
  const queryClient = useQueryClient();

  const { data: groupData } = useGroupQuery(id);
  const { data: permissionListData } = usePermissionListQuery({
    page: DEFAULT_TABLE_PAGE_START,
    size: MAX_PAGE_SIZE
  });
  const { data: groupPermissionListData } = useGroupPermissionListQuery({
    page: DEFAULT_TABLE_PAGE_START,
    size: MAX_PAGE_SIZE
  });

  const group = groupData?.data;
  const groupPermissions = useMemo(() => {
    return groupPermissionListData?.data?.content || [];
  }, [groupPermissionListData?.data?.content]);
  const permissions = permissionListData?.data.content;

  const { mutateAsync: createGroupMutate, isPending: createGroupLoading } =
    useCreateGroupMutation();
  const { mutateAsync: updateGroupMutate, isPending: updateGroupLoading } =
    useUpdateGroupMutation();

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
    description: ''
  };

  const initialValues: GroupBodyType = useMemo(
    () => ({
      description: group?.description ?? '',
      name: group?.name ?? '',
      permissions: group?.permissions.map((g) => g.id.toString()) ?? []
    }),
    [group?.description, group?.name, group?.permissions]
  );

  // const onSubmit = async (
  //   values: GroupBodyType,
  //   form: UseFormReturn<GroupBodyType>
  // ) => {
  //   const mutation = isCreate ? createGroupMutation : updateGroupMutation;
  //   await mutation.mutateAsync(
  //     isCreate ? values : { ...omit(values, ['kind']), id },
  //     {
  //       onSuccess: (res) => {
  //         if (res.result) {
  //           notify.success(
  //             `${isCreate ? 'Thêm mới' : 'Cập nhật'} vai trò thành công`
  //           );
  //           queryClient.invalidateQueries({ queryKey: ['group', id] });
  //           navigate(route.group.getList.path);
  //         } else {
  //           const errCode = res.code;
  //           if (errCode) {
  //             applyFormErrors(form, errCode, groupErrorMaps);
  //           } else {
  //             logger.error('Error while creating/updating group:', res);
  //             notify.error('Có lỗi xảy ra');
  //           }
  //         }
  //       },
  //       onError: (error) => {
  //         logger.error('Error while creating/updating group:', error);
  //         notify.error('Có lỗi xảy ra');
  //       }
  //     }
  //   );
  // };

  const onSubmit = async (
    values: GroupBodyType,
    form: UseFormReturn<GroupBodyType>
  ) => {
    const mutation = isCreate ? createGroupMutate : updateGroupMutate;

    const { kind: _, ...rest } = values;

    await mutation(isCreate ? values : { ...rest, id }, {
      onSuccess: async (res) => {
        if (res.result) {
          notify.success(
            `${isCreate ? 'Thêm mới' : 'Cập nhật'} vai trò thành công`
          );
          await queryClient.invalidateQueries({ queryKey: ['group', id] });
          navigate.push(route.group.getList.path);
        } else {
          const errCode = res.code;
          if (errCode) {
            applyFormErrors(form, errCode, groupErrorMaps);
          } else {
            logger.error('Error while creating/updating group:', res);
            notify.error('Có lỗi xảy ra');
          }
        }
      },
      onError: (error) => {
        logger.error('Error while creating/updating group:', error);
        notify.error('Có lỗi xảy ra');
      }
    });
  };

  return (
    <PageWrapper
      breadcrumbs={[
        { label: 'Vai trò', href: route.group.getList.path },
        { label: `${isCreate ? 'Thêm mới' : 'Cập nhật'} vai trò` }
      ]}
      notFound={groupData?.code === ErrorCode.GROUP_ERROR_NOT_FOUND}
      notFoundContent='Không tìm thấy vai trò này'
    >
      <BaseForm
        defaultValues={defaultValues}
        initialValues={initialValues}
        onSubmit={onSubmit}
        schema={groupSchema}
      >
        {(form) => (
          <>
            <Row>
              <Col>
                <InputField
                  control={form.control}
                  name='name'
                  label='Tên nhóm'
                  placeholder='Nhập tên nhóm'
                  required
                />
              </Col>
              {isCreate && (
                <Col>
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
              <Col span={24}>
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
              <Col className='gap-y-4' span={24}>
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
                            // <div className='flex w-full flex-col items-center justify-center gap-y-2'>
                            //   <Image
                            //     src={emptyData.src}
                            //     alt='Empty'
                            //     width={150}
                            //     height={80}
                            //   />
                            //   <p>Không có dữ liệu</p>
                            // </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </Col>
            </Row>
            <Row className='mb-0 justify-end'>
              <Col className='w-40!'>
                <Button
                  onClick={() => navigate.push(route.group.getList.path)}
                  type='button'
                  variant={'ghost'}
                  className='border border-red-500 text-red-500 hover:border-red-500/50 hover:bg-transparent! hover:text-red-500/50'
                >
                  <ArrowLeftFromLine />
                  Hủy
                </Button>
              </Col>
              <Col className='w-40!'>
                <Button
                  disabled={
                    !form.formState.isDirty ||
                    createGroupLoading ||
                    updateGroupLoading
                  }
                  type='submit'
                  variant={'primary'}
                  loading={createGroupLoading || updateGroupLoading}
                >
                  <Save />
                  {isCreate ? 'Thêm' : 'Cập nhật'}
                </Button>
              </Col>
            </Row>
          </>
        )}
      </BaseForm>
    </PageWrapper>
  );
}
