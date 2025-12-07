export default function ReviewItemSkeleton() {
  return (
    <div className='flex h-30 w-full items-start space-x-3 rounded-md border p-3 transition hover:bg-gray-50'>
      <div className='skeleton h-10 w-10 rounded-full!'></div>
      <div className='flex-1'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-x-2'>
            <h4 className='flex items-center gap-x-2 font-medium text-gray-800'>
              <div className='skeleton h-5 w-30 font-semibold'></div>
              <div className='skeleton h-5 w-5'></div>
              <div className='skeleton h-5 w-20'></div>
              <div className='skeleton h-5 w-10'></div>
              <div className='skeleton h-5 w-5'></div>
            </h4>
          </div>
          <div className='skeleton mr-2 h-5 w-5'></div>
        </div>
        <p className='skeleton mt-4 h-5 w-100 text-gray-700'></p>

        <div className='mt-4 flex items-center gap-x-4 text-sm text-gray-500'>
          <div className='skeleton h-5 w-10'></div>
          <div className='skeleton h-5 w-10'></div>
          <div className='skeleton h-5 w-10'></div>
          <div className='skeleton h-5 w-10'></div>
          <div className='skeleton h-5 w-10'></div>
        </div>
      </div>
    </div>
  );
}
