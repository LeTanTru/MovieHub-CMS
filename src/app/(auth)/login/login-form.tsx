'use client';

import { logoWithText } from '@/assets';
import { Button, Col, InputField, Row, SelectField } from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import {
  ErrorCode,
  LOGIN_TYPE_MANAGER,
  loginOptions,
  storageKeys
} from '@/constants';
import { logger } from '@/logger';
import { loginSchema } from '@/schemaValidations';
import { ApiResponse, LoginBodyType, LoginResType } from '@/types';
import { notify, setData } from '@/utils';
import Image from 'next/image';
import PasswordField from '@/components/form/password-field';
import { useAuthStore } from '@/store';
import envConfig from '@/config';
import { useLoginEmployeeMutation, useLoginManagerMutation } from '@/queries';
import { omit } from 'lodash';

export default function LoginForm() {
  const loginManagerMutation = useLoginManagerMutation();
  const loginEmployeeMutation = useLoginEmployeeMutation();
  const { setAuthenticated, setLoading } = useAuthStore();

  const loading =
    loginManagerMutation.isPending || loginEmployeeMutation.isPending;

  const defaultValues: LoginBodyType = {
    username: '',
    password: '',
    grant_type: envConfig.NEXT_PUBLIC_GRANT_TYPE as string,
    tenantId: envConfig.NEXT_PUBLIC_TENANT_ID,
    loginType: LOGIN_TYPE_MANAGER
  };

  const handleLoginSuccess = (res: LoginResType | ApiResponse<any>) => {
    if ((res as ApiResponse<any>).result === false) {
      const code = (res as ApiResponse<any>).code;
      if (code === ErrorCode.ACCOUNT_ERROR_LOCKED) {
        notify.error('Tài khoản đã bị khóa, vui lòng liên hệ quản trị viên');
      }
    } else {
      const _res = res as LoginResType;
      notify.success('Đăng nhập thành công');
      setData(storageKeys.ACCESS_TOKEN, _res?.access_token!);
      setData(storageKeys.REFRESH_TOKEN, _res?.refresh_token!);
      setData(storageKeys.USER_KIND, _res?.user_kind?.toString()!);
      setAuthenticated(true);
      setLoading(true);
    }
  };

  const handleLoginError = (error: Error) => {
    logger.error('Error while logging in: ', error);
    notify.error('Đăng nhập thất bại');
  };

  const onSubmit = async (values: LoginBodyType) => {
    if (values.loginType === LOGIN_TYPE_MANAGER) {
      await loginManagerMutation.mutateAsync(
        { ...omit(values, ['loginType']) } as any,
        {
          onSuccess: handleLoginSuccess,
          onError: handleLoginError
        }
      );
    } else {
      await loginEmployeeMutation.mutateAsync(values, {
        onSuccess: handleLoginSuccess,
        onError: handleLoginError
      });
    }
  };

  return (
    <BaseForm
      defaultValues={defaultValues}
      schema={loginSchema}
      onSubmit={onSubmit}
      className='flex flex-col items-center justify-around gap-0 rounded-lg px-6 py-6 shadow-[0px_0px_10px_1px] shadow-slate-200 max-[1560px]:w-120 min-[1560px]:w-120'
    >
      {(form) => (
        <>
          <Row className='mb-2 w-full'>
            <Col span={24} className='items-center justify-center px-0'>
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
          <Row className='w-full flex-col gap-5 *:px-0'>
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
            {/* <Col span={24}>
              <InputField
                name='tenantId'
                control={form.control}
                label='Mã thuê bao (Tenant Id)'
                placeholder='Mã thuê bao (Tenant Id)'
                required
              />
            </Col> */}
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
          <Row className='mb-0 w-full'>
            <Col className='my-0 px-0' span={24}>
              <Button
                disabled={!form.formState.isDirty || loading}
                variant={'primary'}
                loading={loading}
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
