'use client';

import { SubtitleItem } from './subtitle-item';
import { useShallow } from 'zustand/react/shallow';
import { useVideoLibrarySubtitleStore } from '@/store';
import { Virtualizer } from '@tanstack/react-virtual';
import type { ChangeEvent } from 'react';
import type { SubtitleType } from '@/types';

type SubtitleListProps = {
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
};

export function SubtitleList({ rowVirtualizer }: SubtitleListProps) {
  const {
    currentTime,
    selectedSubtitleId,
    subtitles,
    setSelectedSubtitleId,
    updateSubtitle
  } = useVideoLibrarySubtitleStore(
    useShallow((s) => ({
      currentTime: s.currentTime,
      selectedSubtitleId: s.selectedSubtitleId,
      subtitles: s.subtitles,
      setSelectedSubtitleId: s.setSelectedSubtitleId,
      updateSubtitle: s.updateSubtitle
    }))
  );

  const handleVttContentChange = (
    e: ChangeEvent<HTMLTextAreaElement>,
    targetSubtitle: SubtitleType
  ) => {
    setSelectedSubtitleId(targetSubtitle.id);
    updateSubtitle(targetSubtitle.id, { text: e.target.value });
  };

  return (
    <div
      style={{
        height: `${rowVirtualizer.getTotalSize()}px`,
        width: '100%',
        position: 'relative'
      }}
    >
      {rowVirtualizer.getVirtualItems().map((row) => {
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
              padding: '8px'
            }}
          >
            <SubtitleItem
              isActive={isActive}
              isSelected={isSelected}
              key={subtitle.id}
              rowIndex={row.index + 1}
              subtitle={subtitle}
              onVttChange={handleVttContentChange}
              setSelectedSubtitleId={setSelectedSubtitleId}
              onTimeChange={updateSubtitle}
            />
          </div>
        );
      })}
    </div>
  );
}
