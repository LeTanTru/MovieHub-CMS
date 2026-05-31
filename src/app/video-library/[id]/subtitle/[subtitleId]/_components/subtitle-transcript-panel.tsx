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
  const parentRef = useRef<HTMLDivElement | null>(null);

  const { subtitles, setSubtitles } = useVideoLibrarySubtitleStore(
    useShallow((s) => ({
      setSubtitles: s.setSubtitles,
      subtitles: s.subtitles
    }))
  );

  const rowVirtualizer = useVirtualizer({
    count: subtitles.length,
    getScrollElement: () => parentRef.current,
    getItemKey: (index) => subtitles[index].id,
    estimateSize: () => 180,
    overscan: 8
  });

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
    const newSubtitle = [...subtitles];

    const targetIndex = newSubtitle.findIndex(
      (sub) => sub.id === targetSubtitle.id
    );
    if (targetIndex === -1) return;

    newSubtitle[targetIndex].text = e.target.value;
    setSubtitles(newSubtitle);
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
            {rowVirtualizer.getVirtualItems().map((row) => (
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
                  className='rounded-md bg-white p-2 shadow-[0_0_4px_1px_rgba(0,0,0,0.1)]'
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
                      <span>{subtitles[row.index].start.trim()}</span>
                      <div className='h-px flex-1 bg-zinc-400'></div>
                      <span>{subtitles[row.index].end.trim()}</span>
                    </div>
                  </div>

                  <textarea
                    className='focus-visible:ring-main-color w-full resize-none rounded-md border bg-transparent p-1 text-sm text-zinc-700 transition-all duration-200 ease-linear outline-none focus-visible:ring-2'
                    value={subtitles[row.index].text}
                    rows={4}
                    onChange={(e) =>
                      handleVttContentChange(e, subtitles[row.index])
                    }
                    spellCheck={false}
                  />
                </m.div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
