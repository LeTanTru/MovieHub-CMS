'use client';

import { useRouter } from 'next/navigation';
import { useTopLoader } from 'nextjs-toploader';

const useNavigate = (startLoader: boolean = true) => {
  const router = useRouter();
  const loading = useTopLoader();

  const navigate = (path: string) => {
    router.push(path);
    if (startLoader) loading.start();
  };

  return navigate;
};

export default useNavigate;
