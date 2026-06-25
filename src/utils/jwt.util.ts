import { logger } from '@/logger';
import { JwtType } from '@/types';
import { jwtDecode } from 'jwt-decode';

/**
 * @param token The JWT token to decode
 */
export const decodeJwt = (token: string): JwtType | null => {
  try {
    return jwtDecode(token);
  } catch (error) {
    logger.error('[JWT_DECODE_ERROR]', error);
  }
  return null;
};

/**
 * @param token The JWT token to check for expiration
 */
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;

  const payload = decodeJwt(token);
  if (!payload || !payload.exp) return true;

  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
};

/**
 * @param token The JWT token to check
 * @param thresholdMinutes The number of minutes before expiration to consider "expiring soon"
 */
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
