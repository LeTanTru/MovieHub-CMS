'use client';

import {
  Col,
  InputField,
  PasswordField,
  Row,
  UploadImageField
} from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { apiConfig, profileErrorMaps, storageKeys } from '@/constants';
import { useFileUploadManager, useNavigate, useSaveBase } from '@/hooks';
import { useDeleteFileMutation, useUploadAvatarMutation } from '@/queries';
import { route } from '@/routes';
import { profileSchema } from '@/schemaValidations';
import { useAuthStore } from '@/store';
import type { ProfileBodyType, ProfileResType } from '@/types';
import { getData, removeData, renderImageUrl } from '@/utils';
import { useMemo } from 'react';
import type { UseFormReturn } from 'react-hook-form';

export default function ProfileForm() {
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);

  const { mutateAsync: uploadAvatarMutate, isPending: uploadAvatarLoading } =
    useUploadAvatarMutation();
  const { mutateAsync: deleteFileMutate } = useDeleteFileMutation();

  const { onFormChange, handleSubmit, renderActions } = useSaveBase<
    ProfileResType,
    ProfileBodyType
  >({
    apiConfig: {
      update: apiConfig.account.updateProfile
    },
    options: {
      queryKey: 'profile',
      objectName: 'hồ sơ',
      pathParams: {},
      mode: 'edit',
      showNotify: true
    }
  });

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
      password: '',
      confirmPassword: ''
    }),
    [profile?.avatarPath, profile?.email, profile?.fullName]
  );

  const onSubmit = async (
    values: ProfileBodyType,
    form: UseFormReturn<ProfileBodyType>
  ) => {
    await Promise.all([
      avatarImageManager.handleSubmit(),
      handleSubmit(
        {
          ...values,
          avatarPath: avatarImageManager.currentUrl
        },
        form,
        profileErrorMaps
      )
    ]);
  };

  const handleCancel = async () => {
    await avatarImageManager.handleCancel();

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
      onFormChange={onFormChange}
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
                avatar
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
          <>
            {renderActions(form, {
              onCancel: handleCancel
            })}
          </>
        </>
      )}
    </BaseForm>
  );
}
