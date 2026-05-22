'use client';

import './video-play-modal.css';
import { Modal } from '@/components/modal';
import dynamic from 'next/dynamic';

const VideoPlayer = dynamic(
  () => import('@/components/video-player').then((mod) => mod.VideoPlayer),
  { ssr: false }
);

import type { VideoLibraryResType } from '@/types';
import { useAuthStore } from '@/store';
import {
  isMobileDevice,
  isTabletDevice,
  renderImageUrl,
  renderVideoUrl,
  renderVttUrl
} from '@/utils';
import { VIDEO_LIBRARY_SOURCE_TYPE_INTERNAL } from '@/constants';
import { envConfig } from '@/config';

type VideoPlayModalProps = {
  video: VideoLibraryResType;
  open: boolean;
  onClose: () => void;
};

export function VideoPlayModal({ open, video, onClose }: VideoPlayModalProps) {
  const accessToken = useAuthStore((s) => s.accessToken);

  return (
    <Modal
      open={open}
      onClose={onClose}
      className='video-play-modal top-1/2 left-1/2 m-0 w-auto -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-transparent shadow-none'
      aria-labelledby='video-play-modal-title'
      confirmOnClose
    >
      <Modal.Body className='overflow-hidden'>
        <VideoPlayer
          auth={video.sourceType === VIDEO_LIBRARY_SOURCE_TYPE_INTERNAL}
          duration={video.duration}
          introEnd={video.introEnd}
          introStart={video.introStart}
          src={renderVideoUrl(video.hostname, video.content, video.sourceType)}
          thumbnailUrl={renderImageUrl(video.thumbnailUrl)}
          vttUrl={renderVttUrl(video.hostname, video.vttUrl, video.sourceType)}
          outroStart={video.outroStart}
          token={accessToken || ''}
          volume={
            envConfig.NEXT_PUBLIC_NODE_ENV === 'development'
              ? 0
              : isMobileDevice() || isTabletDevice()
                ? 1
                : 0.5
          }
        />
      </Modal.Body>
      <Modal.Confirm message='Bạn có chắc chắn muốn hủy không ?' />
    </Modal>
  );
}
