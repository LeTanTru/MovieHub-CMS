'use client';

import { apiConfig, objectNames, queryKeys } from '@/constants';
import { CircleLoading } from '@/components/loading';
import { Col, Row } from '@/components/form';
import { ConfirmModal } from '@/components/modal';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { route } from '@/routes';
import { SubtitleForm } from './subtitle-form';
import { SubtitlePreviewPlayer } from './subtitle-preview-player';
import { SubtitleTranscriptPanel } from './subtitle-transcript-panel';
import { useElementHeight } from '../_hooks/use-element-height';
import { useListBase, useQueryParams } from '@/hooks';
import { useVideoLibraryQuery } from '@/queries';
import { useVideoLibrarySubtitleStore } from '@/store';
import {
  SubtitleType,
  VideoLibrarySubtitleResType,
  VideoLibrarySubtitleSearchType
} from '@/types';
import { generatePath, renderListPageUrl } from '@/utils';
import { useParams } from 'next/navigation';
import { useReducer } from 'react';
import { useShallow } from 'zustand/react/shallow';

type SubtitleFormStateType =
  | {
      mode: 'create';
    }
  | {
      mode: 'edit';
      subtitleId: string;
    };

type SubtitleEditorState = {
  subtitleFormState: SubtitleFormStateType | null;
  pendingSubtitleFormState: SubtitleFormStateType | null;
  isSubtitleFormChanged: boolean;
  isSubtitleFormSwitchConfirmOpen: boolean;
};

type SubtitleEditorAction =
  | { type: 'REQUEST_FORM_STATE'; payload: SubtitleFormStateType }
  | { type: 'CLOSE_FORM' }
  | { type: 'SET_FORM_CHANGED'; payload: boolean }
  | { type: 'SET_SWITCH_CONFIRM_OPEN'; payload: boolean }
  | { type: 'CONFIRM_SWITCH' };

function subtitleEditorReducer(
  state: SubtitleEditorState,
  action: SubtitleEditorAction
): SubtitleEditorState {
  switch (action.type) {
    case 'REQUEST_FORM_STATE':
      if (state.subtitleFormState && state.isSubtitleFormChanged) {
        return {
          ...state,
          pendingSubtitleFormState: action.payload,
          isSubtitleFormSwitchConfirmOpen: true
        };
      }
      return {
        ...state,
        subtitleFormState: action.payload,
        isSubtitleFormChanged: false
      };
    case 'CLOSE_FORM':
      return {
        ...state,
        subtitleFormState: null,
        isSubtitleFormChanged: false
      };
    case 'SET_FORM_CHANGED':
      return {
        ...state,
        isSubtitleFormChanged: action.payload
      };
    case 'SET_SWITCH_CONFIRM_OPEN':
      return {
        ...state,
        isSubtitleFormSwitchConfirmOpen: action.payload,
        pendingSubtitleFormState: action.payload
          ? state.pendingSubtitleFormState
          : null
      };
    case 'CONFIRM_SWITCH':
      return {
        ...state,
        subtitleFormState: state.pendingSubtitleFormState,
        isSubtitleFormChanged: false,
        pendingSubtitleFormState: null
      };
    default:
      return state;
  }
}

export function SubtitleEditor() {
  const [playerHeight, playerContainerRef] = useElementHeight();
  const [subtitleFormHeight, subtitleFormContainerRef] = useElementHeight();

  const [{ subtitleFormState, isSubtitleFormSwitchConfirmOpen }, dispatch] =
    useReducer(subtitleEditorReducer, {
      subtitleFormState: null,
      pendingSubtitleFormState: null,
      isSubtitleFormChanged: false,
      isSubtitleFormSwitchConfirmOpen: false
    });

  const { subtitles, addSubtitle, updateSubtitle } =
    useVideoLibrarySubtitleStore(
      useShallow((s) => ({
        subtitles: s.subtitles,
        addSubtitle: s.addSubtitle,
        updateSubtitle: s.updateSubtitle
      }))
    );

  const { id: videoLibraryId } = useParams<{
    id: string;
    subtitleId: string;
  }>();

  const { searchParams, serializeParams, deprefixParams } =
    useQueryParams<Record<string, string>>();

  const parentParams = deprefixParams(searchParams);
  const {
    videoName,
    parentPage,
    language: _language,
    ...restParentParams
  } = parentParams;

  const { p_language, ...restSearchParams } = searchParams;

  const { data: videoLibrary, isLoading: loadingVideoLibrary } =
    useVideoLibraryQuery(videoLibraryId);

  const { data: subtitleList, loading } = useListBase<
    VideoLibrarySubtitleResType,
    VideoLibrarySubtitleSearchType
  >({
    apiConfig: apiConfig.videoLibrarySubtitle,
    options: {
      objectName: objectNames.SUBTITLE,
      queryKey: queryKeys.VIDEO_LIBRARY_SUBTITLE,
      defaultFilters: {
        videoLibraryId
      },
      notShowFromSearchParams: ['videoLibraryId']
    }
  });

  const videoSubtitle = subtitleList.find(
    (subtitle) => subtitle.language === p_language
  );

  const isEditingSubtitle =
    subtitleFormState?.mode === 'edit'
      ? subtitles.find(
          (subtitle) => subtitle.id === subtitleFormState.subtitleId
        )
      : null;

  const handleOpenAddSubtitleForm = () => {
    dispatch({ type: 'REQUEST_FORM_STATE', payload: { mode: 'create' } });
  };

  const handleOpenEditSubtitleForm = (subtitle: SubtitleType) => {
    dispatch({
      type: 'REQUEST_FORM_STATE',
      payload: { mode: 'edit', subtitleId: subtitle.id }
    });
  };

  const handleCloseSubtitleForm = () => {
    dispatch({ type: 'CLOSE_FORM' });
  };

  const handleSubtitleFormSwitchConfirmOpenChange = (open: boolean) => {
    dispatch({ type: 'SET_SWITCH_CONFIRM_OPEN', payload: open });
  };

  const handleConfirmSubtitleFormSwitch = () => {
    dispatch({ type: 'CONFIRM_SWITCH' });
  };

  const transcriptPanelHeight = playerHeight + subtitleFormHeight;

  return (
    <PageWrapper
      breadcrumbs={[
        {
          label: 'Video',
          href: renderListPageUrl(
            route.videoLibrary.getList.path,
            serializeParams({ ...restParentParams, page: parentPage })
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
          label: 'Phụ đề',
          href: renderListPageUrl(
            generatePath(route.videoLibrary.subtitle.path, {
              id: videoLibraryId
            }),
            serializeParams(restSearchParams)
          )
        },
        {
          label: videoSubtitle
            ? `Chỉnh sửa nội dung ${videoSubtitle.label}`
            : 'Chỉnh sửa nội dung'
        }
      ]}
      notFound={!videoLibrary || !videoSubtitle}
      notFoundContent={`Không tìm thấy ${videoLibrary ? 'phụ đề' : 'video'}`}
    >
      <ListPageWrapper>
        <Row className='grid-row-no-gutters items-stretch'>
          <Col className='grid-c-9 grid-col-no-gutters'>
            {loading || loadingVideoLibrary ? (
              <CircleLoading className='stroke-sporty-blue m-4' />
            ) : videoLibrary && videoSubtitle ? (
              <>
                <SubtitlePreviewPlayer
                  videoLibrary={videoLibrary}
                  playerContainerRef={playerContainerRef}
                />
                <div ref={subtitleFormContainerRef} className='flex flex-col'>
                  <SubtitleForm
                    subtitle={
                      subtitleFormState?.mode === 'edit'
                        ? isEditingSubtitle
                        : null
                    }
                    onClose={handleCloseSubtitleForm}
                    onAdd={addSubtitle}
                    onEdit={updateSubtitle}
                    onFormChange={(changed) =>
                      dispatch({ type: 'SET_FORM_CHANGED', payload: changed })
                    }
                    disabled={
                      subtitleFormState?.mode === 'create' ||
                      !!isEditingSubtitle
                        ? false
                        : true
                    }
                  />
                </div>
              </>
            ) : null}
          </Col>
          <Col className='grid-c-3 grid-col-no-gutters h-full'>
            {videoSubtitle && videoLibrary && (
              <SubtitleTranscriptPanel
                videoSubtitle={videoSubtitle}
                videoLibrary={videoLibrary}
                height={transcriptPanelHeight}
                onAddSubtitle={handleOpenAddSubtitleForm}
                onEditSubtitle={handleOpenEditSubtitleForm}
              />
            )}
          </Col>
        </Row>
      </ListPageWrapper>
      <ConfirmModal
        open={isSubtitleFormSwitchConfirmOpen}
        onOpenChange={handleSubtitleFormSwitchConfirmOpenChange}
        message='Bạn có chắc chắn muốn hủy không ?'
        onConfirm={handleConfirmSubtitleFormSwitch}
      />
    </PageWrapper>
  );
}
