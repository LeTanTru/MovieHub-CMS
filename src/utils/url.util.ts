import { AppConstants, VIDEO_LIBRARY_SOURCE_TYPE_EXTERNAL } from '@/constants';
import { route } from '@/routes';

export const renderListPageUrl = (path: string, queryString?: string) => {
  if (queryString) {
    return `${path}?${queryString}`;
  }
  return path;
};

export const generatePath = (
  template: string,
  params: Record<string, string | number>
) => {
  return template.replace(/:([a-zA-Z0-9_]+)/g, (_, key) => {
    if (params[key] === undefined) {
      throw new Error(`Missing parameter "${key}" for path "${template}"`);
    }
    return encodeURIComponent(params[key]);
  });
};

export const renderVideoUrl = (
  hostname: string,
  url: string,
  sourceType: number
) => {
  if (!hostname || !url) return '';

  if (sourceType === VIDEO_LIBRARY_SOURCE_TYPE_EXTERNAL) return url;

  if (hostname.startsWith('https'))
    return `${hostname}/v1/file/download-video-resource${url}`;

  return `https://${hostname}/v1/file/download-video-resource${url}`;
};

export const renderImageUrl = (url: string | undefined | null) => {
  if (!url) return '';
  return url.startsWith('https') ? url : `${AppConstants.contentRootUrl}${url}`;
};

export const renderVttUrl = (
  hostname: string,
  url: string,
  sourceType: number
) => {
  if (!hostname || !url) return '';

  if (sourceType === VIDEO_LIBRARY_SOURCE_TYPE_EXTERNAL) return url;

  if (hostname.startsWith('https'))
    return `${hostname}/v1/file/public-download${url}`;

  return `https://${hostname}/v1/file/public-download${url}`;
};

export const renderFileUrl = (url: string, isPublic?: boolean) => {
  if (!url) return '';

  return url.startsWith('https')
    ? url
    : `${isPublic ? AppConstants.publicContentUrl : AppConstants.contentRootUrl}${url}`;
};

export const isSafeInternalPath = (path: unknown): path is string => {
  if (typeof path !== 'string' || !path.startsWith('/')) return false;
  if (path.startsWith('//')) return false;
  if (/^(javascript|data|vbscript):/i.test(path)) return false;
  return true;
};

export const buildLoginRedirectPath = (
  pathname: string,
  queryString?: string
) => {
  if (
    !pathname ||
    pathname === route.home.path ||
    pathname === route.login.path
  ) {
    return route.login.path;
  }

  const redirectPath = queryString
    ? `${pathname}?${queryString.startsWith('?') ? queryString.slice(1) : queryString}`
    : pathname;
  const params = new URLSearchParams({ redirect: redirectPath });
  return `${route.login.path}?${params.toString()}`;
};

export const renderVideoLibraryUploadUrl = (hostname: string, path: string) => {
  const normalizedHostname = hostname.startsWith('http')
    ? hostname
    : `https://${hostname}`;

  return `${normalizedHostname}${path}`;
};
