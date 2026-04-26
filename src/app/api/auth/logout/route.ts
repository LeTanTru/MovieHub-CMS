import { apiConfig, storageKeys } from '@/constants';
import { logger } from '@/logger';
import {
  http,
  removeAccessTokenFromCookie,
  removeCookieData,
  removeRefreshTokenFromCookie
} from '@/utils';
import { HttpStatusCode } from 'axios';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    try {
      await http.post(apiConfig.auth.logout);
    } catch (e) {
      logger.error('[LOGOUT_BACKEND_ERROR]', e);
    }

    await removeAccessTokenFromCookie();
    await removeRefreshTokenFromCookie();
    await removeCookieData(storageKeys.USER_KIND);

    return NextResponse.json(
      {
        result: true,
        message: 'Logged out successfully'
      },
      { status: HttpStatusCode.Ok }
    );
  } catch (error) {
    logger.error('[LOGOUT_ERROR]', error);
    return NextResponse.json(
      { result: false, message: 'Logout failed' },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
