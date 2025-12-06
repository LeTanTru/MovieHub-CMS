import { Separator } from '@/components/ui/separator';
import { route } from '@/routes';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className='bg-neutral-200 px-12.5 py-4 text-center text-sm text-black/88'>
      <strong>CMS</strong> - © Copyright {new Date().getFullYear()}. Tất cả bản
      quyền đã được bảo lưu.
      <div className='mt-1 flex items-center justify-center gap-x-2'>
        <Link
          href={route.contact.path}
          className='font-semibold text-slate-800 transition-all duration-200 ease-linear hover:opacity-80'
        >
          Liên hệ
        </Link>
        <Separator orientation='vertical' className='h-4! w-px! bg-gray-500!' />
        <Link
          href={route.contact.path}
          className='font-semibold text-slate-800 transition-all duration-200 ease-linear hover:opacity-80'
        >
          Chính sách và bảo mật
        </Link>
      </div>
    </footer>
  );
}
