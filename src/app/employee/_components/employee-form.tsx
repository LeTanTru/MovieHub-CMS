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
  apiConfig,
  employeeErrorMaps,
  employeeStatusOptions,
  ErrorCode,
  MAX_PAGE_SIZE,
  objectNames,
  queryKeys,
  STATUS_ACTIVE
} from '@/constants';
import { useFileUploadManager, useSaveBase } from '@/hooks';
import {
  useDeleteFileMutation,
  useGroupListQuery,
  useUploadAvatarMutation
} from '@/queries';
import { route } from '@/routes';
import { employeeSchema } from '@/schemaValidations';
import type { EmployeeBodyType, EmployeeResType } from '@/types';
import { renderImageUrl, renderListPageUrl } from '@/utils';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import type { UseFormReturn } from 'react-hook-form';

const defaultValues: EmployeeBodyType = {
  username: '',
  email: '',
  fullName: '',
  groupId: '',
  password: '',
  avatarPath: '',
  status: STATUS_ACTIVE,
  confirmPassword: '',
  phone: '',
  confirmNewPassword: '',
  newPassword: ''
};

export function EmployeeForm() {
  const { id } = useParams<{ id: string }>();

  const { data: groupListData } = useGroupListQuery({ size: MAX_PAGE_SIZE });

  const groupOptions = groupListData?.content.map((item) => ({
    label: item.name,
    value: item.id.toString()
  }));

  const { mutateAsync: uploadImage, isPending } = useUploadAvatarMutation();
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
  } = useSaveBase<EmployeeResType, EmployeeBodyType>({
    apiConfig: apiConfig.employee,
    options: {
      queryKey: queryKeys.EMPLOYEE,
      objectName: objectNames.EMPLOYEE,
      listPageUrl: route.employee.getList.path,
      pathParams: {
        id
      },
      mode: id === 'create' ? 'create' : 'edit'
    }
  });

  const imageManager = useFileUploadManager({
    initialUrl: data?.avatarPath,
    deleteFileMutate: deleteFileMutate,
    isEditing,
    onOpen: true
  });

  const initialValues: EmployeeBodyType = useMemo(
    () => ({
      username: data?.username ?? defaultValues.username,
      email: data?.email ?? defaultValues.email,
      fullName: data?.fullName ?? defaultValues.fullName,
      groupId: data?.group?.id?.toString() ?? defaultValues.groupId,
      password: defaultValues.password,
      avatarPath: data?.avatarPath ?? defaultValues.avatarPath,
      status: data?.status ?? defaultValues.status,
      confirmPassword: defaultValues.confirmPassword,
      phone: data?.phone ?? defaultValues.phone,
      confirmNewPassword: defaultValues.confirmNewPassword,
      newPassword: defaultValues.newPassword
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

  const handleCancel = async () => {
    await imageManager.handleCancel();
  };

  const onSubmit = async (
    values: EmployeeBodyType,
    form: UseFormReturn<EmployeeBodyType>
  ) => {
    await Promise.all([
      imageManager.handleSubmit(),
      handleSubmit(
        {
          ...values,
          avatarPath: imageManager.currentUrl
        },
        form,
        employeeErrorMaps
      )
    ]);
  };

  return (
    <PageWrapper
      breadcrumbs={[
        {
          label: 'Nhân viên',
          href: renderListPageUrl(route.employee.getList.path, queryString)
        },
        { label: `${!isEditing ? 'Thêm mới' : 'Cập nhật'} nhân viên` }
      ]}
      notFound={responseCode === ErrorCode.EMPLOYEE_ERROR_NOT_FOUND}
      notFoundContent='Không tìm thấy nhân viên này'
    >
      <BaseForm
        onSubmit={onSubmit}
        defaultValues={defaultValues}
        schema={employeeSchema(isEditing)}
        initialValues={initialValues}
        onFormChange={onFormChange}
      >
        {(form) => (
          <>
            <Row>
              <Col className='grid-c-24'>
                <UploadImageField
                  value={renderImageUrl(imageManager.currentUrl)}
                  loading={isPending}
                  control={form.control}
                  name='avatarPath'
                  onChange={imageManager.trackUpload}
                  size={120}
                  uploadImageFn={async (file) => {
                    const res = await uploadImage({ file });
                    return res.data?.filePath ?? '';
                  }}
                  deleteImageFn={imageManager.handleDeleteOnClick}
                  label='Ảnh đại diện'
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

            {!isEditing && (
              <>
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
                      options={employeeStatusOptions || []}
                      control={form.control}
                      name='status'
                      label='Trạng thái'
                      placeholder='Trạng thái'
                      required
                    />
                  </Col>
                </Row>
              </>
            )}

            {isEditing && (
              <>
                <Row>
                  <Col className='grid-c-6'>
                    <PasswordField
                      control={form.control}
                      name='newPassword'
                      label='Mật khẩu mới'
                      placeholder='Mật khẩu mới'
                      required={!isEditing}
                    />
                  </Col>
                  <Col className='grid-c-6'>
                    <PasswordField
                      control={form.control}
                      name='confirmNewPassword'
                      label='Nhập lại mật khẩu mới'
                      placeholder='Nhập lại mật khẩu mới'
                      required={!isEditing}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col className='grid-c-6'>
                    <SelectField
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
                      options={employeeStatusOptions || []}
                      control={form.control}
                      name='status'
                      label='Trạng thái'
                      placeholder='Trạng thái'
                      required
                    />
                  </Col>
                </Row>
              </>
            )}

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
