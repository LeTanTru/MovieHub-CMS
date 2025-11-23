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

export function renderVideoUrl(url?: string) {
  if (!url) return '';
  return url.startsWith('https') ? url : `${AppConstants.videoRootUrl}/${url}`;
}

export const renderImageUrl = (url: string | undefined | null) => {
  if (!url) return '';
  return url.startsWith('https') ? url : `${AppConstants.contentRootUrl}${url}`;
};

export const renderVttUrl = (url: string | undefined | null) => {
  if (!url) return '';
  return url.startsWith('https')
    ? url
    : `${AppConstants.publicContentUrl}${url}`;
};

export const renderFileUrl = (url: string | undefined | null) => {
  if (!url) return '';
  return url.startsWith('https') ? url : `${AppConstants.contentRootUrl}${url}`;
};
