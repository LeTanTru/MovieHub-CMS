import { StyleForm } from '@/app/style/_components';
import { queryKeys } from '@/constants';

export default function StyleSavePage() {
  return <StyleForm queryKey={queryKeys.STYLE} />;
}
