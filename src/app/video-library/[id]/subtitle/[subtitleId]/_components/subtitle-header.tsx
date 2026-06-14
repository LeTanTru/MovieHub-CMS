'use client';

import { Button, ToolTip } from '@/components/form';
import { Separator } from '@/components/ui/separator';
import { useVideoLibrarySubtitleStore } from '@/store';
import { SubtitleType, VideoLibrarySubtitleResType } from '@/types';
import { notify, serializeVttContent } from '@/utils';
import { useUploadSubtitleMutation } from '@/queries';
import { Download, Loader2, Plus, Upload } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';

type SubtitleHeaderProps = {
  subtitles: SubtitleType[];
  videoSubtitle: VideoLibrarySubtitleResType;
};

export function SubtitleHeader({
  subtitles,
  videoSubtitle
}: SubtitleHeaderProps) {
  const { id: videoId } = useParams<{ id: string }>();

  const requestSubtitleFormState = useVideoLibrarySubtitleStore(
    useShallow((s) => s.requestSubtitleFormState)
  );

  const { mutateAsync: uploadSubtitleMutate, isPending: isUploading } =
    useUploadSubtitleMutation();

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

  const handleAddSubtitle = () => {
    requestSubtitleFormState({ mode: 'create' });
  };

  const handleUpload = () => {
    if (!canExport) return;

    const content = serializeVttContent(subtitles);
    const file = new File([content], `${videoSubtitle.language}.vtt`, {
      type: 'text/vtt'
    });

    uploadSubtitleMutate(
      { file, videoId },
      {
        onSuccess: () => {
          notify.success('Tải lên file phụ đề thành công');
        },
        onError: () => {
          notify.error('Tải lên file phụ đề thất bại');
        }
      }
    );
  };

  return (
    <div className='flex shrink-0 items-center justify-between border-b border-gray-200 px-2 py-1'>
      <div className='flex items-center gap-2'>
        <span className='font-semibold tracking-widest uppercase'>Phụ đề</span>
        <span className='rounded-full bg-slate-800 px-2 py-0.5 text-xs font-medium text-white tabular-nums'>
          {subtitles.length} phân đoạn
        </span>
      </div>

      <div className='flex items-center gap-2'>
        <ToolTip title='Thêm dòng phụ đề mới' side='bottom'>
          <Button
            variant='ghost'
            className='p-0! hover:bg-transparent'
            disabled={isUploading}
            onClick={handleAddSubtitle}
          >
            <Plus
              size={16}
              className='transition-all duration-200 ease-linear hover:text-gray-400'
            />
          </Button>
        </ToolTip>

        <Separator className='h-4! w-px!' />

        <ToolTip title='Lưu phụ đề lên server' side='bottom'>
          <Button
            variant='ghost'
            className='p-0! hover:bg-transparent'
            disabled={!canExport || isUploading}
            onClick={handleUpload}
          >
            {isUploading ? (
              <Loader2 size={16} className='animate-spin' />
            ) : (
              <Upload
                size={16}
                className='transition-all duration-200 ease-linear hover:text-gray-400'
              />
            )}
          </Button>
        </ToolTip>

        <Separator className='h-4! w-px!' />

        <ToolTip
          title={`Xuất file phụ đề ${videoSubtitle.label}`}
          side='bottom'
        >
          <Button
            onClick={handleExport}
            disabled={!canExport || isUploading}
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
    </div>
  );
}
