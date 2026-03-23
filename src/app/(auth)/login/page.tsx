import { LoginForm } from '@/app/(auth)/login/_components';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Đăng nhập'
};

export default function LoginPage() {
  return <LoginForm />;
}
