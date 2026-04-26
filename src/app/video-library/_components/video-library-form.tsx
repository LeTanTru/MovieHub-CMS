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
  queryKeys,
  STATUS_ACTIVE,
  VIDEO_LIBRARY_SOURCE_TYPE_EXTERNAL,
  VIDEO_LIBRARY_SOURCE_TYPE_INTERNAL,
  videoLibraryErrorMaps,
  videoLibrarySourceTypeOptions
} from '@/constants';
import { useAuthStore } from '@/store';
import { useChunkUpload, useFileUploadManager, useSaveBase } from '@/hooks';
import { useDeleteFileMutation, useUploadLogoMutation } from '@/queries';
import { route } from '@/routes';
import { videoLibrarySchema } from '@/schemaValidations';
import type { VideoLibraryBodyType, VideoLibraryResType } from '@/types';
import {
  isMobileDevice,
  isTabletDevice,
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
import envConfig from '@/config';

export default function VideoLibraryForm() {
  const { id } = useParams<{ id: string }>();
  const accessToken = useAuthStore((s) => s.accessToken);

  const { mutateAsync: uploadLogoMutation, isPending: uploadLogoLoading } =
    useUploadLogoMutation();
  const { mutateAsync: deleteFileMutate } = useDeleteFileMutation();
  const { upload } = useChunkUpload();
  const {
    data,
    loading,
    isEditing,
    queryString,
    responseCode,
    onFormChange,
    handleSubmit,
    renderActions
  } = useSaveBase<VideoLibraryResType, VideoLibraryBodyType>({
    apiConfig: apiConfig.videoLibrary,
    options: {
      queryKey: queryKeys.VIDEO_LIBRARY,
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
    deleteFileMutate: deleteFileMutate,
    isEditing,
    onOpen: true
  });

  const videoManager = useFileUploadManager({
    initialUrl: data?.content,
    deleteFileMutate: deleteFileMutate,
    isEditing,
    onOpen: true
  });

  const isUploading =
    imageManager.isUploading || videoManager.isUploading || uploadLogoLoading;

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

  const initialValues: VideoLibraryBodyType = useMemo(
    () => ({
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
      vttUrl: data?.vttUrl ?? '',
      spriteUrl: data?.spriteUrl ?? ''
    }),
    [
      data?.content,
      data?.description,
      data?.duration,
      data?.introEnd,
      data?.introStart,
      data?.name,
      data?.outroStart,
      data?.sourceType,
      data?.spriteUrl,
      data?.thumbnailUrl,
      data?.vttUrl
    ]
  );

  const handleCancel = async () => {
    await Promise.all([
      imageManager.handleCancel(),
      videoManager.handleCancel()
    ]);
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

    await Promise.all([
      imageManager.handleSubmit(),
      videoManager.handleSubmit(),
      handleSubmit(
        {
          ...values,
          introStart: values.introStart
            ? (timeToSeconds(values.introStart as string) ?? null)
            : values.introEnd
              ? 0
              : null,
          introEnd: values.introEnd
            ? (timeToSeconds(values.introEnd as string) ?? null)
            : null,
          outroStart: values.outroStart
            ? (timeToSeconds(values.outroStart as string) ?? null)
            : null,
          duration: values.duration,
          thumbnailUrl: imageManager.currentUrl,
          content:
            values.sourceType === VIDEO_LIBRARY_SOURCE_TYPE_EXTERNAL
              ? values.content
              : videoManager.currentUrl
        },
        form,
        videoLibraryErrorMaps
      )
    ]);
  };

  return (
    <PageWrapper
      breadcrumbs={[
        {
          label: 'Video',
          href: renderListPageUrl(route.videoLibrary.getList.path, queryString)
        },
        { label: `${!isEditing ? 'Thêm mới' : 'Cập nhật'} video` }
      ]}
      notFound={responseCode === ErrorCode.VIDEO_LIBRARY_ERROR_NOT_FOUND}
      notFoundContent='Không tìm thấy video này'
    >
      <BaseForm
        onSubmit={onSubmit}
        defaultValues={defaultValues}
        schema={videoLibrarySchema}
        initialValues={initialValues}
        onFormChange={onFormChange}
      >
        {(form) => {
          const sourceType = form.watch('sourceType');
          const content = form.watch('content');
          const vttUrl = form.watch('vttUrl');
          const duration = form.watch('duration');
          const introStart = form.watch('introStart');
          const introEnd = form.watch('introEnd');
          const outroStart = form.watch('outroStart');

          // URL validation helper
          const isValidUrl = (url: string | null | undefined): boolean => {
            if (!url) return false;
            const urlRegex =
              /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/i;
            return urlRegex.test(url);
          };

          // Only pass valid URLs to VideoPlayer
          const validatedContent = isValidUrl(content) ? content : '';
          const validatedVttUrl = isValidUrl(vttUrl) ? vttUrl : '';

          return (
            <>
              <Row>
                <Col className='grid-c-12'>
                  <UploadImageField
                    value={renderImageUrl(imageManager.currentUrl)}
                    loading={uploadLogoLoading}
                    control={form.control}
                    name='thumbnailUrl'
                    onChange={imageManager.trackUpload}
                    size={150}
                    uploadImageFn={async (file) => {
                      const res = await uploadLogoMutation({
                        file
                      });
                      return res.data?.filePath ?? '';
                    }}
                    deleteImageFn={imageManager.handleDeleteOnClick}
                    label='Ảnh nền (16:9)'
                    aspect={16 / 9}
                    required
                    defaultCrop={false}
                  />
                </Col>
              </Row>
              <Row>
                <Col className='grid-c-6'>
                  <InputField
                    control={form.control}
                    name='name'
                    label='Tên video'
                    placeholder='Tên video'
                    required
                  />
                </Col>
                <Col className='grid-c-6'>
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
                <Col className='grid-c-6'>
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
                <Col className='grid-c-6'>
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
                <Col className='grid-c-6'>
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
                {sourceType === VIDEO_LIBRARY_SOURCE_TYPE_EXTERNAL && (
                  <Col className='grid-c-6'>
                    <TimePickerField
                      control={form.control}
                      name='duration'
                      label='Thời lượng'
                      placeholder='Thời lượng'
                      required
                    />
                  </Col>
                )}
              </Row>

              {/* Show content, vttUrl, spriteUrl, duration only for EXTERNAL source type */}
              {sourceType === VIDEO_LIBRARY_SOURCE_TYPE_EXTERNAL && (
                <>
                  <Row>
                    <Col className='grid-c-6'>
                      <InputField
                        control={form.control}
                        name='content'
                        label='Nhập đường dẫn video'
                        placeholder='Nhập đường dẫn video'
                        required
                      />
                    </Col>
                    <Col className='grid-c-6'>
                      <InputField
                        control={form.control}
                        name='vttUrl'
                        label='Đường dẫn VTT (thumbnail preview)'
                        placeholder='Nhập URL file .vtt'
                      />
                    </Col>
                  </Row>

                  <Row>
                    <Col className='grid-c-6'>
                      <InputField
                        control={form.control}
                        name='spriteUrl'
                        label='Đường dẫn ảnh sprite (sprite url)'
                        placeholder='Đường dẫn ảnh sprite (sprite url)'
                      />
                    </Col>
                  </Row>

                  {/* Video preview for external source */}
                  {validatedContent ? (
                    <Row>
                      <Col className='grid-c-12'>
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
                          src={validatedContent}
                          thumbnailUrl={renderImageUrl(imageManager.currentUrl)}
                          vttUrl={
                            validatedVttUrl
                              ? renderVttUrl(
                                  data.hostname,
                                  validatedVttUrl,
                                  data.sourceType
                                )
                              : ''
                          }
                          volume={
                            envConfig.NEXT_PUBLIC_NODE_ENV === 'development'
                              ? 0
                              : isMobileDevice() || isTabletDevice()
                                ? 1
                                : 0.5
                          }
                        />
                      </Col>
                    </Row>
                  ) : null}
                </>
              )}

              {/* Show video player/upload for INTERNAL source type */}
              {sourceType === VIDEO_LIBRARY_SOURCE_TYPE_INTERNAL && (
                <Row>
                  <Col className='grid-c-12'>
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
                        src={renderVideoUrl(
                          data.hostname,
                          data.content,
                          data.sourceType
                        )}
                        thumbnailUrl={renderImageUrl(data.thumbnailUrl)}
                        vttUrl={renderVttUrl(
                          data.hostname,
                          data.vttUrl,
                          data.sourceType
                        )}
                        token={accessToken || ''}
                        skipOutro={true}
                        volume={
                          envConfig.NEXT_PUBLIC_NODE_ENV === 'development'
                            ? 0
                            : isMobileDevice() || isTabletDevice()
                              ? 1
                              : 0.5
                        }
                      />
                    ) : (
                      // Upload video
                      <UploadVideoField
                        control={form.control}
                        name='content'
                        label='Video'
                        required
                        onChange={videoManager.trackUpload}
                        onUploadStart={videoManager.trackUploadStart}
                        uploadVideoFn={async (file, onProgress) => {
                          const filePath = await upload(file, onProgress);
                          return filePath;
                        }}
                        deleteImageFn={videoManager.handleDeleteOnClick}
                        maxSize={2 * 1024 * 1024 * 1024}
                      />
                    )}
                  </Col>
                </Row>
              )}

              <Row>
                <Col className='grid-c-12'>
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
                  onCancel: handleCancel,
                  disabled: isUploading
                })}
              </>
              {loading && (
                <div className='absolute inset-0 z-10 flex justify-center bg-white/80'>
                  <CircleLoading className='stroke-main-color mt-20' />
                </div>
              )}
            </>
          );
        }}
      </BaseForm>
    </PageWrapper>
  );
}
