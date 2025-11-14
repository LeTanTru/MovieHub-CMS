import { AppConstants } from '@/constants';

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
