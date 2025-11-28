'use client';
import {
  Col,
  InputField,
  Row,
  SelectField,
  UploadImageField
} from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import PasswordField from '@/components/form/password-field';
import { PageWrapper } from '@/components/layout';
import { CircleLoading } from '@/components/loading';
import {
  apiConfig,
  employeeErrorMaps,
  ErrorCode,
  STATUS_ACTIVE,
  statusOptions
} from '@/constants';
import { useSaveBase } from '@/hooks';
import { useGroupListQuery, useUploadAvatarMutation } from '@/queries';
import { route } from '@/routes';
import { employeeSchema } from '@/schemaValidations';
import { EmployeeBodyType, EmployeeResType } from '@/types';
import { renderImageUrl, renderListPageUrl } from '@/utils';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

export default function EmployeeForm({ queryKey }: { queryKey: string }) {
  const [avatarPath, setAvatarPath] = useState<string>('');
  const groupListQuery = useGroupListQuery();
  const groupList = groupListQuery.data?.data.content || [];
  const groupOptions = groupList.map((item) => ({
    label: item.name,
    value: item.id.toString()
  }));
  const uploadImageMutation = useUploadAvatarMutation();
  const { id } = useParams<{ id: string }>();

  const {
    data,
    loading,
    isEditing,
    queryString,
    responseCode,
    handleSubmit,
    renderActions
  } = useSaveBase<EmployeeResType, EmployeeBodyType>({
    apiConfig: apiConfig.employee,
    options: {
      queryKey,
      objectName: 'nhân viên',
      listPageUrl: route.employee.getList.path,
      pathParams: {
        id
      },
      mode: id === 'create' ? 'create' : 'edit'
    }
  });

  const defaultValues: EmployeeBodyType = {
    username: '',
    email: '',
    fullName: '',
    groupId: '',
    password: '',
    avatarPath: '',
    status: 0,
    confirmPassword: '',
    phone: '',
    confirmNewPassword: '',
    newPassword: '',
    oldPassword: ''
  };

  const initialValues: EmployeeBodyType = useMemo(() => {
    return {
      username: data?.username ?? '',
      email: data?.email ?? '',
      fullName: data?.fullName ?? '',
      groupId: data?.group?.id?.toString() ?? '',
      password: '',
      avatarPath: data?.avatarPath ?? '',
      status: data?.status ?? STATUS_ACTIVE,
      confirmPassword: '',
      phone: data?.phone ?? '',
      confirmNewPassword: '',
      newPassword: '',
      oldPassword: ''
    };
  }, [data]);

  useEffect(() => {
    if (data?.avatarPath) setAvatarPath(data?.avatarPath);
  }, [data]);

  const onSubmit = async (
    values: EmployeeBodyType,
    form: UseFormReturn<EmployeeBodyType>
  ) => {
    await handleSubmit(
      {
        ...values,
        avatarPath: avatarPath
      },
      form,
      employeeErrorMaps
    );
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
      notFoundContent={'Không tìm thấy nhân viên này'}
    >
      <BaseForm
        onSubmit={onSubmit}
        defaultValues={defaultValues}
        schema={employeeSchema(isEditing)}
        initialValues={initialValues}
      >
        {(form) => (
          <>
            <Row>
              <Col span={24} className='pr-0'>
                <UploadImageField
                  value={renderImageUrl(avatarPath)}
                  loading={uploadImageMutation.isPending}
                  control={form.control}
                  name='avatarPath'
                  onChange={(url) => {
                    setAvatarPath(url);
                  }}
                  size={150}
                  uploadImageFn={async (file: Blob) => {
                    const res = await uploadImageMutation.mutateAsync({ file });
                    return res.data?.filePath ?? '';
                  }}
                  label='Ảnh đại diện'
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <InputField
                  control={form.control}
                  name='username'
                  label='Tên đăng nhập'
                  placeholder='Tên đăng nhập'
                  required
                  disabled={isEditing}
                />
              </Col>
              <Col>
                <InputField
                  control={form.control}
                  name='fullName'
                  label='Họ tên nhân viên'
                  placeholder='Họ tên nhân viên'
                  required
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <InputField
                  control={form.control}
                  name='email'
                  label='Email'
                  placeholder='Email'
                  required
                />
              </Col>
              <Col>
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
                  <Col>
                    <PasswordField
                      control={form.control}
                      name='password'
                      label='Mật khẩu'
                      placeholder='Mật khẩu'
                      required={!isEditing}
                    />
                  </Col>
                  <Col>
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
                  <Col>
                    <SelectField
                      options={groupOptions || []}
                      control={form.control}
                      name='groupId'
                      label='Nhóm quyền'
                      placeholder='Nhóm quyền'
                      required
                    />
                  </Col>
                  <Col>
                    <SelectField
                      options={statusOptions || []}
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
                  <Col>
                    <PasswordField
                      control={form.control}
                      name='oldPassword'
                      label='Mật khẩu cũ'
                      placeholder='Mật khẩu cũ'
                      required={!isEditing}
                    />
                  </Col>
                  <Col>
                    <PasswordField
                      control={form.control}
                      name='newPassword'
                      label='Mật khẩu mới'
                      placeholder='Mật khẩu mới'
                      required={!isEditing}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <PasswordField
                      control={form.control}
                      name='confirmNewPassword'
                      label='Nhập lại mật khẩu mới'
                      placeholder='Nhập lại mật khẩu mới'
                      required={!isEditing}
                    />
                  </Col>
                  <Col>
                    <SelectField
                      options={groupOptions || []}
                      control={form.control}
                      name='groupId'
                      label='Nhóm quyền'
                      placeholder='Nhóm quyền'
                      required
                    />
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <SelectField
                      options={statusOptions || []}
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

            <>{renderActions(form)}</>
            {loading && (
              <div className='absolute inset-0 bg-white/80'>
                <CircleLoading className='stroke-dodger-blue mt-20 size-8' />
              </div>
            )}
          </>
        )}
      </BaseForm>
    </PageWrapper>
  );
}
