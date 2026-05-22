import { apiConfig, storageKeys } from '@/constants';
import { logger } from '@/logger';
import { ApiResponseNoData } from '@/types';
import { http, isAxiosError, removeCookie } from '@/utils';
import { HttpStatusCode } from 'axios';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    try {
      const res = await http.post<ApiResponseNoData>(apiConfig.auth.logout);
      if (res.result) {
        await Promise.all([
          removeCookie(storageKeys.ACCESS_TOKEN),
          removeCookie(storageKeys.REFRESH_TOKEN),
          removeCookie(storageKeys.USER_KIND),
          removeCookie(storageKeys.CSRF_TOKEN)
        ]);

        return NextResponse.json(
          { result: true, message: 'Logged out successfully' },
          { status: HttpStatusCode.Ok }
        );
      }
    } catch (e) {
      logger.error('[LOGOUT_BACKEND_ERROR]', e);
    }
  } catch (error) {
    if (isAxiosError(error)) {
      const response = error.response?.data;

      logger.error('[LOGOUT_ERROR]', response);

      if (response) {
        return NextResponse.json(
          { result: false, ...response },
          { status: error.response?.status }
        );
      }

      return NextResponse.json(
        { result: false, message: 'Logout failed' },
        { status: error.response?.status }
      );
    }

    logger.error('[LOGOUT_ERROR]', error);

    return NextResponse.json(
      { result: false, message: 'Logout failed' },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
