'use client';

import { emptyData } from '@/assets';
import { NotFound } from '@/components/not-found';
import { useVideoLibrarySubtitleStore } from '@/store';
import {
  SubtitleType,
  VideoLibraryResType,
  VideoLibrarySubtitleResType
} from '@/types';
import { parseVttContent, renderVttUrl, serializeVttContent } from '@/utils';
import { ChangeEvent, useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { m } from 'framer-motion';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Button, ToolTip } from '@/components/form';
import { logger } from '@/logger';
import { Download } from 'lucide-react';
import { useClickOutside } from '@/hooks';
import { cn } from '@/lib';

type SubtitleTranscriptPanelProps = {
  height?: number;
  videoLibrary: VideoLibraryResType;
  subtitle: VideoLibrarySubtitleResType;
};

export function SubtitleTranscriptPanel({
  height,
  videoLibrary,
  subtitle
}: SubtitleTranscriptPanelProps) {
  const {
    currentTime,
    subtitles,
    setSelectedSubtitleId,
    setSubtitles,
    updateSubtitle
  } = useVideoLibrarySubtitleStore(
    useShallow((s) => ({
      currentTime: s.currentTime,
      subtitles: s.subtitles,
      setSelectedSubtitleId: s.setSelectedSubtitleId,
      setSubtitles: s.setSubtitles,
      updateSubtitle: s.updateSubtitle
    }))
  );

  const parentRef = useClickOutside<HTMLDivElement>(() =>
    setSelectedSubtitleId(undefined)
  );

  const previousActiveIndexRef = useRef<number | null>(null);

  const activeIndex = subtitles.findIndex(
    (subtitle) =>
      subtitle.startTime <= currentTime && currentTime < subtitle.endTime
  );

  const rowVirtualizer = useVirtualizer({
    count: subtitles.length,
    getScrollElement: () => parentRef.current,
    getItemKey: (index) => subtitles[index].id,
    estimateSize: () => 180,
    overscan: 8
  });

  useEffect(() => {
    if (activeIndex < 0 || activeIndex === previousActiveIndexRef.current) {
      return;
    }

    previousActiveIndexRef.current = activeIndex;

    const activeElement = document.activeElement;
    const isEditingInsidePanel =
      activeElement instanceof Element &&
      parentRef.current?.contains(activeElement) &&
      activeElement.matches('input, textarea');

    if (isEditingInsidePanel) return;

    const offset = rowVirtualizer.getOffsetForIndex(activeIndex, 'center')?.[0];

    if (typeof offset !== 'number') return;

    parentRef.current?.scrollTo({
      top: offset,
      behavior: 'smooth'
    });
  }, [activeIndex, rowVirtualizer, parentRef]);

  useEffect(() => {
    let isActive = true;

    const getVttContent = async () => {
      try {
        const res = await fetch(
          renderVttUrl(
            videoLibrary.hostname,
            subtitle.fileUrl,
            videoLibrary.sourceType
          )
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch VTT content: ${res.status}`);
        }

        const content = await res.text();

        if (isActive) {
          setSubtitles(parseVttContent(content), { resetHistory: true });
        }
      } catch (error) {
        logger.error('[GET_VTT_CONTENT_ERROR]', error);

        if (isActive) {
          setSubtitles([], { resetHistory: true });
        }
      }
    };

    getVttContent();

    return () => {
      isActive = false;
    };
  }, [
    setSubtitles,
    subtitle.fileUrl,
    videoLibrary.hostname,
    videoLibrary.sourceType
  ]);

  const handleVttContentChange = (
    e: ChangeEvent<HTMLTextAreaElement>,
    targetSubtitle: SubtitleType
  ) => {
    setSelectedSubtitleId(targetSubtitle.id);
    updateSubtitle(targetSubtitle.id, { text: e.target.value });
  };

  const handleExport = () => {
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
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative'
            }}
          >
            {rowVirtualizer.getVirtualItems().map((row) => {
              const subtitle = subtitles[row.index];
              const isActive =
                subtitle.startTime <= currentTime &&
                currentTime < subtitle.endTime;

              return (
                <div
                  key={row.key}
                  data-index={row.index}
                  ref={rowVirtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${row.start}px)`,
                    padding: '8px'
                  }}
                >
                  <m.div
                    className={cn(
                      'rounded-md p-2 shadow-[0_0_4px_1px_rgba(0,0,0,0.1)] transition-colors duration-200 ease-linear',
                      {
                        'ring-main-color ring-2': isActive
                      }
                    )}
                    whileHover={{
                      translateY: -2,
                      boxShadow: '0 0 6px 1px rgba(0,0,0,0.15)'
                    }}
                    transition={{
                      duration: 0.2,
                      ease: 'linear'
                    }}
                  >
                    <div className='mb-1.5 flex items-center gap-2'>
                      <span className='flex h-5 min-w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white'>
                        {row.index + 1}
                      </span>
                      <div className='flex w-full items-center gap-1 text-xs'>
                        <span>{subtitle.start.trim()}</span>
                        <div className='h-px flex-1 bg-zinc-400'></div>
                        <span>{subtitle.end.trim()}</span>
                      </div>
                    </div>

                    <textarea
                      className='w-full resize-none rounded-md border border-gray-200 bg-transparent p-1 text-sm transition-all duration-200 ease-linear outline-none focus-visible:border-gray-200'
                      value={subtitle.text}
                      rows={4}
                      onFocus={() => setSelectedSubtitleId(subtitle.id)}
                      onChange={(e) => handleVttContentChange(e, subtitle)}
                      spellCheck={false}
                    />
                  </m.div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
