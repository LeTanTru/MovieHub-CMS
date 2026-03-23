import envConfig from '@/config';

const authApiUrl = envConfig.NEXT_PUBLIC_AUTH_API_URL;
const apiUrl = envConfig.NEXT_PUBLIC_API_URL;
const mediaUrl = envConfig.NEXT_PUBLIC_API_MEDIA_URL;

const AppConstants = {
  authApiUrl: `${authApiUrl}`,
  apiUrl: `${apiUrl}`,
  mediaUrl: `${mediaUrl}`,
  contentRootUrl: `${mediaUrl}/v1/file/download`,
  publicContentUrl: `${mediaUrl}/v1/file/public-download`,
  videoRootUrl: `${mediaUrl}/v1/file/download-video-resource`
};

export default AppConstants;
