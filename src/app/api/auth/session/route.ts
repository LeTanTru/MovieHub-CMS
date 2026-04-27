import { storageKeys } from '@/constants';
import { getCookie } from '@/utils';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const accessToken = await getCookie(storageKeys.ACCESS_TOKEN);
  const userKind = await getCookie(storageKeys.USER_KIND);

  return NextResponse.json({
    result: true,
    data: {
      accessToken,
      userKind
    }
  });
}
