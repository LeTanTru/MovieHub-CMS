import { envConfig } from '@/config';
import {
  ACCESS_TOKEN_MAX_AGE,
  apiConfig,
  CSRF_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
  storageKeys,
  USER_KIND_MAX_AGE
} from '@/constants';
import type { RefreshTokenResType, SessionResType } from '@/types';
import { getCookie, setCookie } from '@/utils';
import axios from 'axios';
import { generateCsrfToken } from './generate-csrf-token';
import { getBasicAuthHeader } from './auth';
import { makeCookieOption } from './make-cookie-option';

const TIME_OUT = 10000;

type RefreshedSession = {
  response: RefreshTokenResType & { csrfToken: string };
  session: SessionResType;
};

export async function refreshSession(): Promise<RefreshedSession | null> {
  const refreshToken = await getCookie(storageKeys.REFRESH_TOKEN);

  if (!refreshToken) {
    return null;
  }

  const { data: response } = await axios.post<RefreshTokenResType>(
    apiConfig.auth.refreshToken.baseUrl,
    {
      refresh_token: refreshToken,
      grant_type: process.env.GRANT_TYPE_REFRESH_TOKEN
    },
    {
      headers: {
        ...apiConfig.auth.refreshToken.headers,
        Authorization: getBasicAuthHeader(),
        [storageKeys.X_CLIENT_TYPE]: envConfig.NEXT_PUBLIC_CLIENT_TYPE
      },
      timeout: TIME_OUT
    }
  );

  const csrfToken = generateCsrfToken();
  const userKind = response.user_kind as number;
  const session: SessionResType = {
    accessToken: response.access_token,
    csrfToken,
    userKind
  };

  await Promise.all([
    setCookie(
      storageKeys.ACCESS_TOKEN,
      response.access_token,
      makeCookieOption(response.expires_in || ACCESS_TOKEN_MAX_AGE)
    ),
    setCookie(
      storageKeys.REFRESH_TOKEN,
      response.refresh_token,
      makeCookieOption(REFRESH_TOKEN_MAX_AGE)
    ),
    setCookie(
      storageKeys.USER_KIND,
      String(userKind),
      makeCookieOption(USER_KIND_MAX_AGE)
    ),
    setCookie(
      storageKeys.CSRF_TOKEN,
      csrfToken,
      makeCookieOption(CSRF_TOKEN_MAX_AGE)
    )
  ]);

  return {
    response: { ...response, csrfToken },
    session
  };
}
