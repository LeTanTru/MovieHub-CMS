'use client';

import { useVideoLibrarySubtitleStore } from '@/store';
import { VideoLibraryResType, VideoLibrarySubtitleResType } from '@/types';
import { parseVttContent, renderVttUrl } from '@/utils';
import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';

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
  const { subtitles, setSubtitles } = useVideoLibrarySubtitleStore(
    useShallow((s) => ({
      setSubtitles: s.setSubtitles,
      subtitles: s.subtitles
    }))
  );

  useEffect(() => {
    const getVttContent = async () => {
      const res = await fetch(
        renderVttUrl(
          videoLibrary.hostname,
          subtitle?.fileUrl,
          videoLibrary.sourceType
        )
      );

      const content = await res.text();

      setSubtitles(parseVttContent(content));
    };

    getVttContent();
  }, [
    setSubtitles,
    subtitle?.fileUrl,
    videoLibrary.hostname,
    videoLibrary.sourceType
  ]);

  return (
    <div
      className='flex flex-col overflow-hidden border-l border-zinc-200 bg-zinc-50'
      style={height ? { height } : undefined}
    >
      <div className='flex shrink-0 items-center justify-between border-b border-zinc-200 px-3 py-2'>
        <span className='text-[11px] font-semibold tracking-widest text-zinc-400 uppercase'>
          Phụ đề
        </span>
        <span className='rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-medium text-zinc-500 tabular-nums'>
          {subtitles.length} phân đoạn
        </span>
      </div>

      <div className='flex h-full flex-col overflow-y-auto [scrollbar-color:var(--color-zinc-300)_transparent] [scrollbar-width:thin]'>
        {subtitles.length === 0 ? (
          <div className='flex flex-1 items-center justify-center text-[12px] text-zinc-400'>
            Không có phụ đề
          </div>
        ) : (
          subtitles.map((subtitle, idx) => (
            <div
              key={subtitle.id}
              className='border-b border-zinc-100 px-3 py-2.5 transition-colors duration-100 hover:bg-white'
            >
              <div className='mb-1.5 flex items-center gap-2'>
                <span className='flex h-4 w-5 shrink-0 items-center justify-center rounded-sm bg-zinc-200 text-xs font-bold text-zinc-500 tabular-nums'>
                  {idx + 1}
                </span>
                <div className='flex items-center gap-1 font-mono text-zinc-400'>
                  <span>{subtitle.start.trim()}</span>
                  <span className='text-zinc-300'></span>
                  <span>{subtitle.end.trim()}</span>
                </div>
              </div>

              <p className='leading-snug text-zinc-700'>{subtitle.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
