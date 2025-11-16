'use client';

import {
  Button,
  Col,
  InputField,
  Row,
  UploadImageField
} from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import PasswordField from '@/components/form/password-field';
import { CircleLoading } from '@/components/loading';
import { KIND_MANAGER, profileErrorMaps, storageKeys } from '@/constants';
import { useAuth, useNavigate } from '@/hooks';
import { logger } from '@/logger';
import {
  useEmployeeUpdateProfileMutation,
  useManagerUpdateProfileMutation,
  useUploadAvatarMutation,
  useUploadLogoMutation
} from '@/queries';
import { route } from '@/routes';
import { profileSchema } from '@/schemaValidations';
import { useAuthStore } from '@/store';
import { ProfileBodyType } from '@/types';
import {
  applyFormErrors,
  getData,
  notify,
  removeData,
  renderImageUrl
} from '@/utils';
import { Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

export default function ProfileForm() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const uploadAvatarMutation = useUploadAvatarMutation();
  const uploadLogoMutation = useUploadLogoMutation();
  const [avatarPath, setAvatarPath] = useState('');
  const [logoPath, setLogoPath] = useState('');
  const { kind } = useAuth();
  const managerUpdateProfileMutation = useManagerUpdateProfileMutation();
  const employeeUpdateProfileMutation = useEmployeeUpdateProfileMutation();
  const profileMutation =
    kind === KIND_MANAGER
      ? managerUpdateProfileMutation
      : employeeUpdateProfileMutation;

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

  useEffect(() => {
    if (profile?.avatarPath) setAvatarPath(profile?.avatarPath);
  }, [profile?.avatarPath]);

  useEffect(() => {
    if (profile?.logoPath) setLogoPath(profile?.logoPath);
  }, [profile?.logoPath]);

  const onSubmit = async (
    values: ProfileBodyType,
    form: UseFormReturn<ProfileBodyType>
  ) => {
    await profileMutation.mutateAsync(
      { ...values, avatarPath },
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

  const handleCancel = () => {
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
                value={renderImageUrl(avatarPath)}
                loading={uploadAvatarMutation.isPending}
                name='avatarPath'
                control={form.control}
                onChange={(url) => {
                  setAvatarPath(url);
                }}
                size={100}
                uploadImageFn={async (file: Blob) => {
                  const res = await uploadAvatarMutation.mutateAsync({
                    file
                  });
                  return res.data?.filePath ?? '';
                }}
                label='Ảnh đại diện'
              />
            </Col>
            {kind === KIND_MANAGER && (
              <Col span={12}>
                <UploadImageField
                  value={renderImageUrl(logoPath)}
                  loading={uploadLogoMutation.isPending}
                  name='logoPath'
                  control={form.control}
                  onChange={(url) => {
                    setLogoPath(url);
                  }}
                  size={100}
                  uploadImageFn={async (file: Blob) => {
                    const res = await uploadLogoMutation.mutateAsync({
                      file
                    });
                    return res.data?.filePath ?? '';
                  }}
                  label='Logo'
                  aspect={16 / 9}
                />
              </Col>
            )}
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
            <Col span={4}>
              <Button
                onClick={() => handleCancel()}
                type='button'
                variant={'ghost'}
                className='border border-red-500 text-red-500 hover:border-red-500/50 hover:bg-transparent! hover:text-red-500/50'
              >
                Hủy
              </Button>
            </Col>
            <Col span={4}>
              <Button
                disabled={!form.formState.isDirty || profileMutation.isPending}
                variant={'primary'}
              >
                {profileMutation.isPending ? (
                  <CircleLoading />
                ) : (
                  <>
                    <Save />
                    Cập nhật
                  </>
                )}
              </Button>
            </Col>
          </Row>
        </>
      )}
    </BaseForm>
  );
}
