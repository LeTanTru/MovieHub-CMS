import Image from 'next/image';

export default function NotFound({
  title,
  icon,
  width = 200,
  height = 200
}: {
  title: string;
  icon: string;
  width?: number;
  height?: number;
}) {
  return (
    <div className='mx-2 flex h-[calc(90dvh-6rem)] flex-col items-center justify-center rounded-lg bg-white max-[1560px]:h-[calc(90dvh-115px)]'>
      <Image src={icon} alt={title} width={width} height={height} />
      <span className='mt-4 text-center text-base font-medium'>{title}</span>
    </div>
  );
}
