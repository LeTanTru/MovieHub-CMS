import { CSRF_TOKEN_MAX_AGE, storageKeys } from '@/constants';
import { generateCsrfToken } from '../_lib/generate-csrf-token';
import { refreshSession } from '../_lib/refresh-session';
import { logger } from '@/logger';
import { getCookie, isAxiosError, removeCookie, setCookie } from '@/utils';
import { makeCookieOption } from '../_lib/make-cookie-option';
import { HttpStatusCode } from 'axios';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [storedAccessToken, storedUserKind, refreshToken] = await Promise.all([
    getCookie(storageKeys.ACCESS_TOKEN),
    getCookie(storageKeys.USER_KIND),
    getCookie(storageKeys.REFRESH_TOKEN)
  ]);
  let accessToken = storedAccessToken;
  let userKind = storedUserKind;

  let csrfToken = await getCookie(storageKeys.CSRF_TOKEN);

  if ((!accessToken || !userKind) && refreshToken) {
    try {
      const refreshedSession = await refreshSession();

      if (refreshedSession) {
        accessToken = refreshedSession.session.accessToken;
        userKind = String(refreshedSession.session.userKind);
        csrfToken = refreshedSession.session.csrfToken;
      }
    } catch (error) {
      if (isAxiosError(error)) {
        logger.error('[SESSION_REFRESH_ERROR]', error.response?.data);

        if (
          error.response?.status === HttpStatusCode.BadRequest ||
          error.response?.status === HttpStatusCode.Unauthorized ||
          error.response?.status === HttpStatusCode.Forbidden
        ) {
          await Promise.all([
            removeCookie(storageKeys.ACCESS_TOKEN),
            removeCookie(storageKeys.REFRESH_TOKEN),
            removeCookie(storageKeys.USER_KIND),
            removeCookie(storageKeys.CSRF_TOKEN)
          ]);
        }
      } else {
        logger.error('[SESSION_REFRESH_ERROR]', error);
      }

      accessToken = null;
      userKind = null;
      csrfToken = null;
    }
  }

  if (!csrfToken) {
    csrfToken = generateCsrfToken();
    await setCookie(
      storageKeys.CSRF_TOKEN,
      csrfToken,
      makeCookieOption(CSRF_TOKEN_MAX_AGE)
    );
  }

  return NextResponse.json(
    {
      result: true,
      data: {
        accessToken,
        userKind: userKind !== null ? Number(userKind) : null,
        csrfToken
      }
    },
    {
      headers: {
        'Cache-Control': 'no-store'
      }
    }
  );
}
