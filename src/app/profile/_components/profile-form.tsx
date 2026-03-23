'use client';

import {
  Button,
  Col,
  InputField,
  PasswordField,
  Row,
  UploadImageField
} from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { profileErrorMaps, storageKeys } from '@/constants';
import { useFileUploadManager, useNavigate } from '@/hooks';
import { logger } from '@/logger';
import {
  useDeleteFileMutation,
  useUpdateProfileMutation,
  useUploadAvatarMutation
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

  const { mutateAsync: uploadAvatarMutate, isPending: uploadAvatarLoading } =
    useUploadAvatarMutation();
  const { mutateAsync: deleteFileMutate } = useDeleteFileMutation();

  const { mutateAsync: updateProfileMutate, isPending: updateProfileLoading } =
    useUpdateProfileMutation();

  const avatarImageManager = useFileUploadManager({
    initialUrl: profile?.avatarPath,
    deleteFileMutate: deleteFileMutate,
    isEditing: true,
    onOpen: true
  });

  const defaultValues: ProfileBodyType = {
    fullName: '',
    avatarPath: '',
    oldPassword: '',
    password: '',
    confirmPassword: ''
  };

  const initialValues: ProfileBodyType = useMemo(
    () => ({
      email: profile?.email ?? '',
      fullName: profile?.fullName ?? '',
      avatarPath: profile?.avatarPath ?? '',
      oldPassword: '',
      confirmPassword: '',
      newPassword: ''
    }),
    [profile?.avatarPath, profile?.email, profile?.fullName]
  );

  const onSubmit = async (
    values: ProfileBodyType,
    form: UseFormReturn<ProfileBodyType>
  ) => {
    await Promise.all([
      avatarImageManager.handleSubmit(),
      updateProfileMutate(
        {
          ...values,
          avatarPath: avatarImageManager.currentUrl
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
      )
    ]);
  };

  const handleCancel = async () => {
    await Promise.all([avatarImageManager.handleCancel()]);

    const prevPath = getData(storageKeys.PREVIOUS_PATH);
    removeData(storageKeys.PREVIOUS_PATH);
    navigate.push(prevPath ?? route.home.path);
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
            <Col span={24}>
              <UploadImageField
                value={renderImageUrl(avatarImageManager.currentUrl)}
                loading={uploadAvatarLoading}
                name='avatarPath'
                control={form.control}
                onChange={avatarImageManager.trackUpload}
                size={120}
                uploadImageFn={async (file: Blob) => {
                  const res = await uploadAvatarMutate({
                    file
                  });
                  return res.data?.filePath ?? '';
                }}
                deleteImageFn={avatarImageManager.handleDeleteOnClick}
                label='Ảnh đại diện'
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
              <PasswordField
                control={form.control}
                name='oldPassword'
                label='Mật khẩu hiện tại'
                placeholder='Mật khẩu hiện tại'
                required
              />
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <PasswordField
                control={form.control}
                name='password'
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
                variant='ghost'
                className='border border-red-500 text-red-500 hover:border-red-500/50 hover:bg-transparent! hover:text-red-500/50'
              >
                <ArrowLeftFromLine />
                Hủy
              </Button>
            </Col>
            <Col className='w-40!'>
              <Button
                disabled={!form.formState.isDirty || updateProfileLoading}
                variant='primary'
                loading={updateProfileLoading}
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
