import { apiConfig, storageKeys } from '@/constants';
import { logger } from '@/logger';
import { ApiResponse } from '@/types';
import { http, isAxiosError, removeCookie } from '@/utils';
import { HttpStatusCode } from 'axios';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    try {
      const res = await http.post<ApiResponse<any>>(apiConfig.auth.logout);
      if (res.result) {
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
      }
    } catch (e) {
      logger.error('[LOGOUT_BACKEND_ERROR]', e);
    }
  } catch (error) {
    if (isAxiosError(error)) {
      const response = error.response?.data;

      logger.error('[LOGOUT_ERROR]', response);

      if (response) {
        return new NextResponse(
          JSON.stringify({ result: false, ...response }, null, 2),
          {
            status: error.response?.status,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }

      return new NextResponse(
        JSON.stringify({ result: false, message: 'Logout failed' }, null, 2),
        {
          status: error.response?.status,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    logger.error('[LOGOUT_ERROR]', error);

    return new NextResponse(
      JSON.stringify({ result: false, message: 'Logout failed' }, null, 2),
      {
        status: HttpStatusCode.InternalServerError,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
