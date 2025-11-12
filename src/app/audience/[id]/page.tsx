import { AudienceForm } from '@/app/audience/_components';
import { queryKeys } from '@/constants';

export default function AudienceSavePage() {
  return <AudienceForm queryKey={queryKeys.AUDIENCE} />;
}
