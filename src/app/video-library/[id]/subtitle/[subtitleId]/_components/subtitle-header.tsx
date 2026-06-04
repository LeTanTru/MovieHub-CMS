'use client';

import { Button, ToolTip } from '@/components/form';
import { SubtitleType, VideoLibrarySubtitleResType } from '@/types';
import { serializeVttContent } from '@/utils';
import { Download } from 'lucide-react';

type SubtitleHeaderProps = {
  subtitles: SubtitleType[];
  videoSubtitle: VideoLibrarySubtitleResType;
};

export function SubtitleHeader({
  subtitles,
  videoSubtitle
}: SubtitleHeaderProps) {
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
    a.download = `${videoSubtitle.language || 'subtitle'}.vtt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  };

  return (
    <div className='flex shrink-0 items-center justify-between border-b border-gray-200 px-2 py-1'>
      <div className='flex items-center gap-2'>
        <span className='font-semibold tracking-widest uppercase'>Phụ đề</span>
        <span className='rounded-full bg-slate-800 px-2 py-0.5 text-xs font-medium text-white tabular-nums'>
          {subtitles.length} phân đoạn
        </span>
      </div>

      <ToolTip title={`Xuất file phụ đề ${videoSubtitle.label}`} side='bottom'>
        <Button
          onClick={handleExport}
          disabled={!canExport}
          variant='ghost'
          className='p-0! hover:bg-transparent'
        >
          <Download
            size={16}
            className='transition-all duration-200 ease-linear hover:text-gray-400'
          />
        </Button>
      </ToolTip>
    </div>
  );
}
