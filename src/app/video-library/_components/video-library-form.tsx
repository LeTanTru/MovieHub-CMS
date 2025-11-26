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
import { useSaveBase } from '@/hooks';
import { useUploadLogoMutation, useUploadVideoMutation } from '@/queries';
import { route } from '@/routes';
import { videoLibrarySchema } from '@/schemaValidations';
import { VideoLibraryBodyType, VideoLibraryResType } from '@/types';
import {
  getData,
  renderImageUrl,
  renderListPageUrl,
  renderVideoUrl,
  renderVttUrl
} from '@/utils';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
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
  MediaProviderChangeEvent,
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
import { cn } from '@/lib';

export default function VideoLibraryForm({ queryKey }: { queryKey: string }) {
  const { id } = useParams<{ id: string }>();
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const uploadLogoMutation = useUploadLogoMutation();
  const uploadVideoMutation = useUploadVideoMutation();

  const {
    data,
    loading,
    isEditing,
    queryString,
    responseCode,
    handleSubmit,
    renderActions
  } = useSaveBase<VideoLibraryResType, VideoLibraryBodyType>({
    apiConfig: apiConfig.videoLibary,
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

  function timeToSeconds(time: string): number {
    console.log('🚀 ~ timeToSeconds ~ time:', time);
    const parts = time.split(':');

    if (parts.length !== 3) {
      throw new Error('Định dạng thời gian phải là HH:mm:ss');
    }

    const [hours, minutes, seconds] = parts.map((p) => parseInt(p, 10));

    if (
      isNaN(hours) ||
      isNaN(minutes) ||
      isNaN(seconds) ||
      hours < 0 ||
      minutes < 0 ||
      minutes >= 60 ||
      seconds < 0 ||
      seconds >= 60
    ) {
      throw new Error('Giá trị giờ, phút, giây không hợp lệ');
    }

    return hours * 3600 + minutes * 60 + seconds;
  }

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
    duration: 0
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
      sourceType: data?.sourceType ?? VIDEO_LIBRARY_SOURCE_TYPE_INTERNAL
    };
  }, [data]);

  const onSubmit = async (
    values: VideoLibraryBodyType,
    form: UseFormReturn<VideoLibraryBodyType>
  ) => {
    await handleSubmit(
      {
        ...values,
        introStart: timeToSeconds(
          values.introStart ? (values.introStart as string) : '00:00:00'
        ),
        introEnd: timeToSeconds(
          values.introEnd ? (values.introEnd as string) : '00:00:00'
        ),
        outroStart: timeToSeconds(
          values.outroStart ? (values.outroStart as string) : '00:00:00'
        ),
        duration: timeToSeconds(
          values.duration ? (values.duration as string) : '00:00:00'
        ),
        thumbnailUrl,
        content: videoUrl
      },
      form,
      videoLibraryErrorMaps
    );
  };

  useEffect(() => {
    if (data?.thumbnailUrl) setThumbnailUrl(data?.thumbnailUrl);
  }, [data]);

  useEffect(() => {
    if (data?.content) setVideoUrl(data?.content);
  }, [data]);

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
        schema={videoLibrarySchema(
          data?.sourceType === VIDEO_LIBRARY_SOURCE_TYPE_EXTERNAL
        )}
        initialValues={initialValues}
      >
        {(form) => {
          const sourceType = form.watch('sourceType');

          return (
            <>
              <Row>
                <Col span={24} className='pr-0'>
                  <UploadImageField
                    value={renderImageUrl(thumbnailUrl)}
                    loading={uploadLogoMutation.isPending}
                    control={form.control}
                    name='thumbnailUrl'
                    onChange={(url) => {
                      setThumbnailUrl(url);
                    }}
                    size={150}
                    uploadImageFn={async (file: Blob) => {
                      const res = await uploadLogoMutation.mutateAsync({
                        file
                      });
                      return res.data?.filePath ?? '';
                    }}
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

              {/* isEditing */}
              {isEditing && (
                <>
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
                  <Row
                    className={cn({
                      'mb-0':
                        isEditing &&
                        data?.sourceType === VIDEO_LIBRARY_SOURCE_TYPE_INTERNAL
                    })}
                  >
                    <Col>
                      <TimePickerField
                        control={form.control}
                        name='outroStart'
                        label='Thời gian bắt đầu outro'
                        placeholder='Thời gian bắt đầu outro'
                      />
                    </Col>
                    <Col>
                      <TimePickerField
                        control={form.control}
                        name='duration'
                        label='Thời lượng'
                        placeholder='Thời lượng'
                        required={
                          data?.sourceType ===
                          VIDEO_LIBRARY_SOURCE_TYPE_EXTERNAL
                        }
                      />
                    </Col>
                  </Row>
                  {/* source type EXTERNAL & isEditing */}
                  <Row>
                    {sourceType === VIDEO_LIBRARY_SOURCE_TYPE_EXTERNAL &&
                      isEditing && (
                        <Col>
                          <InputField
                            control={form.control}
                            name='content'
                            label='Nhập đường dẫn video'
                            placeholder='Nhập đường dẫn video'
                            required
                            onChange={(e) => {
                              setVideoUrl(e.target.value);
                              form.setValue('content', e.target.value);
                            }}
                          />
                        </Col>
                      )}
                  </Row>
                  {/* If has video url */}
                  {(videoUrl || form.watch('content')) &&
                    isEditing &&
                    sourceType === VIDEO_LIBRARY_SOURCE_TYPE_EXTERNAL && (
                      <Row>
                        <Col span={24}>
                          <MediaPlayer
                            viewType='video'
                            streamType='on-demand'
                            src={videoUrl || form.watch('content')}
                            autoPlay={false}
                            muted
                            logLevel='silent'
                          >
                            <MediaProvider />
                            <DefaultVideoLayout icons={defaultLayoutIcons} />
                          </MediaPlayer>
                        </Col>
                      </Row>
                    )}
                </>
              )}

              {/* Source = EXTERNAL & not isEditing */}
              {sourceType === VIDEO_LIBRARY_SOURCE_TYPE_EXTERNAL ? (
                !isEditing && (
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
                            setVideoUrl(e.target.value);
                            form.setValue('content', e.target.value);
                          }}
                        />
                      </Col>
                      <Col>
                        <TimePickerField
                          control={form.control}
                          name='duration'
                          label='Thời lượng'
                          placeholder='Thời lượng'
                          required
                        />
                      </Col>
                    </Row>

                    {/* if has video url or content */}
                    {(videoUrl || form.watch('content')) && (
                      <Row>
                        <Col span={24}>
                          <MediaPlayer
                            viewType='video'
                            streamType='on-demand'
                            src={videoUrl || form.watch('content')}
                            autoPlay={false}
                            muted
                            logLevel='silent'
                          >
                            <MediaProvider />
                            <DefaultVideoLayout icons={defaultLayoutIcons} />
                          </MediaPlayer>
                        </Col>
                      </Row>
                    )}
                  </>
                )
              ) : (
                // source type = INTERNAL && isEditing
                <Row>
                  <Col span={24}>
                    {/* Play preview video */}
                    {isEditing && data ? (
                      <MediaPlayer
                        viewType='video'
                        streamType='on-demand'
                        logLevel='silent'
                        crossOrigin
                        playsInline
                        muted
                        preferNativeHLS={false}
                        autoPlay={false}
                        src={renderVideoUrl(data.content)}
                        fullscreenOrientation={'none'}
                        onProviderChange={onProviderChange}
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
                        onChange={(url) => setVideoUrl(url)}
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

              <>{renderActions(form)}</>
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
  provider: MediaProviderAdapter | null,
  nativeEvent: MediaProviderChangeEvent
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
