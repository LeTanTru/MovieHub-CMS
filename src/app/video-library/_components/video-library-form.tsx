'use client';

import {
  Col,
  InputField,
  RichTextField,
  Row,
  SelectField,
  TimePickerField,
  UploadImageField,
  UploadVideoField
} from '@/components/form';
import { BaseForm } from '@/components/form/base-form';
import { PageWrapper } from '@/components/layout';
import { CircleLoading } from '@/components/loading';
import {
  apiConfig,
  ErrorCode,
  STATUS_ACTIVE,
  VIDEO_LIBRARY_SOURCE_TYPE_EXTERNAL,
  VIDEO_LIBRARY_SOURCE_TYPE_INTERNAL,
  videoLibraryErrorMaps,
  videoLibrarySourceTypeOptions
} from '@/constants';
import { useFileUploadManager, useSaveBase } from '@/hooks';
import {
  useDeleteFileMutation,
  useUploadLogoMutation,
  useUploadVideoMutation
} from '@/queries';
import { route } from '@/routes';
import { videoLibrarySchema } from '@/schemaValidations';
import type { VideoLibraryBodyType, VideoLibraryResType } from '@/types';
import {
  renderImageUrl,
  renderListPageUrl,
  renderVideoUrl,
  renderVttUrl,
  timeToSeconds
} from '@/utils';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { VideoPlayer } from '@/components/video-player';
import type { AxiosProgressEvent } from 'axios';
import { logger } from '@/logger';
import { Activity } from '@/components/activity';

export default function VideoLibraryForm({ queryKey }: { queryKey: string }) {
  const { id } = useParams<{ id: string }>();

  const uploadLogoMutation = useUploadLogoMutation();
  const uploadVideoMutation = useUploadVideoMutation();

  const deleteFileMutation = useDeleteFileMutation();

  const {
    data,
    loading,
    isEditing,
    queryString,
    responseCode,
    handleSubmit,
    renderActions
  } = useSaveBase<VideoLibraryResType, VideoLibraryBodyType>({
    apiConfig: apiConfig.videoLibrary,
    options: {
      queryKey,
      objectName: 'video',
      listPageUrl: route.videoLibrary.getList.path,
      pathParams: {
        id
      },
      mode: id === 'create' ? 'create' : 'edit'
    }
  });

  const imageManager = useFileUploadManager({
    initialUrl: data?.thumbnailUrl,
    deleteFileMutation: deleteFileMutation,
    isEditing,
    onOpen: true
  });

  const videoManager = useFileUploadManager({
    initialUrl: data?.content,
    deleteFileMutation: deleteFileMutation,
    isEditing,
    onOpen: true
  });

  const defaultValues: VideoLibraryBodyType = {
    content: '',
    description: '',
    introEnd: 0,
    outroStart: 0,
    introStart: 0,
    name: '',
    status: STATUS_ACTIVE,
    thumbnailUrl: '',
    sourceType: VIDEO_LIBRARY_SOURCE_TYPE_INTERNAL,
    duration: 0,
    vttUrl: ''
  };

  const initialValues: VideoLibraryBodyType = useMemo(() => {
    return {
      content: data?.content ?? '',
      description: data?.description ?? '',
      introEnd: data?.introEnd ?? 0,
      introStart: data?.introStart ?? 0,
      outroStart: data?.outroStart ?? 0,
      duration: data?.duration ?? 0,
      name: data?.name ?? '',
      status: STATUS_ACTIVE,
      thumbnailUrl: data?.thumbnailUrl ?? '',
      sourceType: data?.sourceType ?? VIDEO_LIBRARY_SOURCE_TYPE_INTERNAL,
      vttUrl: data?.vttUrl ?? ''
    };
  }, [data]);

  const handleCancel = async () => {
    await imageManager.handleCancel();
    await videoManager.handleCancel();
  };

  const onSubmit = async (
    values: VideoLibraryBodyType,
    form: UseFormReturn<VideoLibraryBodyType>
  ) => {
    if (values.sourceType === VIDEO_LIBRARY_SOURCE_TYPE_EXTERNAL) {
      const isDurationValid =
        values.duration !== null &&
        values.duration !== undefined &&
        values.duration !== '' &&
        values.duration !== '00:00:00' &&
        values.duration !== 0;

      if (!isDurationValid) {
        form.setError('duration', {
          type: 'manual',
          message: 'Bắt buộc'
        });
        return;
      }
    }

    await imageManager.handleSubmit();
    await videoManager.handleSubmit();

    await handleSubmit(
      {
        ...values,
        introStart:
          timeToSeconds(
            values.introStart ? (values.introStart as string) : '00:00:00'
          ) ?? null,
        introEnd:
          timeToSeconds(
            values.introEnd ? (values.introEnd as string) : '00:00:00'
          ) ?? null,
        outroStart:
          timeToSeconds(
            values.outroStart ? (values.outroStart as string) : '00:00:00'
          ) ?? null,
        duration: values.duration,
        thumbnailUrl: imageManager.currentUrl,
        content: videoManager.currentUrl
      },
      form,
      videoLibraryErrorMaps
    );
  };

  return (
    <PageWrapper
      breadcrumbs={[
        {
          label: 'Thư viện video',
          href: renderListPageUrl(route.videoLibrary.getList.path, queryString)
        },
        { label: `${!isEditing ? 'Thêm mới' : 'Cập nhật'} video` }
      ]}
      notFound={responseCode === ErrorCode.VIDEO_LIBRARY_ERROR_NOT_FOUND}
      notFoundContent={'Không tìm thấy video này'}
    >
      <BaseForm
        onSubmit={onSubmit}
        defaultValues={defaultValues}
        schema={videoLibrarySchema}
        initialValues={initialValues}
      >
        {(form) => {
          const sourceType = form.watch('sourceType');
          const content = form.watch('content');
          const vttUrl = form.watch('vttUrl');
          const duration = form.watch('duration');
          const introStart = form.watch('introStart');
          const introEnd = form.watch('introEnd');
          const outroStart = form.watch('outroStart');

          return (
            <>
              <Row>
                <Col span={24}>
                  <UploadImageField
                    value={renderImageUrl(imageManager.currentUrl)}
                    loading={uploadLogoMutation.isPending}
                    control={form.control}
                    name='thumbnailUrl'
                    onChange={imageManager.trackUpload}
                    size={150}
                    uploadImageFn={async (file: Blob) => {
                      const res = await uploadLogoMutation.mutateAsync({
                        file
                      });
                      return res.data?.filePath ?? '';
                    }}
                    deleteImageFn={imageManager.handleDeleteOnClick}
                    label='Ảnh nền (16:9)'
                    aspect={16 / 9}
                    required
                  />
                </Col>
              </Row>
              <Row>
                <Col>
                  <InputField
                    control={form.control}
                    name='name'
                    label='Tên video'
                    placeholder='Tên video'
                    required
                  />
                </Col>
                <Col>
                  <SelectField
                    control={form.control}
                    name='sourceType'
                    options={videoLibrarySourceTypeOptions}
                    label='Nguồn video'
                    required
                    disabled={isEditing}
                  />
                </Col>
              </Row>

              {/* Always show intro/outro fields for both source types */}
              <Row>
                <Col>
                  <TimePickerField
                    control={form.control}
                    name='introStart'
                    label='Thời gian bắt đầu intro'
                    placeholder='Thời gian bắt đầu intro'
                    onChange={(value) => {
                      const introStartSec = timeToSeconds(
                        (value as string) || '00:00:00'
                      );
                      const introEndSec = timeToSeconds(
                        (introEnd as string) || '00:00:00'
                      );
                      if (introStartSec < introEndSec) {
                        form.clearErrors('introEnd');
                      }
                    }}
                  />
                </Col>
                <Col>
                  <TimePickerField
                    control={form.control}
                    name='introEnd'
                    label='Thời gian kết thúc intro'
                    placeholder='Thời gian kết thúc intro'
                    onChange={(value) => {
                      const introStartSec = timeToSeconds(
                        (introStart as string) || '00:00:00'
                      );
                      const introEndSec = timeToSeconds(
                        (value as string) || '00:00:00'
                      );
                      if (introStartSec < introEndSec) {
                        form.clearErrors('introStart');
                      }
                    }}
                  />
                </Col>
              </Row>
              <Row>
                <Col>
                  <TimePickerField
                    control={form.control}
                    name='outroStart'
                    label='Thời gian bắt đầu outro'
                    placeholder='Thời gian bắt đầu outro'
                    onChange={(value) => {
                      const introEndSec = timeToSeconds(
                        (introEnd as string) || '00:00:00'
                      );
                      const outStartSec = timeToSeconds(
                        (value as string) || '00:00:00'
                      );
                      if (outStartSec > introEndSec) {
                        form.clearErrors('introEnd');
                      }
                    }}
                  />
                </Col>
                <Activity
                  visible={sourceType === VIDEO_LIBRARY_SOURCE_TYPE_EXTERNAL}
                >
                  <Col>
                    <TimePickerField
                      control={form.control}
                      name='duration'
                      label='Thời lượng'
                      placeholder='Thời lượng'
                      required
                    />
                  </Col>
                </Activity>
              </Row>

              {/* Show content, vttUrl, spriteUrl, duration only for EXTERNAL source type */}
              <Activity
                visible={sourceType === VIDEO_LIBRARY_SOURCE_TYPE_EXTERNAL}
              >
                <Row>
                  <Col>
                    <InputField
                      control={form.control}
                      name='content'
                      label='Nhập đường dẫn video'
                      placeholder='Nhập đường dẫn video'
                      required
                      onChange={(e) => {
                        const value = e.target.value;
                        videoManager.trackUpload(value);
                        form.setValue('content', value);
                        if (value) {
                          form.clearErrors('content');
                        }
                      }}
                    />
                  </Col>
                  <Col>
                    <InputField
                      control={form.control}
                      name='vttUrl'
                      label='Đường dẫn VTT (thumbnail preview)'
                      placeholder='Nhập URL file .vtt'
                    />
                  </Col>
                </Row>

                <Row>
                  <Col>
                    <InputField
                      control={form.control}
                      name='spriteUrl'
                      label='Đường dẫn ảnh sprite (sprite url)'
                      placeholder='Đường dẫn ảnh sprite (sprite url)'
                    />
                  </Col>
                </Row>

                {/* Video preview for external source */}
                <Activity visible={!!videoManager.currentUrl || !!content}>
                  <Row>
                    <Col span={24} className='px-0!'>
                      <VideoPlayer
                        auth={false}
                        duration={timeToSeconds(
                          (duration as string) || '00:00:00'
                        )}
                        introEnd={timeToSeconds(
                          (introEnd as string) || '00:00:00'
                        )}
                        introStart={timeToSeconds(
                          (introStart as string) || '00:00:00'
                        )}
                        outroStart={timeToSeconds(
                          (outroStart as string) || '00:00:00'
                        )}
                        source={videoManager.currentUrl || content}
                        thumbnailUrl={imageManager.currentUrl}
                        vttUrl={vttUrl || ''}
                      />
                    </Col>
                  </Row>
                </Activity>
              </Activity>

              {/* Show video player/upload for INTERNAL source type */}
              <Activity
                visible={sourceType === VIDEO_LIBRARY_SOURCE_TYPE_INTERNAL}
              >
                <Row>
                  <Col span={24}>
                    {/* Play preview video */}
                    {isEditing && data ? (
                      <VideoPlayer
                        auth={true}
                        duration={data.duration}
                        introEnd={
                          timeToSeconds((introEnd as string) || '00:00:00') ||
                          data.introEnd
                        }
                        introStart={
                          timeToSeconds((introStart as string) || '00:00:00') ||
                          data.introStart
                        }
                        outroStart={
                          timeToSeconds((outroStart as string) || '00:00:00') ||
                          data.outroStart
                        }
                        source={renderVideoUrl(data.content)}
                        thumbnailUrl={renderImageUrl(data.thumbnailUrl)}
                        vttUrl={renderVttUrl(data.vttUrl)}
                      />
                    ) : (
                      // Upload video
                      <UploadVideoField
                        control={form.control}
                        name='content'
                        label='Video'
                        required
                        onChange={videoManager.trackUpload}
                        uploadVideoFn={async (file: Blob, onProgress) => {
                          const res = await uploadVideoMutation.mutateAsync({
                            file,
                            options: {
                              onUploadProgress: (e: AxiosProgressEvent) => {
                                const percent = Math.round(
                                  (e.loaded * 100) / (e.total ?? 1)
                                );
                                logger.info(`Upload video: ${percent}%`);
                                onProgress(percent);
                              }
                            }
                          });
                          return res.data?.filePath ?? '';
                        }}
                        deleteImageFn={videoManager.handleDeleteOnClick}
                      />
                    )}
                  </Col>
                </Row>
              </Activity>

              <Row>
                <Col span={24}>
                  <RichTextField
                    control={form.control}
                    name='description'
                    label='Mô tả'
                    placeholder='Mô tả'
                    required
                  />
                </Col>
              </Row>

              <>
                {renderActions(form, {
                  onCancel: handleCancel
                })}
              </>
              <Activity visible={loading}>
                <div className='absolute inset-0 bg-white/80'>
                  <CircleLoading className='stroke-dodger-blue mt-20 size-8' />
                </div>
              </Activity>
            </>
          );
        }}
      </BaseForm>
    </PageWrapper>
  );
}
