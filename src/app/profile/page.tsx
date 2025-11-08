import ProfileForm from '@/app/profile/profile-form';
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
