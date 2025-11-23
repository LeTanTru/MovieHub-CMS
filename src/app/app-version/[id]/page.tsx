import { AppVersionForm } from '@/app/app-version/_components';
import { queryKeys } from '@/constants';

export default function AppVersionSavePage() {
  return <AppVersionForm queryKey={queryKeys.APP_VERSION} />;
}
