'use server';

import { cookies } from 'next/headers';

export async function getCookiesServer() {
  const cookieStore = await cookies();
  return {
    sessionToken: cookieStore.get('sessionToken')?.value || '',
    tenantId: cookieStore.get('X-Tenant-Id')?.value || ''
  };
}
