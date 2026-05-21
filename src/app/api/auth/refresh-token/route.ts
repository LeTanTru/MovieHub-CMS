import { generateCsrfToken } from '../_lib/generate-csrf-token';
import { getBasicAuthHeader } from '../_lib/auth';
import { makeCookieOption } from '../_lib/make-cookie-option';
import {
  ACCESS_TOKEN_MAX_AGE,
  apiConfig,
  CSRF_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
  storageKeys
} from '@/constants';
import { logger } from '@/logger';
import { RefreshTokenResType } from '@/types';
import {
  getCookie,
  http,
  isAxiosError,
  removeCookie,
  setCookie
} from '@/utils';
import { HttpStatusCode } from 'axios';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const refresh_token = await getCookie(storageKeys.REFRESH_TOKEN);

    if (!refresh_token) {
      return NextResponse.json(
        { result: false, message: 'Refresh token is required' },
        { status: HttpStatusCode.BadRequest }
      );
    }

    const res = await http.post<RefreshTokenResType>(
      apiConfig.auth.refreshToken,
      {
        body: {
          refresh_token,
          grant_type: process.env.GRANT_TYPE_REFRESH_TOKEN
        },
        options: {
          headers: {
            Authorization: getBasicAuthHeader()
          }
        }
      }
    );

    if (res.access_token) {
      await setCookie(
        storageKeys.ACCESS_TOKEN,
        res.access_token,
        makeCookieOption(ACCESS_TOKEN_MAX_AGE)
      );
    }

    if (res.refresh_token) {
      await removeCookie(storageKeys.REFRESH_TOKEN);
      await setCookie(
        storageKeys.REFRESH_TOKEN,
        res.refresh_token,
        makeCookieOption(REFRESH_TOKEN_MAX_AGE)
      );
    }

    if (res.user_kind) {
      await setCookie(
        storageKeys.USER_KIND,
        String(res.user_kind),
        makeCookieOption(ACCESS_TOKEN_MAX_AGE)
      );
    }

    const csrfToken = generateCsrfToken();

    await setCookie(
      storageKeys.CSRF_TOKEN,
      csrfToken,
      makeCookieOption(CSRF_TOKEN_MAX_AGE)
    );

    return NextResponse.json(
      { result: true, data: res },
      { status: HttpStatusCode.Ok }
    );
  } catch (error) {
    if (isAxiosError(error)) {
      const response = error.response?.data;

      logger.error('[REFRESH_TOKEN_ERROR]', response);

      if (response) {
        return NextResponse.json(
          { result: false, ...response },
          { status: error.response?.status }
        );
      }

      return NextResponse.json(
        { result: false, message: 'Refresh token failed' },
        { status: error.response?.status }
      );
    }

    logger.error('[REFRESH_TOKEN_ERROR]', error);

    return NextResponse.json(
      { result: false, message: 'Refresh token failed' },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
