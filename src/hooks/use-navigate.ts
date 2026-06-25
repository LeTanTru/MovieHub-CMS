import { useRouter } from 'next/navigation';
import { useTopLoader } from 'nextjs-toploader';

/**
 * Hook to wrap router navigation with top progress loader support.
 *
 * @param startLoader - Whether to start the top progress loader when navigating (defaults to true).
 */
export const useNavigate = (startLoader: boolean = true) => {
  const router = useRouter();
  const loading = useTopLoader();

  const startLoading = () => {
    if (startLoader) loading.start();
  };

  const push = (path: string) => {
    startLoading();
    router.push(path);
  };

  const replace = (path: string) => {
    startLoading();
    router.replace(path);
  };

  const prefetch = (path: string) => {
    router.prefetch(path);
  };

  const back = () => {
    startLoading();
    router.back();
  };

  const forward = () => {
    startLoading();
    router.forward();
  };

  const refresh = () => {
    startLoading();
    router.refresh();
  };

  return { push, replace, prefetch, back, forward, refresh };
};
