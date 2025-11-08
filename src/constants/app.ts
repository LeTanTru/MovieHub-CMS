import envConfig from '@/config';

const apiUrl = envConfig.NEXT_PUBLIC_API_ENDPOINT_URL;
const mediaUrl = envConfig.NEXT_PUBLIC_API_MEDIA_URL;

const AppConstants = {
  apiUrl: `${apiUrl}`,
  mediaUrl: `${mediaUrl}`,
  contentRootUrl: `${mediaUrl}/v1/file/download`
};

export default AppConstants;
