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
| `src/utils/vtt-time.util.ts`                                                                 | Exports `vttTimeToSecond` and `secondToVttTime`.                    |
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
- `DONE`: `SubtitleType` includes `startTime` and `endTime` in seconds.
- `DONE`: The subtitle store includes normalized draft state, selection, duration, and history stacks.
- `DONE`: `setSubtitles(subtitles, { resetHistory: true })` resets history, future, and selection.
- `DONE`: `parseVttContent` returns normalized subtitle drafts with second-based timing fields.
- `DONE`: `SubtitleTranscriptPanel` fetches the VTT file on render and calls `setSubtitles(parseVttContent(content), { resetHistory: true })`.

### Modify One By One

1. Types: `src/types/video-library-subtitle.type.ts`
   - Add `startTime: number` and `endTime: number` to `SubtitleType`.
   - Keep `start` and `end` as formatted strings in `hh:mm:ss.mmm` format.
   - Add `duration`, `selectedSubtitleId`, `past`, and `future` to `VideoLibrarySubtitleState`.
   - Add `setDuration`, `setSelectedSubtitleId`, `updateSubtitle`, `commitSubtitles`, `undo`, and `redo` to `VideoLibrarySubtitleActions`.

2. Store: `src/store/video-library-subtitle.store.ts`
   - Initialize `duration`, `selectedSubtitleId`, `past`, and `future`.
   - Update `setSubtitles(subtitles, { resetHistory: true })` so it clears history and selection when a new VTT file is loaded.
   - Keep `setCurrentTime` lightweight because player events will call it frequently.

3. Utils: `src/utils/text.util.ts`
   - Update `parseVttContent` to parse cue timings with `vttTimeToSecond`.
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
- [x] Parsed subtitles include `startTime` and `endTime`.
- [x] Loading a new subtitle resets history, future, and selection.
- [x] Multiline VTT cues remain multiline after parsing.

---

## Feature 2 - Preview Player Time Sync And Draft Captions [DONE]

### Purpose

Reuse the existing video player, sync playback time into the subtitle store, and render draft subtitle changes live on top of the video.

### Current Status

- `DONE`: `SubtitleEditor` renders `SubtitlePreviewPlayer`.
- `DONE`: `SubtitlePreviewPlayer` wraps the existing dynamic `VideoPlayer`.
- `DONE`: The base `VideoPlayer` already accepts a `ref` prop and forwards Vidstack `onTimeUpdate`.
- `DONE`: Player `currentTime` is synced into the store from Vidstack `onTimeUpdate` in seconds.
- `DONE`: Draft subtitle text is rendered live over the video with a custom overlay.
- `DONE`: Selecting a transcript row seeks the preview player to that segment start and pauses playback.
- `DONE`: When a transcript row is selected, the overlay shows the selected subtitle; otherwise it shows the active subtitle for the current playhead.
- Draft subtitles are not registered as Vidstack `TextTrack` entries because updating Blob-backed tracks on every edit caused duplicate caption-menu keys such as `:subtitles-[draft preview] tiếng việt`.

### Modify One By One

1. Types: `src/types/video-library-subtitle.type.ts`
   - Store state currently uses seconds: `currentTime: number` and `duration: number`.
   - Subtitle cue timing currently uses seconds: `startTime: number` and `endTime: number`.
   - Actions currently include `setCurrentTime(currentTime: number)` and `setDuration(duration: number)`.

2. Store: `src/store/video-library-subtitle.store.ts`
   - `setDuration` exists for later duration-aware editing features, but Feature 2 does not call it.
   - Keep time setters independent from history.

3. Components: `src/app/video-library/[id]/subtitle/[subtitleId]/_components/subtitle-preview-player.tsx`
   - Import `useVideoLibrarySubtitleStore`, `useShallow`, `useEffect`, and `useRef`.
   - Select `currentTime`, `selectedSubtitleId`, `subtitles`, and `setCurrentTime` from the store.
   - Pass `onTimeUpdate={(detail) => setCurrentTime(detail.currentTime)}` to `VideoPlayer`.
   - Keep a `MediaPlayerInstance` ref so selected transcript rows can seek the player.
   - When `selectedSubtitleId` resolves to a subtitle, set `playerRef.current.currentTime = selectedSubtitle.startTime` and pause playback.
   - Do not generate a Blob VTT URL for every subtitle edit.
   - Do not pass the draft subtitle list to `VideoPlayer` through `textTracks`; Vidstack's caption menu can retain old track entries and emit duplicate React key warnings.
   - Find the active draft cue directly from normalized state:
     - `subtitles.find((s) => currentTime >= s.startTime && currentTime <= s.endTime)`.
   - Resolve the preview cue as `selectedSubtitle ?? activeSubtitle`.
   - Render the preview cue as an absolutely positioned overlay inside the same aspect-ratio wrapper as the player.
   - Use `whitespace-pre-line` so multiline subtitle text previews correctly.
   - Use `pointer-events-none` on the overlay so it does not block player controls.
   - Keep `textTracks` out of the editor preview while draft overlay mode is active.

4. Components: `src/components/video-player/video-player.tsx`
   - Keep `TextTrackSync` generic and preserve existing regular `textTracks` behavior for other video pages.
   - If you modify `TextTrackSync`, track and remove the exact `TextTrack` objects added by the component instead of relying only on `src` scanning.
   - Do not hardcode subtitle-editor-specific behavior in the shared player.

5. Utils: `src/utils/vtt-time.util.ts`
   - No required change for overlay-based draft preview.
   - If you later switch to native `VTTCue`, pass `startTime` and `endTime` directly because browser cues expect seconds.

6. Styles/UI
   - Keep the existing player aspect-ratio wrapper.
   - Use a custom overlay for draft preview because Blob-backed Vidstack tracks caused duplicate caption-menu entries during frequent edits.
   - Keep the overlay visually close to native captions: centered near the bottom, readable contrast, no controls or instructional text.
   - Do not add visible instructional text to the player.

### Edge Cases

- Empty subtitle list should render no draft overlay.
- Invalid cue ranges should not crash the preview; the active cue lookup should naturally ignore cues where the current time is not inside the cue range.
- Multiline cue text must remain multiline in the overlay.
- `setCurrentTime` fires frequently, so do not put history updates, serialization, or expensive work inside the time-update handler.
- Selected-row preview intentionally overrides active-playhead preview until the row selection is cleared.
- If regular server-side subtitle tracks are needed in the editor later, reintroduce them separately from the draft preview so the draft overlay does not compete with Vidstack's caption menu.

### Acceptance Checks

- [x] Store `currentTime` updates while the video plays.
- [x] Edited subtitle text appears on the preview video without a page reload.
- [x] Selecting a transcript row seeks and pauses the preview player at that subtitle start time.
- [x] Draft preview does not create duplicate Vidstack caption-menu entries.
- [x] Existing regular text track support is preserved in the shared `VideoPlayer`; no current non-editor call sites pass `textTracks`.

---

## Feature 3 - Transcript Virtualization, Active Row, And Inline Editing [PARTIAL]

### Purpose

Render all subtitle segments in a performant transcript panel, highlight the active cue based on the current playhead, and allow direct editing of text and timestamps.

### Current Status

- `DONE`: `SubtitleTranscriptPanel` uses `@tanstack/react-virtual`.
- `DONE`: Rows show segment numbers and textarea fields.
- `DONE`: Textarea changes update subtitle text in the store through `updateSubtitle`.
- `DONE`: Active row detection and auto-scroll are implemented.
- `TODO`: Timestamp inputs are not implemented.
- `TODO`: Textarea auto-height is not implemented.
- `TODO`: Orange active-row styling is not implemented.
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
   - Select `currentTime`, `selectedSubtitleId`, `setSelectedSubtitleId`, `updateSubtitle`, and `commitSubtitles` from the store with `useShallow`.
   - Compute `activeIndex` with `subtitles.findIndex((s) => s.startMs <= currentTime && currentTime < s.endMs)`.
   - Keep `activeIndex` as `-1` when no cue matches.
   - Use a `useRef<number | null>` to remember the previous active index.
   - In an effect, call `rowVirtualizer.scrollToIndex(activeIndex, { align: 'center' })` only when:
     - `activeIndex >= 0`.
     - `activeIndex !== previousActiveIndexRef.current`.
     - The user is not currently focused inside an `input` or `textarea` in the transcript panel.
   - Add text editing through `updateSubtitle(id, { text })`; do not call `setSubtitles` for per-row edits.
   - Add compact start/end timestamp inputs:
     - Use controlled values from `subtitle.start` and `subtitle.end`.
     - Accept `hh:mm:ss.mmm` and `mm:ss.mmm` if `vttTimeToMs` supports both.
     - On valid change, update both fields: `{ start, startMs }` or `{ end, endMs }`.
     - Normalize the displayed string with `msToVttTime(ms)` on blur.
     - Do not update the store on invalid input unless you also keep local input state; the simplest path is to reject invalid values and leave the previous store value.
   - Enforce basic timestamp validity before committing:
     - `startMs >= 0`.
     - `endMs > startMs`.
     - Optionally clamp `endMs` to `durationMs` when duration is known.
     - Avoid overlap with neighboring cues if the product expects non-overlapping subtitles.
   - Capture a previous subtitle snapshot before editing:
     - Store `structuredClone(subtitles)` in a ref on `onFocus` or `onPointerDown` if the ref is empty.
     - On blur or Enter, call `commitSubtitles(previousSnapshotRef.current)` and clear the ref.
     - On Escape, restore the previous snapshot with `setSubtitles(previousSnapshot)` and clear the ref.
   - Select the row when a user focuses or clicks inside it with `setSelectedSubtitleId(subtitle.id)`.
   - Handle keyboard editing inside fields:
     - `Enter` in timestamp inputs commits the edit and blurs the input.
     - `Enter` in textarea should keep normal multiline behavior unless `Ctrl+Enter` / `Cmd+Enter` is chosen as the commit shortcut.
     - `Escape` cancels the active edit from the captured snapshot.

4. Utils: `src/utils/vtt-time.util.ts`
   - Use `vttTimeToMs` for timestamp input parsing.
   - Use `msToVttTime` to normalize timestamp display after valid edits.

5. Styles/UI
   - Apply an orange active-row style: border, subtle background, and visible focus ring.
   - Apply a separate selected-row style if `selectedSubtitleId` differs from the active playback row.
   - Keep row heights stable enough for virtualization.
   - Add textarea auto-height without causing layout thrash; call `rowVirtualizer.measure()` after height changes if needed.
   - Keep timestamp inputs compact and readable inside the right panel.
   - Textarea auto-height implementation detail:
     - Keep `resize-none`.
     - On mount/change, set `textarea.style.height = 'auto'`, then `textarea.style.height = textarea.scrollHeight + 'px'`.
     - Call `rowVirtualizer.measureElement(rowElement)` or `rowVirtualizer.measure()` after height changes.
     - Avoid measuring every row on every playback time update.

### Edge Cases

- Active-row auto-scroll should not fight the user while they are editing text or timestamps.
- If virtual rows are dynamically measured, test rows with one line and many lines of subtitle text.
- Timestamp edits should never leave a row with `endMs <= startMs`.
- History commits should not happen for no-op edits.
- Escape cancel should not erase unrelated edits made after the snapshot by another action; this editor is single-user local state, so a simple snapshot restore is acceptable.

### Acceptance Checks

- [x] Subtitle list renders inside a virtualized container.
- [x] Textarea edits update subtitle text in the store.
- [x] Active subtitle row highlights when playback time enters its cue range.
- [x] Active subtitle row scrolls into view when the active cue changes.
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
   - Prefer implementing structural actions in the store so toolbar buttons and keyboard shortcuts share one behavior:
     - `addSubtitleAt(currentTimeMs)`.
     - `splitSelectedSubtitle(currentTimeMs)`.
     - `deleteSelectedSubtitle()`.
   - Each structural action should:
     - Capture the current `subtitles` before changing anything.
     - Apply the mutation.
     - Push the previous list into history using the same 50-entry limit.
     - Clear `future`.
   - Add delete behavior that clears selection when the selected row is deleted.
   - Keep selection predictable:
     - Add should select the newly created segment.
     - Split should select the second segment.
     - Delete should select the next segment if one exists, otherwise the previous segment, otherwise clear selection.

3. Components: `src/app/video-library/[id]/subtitle/[subtitleId]/_components/subtitle-transcript-panel.tsx`
   - Add toolbar buttons for undo, redo, add, split, delete, and export.
   - Disable undo/redo when their stacks are empty.
   - Disable split/delete when no subtitle is selected.
   - Disable split when `currentTime` is not strictly inside the selected segment.
   - Disable delete when there are no subtitles or no selection.
   - Sync `videoLibrary.duration` into the subtitle store with `setDuration(videoLibrary.duration)` before implementing duration-aware add/split/delete behavior.
   - Add a new segment at the current player time:
     - Use `currentTime` from the store, in milliseconds.
     - Default duration: 2000ms.
     - If duration is known, clamp the end to `durationMs`.
     - If the new segment would overlap the next cue, end it before the next cue starts.
     - If the playhead is inside an existing cue, insert after that cue or create a short cue after the selected cue; choose one behavior and keep it consistent.
   - Split selected segment only when `selected.startMs < currentTime < selected.endMs`.
   - Split result:
     - First cue keeps the old start and gets `endMs = currentTime`.
     - Second cue gets `startMs = currentTime` and keeps the old end.
     - Split text can be duplicated into both cues for simplicity, or divided at the nearest whitespace if you want a smarter edit. Document whichever behavior you choose.
   - Delete selected segment through the store action after pushing the current list into history.

4. Components: `src/app/video-library/[id]/subtitle/[subtitleId]/_components/subtitle-editor.tsx`
   - Add a global `keydown` listener.
   - `Ctrl+Z` / `Cmd+Z` triggers undo.
   - `Ctrl+Shift+Z` / `Ctrl+Y` triggers redo.
   - `Delete` / `Backspace` deletes the selected segment.
   - Ignore shortcuts while focus is inside `input`, `textarea`, `select`, or `[contenteditable]`.
   - Also ignore shortcuts while a modal, menu, or combobox has focus if those components expose a recognizable role such as `role='dialog'`, `role='menu'`, or `role='combobox'`.
   - Call `event.preventDefault()` only when the editor actually handles the shortcut.

5. Utils
   - Add a small local helper for generating subtitle IDs if needed.
   - Use `msToVttTime` when creating or splitting segments.
   - Suggested ID helper: `subtitle-${Date.now()}-${Math.random().toString(36).slice(2)}`.
   - Keep this helper local to the subtitle store or transcript panel unless another module needs it.

6. Styles/UI
   - Use existing `Button` and `ToolTip` components.
   - Use lucide icons for toolbar actions.
   - Show disabled states clearly.
   - Keep toolbar controls compact because this panel is narrow.
   - Suggested lucide icons:
     - Undo: `Undo2`.
     - Redo: `Redo2`.
     - Add: `Plus`.
     - Split: `Split`.
     - Delete: `Trash2`.
     - Export: `Download`.
   - Toolbar order: undo, redo, separator, add, split, delete, separator, export.

### Edge Cases

- Do not let split create zero-length cues.
- Do not let add create cues beyond `durationMs` when duration is available.
- Undo/redo should preserve selection when the selected ID still exists.
- Keyboard delete should not run while typing inside a field.
- Structural edits should use one history entry per user action.

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
   - Filter or skip invalid cues before writing:
     - Skip cues with missing text only if blank captions are not allowed by product requirements.
     - Always skip cues where `!Number.isFinite(startMs)`, `!Number.isFinite(endMs)`, or `endMs <= startMs`.
   - Serializer shape:
     - Start with `['WEBVTT', '']`.
     - For each sorted valid cue, push an optional numeric cue index or stable cue ID.
     - Push `${msToVttTime(startMs)} --> ${msToVttTime(endMs)}`.
     - Push `subtitle.text` exactly as stored so multiline text remains multiline.
     - Push a blank line after each cue.
   - Prefer numeric cue indexes in exported files if backend cue IDs are editor-only implementation details.

3. Components: `src/app/video-library/[id]/subtitle/[subtitleId]/_components/subtitle-transcript-panel.tsx`
   - Keep export button in the toolbar/header.
   - Use `serializeVttContent(subtitles)` for the file content.
   - Download as `${subtitle.language || 'subtitle'}.vtt`.
   - Revoke the object URL after download.
   - Disable export when there are no valid cues.
   - If the current edit has an uncommitted snapshot, commit or normalize it before export so the downloaded file matches the visible editor state.

4. Styles/UI
   - Keep the existing tooltip and download icon.
   - Place export with the other toolbar actions once the toolbar is complete.

### Edge Cases

- Export should work after undo/redo.
- Export should work after timestamp edits even if formatted `start` and `end` strings are stale, because it uses `startMs` and `endMs`.
- Export should not mutate the current subtitle order in the store; sort a copied array.
- The downloaded file should end with a newline for better compatibility with subtitle tools.

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
