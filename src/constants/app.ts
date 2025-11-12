import envConfig from '@/config';

const metaApiUrl = envConfig.NEXT_PUBLIC_API_META_ENDPOINT_URL;
const tenantApiUrl = envConfig.NEXT_PUBLIC_API_TENANT_ENDPOINT_URL;
const mediaUrl = envConfig.NEXT_PUBLIC_API_MEDIA_URL;

const AppConstants = {
  metaApiUrl: `${metaApiUrl}`,
  tenantApiUrl: `${tenantApiUrl}`,
  mediaUrl: `${mediaUrl}`,
  contentRootUrl: `${mediaUrl}/v1/file/download`,
  publicContentUrl: `${mediaUrl}/v1/file/public-download`
};

export default AppConstants;
