import { NextRequest, NextResponse } from 'next/server';
import { storageKeys } from '@/constants';

export const validateCsrfToken = (request: NextRequest): boolean => {
  const headerToken = request.headers.get(storageKeys.X_CSRF_TOKEN);
  const cookieToken = request.cookies.get(storageKeys.CSRF_TOKEN)?.value;

  if (!headerToken || !cookieToken) {
    return false;
  }

  return headerToken === cookieToken;
};

export const csrfErrorResponse = () => {
  return NextResponse.json(
    { result: false, message: 'CSRF token validation failed' },
    { status: 403 }
  );
};
