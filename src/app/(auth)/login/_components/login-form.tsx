'use client';

import { BaseForm } from '@/components/form/base-form';
import { Button, Col, InputField, PasswordField, Row } from '@/components/form';
import { logger } from '@/logger';
import { loginSchema } from '@/schemaValidations';
import { logoWithText } from '@/assets';
import { notify, setData } from '@/utils';
import { route } from '@/routes';
import { GROUP_KIND_ADMIN, storageKeys } from '@/constants';
import { useAuthStore } from '@/store';
import { useFirstActiveRoute, useNavigate } from '@/hooks';
import {
  useEmployeeProfileQuery,
  useLoginMutation,
  useProfileQuery
} from '@/queries';
import envConfig from '@/config';
import Image from 'next/image';
import type { LoginBodyType, LoginResType } from '@/types';
import { useAppContext } from '@/components/providers/app-provider';

export default function LoginForm() {
  const navigate = useNavigate();

  const firstActiveRoute = useFirstActiveRoute();

  const { mutateAsync: loginMutate, isPending: loginLoading } =
    useLoginMutation();

  const { refetch: getProfile, isLoading: profileLoading } = useProfileQuery();
  const { refetch: getEmployeeProfile, isLoading: employeeProfileLoading } =
    useEmployeeProfileQuery();

  const { setLoading } = useAppContext();
  const setProfile = useAuthStore((s) => s.setProfile);

  const defaultValues: LoginBodyType = {
    username: '',
    password: '',
    grant_type: envConfig.NEXT_PUBLIC_GRANT_TYPE
  };

  const onSubmit = async (values: LoginBodyType) => {
    await loginMutate(values, {
      onSuccess: async (res: LoginResType) => {
        const accessToken = res.access_token;
        const refreshToken = res.refresh_token;
        const userKind = res.user_kind;

        setData(storageKeys.ACCESS_TOKEN, accessToken);
        setData(storageKeys.REFRESH_TOKEN, refreshToken);
        setData(storageKeys.USER_KIND, String(userKind));

        const profileQuery =
          userKind === GROUP_KIND_ADMIN ? getProfile : getEmployeeProfile;
        const profileData = await profileQuery();
        const profile = profileData?.data?.data;

        setLoading(profileLoading || employeeProfileLoading);

        if (profile) {
          setProfile(profile);
          navigate.push(firstActiveRoute ?? route.home.path);
        }
        notify.success('Đăng nhập thành công');
      },
      onError: (error: Error) => {
        logger.error('Error while logging in', error);
        notify.error('Đăng nhập thất bại');
      }
    });
  };

  return (
    <BaseForm
      defaultValues={defaultValues}
      schema={loginSchema}
      onSubmit={onSubmit}
      className='flex flex-col items-center justify-around gap-0 rounded-lg px-6 py-6 shadow-[0px_0px_10px_2px] shadow-black/20 max-[1560px]:w-120 min-[1560px]:w-120'
    >
      {(form) => (
        <>
          <Row className='w-full'>
            <Col className='grid-c-12 grid-col-no-gutters items-center justify-center'>
              <div className='bg-sidebar/80 mx-auto flex w-full items-center justify-center rounded py-2'>
                <Image
                  src={logoWithText.src}
                  width={180}
                  height={50}
                  alt='MovieHub Logo'
                />
              </div>
            </Col>
          </Row>
          <Row className='w-full'>
            <Col className='grid-c-12 grid-col-no-gutters items-center justify-center'>
              <h1 className='text-xl font-bold text-zinc-800 uppercase'>
                Đăng nhập
              </h1>
            </Col>
          </Row>
          <Row className='w-full'>
            <Col className='grid-c-12 grid-col-no-gutters'>
              <InputField
                name='username'
                control={form.control}
                label='Tên đăng nhập'
                placeholder='Tên đăng nhập'
                required
              />
            </Col>
          </Row>
          <Row className='w-full'>
            <Col className='grid-c-12 grid-col-no-gutters'>
              <PasswordField
                name='password'
                control={form.control}
                label='Mật khẩu'
                placeholder='Mật khẩu'
                required
              />
            </Col>
          </Row>
          <Row className='mb-0 w-full'>
            <Col className='grid-c-12 grid-col-no-gutters'>
              <Button
                disabled={!form.formState.isDirty || loginLoading}
                variant='primary'
                loading={loginLoading}
              >
                Đăng nhập
              </Button>
            </Col>
          </Row>
        </>
      )}
    </BaseForm>
  );
}
