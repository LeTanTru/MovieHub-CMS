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
import { KIND_MANAGER, profileErrorMaps, storageKeys } from '@/constants';
import { useAuth, useNavigate } from '@/hooks';
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
import { ProfileBodyType } from '@/types';
import {
  applyFormErrors,
  getData,
  notify,
  removeData,
  renderImageUrl
} from '@/utils';
import { ArrowLeftFromLine, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

export default function ProfileForm() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [avatarPath, setAvatarPath] = useState('');
  const [logoPath, setLogoPath] = useState('');
  const [uploadedAvatarImages, setUploadedAvatarImages] = useState<string[]>(
    []
  );
  const [uploadedLogoImages, setUploadedLogoImages] = useState<string[]>([]);

  const uploadAvatarMutation = useUploadAvatarMutation();
  const uploadLogoMutation = useUploadLogoMutation();
  const deleteImageMutation = useDeleteFileMutation();

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

  const deleteFiles = async (files: string[]) => {
    const validFiles = files.filter(Boolean);
    if (!validFiles.length) return;
    await Promise.all(
      validFiles.map((filePath) =>
        deleteImageMutation.mutateAsync({ filePath }).catch((err) => {
          logger.error('Failed to delete file:', filePath, err);
        })
      )
    );
  };

  const onSubmit = async (
    values: ProfileBodyType,
    form: UseFormReturn<ProfileBodyType>
  ) => {
    // Delete logic for avatar:
    // - If user removed avatar (avatarPath is empty), delete all uploaded avatars except the original
    // - If user kept/changed avatar, delete all previous uploads, keep only the current one
    const avatarFilesToDelete = [];
    if (!avatarPath) {
      // User removed avatar - delete all uploaded files except original
      avatarFilesToDelete.push(
        ...uploadedAvatarImages.filter((img) => img !== profile?.avatarPath)
      );
    } else if (avatarPath !== profile?.avatarPath) {
      // User changed avatar - delete all previous uploads except the current one
      avatarFilesToDelete.push(
        ...uploadedAvatarImages.filter((img) => img !== avatarPath)
      );
    }

    // Same logic for logo
    const logoFilesToDelete = [];
    if (!logoPath) {
      logoFilesToDelete.push(
        ...uploadedLogoImages.filter((img) => img !== profile?.logoPath)
      );
    } else if (logoPath !== profile?.logoPath) {
      logoFilesToDelete.push(
        ...uploadedLogoImages.filter((img) => img !== logoPath)
      );
    }

    const filesToDelete = [...avatarFilesToDelete, ...logoFilesToDelete];

    await deleteFiles(filesToDelete.filter(Boolean));

    await profileMutation.mutateAsync(
      { ...values, avatarPath, logoPath },
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

  useEffect(() => {
    const url = profile?.avatarPath || '';
    setAvatarPath(url);
    setUploadedAvatarImages(url ? [url] : []);
  }, [profile?.avatarPath]);

  useEffect(() => {
    const url = profile?.logoPath || '';
    setLogoPath(url);
    setUploadedLogoImages(url ? [url] : []);
  }, [profile?.logoPath]);

  const handleCancel = async () => {
    // Delete all files uploaded during this session, keep only the original files
    const avatarFilesToDelete = uploadedAvatarImages.filter(
      (img) => img !== profile?.avatarPath
    );
    const logoFilesToDelete = uploadedLogoImages.filter(
      (img) => img !== profile?.logoPath
    );

    const filesToDelete = [...avatarFilesToDelete, ...logoFilesToDelete];
    await deleteFiles(filesToDelete.filter(Boolean));

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
                  setUploadedAvatarImages((prev) =>
                    url ? [...prev, url] : [...prev]
                  );
                }}
                size={150}
                uploadImageFn={async (file: Blob) => {
                  const res = await uploadAvatarMutation.mutateAsync({
                    file
                  });
                  return res.data?.filePath ?? '';
                }}
                deleteImageFn={
                  profile?.avatarPath
                    ? undefined
                    : () =>
                        deleteImageMutation.mutateAsync({
                          filePath: avatarPath
                        })
                }
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
                    setUploadedLogoImages((prev) =>
                      url ? [...prev, url] : [...prev]
                    );
                  }}
                  size={150}
                  uploadImageFn={async (file: Blob) => {
                    const res = await uploadLogoMutation.mutateAsync({
                      file
                    });
                    return res.data?.filePath ?? '';
                  }}
                  deleteImageFn={
                    profile?.logoPath
                      ? undefined
                      : () =>
                          deleteImageMutation.mutateAsync({
                            filePath: logoPath
                          })
                  }
                  label='Logo (16:9)'
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
            <Col className='w-40!'>
              <Button
                onClick={() => handleCancel()}
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
