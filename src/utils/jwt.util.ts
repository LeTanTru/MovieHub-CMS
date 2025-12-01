import { logger } from '@/logger';
import { jwtDecode } from 'jwt-decode';

export const decodeJwt = (
  token: string
): { exp: number; authorities: string[] } | null => {
  try {
    return jwtDecode(token);
  } catch (error) {
    logger.error('Failed to decode JWT:', error);
  }
  return null;
};

export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;

  const payload = decodeJwt(token);
  if (!payload || !payload.exp) return true;

  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
};

export const isTokenExpiringSoon = (
  token: string | null,
  thresholdMinutes = 15
): boolean => {
  if (!token) return true;

  const payload = decodeJwt(token);
  if (!payload || !payload.exp) return true;

  const now = Math.floor(Date.now() / 1000);
  const threshold = thresholdMinutes * 60;

  return payload.exp < now + threshold;
};
