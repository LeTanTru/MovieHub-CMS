'use client';

import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/audio.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import {
  Col,
  InputField,
  RichTextField,
  Row,
  SelectField,
  TextAreaField,
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
  storageKeys,
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
import { VideoLibraryBodyType, VideoLibraryResType } from '@/types';
import {
  getData,
  renderImageUrl,
  renderListPageUrl,
  renderVideoUrl,
  renderVttUrl,
  timeToSeconds
} from '@/utils';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  DefaultVideoLayout,
  defaultLayoutIcons
} from '@vidstack/react/player/layouts/default';
import {
  isHLSProvider,
  MediaPlayer,
  MediaProvider,
  MediaProviderAdapter,
  Poster
} from '@vidstack/react';
import {
  CaptionButton,
  FullscreenToggleButton,
  PiPToggleButton,
  PlayToggleButton,
  SeekBackwardButton,
  SeekForwardButton,
  SettingMenu,
  VolumeToggleButton
} from '@/components/video-player';
import { AxiosProgressEvent } from 'axios';
import { logger } from '@/logger';

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
    shortDescription: '',
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
      shortDescription: data?.shortDescription ?? '',
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
          ) || null,
        introEnd:
          timeToSeconds(
            values.introEnd ? (values.introEnd as string) : '00:00:00'
          ) || null,
        outroStart:
          timeToSeconds(
            values.outroStart ? (values.outroStart as string) : '00:00:00'
          ) || null,
        duration: timeToSeconds(
          values.duration ? (values.duration as string) : '00:00:00'
        ),
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
                  />
                </Col>
                <Col>
                  <TimePickerField
                    control={form.control}
                    name='introEnd'
                    label='Thời gian kết thúc intro'
                    placeholder='Thời gian kết thúc intro'
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
                  />
                </Col>
                {sourceType === VIDEO_LIBRARY_SOURCE_TYPE_EXTERNAL && (
                  <Col>
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
                    <Col>
                      <InputField
                        control={form.control}
                        name='content'
                        label='Nhập đường dẫn video'
                        placeholder='Nhập đường dẫn video'
                        required
                        onChange={(e) => {
                          const value = e.target.value;
                          imageManager.trackUpload(value);
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
                  {(videoManager.currentUrl || content) && (
                    <Row>
                      <Col span={24}>
                        <MediaPlayer
                          autoPlay
                          crossOrigin
                          fullscreenOrientation={'none'}
                          logLevel='silent'
                          onProviderChange={undefined}
                          playsInline
                          preferNativeHLS={false}
                          src={videoManager.currentUrl || content}
                          streamType='on-demand'
                          viewType='video'
                          volume={0.5}
                        >
                          <MediaProvider />
                          <DefaultVideoLayout
                            thumbnails={vttUrl || undefined}
                            icons={defaultLayoutIcons}
                            slots={{
                              playButton: <PlayToggleButton />,
                              muteButton: <VolumeToggleButton />,
                              fullscreenButton: <FullscreenToggleButton />,
                              pipButton: <PiPToggleButton />,
                              settingsMenu: (
                                <SettingMenu
                                  placement='top end'
                                  tooltipPlacement='top'
                                />
                              ),
                              captionButton: <CaptionButton />,
                              beforeSettingsMenu: (
                                <>
                                  <SeekBackwardButton />
                                  <SeekForwardButton />
                                </>
                              ),
                              googleCastButton: null
                            }}
                          />
                        </MediaPlayer>
                      </Col>
                    </Row>
                  )}
                </>
              )}

              {/* Show video player/upload for INTERNAL source type */}
              {sourceType === VIDEO_LIBRARY_SOURCE_TYPE_INTERNAL && (
                <Row>
                  <Col span={24}>
                    {/* Play preview video */}
                    {isEditing && data ? (
                      <MediaPlayer
                        autoPlay
                        crossOrigin
                        fullscreenOrientation={'none'}
                        logLevel='silent'
                        onProviderChange={onProviderChange}
                        playsInline
                        preferNativeHLS={false}
                        src={renderVideoUrl(data.content)}
                        streamType='on-demand'
                        viewType='video'
                        volume={0.5}
                      >
                        <MediaProvider slot='media'>
                          <Poster
                            className='vds-poster'
                            src={renderImageUrl(data.thumbnailUrl)}
                          />
                          {/* {textTracks.map((track) => (
                            <Track {...(track as any)} key={track.src} />
                          ))} */}
                        </MediaProvider>
                        <DefaultVideoLayout
                          thumbnails={renderVttUrl(data.vttUrl)}
                          icons={defaultLayoutIcons}
                          slots={{
                            playButton: <PlayToggleButton />,
                            muteButton: <VolumeToggleButton />,
                            fullscreenButton: <FullscreenToggleButton />,
                            pipButton: <PiPToggleButton />,
                            settingsMenu: (
                              <SettingMenu
                                placement='top end'
                                tooltipPlacement='top'
                              />
                            ),
                            captionButton: <CaptionButton />,
                            beforeSettingsMenu: (
                              <>
                                <SeekBackwardButton />
                                <SeekForwardButton />
                              </>
                            ),
                            googleCastButton: null
                          }}
                        />
                      </MediaPlayer>
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
              )}

              <Row>
                <Col span={24}>
                  <TextAreaField
                    control={form.control}
                    name='shortDescription'
                    label='Mô tả ngắn'
                    placeholder='Mô tả ngắn'
                    required
                  />
                </Col>
              </Row>
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
              {loading && (
                <div className='absolute inset-0 bg-white/80'>
                  <CircleLoading className='stroke-dodger-blue mt-20 size-8' />
                </div>
              )}
            </>
          );
        }}
      </BaseForm>
    </PageWrapper>
  );
}

function onProviderChange(
  provider: MediaProviderAdapter | null
  // nativeEvent: MediaProviderChangeEvent
) {
  if (isHLSProvider(provider)) {
    provider.config = {
      xhrSetup(xhr) {
        xhr.setRequestHeader(
          'Authorization',
          `Bearer ${getData(storageKeys.ACCESS_TOKEN)}`
        );
      }
    };
  }
}
