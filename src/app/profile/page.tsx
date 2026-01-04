import { ProfileForm } from '@/app/profile/_components';
import { ListPageWrapper, PageWrapper } from '@/components/layout';

export default function ProfilePage() {
  return (
    <PageWrapper breadcrumbs={[{ label: 'Hồ sơ' }]}>
      <ListPageWrapper>
        <ProfileForm />
      </ListPageWrapper>
    </PageWrapper>
  );
}
