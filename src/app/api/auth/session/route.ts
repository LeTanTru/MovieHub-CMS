import { CSRF_TOKEN_MAX_AGE, storageKeys } from '@/constants';
import { generateCsrfToken } from '../_lib/generate-csrf-token';
import { getCookie, setCookie } from '@/utils';
import { makeCookieOption } from '../_lib/make-cookie-option';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [accessToken, userKind] = await Promise.all([
    getCookie(storageKeys.ACCESS_TOKEN),
    getCookie(storageKeys.USER_KIND)
  ]);

  let csrfToken = await getCookie(storageKeys.CSRF_TOKEN);
  if (!csrfToken) {
    csrfToken = generateCsrfToken();
    await setCookie(
      storageKeys.CSRF_TOKEN,
      csrfToken,
      makeCookieOption(CSRF_TOKEN_MAX_AGE)
    );
  }

  return new NextResponse(
    JSON.stringify(
      {
        result: true,
        data: {
          accessToken,
          userKind,
          csrfToken
        }
      },
      null,
      2
    ),
    {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    }
  );
}
