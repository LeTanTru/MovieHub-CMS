'use client';

import { emptyData } from '@/assets';
import { NotFound } from '@/components/not-found';
import { useVideoLibrarySubtitleStore } from '@/store';
import { VideoLibraryResType, VideoLibrarySubtitleResType } from '@/types';
import { parseVttContent, renderVttUrl, serializeVttContent } from '@/utils';
import { useCallback, useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  elementScroll,
  useVirtualizer,
  VirtualizerOptions
} from '@tanstack/react-virtual';
import { Button, ToolTip } from '@/components/form';
import { logger } from '@/logger';
import { Download } from 'lucide-react';
import { useClickOutside } from '@/hooks';
import { SubtitleList } from './subtitle-list';

type SubtitleTranscriptPanelProps = {
  height?: number;
  videoLibrary: VideoLibraryResType;
  subtitle: VideoLibrarySubtitleResType;
};

function easeInOutQuint(t: number) {
  return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
}

export function SubtitleTranscriptPanel({
  height,
  videoLibrary,
  subtitle
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
    estimateSize: () => 180,
    overscan: 8,
    scrollToFn
  });

  useEffect(() => {
    const activeIndex = subtitles.findIndex(
      (s) => s.startTime <= currentTime && currentTime < s.endTime
    );

    if (activeIndex !== -1 && activeIndex !== activeIndexRef.current) {
      activeIndexRef.current = activeIndex;
      rowVirtualizer.scrollToIndex(activeIndex, { align: 'center' });
    }
  }, [currentTime, subtitles, rowVirtualizer]);

  useEffect(() => {
    const controller = new AbortController();

    const getVttContent = async () => {
      try {
        const res = await fetch(
          renderVttUrl(
            videoLibrary.hostname,
            subtitle.fileUrl,
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
    subtitle.fileUrl,
    videoLibrary.hostname,
    videoLibrary.sourceType
  ]);

  const canExport = subtitles.some(
    (subtitle) =>
      Number.isFinite(subtitle.startTime) &&
      Number.isFinite(subtitle.endTime) &&
      subtitle.endTime > subtitle.startTime
  );

  const handleExport = () => {
    if (!canExport) return;

    const content = serializeVttContent(subtitles);

    const blob = new Blob([content], { type: 'text/vtt' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${subtitle.language || 'subtitle'}.vtt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  };

  return (
    <div
      className='flex h-full flex-col overflow-hidden border-l border-gray-200 bg-gray-50'
      style={height ? { height } : undefined}
    >
      <div className='flex shrink-0 items-center justify-between border-b border-gray-200 p-1'>
        <div className='flex items-center gap-2'>
          <span className='font-semibold tracking-widest uppercase'>
            Phụ đề
          </span>
          <span className='rounded-full bg-slate-800 px-2 py-0.5 text-xs font-medium text-white tabular-nums'>
            {subtitles.length} phân đoạn
          </span>
        </div>

        <ToolTip title={`Xuất file phụ đề ${subtitle.label}`} side='bottom'>
          <Button
            onClick={handleExport}
            disabled={!canExport}
            variant='ghost'
            className='hover:bg-transparent'
          >
            <Download
              size={16}
              className='transition-all duration-200 ease-linear hover:text-gray-400'
            />
          </Button>
        </ToolTip>
      </div>

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
