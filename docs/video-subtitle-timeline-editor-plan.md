# Video Subtitle Transcript Editor - Implementation Plan

## Goal

Build a simplified subtitle editor at:

`src/app/video-library/[id]/subtitle/[subtitleId]/page.tsx`

The editor replaces the scrollable timeline/ruler UI with a video preview player on the left and a virtualized transcript panel on the right.

## Core Features

- Preview player with live-updating draft subtitles.
- Virtualized transcript panel for long subtitle files.
- Real-time player time and duration sync into Zustand.
- Active subtitle highlighting and auto-scroll.
- Text, timestamp, and segment editing.
- Undo and redo for text and structural changes.
- Browser VTT export.

## Status Legend

- `DONE`: implemented in the current changes.
- `PARTIAL`: current changes cover only part of the feature.
- `TODO`: not implemented yet.

## Existing Reusable Assets

| File / Symbol                                                                                | Role                                                                |
| :------------------------------------------------------------------------------------------- | :------------------------------------------------------------------ |
| `src/utils/vtt-time.util.ts`                                                                 | Exports `vttTimeToMs`, `msToVttTime`, `msToPixel`, and `pixelToMs`. |
| `src/components/video-player/video-player.tsx`                                               | Existing base player. Reuse this; do not create a duplicate player. |
| `src/store/video-library-subtitle.store.ts`                                                  | Zustand store for subtitle editor state.                            |
| `src/types/video-library-subtitle.type.ts`                                                   | Subtitle and subtitle-store typings.                                |
| `src/app/video-library/[id]/subtitle/[subtitleId]/_components/subtitle-editor.tsx`           | Editor shell.                                                       |
| `src/app/video-library/[id]/subtitle/[subtitleId]/_components/subtitle-preview-player.tsx`   | Preview player wrapper.                                             |
| `src/app/video-library/[id]/subtitle/[subtitleId]/_components/subtitle-transcript-panel.tsx` | Transcript panel and toolbar surface.                               |

---

## Feature 1 - VTT Draft Loading And Normalized State [DONE]

### Purpose

Fetch the selected `.vtt` subtitle file, parse it into a normalized in-memory draft, and initialize the editor store with clean timing data.

### Current Status

- `DONE`: `src/utils/vtt-time.util.ts` exists.
- `DONE`: `SubtitleType` includes `startMs` and `endMs`.
- `DONE`: The subtitle store includes normalized draft state, selection, duration, and history stacks.
- `DONE`: `setSubtitles(subtitles, { resetHistory: true })` resets history, future, and selection.
- `DONE`: `parseVttContent` returns normalized subtitle drafts with millisecond timing fields.
- `DONE`: `SubtitleTranscriptPanel` fetches the VTT file on render and calls `setSubtitles(parseVttContent(content), { resetHistory: true })`.

### Modify One By One

1. Types: `src/types/video-library-subtitle.type.ts`
   - Add `startMs: number` and `endMs: number` to `SubtitleType`.
   - Keep `start` and `end` as formatted strings in `hh:mm:ss.mmm` format.
   - Add `durationMs`, `selectedSubtitleId`, `past`, and `future` to `VideoLibrarySubtitleState`.
   - Add `setDurationMs`, `setSelectedSubtitleId`, `updateSubtitle`, `commitSubtitles`, `undo`, and `redo` to `VideoLibrarySubtitleActions`.

2. Store: `src/store/video-library-subtitle.store.ts`
   - Initialize `durationMs`, `selectedSubtitleId`, `past`, and `future`.
   - Update `setSubtitles(subtitles, { resetHistory: true })` so it clears history and selection when a new VTT file is loaded.
   - Keep `setCurrentTime` lightweight because player events will call it frequently.

3. Utils: `src/utils/text.util.ts`
   - Update `parseVttContent` to parse cue timings with `vttTimeToMs`.
   - Support multiline cue text.
   - Generate stable local cue IDs.
   - Ignore `WEBVTT`, cue indexes, and blank separator lines safely.

4. Components: `src/app/video-library/[id]/subtitle/[subtitleId]/_components/subtitle-transcript-panel.tsx`
   - Keep the VTT fetch here unless the editor shell later needs to own loading state.
   - Call `setSubtitles(parsedSubtitles, { resetHistory: true })` after fetching.
   - Handle fetch failures with the existing empty/not-found UI pattern.

5. Styles/UI
   - Keep loading and empty states inside the transcript panel.
   - No separate stylesheet is needed; use existing Tailwind utility patterns.

### Acceptance Checks

- [x] Selected subtitle VTT file is fetched on page render.
- [x] Parsed subtitles include `startMs` and `endMs`.
- [x] Loading a new subtitle resets history, future, and selection.
- [x] Multiline VTT cues remain multiline after parsing.

---

## Feature 2 - Preview Player Time Sync And Draft Captions [PARTIAL]

### Purpose

Reuse the existing video player, sync playback time and duration into the subtitle store, and render draft subtitle changes live on top of the video.

### Current Status

- `DONE`: `SubtitleEditor` renders `SubtitlePreviewPlayer`.
- `PARTIAL`: `SubtitlePreviewPlayer` wraps the existing dynamic `VideoPlayer`.
- `TODO`: The wrapper is not `forwardRef`-based.
- `TODO`: Player `currentTime` and `duration` are not synced into the store.
- `TODO`: Draft subtitles are not converted into an in-memory `TextTrack`.

### Modify One By One

1. Types: `src/types/video-library-subtitle.type.ts`
   - Ensure store state has `currentTime: number` and `durationMs: number`, both in milliseconds.
   - Ensure actions include `setCurrentTime(currentTime: number)` and `setDurationMs(durationMs: number)`.

2. Store: `src/store/video-library-subtitle.store.ts`
   - Add `setDurationMs`.
   - Keep time setters independent from history.

3. Components: `src/app/video-library/[id]/subtitle/[subtitleId]/_components/subtitle-preview-player.tsx`
   - Wrap the preview component with `forwardRef` if the base player instance requires ref access.
   - Wire player time events to `setCurrentTime(currentTime * 1000)`.
   - Wire duration events to `setDurationMs(duration * 1000)`.
   - Create or reuse one programmatic text track labelled `[Draft Preview]`.
   - Refresh draft cues whenever `subtitles` changes.

4. Components: `src/components/video-player/video-player.tsx`
   - Only modify this if the existing player does not expose the needed Vidstack events/ref.
   - Preserve existing player behavior for other pages.

5. Utils: `src/utils/vtt-time.util.ts`
   - Use `startMs / 1000` and `endMs / 1000` when creating native `VTTCue` objects.

6. Styles/UI
   - Keep the existing player aspect-ratio wrapper.
   - Prefer native subtitle rendering through `TextTrack`; add custom overlay styles only if native cues cannot satisfy preview needs.

### Acceptance Checks

- [ ] Store `currentTime` updates while the video plays.
- [ ] Store `durationMs` updates when media metadata is available.
- [ ] Edited subtitle text appears on the preview video without a page reload.
- [ ] Existing regular text tracks still work.

---

## Feature 3 - Transcript Virtualization, Active Row, And Inline Editing [PARTIAL]

### Purpose

Render all subtitle segments in a performant transcript panel, highlight the active cue based on the current playhead, and allow direct editing of text and timestamps.

### Current Status

- `DONE`: `SubtitleTranscriptPanel` uses `@tanstack/react-virtual`.
- `DONE`: Rows show segment numbers and textarea fields.
- `DONE`: Textarea changes update subtitle text in the store through `setSubtitles`.
- `TODO`: Timestamp inputs are not implemented.
- `TODO`: Textarea auto-height is not implemented.
- `TODO`: Active row detection, orange highlight, and auto-scroll are not implemented.
- `TODO`: Edits do not use `updateSubtitle`.
- `TODO`: Blur/Enter does not commit history.

### Modify One By One

1. Types: `src/types/video-library-subtitle.type.ts`
   - Ensure `SubtitleType` has editable `text`, `start`, `end`, `startMs`, and `endMs`.
   - Use `Partial<SubtitleType>` for `updateSubtitle` patches.

2. Store: `src/store/video-library-subtitle.store.ts`
   - Add `updateSubtitle(id, patch)` for per-row edits.
   - Add `setSelectedSubtitleId(id)` for row selection.
   - Add `commitSubtitles(previousSubtitles)` so text and timestamp edits can enter history on blur or Enter.

3. Components: `src/app/video-library/[id]/subtitle/[subtitleId]/_components/subtitle-transcript-panel.tsx`
   - Keep `useVirtualizer` with stable row keys from subtitle IDs.
   - Compute `activeIndex` with `subtitles.findIndex((s) => s.startMs <= currentTime && currentTime <= s.endMs)`.
   - Scroll to active row only when `activeIndex` changes.
   - Add text editing through `updateSubtitle(id, { text })`.
   - Add start/end timestamp inputs.
   - When timestamp input changes, update both formatted time and millisecond fields.
   - Capture a previous subtitle snapshot before editing and call `commitSubtitles(previousSnapshot)` on blur or Enter.
   - Select the row when a user focuses or clicks inside it.

4. Utils: `src/utils/vtt-time.util.ts`
   - Use `vttTimeToMs` for timestamp input parsing.
   - Use `msToVttTime` to normalize timestamp display after valid edits.

5. Styles/UI
   - Apply an orange active-row style: border, subtle background, and visible focus ring.
   - Keep row heights stable enough for virtualization.
   - Add textarea auto-height without causing layout thrash; call `rowVirtualizer.measure()` after height changes if needed.
   - Keep timestamp inputs compact and readable inside the right panel.

### Acceptance Checks

- [x] Subtitle list renders inside a virtualized container.
- [x] Textarea edits update subtitle text in the store.
- [ ] Active subtitle row highlights when playback time enters its cue range.
- [ ] Active subtitle row scrolls into view when the active cue changes.
- [ ] Start/end inputs update `start`, `end`, `startMs`, and `endMs`.
- [ ] Text and timestamp edits are committed to history on blur or Enter.

---

## Feature 4 - History, Segment Actions, And Keyboard Shortcuts [PARTIAL]

### Purpose

Support undo/redo and structural subtitle operations: add, split, delete, and row selection. Provide both toolbar buttons and global shortcuts.

### Current Status

- `DONE`: Store history stacks are implemented.
- `DONE`: Store-level undo/redo actions are implemented.
- `TODO`: Add, split, and delete actions are not implemented.
- `TODO`: Global keyboard shortcuts are not registered.
- `PARTIAL`: Transcript panel has a header area that can host toolbar controls.

### Modify One By One

1. Types: `src/types/video-library-subtitle.type.ts`
   - Add `past: SubtitleType[][]` and `future: SubtitleType[][]`.
   - Add action types for `undo`, `redo`, `commitSubtitles`, and `setSelectedSubtitleId`.
   - Add dedicated action types for add/split/delete if these actions live in the store.

2. Store: `src/store/video-library-subtitle.store.ts`
   - Implement a 50-entry history limit.
   - `commitSubtitles(previousSubtitles)` pushes previous state to `past` only when the list changed.
   - `undo()` restores the latest `past` state and pushes current state to `future`.
   - `redo()` restores the next `future` state and pushes current state to `past`.
   - Add delete behavior that clears selection when the selected row is deleted.

3. Components: `src/app/video-library/[id]/subtitle/[subtitleId]/_components/subtitle-transcript-panel.tsx`
   - Add toolbar buttons for undo, redo, add, split, delete, and export.
   - Disable undo/redo when their stacks are empty.
   - Disable split/delete when no subtitle is selected.
   - Add a new segment at the current player time.
   - Split selected segment only when `currentTime` is inside the selected segment.
   - Delete selected segment after pushing the current list into history.

4. Components: `src/app/video-library/[id]/subtitle/[subtitleId]/_components/subtitle-editor.tsx`
   - Add a global `keydown` listener.
   - `Ctrl+Z` / `Cmd+Z` triggers undo.
   - `Ctrl+Shift+Z` / `Ctrl+Y` triggers redo.
   - `Delete` / `Backspace` deletes the selected segment.
   - Ignore shortcuts while focus is inside `input`, `textarea`, `select`, or `[contenteditable]`.

5. Utils
   - Add a small local helper for generating subtitle IDs if needed.
   - Use `msToVttTime` when creating or splitting segments.

6. Styles/UI
   - Use existing `Button` and `ToolTip` components.
   - Use lucide icons for toolbar actions.
   - Show disabled states clearly.
   - Keep toolbar controls compact because this panel is narrow.

### Acceptance Checks

- [ ] Undo and redo restore text edits.
- [ ] Undo and redo restore timestamp edits.
- [ ] Undo and redo restore add/split/delete operations.
- [ ] Add creates a valid segment at the current player time.
- [ ] Split creates two valid segments without overlap.
- [ ] Delete removes the selected segment and clears selection.
- [ ] Keyboard shortcuts work outside form fields and are ignored inside form fields.

---

## Feature 5 - VTT Export [PARTIAL]

### Purpose

Compile the edited in-memory subtitles into a valid WebVTT file and download it from the browser.

### Current Status

- `DONE`: Transcript panel has an Export button.
- `DONE`: Export currently creates a Blob and downloads a `.vtt` file.
- `PARTIAL`: Serializer still uses the old `start` and `end` fields directly.
- `TODO`: Serializer does not sort by `startMs`.
- `TODO`: Serializer does not guarantee normalized `hh:mm:ss.mmm` timestamps.

### Modify One By One

1. Types: `src/types/video-library-subtitle.type.ts`
   - Export should consume the normalized `SubtitleType[]` shape with `startMs` and `endMs`.

2. Utils: `src/utils/text.util.ts`
   - Update `serializeVttContent(subtitles)` to sort by `startMs`.
   - Use `msToVttTime(startMs)` and `msToVttTime(endMs)`.
   - Preserve multiline cue text.
   - Always include the `WEBVTT` header.

3. Components: `src/app/video-library/[id]/subtitle/[subtitleId]/_components/subtitle-transcript-panel.tsx`
   - Keep export button in the toolbar/header.
   - Use `serializeVttContent(subtitles)` for the file content.
   - Download as `${subtitle.language || 'subtitle'}.vtt`.
   - Revoke the object URL after download.

4. Styles/UI
   - Keep the existing tooltip and download icon.
   - Place export with the other toolbar actions once the toolbar is complete.

### Acceptance Checks

- [x] Export button triggers a client-side file download.
- [ ] Exported file starts with `WEBVTT`.
- [ ] Exported cues are sorted by `startMs`.
- [ ] Exported timestamps are normalized as `hh:mm:ss.mmm`.
- [ ] Multiline subtitle text remains multiline in the exported file.

---

## Final Verification Checklist

### Functional

- [x] Subtitles load from source files on page render.
- [ ] Draft captions display dynamically on top of video.
- [x] Subtitle list renders inside the `@tanstack/react-virtual` wrapper container.
- [ ] Active subtitle segment highlights and auto-scrolls into view.
- [x] Textarea edits update subtitle text in the store.
- [ ] Timestamp edits update formatted and millisecond timing fields.
- [ ] History is captured on blur or Enter.
- [ ] Undo and redo revert edits and structural changes.
- [x] VTT export button triggers a browser download.
- [ ] VTT export uses sorted millisecond timings and normalized timestamps.
- [ ] Global shortcuts execute properly and are ignored inside form fields.

### Quality

- [x] `yarn lint` passes as of 2026-05-31 with 1 warning in `src/components/form/multi-select-field.tsx`.
- [ ] `yarn build` passes without compilation problems. Not verified during this comparison.
