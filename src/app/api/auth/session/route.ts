import { storageKeys } from '@/constants';
import { getCookie } from '@/utils';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [accessToken, userKind] = await Promise.all([
    getCookie(storageKeys.ACCESS_TOKEN),
    getCookie(storageKeys.USER_KIND)
  ]);

  return NextResponse.json({
    result: true,
    data: {
      accessToken,
      userKind
    }
  });
}
