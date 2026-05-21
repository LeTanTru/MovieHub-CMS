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
      return new NextResponse(
        JSON.stringify({ result: false, message: 'Body is required' }, null, 2),
        {
          status: HttpStatusCode.BadRequest,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { username, password } = body;

    if (!username || !password) {
      return new NextResponse(
        JSON.stringify(
          { result: false, message: 'All fields are required' },
          null,
          2
        ),
        {
          status: HttpStatusCode.BadRequest,
          headers: { 'Content-Type': 'application/json' }
        }
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

    return new NextResponse(
      JSON.stringify({ result: true, data: res }, null, 2),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    if (isAxiosError(error)) {
      const response = error.response?.data;

      logger.error('[LOGIN_ERROR]', response);

      if (response) {
        return new NextResponse(
          JSON.stringify({ result: false, ...response }, null, 2),
          {
            status: error.response?.status,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      return new NextResponse(
        JSON.stringify({ result: false, message: 'Login failed' }, null, 2),
        {
          status: error.response?.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    logger.error('[LOGIN_ERROR]', error);

    return new NextResponse(
      JSON.stringify({ result: false, message: 'Login failed' }, null, 2),
      {
        status: HttpStatusCode.InternalServerError,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
