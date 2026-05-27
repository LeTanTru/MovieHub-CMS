import { refreshSession } from '../_lib/refresh-session';
import { logger } from '@/logger';
import { isAxiosError } from '@/utils';
import { HttpStatusCode } from 'axios';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const session = await refreshSession();

    if (!session) {
      return NextResponse.json(
        { result: false, message: 'Refresh token is required' },
        { status: HttpStatusCode.BadRequest }
      );
    }

    return NextResponse.json(
      { result: true, data: session.response },
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
