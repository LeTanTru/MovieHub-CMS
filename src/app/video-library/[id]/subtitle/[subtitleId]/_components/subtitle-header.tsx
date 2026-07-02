'use client';

import { Button, ToolTip } from '@/components/form';
import { ConfirmModal } from '@/components/modal';
import { Separator } from '@/components/ui/separator';
import { useVideoLibrarySubtitleStore } from '@/store';
import { SubtitleType, VideoLibrarySubtitleResType } from '@/types';
import { invalidateQueries, notify, serializeVttContent } from '@/utils';
import { useUploadSubtitleMutation } from '@/queries';
import { Download, Loader2, Plus, Save } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';
import { useValidatePermission } from '@/hooks';
import { apiConfig, queryKeys } from '@/constants';

type SubtitleHeaderProps = {
  subtitles: SubtitleType[];
  videoSubtitle: VideoLibrarySubtitleResType;
};

export function SubtitleHeader({
  subtitles,
  videoSubtitle
}: SubtitleHeaderProps) {
  const { id: videoId } = useParams<{ id: string }>();
  const hasPermission = useValidatePermission();

  const {
    originalSubtitles,
    videoLibraryHostname,
    requestSubtitleFormState,
    setOriginalSubtitles
  } = useVideoLibrarySubtitleStore(
    useShallow((s) => ({
      originalSubtitles: s.originalSubtitles,
      videoLibraryHostname: s.videoLibraryHostname,
      requestSubtitleFormState: s.requestSubtitleFormState,
      setOriginalSubtitles: s.setOriginalSubtitles
    }))
  );

  const { mutate: uploadSubtitle, isPending } = useUploadSubtitleMutation();

  const canExport = subtitles.some(
    (subtitle) =>
      Number.isFinite(subtitle.startTime) &&
      Number.isFinite(subtitle.endTime) &&
      subtitle.endTime > subtitle.startTime
  );

  const canUpload = hasPermission({
    requiredPermissions: [apiConfig.file.uploadSubtitle.permissionCode]
  });

  const isSubtitleContentChanged =
    serializeVttContent(subtitles) !== serializeVttContent(originalSubtitles);

  const disabledSave =
    !canExport ||
    !videoLibraryHostname ||
    !isSubtitleContentChanged ||
    isPending;

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
    if (!canExport || !videoLibraryHostname) return;

    const content = serializeVttContent(subtitles);
    const file = new File([content], `${videoSubtitle.language}.vtt`, {
      type: 'text/vtt'
    });

    uploadSubtitle(
      { file, videoId, videoLibraryHostname },
      {
        onSuccess: () => {
          setOriginalSubtitles(subtitles);
          invalidateQueries([queryKeys.VIDEO_LIBRARY_SUBTITLE_CONTENT]);
          notify.success('Lưu phụ đề thành công');
        },
        onError: () => {
          notify.error('Lưu phụ đề thất bại');
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
        <ToolTip title='Thêm' side='bottom'>
          <Button
            variant='ghost'
            className='text-sporty-blue p-0! hover:bg-transparent'
            disabled={isPending}
            onClick={handleAddSubtitle}
          >
            <Plus
              size={16}
              className='transition-all duration-200 ease-linear hover:text-gray-400'
            />
          </Button>
        </ToolTip>

        <Separator className='h-4! w-px!' />

        {canUpload && (
          <>
            <ConfirmModal
              message='Bạn có chắc chắn muốn lưu phụ đề không ?'
              onConfirm={handleUpload}
              loading={isPending}
              trigger={
                <Button
                  variant='ghost'
                  className='text-sporty-blue p-0! hover:bg-transparent'
                  disabled={disabledSave}
                >
                  {isPending ? (
                    <Loader2 size={16} className='animate-spin' />
                  ) : (
                    <Save
                      size={16}
                      className='transition-all duration-200 ease-linear hover:text-gray-400'
                    />
                  )}
                </Button>
              }
            />

            <Separator className='h-4! w-px!' />
          </>
        )}

        <ToolTip title='Tải xuống' side='bottom'>
          <Button
            onClick={handleExport}
            disabled={!canExport || isPending}
            variant='ghost'
            className='text-sporty-blue p-0! hover:bg-transparent'
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
