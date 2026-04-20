'use client';

import './video-play-modal.css';
import { Modal } from '@/components/modal';
import { VideoPlayer } from '@/components/video-player';
import type { VideoLibraryResType } from '@/types';
import {
  getAccessTokenFromLocalStorage,
  isMobileDevice,
  isTabletDevice,
  renderImageUrl,
  renderVideoUrl,
  renderVttUrl
} from '@/utils';
import { VIDEO_LIBRARY_SOURCE_TYPE_INTERNAL } from '@/constants';
import { useEffect, useRef, useState } from 'react';
import envConfig from '@/config';

type VideoPlayModalProps = {
  video: VideoLibraryResType;
  open: boolean;
  onClose: () => void;
};

export default function VideoPlayModal({
  open,
  video,
  onClose
}: VideoPlayModalProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [bodyHeight, setBodyHeight] = useState<number>(0);

  useEffect(() => {
    if (!open || !bodyRef.current) return;

    const updateHeight = () => {
      if (bodyRef.current) {
        const height = bodyRef.current.clientHeight;
        setBodyHeight(height);
      }
    };

    const timeoutId = setTimeout(updateHeight, 100);

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(bodyRef.current);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [open]);

  useEffect(() => {
    if (open && bodyRef.current) {
      const timer = setTimeout(() => {
        const videoPlayer = bodyRef.current?.querySelector('.video-player');
        if (videoPlayer instanceof HTMLElement) {
          videoPlayer.focus();
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      className='video-play-modal overflow-hidden'
      aria-labelledby='video-play-modal-title'
      confirmOnClose
    >
      <Modal.Header>{video.name}</Modal.Header>
      <Modal.Body ref={bodyRef}>
        <div
          style={
            {
              height: '100%',
              '--player-height': `${bodyHeight}px`,
              '--media-height': `${bodyHeight}px`
            } as React.CSSProperties
          }
          className='p-4'
        >
          <VideoPlayer
            auth={video.sourceType === VIDEO_LIBRARY_SOURCE_TYPE_INTERNAL}
            duration={video.duration}
            introEnd={video.introEnd}
            introStart={video.introStart}
            src={renderVideoUrl(
              video.hostname,
              video.content,
              video.sourceType
            )}
            thumbnailUrl={renderImageUrl(video.thumbnailUrl)}
            vttUrl={renderVttUrl(
              video.hostname,
              video.vttUrl,
              video.sourceType
            )}
            outroStart={video.outroStart}
            token={getAccessTokenFromLocalStorage() || ''}
            title={video.name}
            volume={
              envConfig.NEXT_PUBLIC_NODE_ENV === 'development'
                ? 0
                : isMobileDevice() || isTabletDevice()
                  ? 1
                  : 0.5
            }
          />
        </div>
      </Modal.Body>
      <Modal.Confirm message='Bạn có chắc chắn muốn hủy không ?' />
    </Modal>
  );
}
