'use client';

import { logoWithText } from '@/assets';
import { Button, Col, InputField, Row, SelectField } from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { LOGIN_TYPE_MANAGER, loginOptions, storageKeys } from '@/constants';
import { logger } from '@/logger';
import { loginSchema } from '@/schemaValidations';
import { LoginBodyType } from '@/types/auth.type';
import { notify, setData } from '@/utils';
import Image from 'next/image';
import PasswordField from '@/components/form/password-field';
import { CircleLoading } from '@/components/loading';
import { useNavigate } from '@/hooks';
import { useAuthStore } from '@/store';
import envConfig from '@/config';
import { route } from '@/routes';
import { useLoginEmployeeMutation, useLoginManagerMutation } from '@/queries';

export default function LoginForm() {
  const loginManagerMutation = useLoginManagerMutation();
  const loginEmployeeMutation = useLoginEmployeeMutation();
  const navigate = useNavigate(false);
  const { setAuthenticated, setLoading } = useAuthStore();

  const loading =
    loginManagerMutation.isPending || loginEmployeeMutation.isPending;

  const defaultValues: LoginBodyType = {
    username: '',
    password: '',
    grant_type: envConfig.NEXT_PUBLIC_GRANT_TYPE as string,
    tenantId: '',
    loginType: LOGIN_TYPE_MANAGER
  };

  const onSubmit = async (values: LoginBodyType) => {
    await loginManagerMutation.mutateAsync(values, {
      onSuccess: (res) => {
        notify.success('Đăng nhập thành công');
        setData(storageKeys.ACCESS_TOKEN, res?.access_token!);
        setData(storageKeys.REFRESH_TOKEN, res?.refresh_token!);
        setData(storageKeys.USER_KIND, res?.user_kind?.toString()!);
        setAuthenticated(true);
        setLoading(true);
        navigate(route.home.path);
      },
      onError: (error) => {
        logger.error('Error while logging in: ', error);
        notify.error('Đăng nhập thất bại');
      }
    });
  };

  return (
    <BaseForm
      defaultValues={defaultValues}
      schema={loginSchema}
      onSubmit={onSubmit}
      className='flex flex-col items-center justify-around gap-0 rounded-lg px-6 py-6 shadow-[0px_0px_10px_1px] shadow-slate-200 max-[1560px]:w-120 min-[1560px]:w-150'
    >
      {(form) => (
        <>
          <Row className='mb-2'>
            <Col span={24} className='items-center'>
              <Image
                src={logoWithText.src}
                width={180}
                height={50}
                alt='MovieHub Logo'
              />
            </Col>
          </Row>
          <Row className='flex-col gap-5 *:px-0'>
            <Col span={24}>
              <InputField
                name='username'
                control={form.control}
                label='Tên đăng nhập'
                placeholder='Tên đăng nhập'
                required
              />
            </Col>
            <Col span={24}>
              <PasswordField
                name='password'
                control={form.control}
                label='Mật khẩu'
                placeholder='Mật khẩu'
                required
              />
            </Col>
            <Col span={24}>
              <InputField
                name='tenantId'
                control={form.control}
                label='Mã thuê bao (Tenant Id)'
                placeholder='Mã thuê bao (Tenant Id)'
                required
              />
            </Col>
            <Col span={24}>
              <SelectField
                options={loginOptions}
                name='loginType'
                control={form.control}
                label='Vai trò'
                placeholder='Vai trò'
                required
              />
            </Col>
          </Row>
          <Row className='mb-0'>
            <Col className='my-0 px-0' span={24}>
              <Button
                disabled={!form.formState.isDirty || loading}
                variant={'primary'}
              >
                {loading ? <CircleLoading /> : 'Đăng nhập'}
              </Button>
            </Col>
          </Row>
        </>
      )}
    </BaseForm>
  );
}
