import { apiConfig } from '@/constants';
import { logger } from '@/logger';
import { LoginResType } from '@/types';
import { http, isAxiosError } from '@/utils';
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
          Authorization: `Basic ${btoa(`${process.env.APP_USERNAME}:${process.env.APP_PASSWORD}`)}`
        }
      }
    });

    return NextResponse.json({
      result: true,
      data: res
    });
  } catch (error) {
    if (isAxiosError(error)) {
      const response = error.response?.data;

      logger.error('[LOGIN_ERROR]', response);

      if (response) {
        return NextResponse.json(
          {
            result: false,
            ...response
          },
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
