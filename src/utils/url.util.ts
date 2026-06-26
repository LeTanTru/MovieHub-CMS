import { AppConstants, VIDEO_LIBRARY_SOURCE_TYPE_EXTERNAL } from '@/constants';
import { route } from '@/routes';

/**
 * @param path The base path
 * @param queryString The optional query string to append
 */
export const renderListPageUrl = (path: string, queryString?: string) => {
  if (queryString) {
    return `${path}?${queryString}`;
  }
  return path;
};

/**
 * @param template The route template containing path parameters
 * @param params The values to substitute into the template
 */
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

/**
 * @param hostname The server hostname
 * @param url The relative URL path
 * @param sourceType The source type of the video
 */
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

/**
 * @param url The relative image URL path
 */
export const renderImageUrl = (url: string | undefined | null) => {
  if (!url) return '';
  return url.startsWith('https') ? url : `${AppConstants.contentRootUrl}${url}`;
};

/**
 * @param hostname The server hostname
 * @param url The relative URL path
 * @param sourceType The source type of the video
 */
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

/**
 * @param url The file URL
 * @param isPublic Whether it is a public file
 */
export const renderFileUrl = (url: string, isPublic?: boolean) => {
  if (!url) return '';

  return url.startsWith('https')
    ? url
    : `${isPublic ? AppConstants.publicContentUrl : AppConstants.contentRootUrl}${url}`;
};

/**
 * @param path The path to validate
 */
export const isSafeInternalPath = (path: unknown): path is string => {
  if (typeof path !== 'string' || !path.startsWith('/')) return false;
  if (path.startsWith('//')) return false;
  if (/^(javascript|data|vbscript):/i.test(path)) return false;
  return true;
};

/**
 * @param pathname The pathname to redirect to after login
 * @param queryString The query string to persist after login
 */
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

/**
 * @param hostname The upload server hostname
 * @param path The upload endpoint path
 */
export const renderVideoLibraryUploadUrl = (hostname: string, path: string) => {
  const normalizedHostname = hostname.startsWith('http')
    ? hostname
    : `https://${hostname}`;

  return `${normalizedHostname}${path}`;
};
