import { AppConstants } from '@/constants';

export function renderListPageUrl(path: string, queryString: string) {
  if (queryString) {
    return `${path}?${queryString}`;
  }
  return path;
}

export function generatePath(
  template: string,
  params: Record<string, string | number>
) {
  return template.replace(/:([a-zA-Z0-9_]+)/g, (_, key) => {
    if (params[key] === undefined) {
      throw new Error(`Missing parameter "${key}" for path "${template}"`);
    }
    return encodeURIComponent(params[key]);
  });
}

export function renderVideoUrl(host: string, url?: string) {
  if (!url) return '';
  return url.startsWith('https')
    ? url
    : `https://${host}/v1/file/download-video-resource${url}`;
}

export const renderImageUrl = (url: string | undefined | null) => {
  if (!url) return '';
  return url.startsWith('https') ? url : `${AppConstants.contentRootUrl}${url}`;
};

export const renderVttUrl = (host: string, url?: string) => {
  if (!url) return '';
  return url.startsWith('https')
    ? url
    : `https://${host}/v1/file/public-download${url}`;
};

export const renderFileUrl = (url?: string) => {
  if (!url) return '';
  return url.startsWith('https') ? url : `${AppConstants.contentRootUrl}${url}`;
};
