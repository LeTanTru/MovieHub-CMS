'use client';

import { emptyData } from '@/assets';
import { NotFound } from '@/components/not-found';
import { useVideoLibrarySubtitleStore } from '@/store';
import {
  SubtitleType,
  VideoLibraryResType,
  VideoLibrarySubtitleResType
} from '@/types';
import { parseVttContent, renderVttUrl } from '@/utils';
import { useCallback, useEffect, useRef } from 'react';
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
  const { currentTime, subtitles, setSelectedSubtitleId, setSubtitles } =
    useVideoLibrarySubtitleStore(
      useShallow((s) => ({
        currentTime: s.currentTime,
        subtitles: s.subtitles,
        setSelectedSubtitleId: s.setSelectedSubtitleId,
        setSubtitles: s.setSubtitles
      }))
    );

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

      <div
        ref={parentRef}
        className='relative flex-1 overflow-y-auto [scrollbar-color:var(--color-zinc-300)_transparent] [scrollbar-width:thin]'
      >
        {subtitles.length === 0 ? (
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
    </div>
  );
}
