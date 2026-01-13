'use client';

import { Activity } from '@/components/activity';
import {
  Button,
  Col,
  InputField,
  PasswordField,
  Row,
  UploadImageField
} from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { KIND_MANAGER, profileErrorMaps, storageKeys } from '@/constants';
import { useAuth, useFileUploadManager, useNavigate } from '@/hooks';
import { logger } from '@/logger';
import {
  useDeleteFileMutation,
  useEmployeeUpdateProfileMutation,
  useManagerUpdateProfileMutation,
  useUploadAvatarMutation,
  useUploadLogoMutation
} from '@/queries';
import { route } from '@/routes';
import { profileSchema } from '@/schemaValidations';
import { useAuthStore } from '@/store';
import type { ProfileBodyType } from '@/types';
import {
  applyFormErrors,
  getData,
  notify,
  removeData,
  renderImageUrl
} from '@/utils';
import { ArrowLeftFromLine, Save } from 'lucide-react';
import { useMemo } from 'react';
import type { UseFormReturn } from 'react-hook-form';

export default function ProfileForm() {
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);
  const { kind } = useAuth();

  const uploadAvatarMutation = useUploadAvatarMutation();
  const uploadLogoMutation = useUploadLogoMutation();
  const deleteFileMutation = useDeleteFileMutation();

  const managerUpdateProfileMutation = useManagerUpdateProfileMutation();
  const employeeUpdateProfileMutation = useEmployeeUpdateProfileMutation();

  const profileMutation = useMemo(
    () =>
      kind === KIND_MANAGER
        ? managerUpdateProfileMutation
        : employeeUpdateProfileMutation,
    [kind, managerUpdateProfileMutation, employeeUpdateProfileMutation]
  );

  const avatarImageManager = useFileUploadManager({
    initialUrl: profile?.avatarPath,
    deleteFileMutation: deleteFileMutation,
    isEditing: true,
    onOpen: true
  });

  const logoImageManager = useFileUploadManager({
    initialUrl: profile?.logoPath,
    deleteFileMutation: deleteFileMutation,
    isEditing: true,
    onOpen: true
  });

  const defaultValues: ProfileBodyType = {
    email: '',
    fullName: '',
    avatarPath: '',
    phone: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    logoPath: ''
  };

  const initialValues: ProfileBodyType = useMemo(
    () => ({
      email: profile?.email ?? '',
      fullName: profile?.fullName ?? '',
      avatarPath: profile?.avatarPath ?? '',
      phone: profile?.phone ?? '',
      oldPassword: '',
      logoPath: profile?.logoPath ?? '',
      confirmPassword: '',
      newPassword: ''
    }),
    [profile]
  );

  const onSubmit = async (
    values: ProfileBodyType,
    form: UseFormReturn<ProfileBodyType>
  ) => {
    await Promise.all([
      avatarImageManager.handleSubmit(),
      logoImageManager.handleSubmit()
    ]);

    await profileMutation.mutateAsync(
      {
        ...values,
        avatarPath: avatarImageManager.currentUrl,
        logoPath: logoImageManager.currentUrl
      },
      {
        onSuccess: (res) => {
          if (res.result) {
            notify.success('Cập nhật hồ sơ thành công');
          } else {
            const code = res.code;
            if (code && profileErrorMaps[code])
              applyFormErrors(form, code, profileErrorMaps);
            else notify.error('Cập nhật hồ sơ thất bại');
          }
        },
        onError: (error) => {
          logger.error('Error while updating profile: ', error);
          notify.error('Cập nhật hồ sơ thất bại');
        }
      }
    );
  };

  const handleCancel = async () => {
    await Promise.all([
      avatarImageManager.handleCancel(),
      logoImageManager.handleCancel()
    ]);

    const prevPath = getData(storageKeys.PREVIOUS_PATH);
    removeData(storageKeys.PREVIOUS_PATH);
    navigate(prevPath ?? route.home.path);
  };

  return (
    <BaseForm
      defaultValues={defaultValues}
      initialValues={initialValues}
      onSubmit={onSubmit}
      schema={profileSchema}
      className='mx-auto w-1/2'
    >
      {(form) => (
        <>
          <Row>
            <Col span={kind === KIND_MANAGER ? 12 : 24}>
              <UploadImageField
                value={renderImageUrl(avatarImageManager.currentUrl)}
                loading={uploadAvatarMutation.isPending}
                name='avatarPath'
                control={form.control}
                onChange={avatarImageManager.trackUpload}
                size={150}
                uploadImageFn={async (file: Blob) => {
                  const res = await uploadAvatarMutation.mutateAsync({
                    file
                  });
                  return res.data?.filePath ?? '';
                }}
                deleteImageFn={avatarImageManager.handleDeleteOnClick}
                label='Ảnh đại diện'
              />
            </Col>
            <Activity visible={kind == KIND_MANAGER}>
              <Col span={12}>
                <UploadImageField
                  value={renderImageUrl(logoImageManager.currentUrl)}
                  loading={uploadLogoMutation.isPending}
                  name='logoPath'
                  control={form.control}
                  onChange={logoImageManager.trackUpload}
                  size={150}
                  uploadImageFn={async (file: Blob) => {
                    const res = await uploadLogoMutation.mutateAsync({
                      file
                    });
                    return res.data?.filePath ?? '';
                  }}
                  deleteImageFn={logoImageManager.handleDeleteOnClick}
                  label='Logo (16:9)'
                  aspect={16 / 9}
                />
              </Col>
            </Activity>
          </Row>
          <Row>
            <Col span={24}>
              <InputField
                control={form.control}
                name='email'
                label='Email'
                placeholder='Nhập email'
                required
              />
            </Col>
          </Row>
          <Row>
            <Col span={24}>
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
            <Col span={24}>
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
            <Col span={24}>
              <PasswordField
                control={form.control}
                name='oldPassword'
                label='Mật khẩu hiện tại'
                placeholder='Mật khẩu hiện tại'
              />
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <PasswordField
                control={form.control}
                name='newPassword'
                label='Mật khẩu mới'
                placeholder='Mật khẩu mới'
              />
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <PasswordField
                control={form.control}
                name='confirmPassword'
                label='Nhập lại mật khẩu mới'
                placeholder='Nhập lại mật khẩu mới'
              />
            </Col>
          </Row>
          <Row className='my-0 justify-end'>
            <Col className='w-40!'>
              <Button
                onClick={handleCancel}
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
                disabled={!form.formState.isDirty || profileMutation.isPending}
                variant={'primary'}
                loading={profileMutation.isPending}
              >
                <Save />
                Cập nhật
              </Button>
            </Col>
          </Row>
        </>
      )}
    </BaseForm>
  );
}
