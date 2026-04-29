type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'unknown';

const MOBILE_REGEX = /mobile|iphone|ipod|android.*mobile|windows phone/i;
const TABLET_REGEX = /ipad|tablet|playbook|silk|android(?!.*mobile)/i;

const getUserAgent = (userAgent?: string): string => {
  if (userAgent) return userAgent;
  if (typeof navigator === 'undefined') return '';
  return navigator.userAgent;
};

export const isMobileDevice = (userAgent?: string): boolean => {
  const ua = getUserAgent(userAgent);
  if (!ua) return false;
  return MOBILE_REGEX.test(ua);
};

export const isTabletDevice = (userAgent?: string): boolean => {
  const ua = getUserAgent(userAgent);
  if (!ua) return false;
  return TABLET_REGEX.test(ua);
};

export const isDesktopDevice = (userAgent?: string): boolean => {
  const ua = getUserAgent(userAgent);
  if (!ua) return false;
  return !isMobileDevice(ua) && !isTabletDevice(ua);
};

export const getDeviceType = (userAgent?: string): DeviceType => {
  const ua = getUserAgent(userAgent);
  if (!ua) return 'unknown';
  if (isMobileDevice(ua)) return 'mobile';
  if (isTabletDevice(ua)) return 'tablet';
  return 'desktop';
};
