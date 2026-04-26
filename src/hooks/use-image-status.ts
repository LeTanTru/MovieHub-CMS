import { useEffect, useState } from 'react';

type ImageStatus = 'loading' | 'loaded' | 'error';

type UseImageStatusReturn = {
  status: ImageStatus;
  isLoading: boolean;
  isLoaded: boolean;
  isError: boolean;
};

const useImageStatus = (src?: string): UseImageStatusReturn => {
  const [status, setStatus] = useState<ImageStatus>('loading');

  useEffect(() => {
    if (!src) {
      setStatus('error');
      return;
    }

    setStatus('loading');

    const img = new Image();

    const handleLoad = () => {
      setStatus('loaded');
    };

    const handleError = () => {
      setStatus('error');
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);

    img.src = src;

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
      img.src = '';
    };
  }, [src]);

  return {
    status,
    isLoading: status === 'loading',
    isLoaded: status === 'loaded',
    isError: status === 'error'
  };
};

export default useImageStatus;
