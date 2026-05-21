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
import { LoginResType } from '@/types';
import { http, isAxiosError, setCookie } from '@/utils';
import { HttpStatusCode } from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body) {
      return NextResponse.json(
        { result: false, message: 'Body is required' },
        { status: HttpStatusCode.BadRequest }
      );
    }

    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { result: false, message: 'All fields are required' },
        { status: HttpStatusCode.BadRequest }
      );
    }

    const res = await http.post<LoginResType>(apiConfig.auth.token, {
      body: { ...body, grant_type: process.env.GRANT_TYPE },
      options: {
        headers: {
          Authorization: getBasicAuthHeader()
        }
      }
    });

    const accessToken = res.access_token;
    const refreshToken = res.refresh_token;
    const userKind = res.user_kind;
    const csrfToken = generateCsrfToken();

    await Promise.all([
      setCookie(
        storageKeys.ACCESS_TOKEN,
        accessToken,
        makeCookieOption(ACCESS_TOKEN_MAX_AGE)
      ),
      setCookie(
        storageKeys.REFRESH_TOKEN,
        refreshToken,
        makeCookieOption(REFRESH_TOKEN_MAX_AGE)
      ),
      setCookie(
        storageKeys.USER_KIND,
        String(userKind),
        makeCookieOption(ACCESS_TOKEN_MAX_AGE)
      ),
      setCookie(
        storageKeys.CSRF_TOKEN,
        csrfToken,
        makeCookieOption(CSRF_TOKEN_MAX_AGE)
      )
    ]);

    return NextResponse.json({ result: true, data: res });
  } catch (error) {
    if (isAxiosError(error)) {
      const response = error.response?.data;

      logger.error('[LOGIN_ERROR]', response);

      if (response) {
        return NextResponse.json(
          { result: false, ...response },
          { status: error.response?.status }
        );
      }

      return NextResponse.json(
        { result: false, message: 'Login failed' },
        { status: error.response?.status }
      );
    }

    logger.error('[LOGIN_ERROR]', error);

    return NextResponse.json(
      { result: false, message: 'Login failed' },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
