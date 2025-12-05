'use client';

import VideoPlayModal from './video-play-modal';
import { ImageField } from '@/components/form';
import { useDisclosure } from '@/hooks';
import { Column, VideoLibraryResType } from '@/types';
import { convertUTCToLocal, renderImageUrl } from '@/utils';
import { AiOutlinePlayCircle } from 'react-icons/ai';
import {
  VIDEO_LIBRARY_SOURCE_TYPE_EXTERNAL,
  VIDEO_LIBRARY_SOURCE_TYPE_INTERNAL
} from '@/constants';

type ActionCondition<T> = boolean | ((record: T) => boolean);

export default function VideoCard<T extends { id: string }>({
  video,
  renderActionColumn
}: {
  video: VideoLibraryResType;
  renderActionColumn: (options?: {
    actions?: Record<'edit' | 'delete' | string, ActionCondition<T>>;
    buttonProps?: Record<string, any>;
    columnProps?: Record<string, any>;
  }) => Column<T>;
}) {
  const playModal = useDisclosure(false);

  const handleOpenPlayModal = () => {
    playModal.open();
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0)
      return `${h}:${m.toString().padStart(2, '0')}:${s
        .toString()
        .padStart(2, '0')}`;

    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const sourceTypeLabel = (type: number) => {
    switch (type) {
      case VIDEO_LIBRARY_SOURCE_TYPE_INTERNAL:
        return 'Tải lên';
      case VIDEO_LIBRARY_SOURCE_TYPE_EXTERNAL:
        return 'Bên ngoài';
      default:
        return 'Unknown';
    }
  };

  return (
    <>
      <div className='rounded-lg border p-4 shadow transition-all duration-200 ease-linear hover:-translate-y-1.5 hover:shadow-lg'>
        <ImageField
          src={renderImageUrl(video.thumbnailUrl)}
          aspect={16 / 9}
          hoverIcon={AiOutlinePlayCircle}
          disablePreview
          onClick={handleOpenPlayModal}
        />

        <div className='mt-2'>
          <h3 className='line-clamp-2 text-base font-semibold'>{video.name}</h3>

          <div className='space-y-1 text-sm text-gray-600'>
            <div>
              <span className='font-semibold'>Thời lượng:</span>{' '}
              {formatDuration(video.duration)}
            </div>

            <div>
              <span className='font-semibold'>Ngày tạo:</span>{' '}
              {convertUTCToLocal(video.createdDate)}
            </div>

            <div>
              <span className='font-semibold'>Nguồn:</span>{' '}
              {sourceTypeLabel(video.sourceType)}
            </div>
          </div>
        </div>
      </div>

      <VideoPlayModal
        open={playModal.opened}
        close={playModal.close}
        video={video}
      />
    </>
  );
}
