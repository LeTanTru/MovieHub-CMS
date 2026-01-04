'use client';

import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/audio.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { Modal } from '@/components/modal';
import { VideoPlayer } from '@/components/video-player';
import { VideoLibraryResType } from '@/types';
import { renderImageUrl, renderVideoUrl, renderVttUrl } from '@/utils';
import { VIDEO_LIBRARY_SOURCE_TYPE_INTERNAL } from '@/constants';

export default function VideoPlayModal({
  open,
  video,
  onClose
}: {
  video: VideoLibraryResType;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      title={video.name}
      open={open}
      onClose={onClose}
      className='[&_.content]:top-0 [&_.content]:h-fit'
      width={1200}
      aria-labelledby='video-modal-title'
    >
      <div className='p-4'>
        <VideoPlayer
          auth={video.sourceType === VIDEO_LIBRARY_SOURCE_TYPE_INTERNAL}
          duration={video.duration}
          introEnd={video.introEnd}
          introStart={video.introStart}
          source={renderVideoUrl(video.content)}
          thumbnailUrl={renderImageUrl(video.thumbnailUrl)}
          vttUrl={renderVttUrl(video.vttUrl)}
          outroStart={video.outroStart}
        />
      </div>
    </Modal>
  );
}
