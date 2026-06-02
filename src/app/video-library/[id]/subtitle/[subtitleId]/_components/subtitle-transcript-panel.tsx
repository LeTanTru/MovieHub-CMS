'use client';

import { emptyData } from '@/assets';
import { NotFound } from '@/components/not-found';
import { CircleLoading } from '@/components/loading';
import { useVideoLibrarySubtitleStore } from '@/store';
import {
  SubtitleType,
  VideoLibraryResType,
  VideoLibrarySubtitleResType
} from '@/types';
import { parseVttContent, renderVttUrl } from '@/utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  elementScroll,
  useVirtualizer,
  VirtualizerOptions
} from '@tanstack/react-virtual';
import { logger } from '@/logger';
import { useClickOutside } from '@/hooks';
import { SubtitleList } from './subtitle-list';
import { SubtitleHeader } from './subtitle-header';

type SubtitleTranscriptPanelProps = {
  height?: number;
  videoLibrary: VideoLibraryResType;
  videoSubtitle: VideoLibrarySubtitleResType;
};

function easeInOutQuint(t: number) {
  return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
}

function getNearestSubtitleIndex(
  subtitles: SubtitleType[],
  currentTime: number
) {
  if (subtitles.length === 0) return -1;

  let nearestIndex = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;

  subtitles.forEach((subtitle, index) => {
    const distance =
      currentTime < subtitle.startTime
        ? subtitle.startTime - currentTime
        : currentTime - subtitle.endTime;

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  });

  return nearestIndex;
}

export function SubtitleTranscriptPanel({
  height,
  videoLibrary,
  videoSubtitle
}: SubtitleTranscriptPanelProps) {
  const {
    currentTime,
    subtitles,
    setSelectedSubtitleId,
    setSubtitles,
    isSeeking
  } = useVideoLibrarySubtitleStore(
    useShallow((s) => ({
      currentTime: s.currentTime,
      subtitles: s.subtitles,
      setSelectedSubtitleId: s.setSelectedSubtitleId,
      setSubtitles: s.setSubtitles,
      isSeeking: s.isSeeking
    }))
  );

  const [isLoading, setIsLoading] = useState(true);

  const parentRef = useClickOutside<HTMLDivElement>(() =>
    setSelectedSubtitleId(null)
  );

  const scrollingRef = useRef<number>(-1);

  const activeIndexRef = useRef<number>(-1);

  const scrollToFn: VirtualizerOptions<HTMLDivElement, Element>['scrollToFn'] =
    useCallback(
      (offset, canSmooth, instance) => {
        const duration = 500;
        const start = parentRef.current?.scrollTop || 0;
        const startTime = (scrollingRef.current = Date.now());

        const run = () => {
          if (scrollingRef.current !== startTime) return;
          const now = Date.now();
          const elapsed = now - startTime;
          const progress = easeInOutQuint(Math.min(elapsed / duration, 1));
          const interpolated = start + (offset - start) * progress;

          if (elapsed < duration) {
            elementScroll(interpolated, canSmooth, instance);
            requestAnimationFrame(run);
          } else {
            elementScroll(interpolated, canSmooth, instance);
          }
        };

        requestAnimationFrame(run);
      },
      [parentRef]
    );

  const rowVirtualizer = useVirtualizer({
    count: subtitles.length,
    getScrollElement: () => parentRef.current,
    getItemKey: (index) => subtitles[index].id,
    estimateSize: () => 150,
    overscan: 50,
    scrollToFn
  });

  useEffect(() => {
    const activeIndex = subtitles.findIndex(
      (s) => s.startTime <= currentTime && currentTime < s.endTime
    );
    const targetIndex =
      activeIndex === -1
        ? getNearestSubtitleIndex(subtitles, currentTime)
        : activeIndex;

    if (targetIndex !== -1 && targetIndex !== activeIndexRef.current) {
      activeIndexRef.current = targetIndex;
      rowVirtualizer.scrollToIndex(targetIndex, { align: 'center' });
    }
  }, [currentTime, subtitles, rowVirtualizer]);

  useEffect(() => {
    const controller = new AbortController();

    const getVttContent = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          renderVttUrl(
            videoLibrary.hostname,
            videoSubtitle.fileUrl,
            videoLibrary.sourceType
          ),
          { signal: controller.signal }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch VTT content: ${res.status}`);
        }

        const content = await res.text();

        setSelectedSubtitleId(null);
        setSubtitles(parseVttContent(content));
      } catch (error) {
        if (controller.signal.aborted) return;

        logger.error('[GET_VTT_CONTENT_ERROR]', error);

        setSelectedSubtitleId(null);
        setSubtitles([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    getVttContent();

    return () => {
      controller.abort();
    };
  }, [
    setSubtitles,
    setSelectedSubtitleId,
    videoSubtitle.fileUrl,
    videoLibrary.hostname,
    videoLibrary.sourceType
  ]);

  return (
    <div
      className='flex h-full flex-col overflow-hidden border-l border-gray-200 bg-gray-50'
      style={height ? { height } : undefined}
    >
      <SubtitleHeader subtitles={subtitles} videoSubtitle={videoSubtitle} />

      <div className='relative flex-1 overflow-hidden'>
        <div
          ref={parentRef}
          className='h-full overflow-y-auto [scrollbar-color:var(--color-zinc-300)_transparent] [scrollbar-width:thin]'
        >
          {isLoading ? (
            <div className='flex h-full items-center justify-center'>
              <CircleLoading className='stroke-main-color' />
            </div>
          ) : subtitles.length === 0 ? (
            <div className='flex h-full items-center justify-center'>
              <NotFound
                width={150}
                title='Không có phụ đề'
                icon={emptyData.src}
                className='m-0'
              />
            </div>
          ) : (
            <SubtitleList rowVirtualizer={rowVirtualizer} />
          )}
        </div>

        {isSeeking && !isLoading && (
          <div className='absolute inset-0 z-10 flex items-center justify-center bg-gray-50/50 backdrop-blur-[1px]'>
            <CircleLoading className='stroke-main-color' />
          </div>
        )}
      </div>
    </div>
  );
}
