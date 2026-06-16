'use client';

import {
  Col,
  InputField,
  PasswordField,
  Row,
  SelectField,
  UploadImageField
} from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { PageWrapper } from '@/components/layout';
import { CircleLoading } from '@/components/loading';
import {
  adminErrorMaps,
  apiConfig,
  ErrorCode,
  GROUP_KIND_ADMIN,
  objectNames,
  queryKeys,
  STATUS_ACTIVE,
  statusOptions
} from '@/constants';
import { useFileUploadManager, useSaveBase } from '@/hooks';
import {
  useDeleteFileMutation,
  useGroupListQuery,
  useUploadAvatarMutation
} from '@/queries';
import { route } from '@/routes';
import { accountSchema } from '@/schemaValidations';
import type { AccountBodyType, AccountResType } from '@/types';
import { renderImageUrl, renderListPageUrl } from '@/utils';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import type { UseFormReturn } from 'react-hook-form';

const defaultValues: AccountBodyType = {
  username: '',
  email: '',
  fullName: '',
  groupId: '',
  password: '',
  avatarPath: '',
  status: STATUS_ACTIVE,
  confirmPassword: '',
  phone: ''
};

export function AdminForm() {
  const { id } = useParams<{ id: string }>();

  const { data: groupData } = useGroupListQuery({ kind: GROUP_KIND_ADMIN });
  const groupList = groupData?.content || [];
  const groupOptions = groupList.map((item) => ({
    label: item.name,
    value: item.id.toString()
  }));

  const { mutateAsync: uploadAvatarMutate, isPending: uploadImageLoading } =
    useUploadAvatarMutation();
  const { mutateAsync: deleteFileMutate } = useDeleteFileMutation();

  const {
    data,
    loading,
    isEditing,
    queryString,
    responseCode,
    onFormChange,
    handleSubmit,
    renderActions
  } = useSaveBase<AccountResType, AccountBodyType>({
    apiConfig: {
      create: apiConfig.account.create,
      update: apiConfig.account.update,
      getById: apiConfig.account.getById
    },
    options: {
      queryKey: queryKeys.ADMIN,
      objectName: objectNames.ADMIN,
      listPageUrl: route.admin.getList.path,
      pathParams: {
        id
      },
      mode: id === 'create' ? 'create' : 'edit'
    }
  });

  const initialValues: AccountBodyType = useMemo(
    () => ({
      username: data?.username ?? defaultValues.username,
      email: data?.email ?? defaultValues.email,
      fullName: data?.fullName ?? defaultValues.fullName,
      groupId: data?.group?.id?.toString() ?? defaultValues.groupId,
      password: defaultValues.password,
      avatarPath: data?.avatarPath ?? defaultValues.avatarPath,
      status: data?.status ?? defaultValues.status,
      confirmPassword: defaultValues.confirmPassword,
      phone: data?.phone ?? defaultValues.phone
    }),
    [
      data?.avatarPath,
      data?.email,
      data?.fullName,
      data?.group?.id,
      data?.phone,
      data?.status,
      data?.username
    ]
  );

  const imageManager = useFileUploadManager({
    initialUrl: data?.avatarPath,
    deleteFileMutate: deleteFileMutate,
    isEditing,
    onOpen: true
  });

  const handleCancel = async () => {
    await imageManager.handleCancel();
  };

  const onSubmit = async (
    values: AccountBodyType,
    form: UseFormReturn<AccountBodyType>
  ) => {
    await Promise.all([
      imageManager.handleSubmit(),

      handleSubmit(
        {
          ...values,
          avatarPath: imageManager.currentUrl,
          kind: GROUP_KIND_ADMIN
        },
        form,
        adminErrorMaps
      )
    ]);
  };

  return (
    <PageWrapper
      breadcrumbs={[
        {
          label: 'Quản trị viên',
          href: renderListPageUrl(route.admin.getList.path, queryString)
        },
        { label: `${!data ? 'Thêm mới' : 'Cập nhật'} quản trị viên` }
      ]}
      notFound={responseCode === ErrorCode.ACCOUNT_ERROR_NOT_FOUND}
      notFoundContent='Không tìm thấy quản trị viên này'
    >
      <BaseForm
        onSubmit={onSubmit}
        defaultValues={defaultValues}
        schema={accountSchema(isEditing)}
        initialValues={initialValues}
        onFormChange={onFormChange}
      >
        {(form) => (
          <>
            <Row>
              <Col className='grid-c-12 grid-col-no-gutters'>
                <UploadImageField
                  value={renderImageUrl(imageManager.currentUrl)}
                  loading={uploadImageLoading}
                  control={form.control}
                  name='avatarPath'
                  onChange={imageManager.trackUpload}
                  size={120}
                  uploadImageFn={async (file) => {
                    const res = await uploadAvatarMutate({ file });
                    return res.data?.filePath ?? '';
                  }}
                  label='Ảnh đại diện'
                  deleteImageFn={imageManager.handleDeleteOnClick}
                  avatar
                  defaultCrop
                />
              </Col>
            </Row>
            <Row>
              <Col className='grid-c-6'>
                <InputField
                  control={form.control}
                  name='username'
                  label='Tên đăng nhập'
                  placeholder='Tên đăng nhập'
                  required
                  disabled={isEditing}
                />
              </Col>
              <Col className='grid-c-6'>
                <InputField
                  control={form.control}
                  name='fullName'
                  label='Họ tên'
                  placeholder='Họ tên'
                  required
                />
              </Col>
            </Row>
            <Row>
              <Col className='grid-c-6'>
                <InputField
                  control={form.control}
                  name='email'
                  label='Email'
                  placeholder='Email'
                  required
                />
              </Col>
              <Col className='grid-c-6'>
                <InputField
                  control={form.control}
                  name='phone'
                  label='Số điện thoại'
                  placeholder='Số điện thoại'
                  required
                />
              </Col>
            </Row>
            <Row>
              <Col className='grid-c-6'>
                <PasswordField
                  control={form.control}
                  name='password'
                  label='Mật khẩu'
                  placeholder='Mật khẩu'
                  required={!isEditing}
                />
              </Col>
              <Col className='grid-c-6'>
                <PasswordField
                  control={form.control}
                  name='confirmPassword'
                  label='Nhập lại mật khẩu'
                  placeholder='Nhập lại mật khẩu'
                  required={!isEditing}
                />
              </Col>
            </Row>
            <Row>
              <Col className='grid-c-6'>
                <SelectField
                  getLabel={(opt) => opt.label}
                  getValue={(opt) => opt.value}
                  options={groupOptions || []}
                  control={form.control}
                  name='groupId'
                  label='Vai trò'
                  placeholder='Vai trò'
                  required
                />
              </Col>
              <Col className='grid-c-6'>
                <SelectField
                  getLabel={(opt) => opt.label}
                  getValue={(opt) => opt.value}
                  options={statusOptions || []}
                  control={form.control}
                  name='status'
                  label='Trạng thái'
                  placeholder='Trạng thái'
                  required
                />
              </Col>
            </Row>
            <>
              {renderActions(form, {
                onCancel: handleCancel
              })}
            </>
            {loading && (
              <div className='absolute inset-0 z-10 flex justify-center bg-white/80'>
                <CircleLoading className='stroke-sporty-blue mt-20' />
              </div>
            )}
          </>
        )}
      </BaseForm>
    </PageWrapper>
  );
}
