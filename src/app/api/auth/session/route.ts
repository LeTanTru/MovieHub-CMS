import { storageKeys } from '@/constants';
import { getCookieData } from '@/utils';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const accessTokenCookie = await getCookieData(storageKeys.ACCESS_TOKEN);
  const userKindCookie = await getCookieData(storageKeys.USER_KIND);

  return NextResponse.json({
    result: true,
    data: {
      accessToken: accessTokenCookie?.value || null,
      userKind: userKindCookie?.value || null
    }
  });
}
