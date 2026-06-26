'use client';

import { Button, ToolTip } from '@/components/form';
import { HasPermission } from '@/components/has-permission';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { BaseTable } from '@/components/table';
import {
  apiConfig,
  FieldTypes,
  objectNames,
  queryKeys,
  SUBTITLE_COMPLETE,
  SUBTITLE_LOADING
} from '@/constants';
import {
  useDisclosure,
  useListBase,
  useNavigate,
  useQueryParams
} from '@/hooks';
import { useVideoLibraryQuery } from '@/queries';
import { route } from '@/routes';
import { videoLibrarySubtitleSearchSchema } from '@/schema-validations';
import { VideoLibrarySubtitleModal } from './video-library-subtitle-modal';
import { VideoLibrarySubtitleTranslateModal } from './video-library-subtitle-translate-modal';
import type {
  Column,
  SearchFormProps,
  VideoLibrarySubtitleResType,
  VideoLibrarySubtitleSearchType
} from '@/types';
import { generatePath, renderListPageUrl } from '@/utils';
import { useParams } from 'next/navigation';
import {
  PlusIcon,
  BadgeCheck,
  ScissorsLineDashed,
  LucideLoader
} from 'lucide-react';
import { useState } from 'react';
import { AiOutlineEdit } from 'react-icons/ai';
import { FaCircleCheck } from 'react-icons/fa6';

export function VideoLibrarySubtitleList() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: videoLibrary, isLoading: loadingVideoLibrary } =
    useVideoLibraryQuery(id);

  const [selectedSubtitle, setSelectedSubtitle] =
    useState<VideoLibrarySubtitleResType | null>(null);

  const {
    opened: openedEditModal,
    open: openEditModal,
    close: closeEditModal
  } = useDisclosure();

  const {
    opened: openedTranslateModal,
    open: openTranslateModal,
    close: closeTranslateModal
  } = useDisclosure();

  const handleCloseEditModal = () => {
    closeEditModal();
    setSelectedSubtitle(null);
  };

  const { searchParams, serializeParams, deprefixParams } =
    useQueryParams<Record<string, string>>();
  const parentParams = deprefixParams(searchParams);
  const { videoName, page, ...restParentParams } = parentParams;

  const { data, pagination, loading, handlers } = useListBase<
    VideoLibrarySubtitleResType,
    VideoLibrarySubtitleSearchType
  >({
    apiConfig: apiConfig.videoLibrarySubtitle,
    options: {
      objectName: objectNames.SUBTITLE,
      queryKey: queryKeys.VIDEO_LIBRARY_SUBTITLE,
      defaultFilters: {
        videoLibraryId: id
      },
      notShowFromSearchParams: ['videoLibraryId']
    },
    override: (handlers) => {
      handlers.renderAddButton = () => {
        return (
          <HasPermission
            requiredPermissions={[
              apiConfig.videoLibrarySubtitle.translate.permissionCode
            ]}
          >
            <Button
              onClick={() => {
                openTranslateModal();
              }}
              variant='primary'
            >
              <PlusIcon />
              Thêm mới
            </Button>
          </HasPermission>
        );
      };

      handlers.additionalColumns = () => ({
        edit: (
          record: VideoLibrarySubtitleResType,
          buttonProps?: Record<string, unknown>
        ) => {
          const handleUpdateSubtitle = (
            subtitle: VideoLibrarySubtitleResType
          ) => {
            setSelectedSubtitle(subtitle);
            openEditModal();
          };

          return (
            <ToolTip
              title={`Cập nhật phụ đề tiếng ${record.label}`}
              sideOffset={0}
            >
              <span>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateSubtitle(record);
                  }}
                  className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
                  variant='ghost'
                  {...buttonProps}
                >
                  <AiOutlineEdit className='text-sporty-blue size-4' />
                </Button>
              </span>
            </ToolTip>
          );
        },

        editContent: (
          record: VideoLibrarySubtitleResType,
          buttonProps?: Record<string, unknown>
        ) => {
          const handleEditContent = (subtitle: VideoLibrarySubtitleResType) => {
            navigate.push(
              renderListPageUrl(
                generatePath(route.videoLibrarySubtitle.editor.path, {
                  id,
                  subtitleId: subtitle.id
                }),
                serializeParams({
                  ...searchParams,
                  p_language: subtitle.language
                })
              )
            );
          };

          return (
            <ToolTip title='Cập nhật nội dung' sideOffset={0}>
              <span>
                <Button
                  disabled={record.state !== SUBTITLE_COMPLETE}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditContent(record);
                  }}
                  className='border-none bg-transparent px-2! shadow-none hover:bg-transparent'
                  variant='ghost'
                  {...buttonProps}
                >
                  <ScissorsLineDashed className='text-sporty-blue size-4.5' />
                </Button>
              </span>
            </ToolTip>
          );
        }
      });
    }
  });

  const columns: Column<VideoLibrarySubtitleResType>[] = [
    {
      title: 'Ngôn ngữ',
      dataIndex: 'label',
      render: (val, record) => {
        const value = val as string;
        return (
          <div className='flex items-center gap-x-2'>
            <span className='line-clamp-1 block truncate' title={value}>
              {value}
            </span>
            {record.isDefault && (
              <ToolTip title='Mặc định'>
                <BadgeCheck className='fill-sporty-blue size-5 stroke-white' />
              </ToolTip>
            )}
          </div>
        );
      }
    },
    {
      title: 'Tình trạng',
      dataIndex: 'state',
      width: 120,
      align: 'center',
      render: (val) =>
        val === SUBTITLE_LOADING ? (
          <ToolTip title='Đang xử lý'>
            <div>
              <LucideLoader className='mx-auto size-5 animate-spin' />
            </div>
          </ToolTip>
        ) : (
          <ToolTip title='Đã hoàn thành'>
            <div>
              <FaCircleCheck className='mx-auto size-5 text-emerald-500' />
            </div>
          </ToolTip>
        )
    },
    handlers.renderActionColumn({
      actions: {
        editContent: (record) => record.state === SUBTITLE_COMPLETE,
        edit: handlers.hasPermission({
          requiredPermissions: [
            apiConfig.videoLibrarySubtitle.update.permissionCode
          ]
        }),
        delete: (record) =>
          !record.isDefault &&
          handlers.hasPermission({
            requiredPermissions: [
              apiConfig.videoLibrarySubtitle.delete.permissionCode
            ]
          })
      },
      columnProps: {
        width: 150
      }
    })
  ];

  const searchFields: SearchFormProps<VideoLibrarySubtitleSearchType>['searchFields'] =
    [
      {
        key: 'language',
        placeholder: 'Ngôn ngữ',
        type: FieldTypes.SELECT,
        options: data?.map((sub) => ({
          value: sub.language,
          label: sub.label
        })),
        submitOnChanged: true
      }
    ];

  return (
    <PageWrapper
      breadcrumbs={[
        {
          label: 'Video',
          href: renderListPageUrl(
            route.videoLibrary.getList.path,
            serializeParams({ ...restParentParams, page })
          )
        },
        ...(videoName
          ? [
              {
                label: videoName as string
              }
            ]
          : []),
        {
          label: 'Phụ đề'
        }
      ]}
      notFound={!videoLibrary && !loadingVideoLibrary}
      notFoundContent='Không tìm thấy video'
    >
      <ListPageWrapper
        searchForm={handlers.renderSearchForm({
          searchFields,
          schema: videoLibrarySubtitleSearchSchema
        })}
        addButton={handlers.renderAddButton()}
        reloadButton={handlers.renderReloadButton()}
      >
        <BaseTable
          columns={columns}
          dataSource={data || []}
          pagination={pagination}
          loading={loading}
          changePagination={handlers.changePagination}
        />
      </ListPageWrapper>
      <VideoLibrarySubtitleModal
        open={openedEditModal}
        onClose={handleCloseEditModal}
        subtitle={selectedSubtitle}
      />
      <VideoLibrarySubtitleTranslateModal
        open={openedTranslateModal}
        onClose={closeTranslateModal}
        defaultSubtitleId={data?.find((sub) => sub.isDefault)?.id || ''}
        translatedLanguages={data?.map((sub) => sub.language) || []}
      />
    </PageWrapper>
  );
}
