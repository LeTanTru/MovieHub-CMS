import { notFound } from '@/assets';
import { route } from '@/routes';
import Image from 'next/image';
import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <>
      <div className='mx-auto flex min-h-[80vh] max-w-[1320px] flex-col items-center justify-center bg-white'>
        <Image
          src={notFound.src}
          width={400}
          height={100}
          alt='Không tìm thấy trang'
        />
        <span className='mt-4 text-base font-medium'>Không tìm thấy trang</span>
        <Link
          className='text-dodger-blue mt-4 text-base transition-all duration-200 ease-linear hover:opacity-70'
          href={route.home.path}
        >
          Quay về trang chủ
        </Link>
      </div>
    </>
  );
}
