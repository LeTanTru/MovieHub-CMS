import { apiConfig, storageKeys } from '@/constants';
import { logger } from '@/logger';
import { http, removeCookie } from '@/utils';
import { HttpStatusCode } from 'axios';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    try {
      await http.post(apiConfig.auth.logout);
    } catch (e) {
      logger.error('[LOGOUT_BACKEND_ERROR]', e);
    }

    await Promise.all([
      removeCookie(storageKeys.ACCESS_TOKEN),
      removeCookie(storageKeys.REFRESH_TOKEN),
      removeCookie(storageKeys.USER_KIND),
      removeCookie(storageKeys.CSRF_TOKEN)
    ]);

    return new NextResponse(
      JSON.stringify(
        { result: true, message: 'Logged out successfully' },
        null,
        2
      ),
      {
        status: HttpStatusCode.Ok,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    logger.error('[LOGOUT_ERROR]', error);
    return new NextResponse(
      JSON.stringify({ result: false, message: 'Logout failed' }, null, 2),
      {
        status: HttpStatusCode.InternalServerError,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
