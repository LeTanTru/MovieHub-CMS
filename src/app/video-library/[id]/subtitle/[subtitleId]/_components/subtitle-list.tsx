'use client';

import { SubtitleItem } from './subtitle-item';
import { useShallow } from 'zustand/react/shallow';
import { useVideoLibrarySubtitleStore } from '@/store';
import { Virtualizer } from '@tanstack/react-virtual';
import { SubtitleType } from '@/types';

type SubtitleListProps = {
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
  virtualItems: ReturnType<
    Virtualizer<HTMLDivElement, Element>['getVirtualItems']
  >;
};

export function SubtitleList({
  rowVirtualizer,
  virtualItems
}: SubtitleListProps) {
  const {
    currentTime,
    selectedSubtitleId,
    subtitles,
    setSelectedSubtitleId,
    deleteSubtitle,
    requestSubtitleFormState
  } = useVideoLibrarySubtitleStore(
    useShallow((s) => ({
      currentTime: s.currentTime,
      selectedSubtitleId: s.selectedSubtitleId,
      subtitles: s.subtitles,
      setSelectedSubtitleId: s.setSelectedSubtitleId,
      deleteSubtitle: s.deleteSubtitle,
      requestSubtitleFormState: s.requestSubtitleFormState
    }))
  );

  const handleSubtitleSelect = (id: string, index: number) => {
    setSelectedSubtitleId(id);
    rowVirtualizer.scrollToIndex(index, {
      align: 'center',
      behavior: 'smooth'
    });
  };

  const handleEditSubtitle = (subtitle: SubtitleType) => {
    requestSubtitleFormState({ mode: 'edit', subtitleId: subtitle.id });
  };

  const lastVirtualItem = virtualItems[virtualItems.length - 1];
  const listHeight =
    lastVirtualItem?.index === subtitles.length - 1
      ? lastVirtualItem.end
      : rowVirtualizer.getTotalSize();

  return (
    <div
      style={{
        height: `${listHeight}px`,
        width: '100%',
        position: 'relative',
        marginTop: 4,
        marginBottom: 4
      }}
    >
      {virtualItems.map((row) => {
        const subtitle = subtitles[row.index];
        const isActive =
          subtitle.startTime <= currentTime && currentTime < subtitle.endTime;

        const isSelected = selectedSubtitleId === subtitle.id;

        return (
          <div
            key={row.key}
            data-index={row.index}
            ref={rowVirtualizer.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${row.start}px)`,
              padding: '0px 4px 0px 8px'
            }}
          >
            <SubtitleItem
              isActive={isActive}
              isSelected={isSelected}
              key={subtitle.id}
              rowIndex={row.index + 1}
              subtitle={subtitle}
              onEdit={handleEditSubtitle}
              onSelect={handleSubtitleSelect}
              onDelete={deleteSubtitle}
            />
          </div>
        );
      })}
    </div>
  );
}
