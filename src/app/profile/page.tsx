import { ProfileForm } from '@/app/profile/_components';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hồ sơ'
};

export default function ProfilePage() {
  return (
    <PageWrapper breadcrumbs={[{ label: 'Hồ sơ' }]}>
      <ListPageWrapper>
        <ProfileForm />
      </ListPageWrapper>
    </PageWrapper>
  );
}
