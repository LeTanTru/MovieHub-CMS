# Video Subtitle Transcript Editor - Implementation Plan

## Goal

Build a simplified subtitle editor at:

`src/app/video-library/[id]/subtitle/[subtitleId]/page.tsx`

The editor replaces the scrollable timeline/ruler UI with a video preview player on the left and a virtualized transcript panel on the right.

## Core Features

- Preview player with live-updating draft subtitles.
- Virtualized transcript panel for long subtitle files.
- Real-time player time sync into Zustand.
- Active subtitle highlighting and auto-scroll.
- Text, timestamp, and segment editing.
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

### Implementation Shape

Feature 1 owns only loading and normalizing subtitle draft data. It should not depend on the preview player, transcript row UI, timestamp inputs, segment actions, or export behavior. Keep the draft model seconds-based throughout this feature:

- `start` and `end`: display strings from the VTT file, for example `00:01:05.250`.
- `startTime` and `endTime`: numeric seconds used by playback sync and active-row lookup.
- `currentTime`: numeric seconds in the Zustand store.

### Current Status

- `DONE`: `src/utils/vtt-time.util.ts` exists.
- `DONE`: `SubtitleType` includes `startTime` and `endTime` in seconds.
- `DONE`: The subtitle store includes normalized draft state and selection.
- `DONE`: `setSubtitles(subtitles)` replaces draft subtitle state.
- `DONE`: `SubtitleTranscriptPanel` clears selection explicitly with `setSelectedSubtitleId(null)` when a new subtitle file is loaded or loading fails.
- `DONE`: `parseVttContent` returns normalized subtitle drafts with second-based timing fields.
- `DONE`: `SubtitleTranscriptPanel` fetches the VTT file on render and calls `setSubtitles(parseVttContent(content))`.
- `DONE`: `SubtitleTranscriptPanel` uses `AbortController` to cancel stale VTT fetches during unmounts or subtitle changes.

### Modify One By One

1. Types: `src/types/video-library-subtitle.type.ts`
   - Add `startTime: number` and `endTime: number` to `SubtitleType`.
   - Keep `start` and `end` as formatted VTT strings. Accept both `hh:mm:ss.mmm` and `mm:ss.mmm` from source files if `vttTimeToSecond` supports both, but normalize new generated values with `secondToVttTime`.
   - Add `selectedSubtitleId: string | null` to `VideoLibrarySubtitleState`.
   - Add `setSubtitles`, `setSelectedSubtitleId(id: string | null)`, and `updateSubtitle` to `VideoLibrarySubtitleActions`.

2. Store: `src/store/video-library-subtitle.store.ts`
   - Initialize `selectedSubtitleId`.
   - Keep `setSubtitles(subtitles)` as a simple draft-state replacement action.
   - Clear selection explicitly with `setSelectedSubtitleId(null)` when replacing the draft after loading a new VTT file.
   - Keep `setCurrentTime` lightweight because player events will call it frequently.

3. Utils: `src/utils/text.util.ts`
   - Update `parseVttContent` to parse cue timings with `vttTimeToSecond`.
   - Support multiline cue text.
   - Generate stable local cue IDs.
   - Ignore `WEBVTT`, cue indexes, and blank separator lines safely.
   - Ignore metadata blocks such as `NOTE`, `STYLE`, and `REGION` without treating them as cues.
   - Ignore cue settings after the end timestamp, for example `align:start position:0%`.
   - Skip invalid cues instead of throwing. A malformed cue should not prevent later valid cues from loading.
   - Preserve text lines exactly except for line-ending normalization.

4. Components: `src/app/video-library/[id]/subtitle/[subtitleId]/_components/subtitle-transcript-panel.tsx`
   - Keep the VTT fetch here unless the editor shell later needs to own loading state.
   - Build the URL with `renderVttUrl(videoLibrary.hostname, subtitle.fileUrl, videoLibrary.sourceType)`.
   - Fetch inside `useEffect` with `AbortController`.
   - Pass `{ signal: controller.signal }` to `fetch`.
   - Call `setSelectedSubtitleId(null)` and then `setSubtitles(parseVttContent(content))` after a successful fetch.
   - In `catch`, return early when `controller.signal.aborted` is true.
   - For real fetch or parse failures, log with `logger.error('[GET_VTT_CONTENT_ERROR]', error)`, call `setSelectedSubtitleId(null)`, and call `setSubtitles([])`.
   - Abort the request in the effect cleanup.

5. Styles/UI
   - Keep loading and empty states inside the transcript panel.
   - No separate stylesheet is needed; use existing Tailwind utility patterns.

### Acceptance Checks

- [x] Selected subtitle VTT file is fetched on page render.
- [x] Parsed subtitles include `startTime` and `endTime`.
- [x] Loading a new subtitle resets selection and replaces draft subtitles.
- [x] Multiline VTT cues remain multiline after parsing.
- [x] Stale VTT fetches are cancelled on cleanup and do not overwrite newer draft state.

---

## Feature 2 - Preview Player Time Sync And Draft Captions [DONE]

### Purpose

Reuse the existing video player, sync playback time into the subtitle store, and render draft subtitle changes live on top of the video.

### Implementation Shape

Feature 2 owns the preview side of the editor. It should reuse the shared `VideoPlayer`, keep Vidstack integration generic, and render draft captions with a local overlay instead of repeatedly registering edited subtitle drafts as native text tracks.

The data flow is:

1. `SubtitleEditor` renders `SubtitlePreviewPlayer` and `SubtitleTranscriptPanel` from the same route state.
2. `SubtitleTranscriptPanel` loads parsed subtitle drafts into `useVideoLibrarySubtitleStore`.
3. `SubtitlePreviewPlayer` reads `subtitles`, `selectedSubtitleId`, and `currentTime` from the store.
4. `VideoPlayer.onTimeUpdate` writes `detail.currentTime` into `setCurrentTime`.
5. The preview overlay renders `selectedSubtitle ?? activeSubtitle`.

### Current Status

- `DONE`: `SubtitleEditor` renders `SubtitlePreviewPlayer`.
- `DONE`: `SubtitlePreviewPlayer` wraps the existing dynamic `VideoPlayer`.
- `DONE`: The base `VideoPlayer` already accepts a `ref` prop and forwards Vidstack `onTimeUpdate`.
- `DONE`: Player `currentTime` is synced into the store from Vidstack `onTimeUpdate` in seconds.
- `DONE`: Draft subtitle text is rendered live over the video with a custom overlay.
- `DONE`: Selecting a transcript row seeks the preview player to that segment start and pauses playback.
- `DONE`: Seek completion preserves the current play/pause state instead of forcing playback to resume.
- `DONE`: When a transcript row is selected, the overlay shows the selected subtitle; otherwise it shows the active subtitle for the current playhead.
- `DONE`: Active subtitle lookup uses `currentTime >= startTime && currentTime < endTime`, matching the transcript active-row rule.
- `DONE`: Row selection seeking depends on the selected ID and selected start time, so text edits do not repeatedly seek the player.
- `DONE`: Player seek lifecycle uses `startSeek()` and `completeSeek(currentTime)` so the transcript panel can avoid auto-scroll churn during a seek.
- Draft subtitles are not registered as Vidstack `TextTrack` entries because updating Blob-backed tracks on every edit caused duplicate caption-menu keys such as `:subtitles-[draft preview] tiếng việt`.

### Modify One By One

1. Types: `src/types/video-library-subtitle.type.ts`
   - Store state currently uses seconds: `currentTime: number`.
   - Subtitle cue timing currently uses seconds: `startTime: number` and `endTime: number`.
   - Actions currently include `setCurrentTime(currentTime: number)`.
   - Seek actions currently include `startSeek()` and `completeSeek(currentTime)`.

2. Store: `src/store/video-library-subtitle.store.ts`
   - Keep `setCurrentTime` lightweight because playback can call it frequently.
   - Keep video duration outside the subtitle store; duration-aware editing can receive `videoLibrary.duration` from the component that owns the video data.

3. Components: `src/app/video-library/[id]/subtitle/[subtitleId]/_components/subtitle-preview-player.tsx`
   - Import `useVideoLibrarySubtitleStore`, `useShallow`, `useEffect`, and `useRef`.
   - Select `currentTime`, `selectedSubtitleId`, `subtitles`, and `setCurrentTime` from the store.
   - Pass `onTimeUpdate={(detail) => setCurrentTime(detail.currentTime)}` to `VideoPlayer`.
   - Keep a `MediaPlayerInstance` ref so selected transcript rows can seek the player.
   - Resolve `selectedSubtitle` by finding the row whose `id` equals `selectedSubtitleId`.
   - Resolve `activeSubtitle` from normalized timing with `subtitles.find((s) => currentTime >= s.startTime && currentTime < s.endTime)`.
   - Resolve the preview cue as `selectedSubtitle ?? activeSubtitle`.
   - When `selectedSubtitleId` resolves to a subtitle, set `playerRef.current.currentTime = selectedSubtitle.startTime` and pause playback.
   - Make the seek effect depend on `selectedSubtitleId` and `selectedSubtitle?.startTime`, not the whole `selectedSubtitle` object. This avoids re-seeking while the user edits the selected subtitle text.
   - Do not generate a Blob VTT URL for every subtitle edit.
   - Do not pass the draft subtitle list to `VideoPlayer` through `textTracks`; Vidstack's caption menu can retain old track entries and emit duplicate React key warnings.
   - Render the preview cue as an absolutely positioned overlay inside the same aspect-ratio wrapper as the player.
   - Use `whitespace-pre-line` so multiline subtitle text previews correctly.
   - Use `pointer-events-none` on the overlay so it does not block player controls.
   - Render nothing when there is no preview cue or the preview cue has empty text.
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
   - Put the overlay inside the player wrapper with `absolute right-6 bottom-16 left-6 z-10`.
   - Keep the caption text centered and multiline-safe with `text-center` and `whitespace-pre-line`.
   - Do not add visible instructional text to the player.

### Edge Cases

- Empty subtitle list should render no draft overlay.
- Invalid cue ranges should not crash the preview; the active cue lookup should naturally ignore cues where the current time is not inside the cue range.
- Multiline cue text must remain multiline in the overlay.
- `setCurrentTime` fires frequently, so do not put serialization or expensive work inside the time-update handler.
- Selected-row preview intentionally overrides active-playhead preview until the row selection is cleared.
- Editing a selected row should update the overlay text live without repeatedly seeking the player back to the row start.
- At exact cue boundaries, the previous cue should stop at `endTime` and the next cue should begin at its own `startTime`; use `< endTime`, not `<= endTime`.
- If regular server-side subtitle tracks are needed in the editor later, reintroduce them separately from the draft preview so the draft overlay does not compete with Vidstack's caption menu.

### Acceptance Checks

- [x] Store `currentTime` updates while the video plays.
- [x] Edited subtitle text appears on the preview video without a page reload.
- [x] Selecting a transcript row seeks and pauses the preview player at that subtitle start time.
- [x] Draft preview does not create duplicate Vidstack caption-menu entries.
- [x] Existing regular text track support is preserved in the shared `VideoPlayer`; no current non-editor call sites pass `textTracks`.
- [x] Editing selected subtitle text updates the overlay without causing repeated seek/pause loops.

---

## Feature 3 - Transcript Virtualization, Active Row, And Inline Editing [PARTIAL]

### Purpose

Render all subtitle segments in a performant transcript panel, highlight the active cue based on the current playhead, and allow direct editing of text and timestamps.

### Implementation Shape

Feature 3 owns the transcript panel editing experience. It should keep the same normalized seconds-based model introduced in Feature 1:

- `subtitle.start` and `subtitle.end`: editable display strings.
- `subtitle.startTime` and `subtitle.endTime`: numeric seconds used for validation, preview sync, active-row lookup, and export.
- `currentTime`: numeric seconds from the store.
- `videoLibrary.duration`: numeric seconds from loaded video data, used for timestamp validation when available.

Do not introduce `startMs`, `endMs`, `vttTimeToMs`, or `msToVttTime` for this feature unless the whole subtitle model is migrated. The current project uses `vttTimeToSecond` and `secondToVttTime`.

### Current Status

- `DONE`: `SubtitleTranscriptPanel` uses `@tanstack/react-virtual` (fully compatible with React Compiler by passing `virtualItems` as a direct prop to `SubtitleList`).
- `PARTIAL`: Rows show segment numbers, compact start/end timestamp inputs, and textarea fields. Timestamp inputs are currently controlled placeholders with no update logic.
- `DONE`: Textarea changes update subtitle text in the store through `updateSubtitle`.
- `DONE`: Active row detection and auto-scroll are implemented.
- `DONE`: Auto-scroll ignores gaps with no active cue and uses instant scrolling for distant cue jumps to avoid virtualized-list flicker.
- `DONE`: Active-row auto-scroll pauses while the player is seeking.
- `TODO`: Active-row auto-scroll does not pause while an input or textarea in the transcript panel is focused.
- `TODO`: Timestamp inputs do not update `start`, `end`, `startTime`, or `endTime` yet.
- `TODO`: Invalid timestamp draft handling is not implemented.
- `TODO`: Valid timestamp normalization with `secondToVttTime` on blur or Enter is not implemented.
- `TODO`: Textarea auto-height is not implemented; textareas use fixed `rows={4}`.
- `PARTIAL`: Active and selected rows use the same ring style; separate active/selected styling is not implemented.
- `TODO`: Blur/Enter edit finalization and Escape snapshot restore are not implemented.

### Modify One By One

1. Types: `src/types/video-library-subtitle.type.ts`
   - Keep `SubtitleType` as:
     - `id: string`.
     - `start: string`.
     - `end: string`.
     - `text: string`.
     - `startTime: number`.
     - `endTime: number`.
   - Keep `updateSubtitle(id, patch)` typed as `Partial<SubtitleType>`.
   - No new type fields are required for Feature 3.

2. Store: `src/store/video-library-subtitle.store.ts`
   - Confirm `updateSubtitle(id, patch)` exists for per-row edits.
   - Confirm `setSelectedSubtitleId(id: string | null)` exists for row selection.
   - Confirm `setSubtitles(previousSnapshot)` can restore an edit snapshot on Escape.
   - Do not add history actions for Feature 3.

3. Components: `src/app/video-library/[id]/subtitle/[subtitleId]/_components/subtitle-transcript-panel.tsx`
   - Keep `useVirtualizer` with stable row keys from subtitle IDs.
   - **React Compiler Compatibility**: Since the React Compiler is enabled, it aggressively memoizes `<SubtitleList>` because the `rowVirtualizer` reference remains stable (interior mutability). To bypass this, we must pass `virtualItems={rowVirtualizer.getVirtualItems()}` as a prop to `SubtitleList`. Since `getVirtualItems()` returns a new array reference on scroll, this notifies the React Compiler that the prop changed, forcing a correct re-render of the list.
   - Select `currentTime`, `selectedSubtitleId`, `subtitles`, `setSelectedSubtitleId`, `setSubtitles`, and `updateSubtitle` from the store with `useShallow`.
   - Compute `activeIndex` with `subtitles.findIndex((s) => s.startTime <= currentTime && currentTime < s.endTime)`.
   - Keep `activeIndex` as `-1` when no cue matches.
   - Use `const activeIndexRef = useRef<number>(-1)` to remember the previous active index.
   - In an effect, call `rowVirtualizer.scrollToIndex(activeIndex, { align: 'center' })` only when:
     - `activeIndex >= 0`.
     - `activeIndex !== activeIndexRef.current`.
     - The user is not currently focused inside an `input` or `textarea` in the transcript panel.
   - Add text editing through `updateSubtitle(id, { text })`; do not call `setSubtitles` for per-row edits.
   - Current row selection happens on row click and textarea text changes with `setSelectedSubtitleId(subtitle.id)`.
   - Later timestamp-input work can also select the row on input focus or pointer down if needed.
   - Add compact start/end timestamp inputs:
     - Use controlled values from `subtitle.start` and `subtitle.end`.
     - Use plain `<input>` elements or existing form input components if they fit this compact row layout.
     - Accept `hh:mm:ss.mmm` and `mm:ss.mmm` because `vttTimeToSecond` supports both.
     - For a valid start edit, call `updateSubtitle(id, { start: nextValue, startTime: vttTimeToSecond(nextValue) })`.
     - For a valid end edit, call `updateSubtitle(id, { end: nextValue, endTime: vttTimeToSecond(nextValue) })`.
     - Normalize the displayed string with `secondToVttTime(timeInSeconds)` on blur or Enter.
     - If input is invalid, keep local input state so the user can finish typing; do not immediately overwrite their partial value from the store.
     - On blur, if the local value is invalid, restore the last valid store value.
   - Enforce basic timestamp validity before committing:
     - `startTime >= 0`.
     - `endTime > startTime`.
     - If `duration > 0`, require `startTime < duration` and `endTime <= duration`.
     - Recommended non-overlap rule: `previous.endTime <= startTime` and `endTime <= next.startTime` when neighboring cues exist.
     - If a timestamp would violate these rules, keep the local input visible while focused, but do not apply it to the store.
   - Capture a previous subtitle snapshot before editing:
     - Add `const editSnapshotRef = useRef<SubtitleType[] | null>(null)`.
     - On the first `onFocus` or `onPointerDown` for an edit session, store `structuredClone(subtitles)` if `editSnapshotRef.current` is null.
     - On blur, normalize valid timestamp values, restore invalid timestamp values, then clear the ref.
     - On Enter in timestamp inputs, normalize, clear the ref, and blur the input.
     - On `Ctrl+Enter` or `Cmd+Enter` in the textarea, clear the ref and blur the textarea.
     - On Escape, restore the previous snapshot with `setSubtitles(previousSnapshot)` and clear the ref.
   - Handle keyboard editing inside fields:
     - `Enter` in timestamp inputs commits the edit and blurs the input.
     - `Enter` in textarea should keep normal multiline behavior unless `Ctrl+Enter` / `Cmd+Enter` is chosen as the commit shortcut.
     - `Escape` cancels the active edit from the captured snapshot.
   - Add local timestamp draft state:
     - Keep an object keyed by subtitle ID and field, for example `{ [id]: { start?: string; end?: string } }`.
     - Display `draftValue ?? subtitle.start` and `draftValue ?? subtitle.end`.
     - Clear the field draft after successful normalization or Escape.
     - This prevents partial values like `00:01:` from being rejected before the user finishes typing.
   - Make active-row auto-scroll editing-safe:
     - Check `const activeElement = document.activeElement`.
     - Treat editing as active when `parentRef.current?.contains(activeElement)` and `activeElement.matches('input, textarea')`.
     - Return early from auto-scroll while editing.
   - Keep virtual row measuring stable:
     - Continue passing `ref={rowVirtualizer.measureElement}` to each virtual row wrapper.
     - If textarea height changes, call `rowVirtualizer.measure()` after the DOM height update.

4. Utils: `src/utils/vtt-time.util.ts`
   - Use `vttTimeToSecond` for timestamp input parsing.
   - Use `secondToVttTime` to normalize timestamp display after valid edits.
   - Keep all timestamp edit calculations in seconds.
   - If validation needs a helper, add a small local function in the transcript panel first:
     - `parseTimestampInput(value): number | null`.
     - Return `null` for invalid or non-finite values.

5. Styles/UI
   - Apply a strong active-row style: visible ring, subtle warm background, and clear border.
   - Apply a separate selected-row style, for example a neutral border/ring, when `selectedSubtitleId` differs from the active playback row.
   - If a row is both selected and active, active styling should win.
   - Keep row heights stable enough for virtualization.
   - Add textarea auto-height without causing layout thrash; call `rowVirtualizer.measure()` after height changes if needed.
   - Keep timestamp inputs compact and readable inside the right panel.
   - Suggested row layout:
     - Top row: segment index, start input, divider, end input.
     - Body: auto-height textarea.
   - Timestamp inputs should have monospace/tabular numeric styling so values do not jump while editing.
   - Invalid timestamp input should show a clear border color while focused, but do not add bulky helper text inside every row.
   - Textarea auto-height implementation detail:
     - Keep `resize-none`.
     - On mount/change, set `textarea.style.height = 'auto'`, then `textarea.style.height = textarea.scrollHeight + 'px'`.
     - Call `rowVirtualizer.measureElement(rowElement)` or `rowVirtualizer.measure()` after height changes.
     - Avoid measuring every row on every playback time update.

### Edge Cases

- Active-row auto-scroll should not fight the user while they are editing text or timestamps.
- If virtual rows are dynamically measured, test rows with one line and many lines of subtitle text.
- Timestamp edits should never leave a row with `endTime <= startTime`.
- Invalid partial timestamp input should be editable while focused and restored on blur if it never becomes valid.
- Timestamp normalization should not change cue timing except for rounding to milliseconds through `secondToVttTime`.
- Escape cancel should not erase unrelated edits made after the snapshot by another action; this editor is single-user local state, so a simple snapshot restore is acceptable.
- Textarea Enter should continue inserting a newline; use `Ctrl+Enter` or `Cmd+Enter` for commit.
- Auto-scroll should resume after the user leaves the currently edited input.

### Acceptance Checks

- [x] Subtitle list renders inside a virtualized container.
- [x] Textarea edits update subtitle text in the store.
- [x] Active subtitle row highlights when playback time enters its cue range.
- [x] Active subtitle row scrolls into view when the active cue changes.
- [ ] Active subtitle row does not auto-scroll while a transcript input or textarea is focused.
- [ ] Start/end inputs update `start`, `end`, `startTime`, and `endTime`.
- [ ] Invalid timestamp input is editable while focused and restored if still invalid on blur.
- [ ] Valid timestamp input normalizes with `secondToVttTime` on blur or Enter.
- [ ] Text edits finalize on blur or Ctrl+Enter/Cmd+Enter; timestamp edits finalize on blur or Enter.
- [ ] Escape restores the edit snapshot and clears local timestamp drafts.
- [ ] Textarea auto-height works for one-line and multiline cues without breaking virtualization.

---

## Feature 4 - Add And Delete Segments [TODO]

### Purpose

Support structural subtitle operations for adding a new segment and deleting the selected segment. No history actions or global keyboard shortcuts are required for this feature.

### Current Status

- `TODO`: Add and delete actions are not implemented in `src/store/video-library-subtitle.store.ts`.
- `PARTIAL`: Transcript panel toolbar exists, but currently only contains export.
- `TODO`: Add behavior and new-segment selection are not implemented.
- `TODO`: Delete behavior and post-delete selection are not implemented.
- `TODO`: Add/delete controls are not implemented.

### Modify One By One

1. Types: `src/types/video-library-subtitle.type.ts`
   - Add dedicated action types if add/delete live in the store:
     - `addSubtitleAt(currentTime: number, duration?: number): void`.
     - `deleteSelectedSubtitle(): void`.

2. Store: `src/store/video-library-subtitle.store.ts`
   - Prefer implementing structural actions in the store so toolbar buttons share one behavior:
     - `addSubtitleAt(currentTime, duration)`.
     - `deleteSelectedSubtitle()`.
   - Each structural action should apply the mutation directly to the current draft subtitle list.
   - Add delete behavior that clears selection when the selected row is deleted.
   - Keep selection predictable:
     - Add should select the newly created segment.
     - Delete should select the next segment if one exists, otherwise the previous segment, otherwise clear selection.
   - Add behavior:
     - Use seconds, not milliseconds.
     - Default new cue duration: `2` seconds.
     - Create a local ID such as `subtitle-${Date.now()}-${Math.random().toString(36).slice(2)}`.
     - If `duration > 0`, clamp the new cue end to `duration`.
     - If the playhead is inside an existing cue, insert the new cue after that cue using the existing cue end as the start.
     - Otherwise start the new cue at `currentTime`.
     - Avoid overlap with the next cue by clamping the new cue end to `next.startTime` when needed.
     - If clamping would make `endTime <= startTime`, use a small fallback duration only if it does not overlap; otherwise do not add.
     - Set `start` and `end` with `secondToVttTime(startTime)` and `secondToVttTime(endTime)`.
     - Use empty `text` for the new cue.

3. Components: `src/app/video-library/[id]/subtitle/[subtitleId]/_components/subtitle-transcript-panel.tsx`
   - Add toolbar buttons for add, delete, and export.
   - Disable delete when there are no subtitles or no selection.
   - Disable add when `duration > 0` and `currentTime >= duration`.
   - Add a new segment at the current player time:
     - Use `currentTime` from the store, in seconds.
     - Default duration: `2` seconds.
     - If duration is known, clamp the end to `duration`.
     - If the new segment would overlap the next cue, end it before the next cue starts.
     - If the playhead is inside an existing cue, insert after that cue or create a short cue after the selected cue; choose one behavior and keep it consistent.
   - Delete selected segment through the store action.

4. Components: `src/app/video-library/[id]/subtitle/[subtitleId]/_components/subtitle-editor.tsx`
   - No global keyboard shortcuts are required for this feature.
   - Keep add/delete available from toolbar buttons only.

5. Utils
   - Add a small local helper for generating subtitle IDs if needed.
   - Use `secondToVttTime` when creating segments.
   - Suggested ID helper: `subtitle-${Date.now()}-${Math.random().toString(36).slice(2)}`.
   - Keep this helper local to the subtitle store or transcript panel unless another module needs it.

6. Styles/UI
   - Use existing `Button` and `ToolTip` components.
   - Use lucide icons for toolbar actions.
   - Show disabled states clearly.
   - Keep toolbar controls compact because this panel is narrow.
   - Suggested lucide icons:
     - Add: `Plus`.
     - Delete: `Trash2`.
     - Export: `Download`.
   - Toolbar order: add, delete, separator, export.

### Edge Cases

- Do not let add create zero-length cues.
- Do not let add create cues beyond `duration` when duration is available.
- Do not let add overlap the next cue.
- Delete should do nothing when no subtitle is selected.

### Acceptance Checks

- [ ] Add creates a valid segment at the current player time.
- [ ] Delete removes the selected segment and keeps selection predictable.
- [ ] Add/delete controls are disabled when the action cannot run.

---

## Feature 5 - VTT Export [DONE]

### Purpose

Compile the edited in-memory subtitles into a valid WebVTT file and download it from the browser.

### Current Status

- `DONE`: Transcript panel has an Export button.
- `DONE`: Export currently creates a Blob and downloads a `.vtt` file.
- `DONE`: Serializer uses normalized `startTime` and `endTime` fields.
- `DONE`: Serializer sorts by `startTime` without mutating store order.
- `DONE`: Serializer guarantees normalized `hh:mm:ss.mmm` timestamps with `secondToVttTime`.
- `DONE`: Export is disabled when there are no valid cues.

### Modify One By One

1. Types: `src/types/video-library-subtitle.type.ts`
   - Export consumes the normalized `SubtitleType[]` shape with `startTime` and `endTime`.

2. Utils: `src/utils/text.util.ts`
   - Update `serializeVttContent(subtitles)` to sort by `startTime`.
   - Use `secondToVttTime(startTime)` and `secondToVttTime(endTime)`.
   - Preserve multiline cue text.
   - Always include the `WEBVTT` header.
   - Filter or skip invalid cues before writing:
     - Skip cues with missing text only if blank captions are not allowed by product requirements.
     - Always skip cues where `!Number.isFinite(startTime)`, `!Number.isFinite(endTime)`, or `endTime <= startTime`.
   - Serializer shape:
     - Start with `['WEBVTT', '']`.
     - For each sorted valid cue, push a numeric cue index.
     - Push `${secondToVttTime(startTime)} --> ${secondToVttTime(endTime)}`.
     - Push `subtitle.text` exactly as stored so multiline text remains multiline.
     - Push a blank line after each cue.
   - Prefer numeric cue indexes in exported files if backend cue IDs are editor-only implementation details.

3. Components: `src/app/video-library/[id]/subtitle/[subtitleId]/_components/subtitle-transcript-panel.tsx`
   - Keep export button in the toolbar/header.
   - Use `serializeVttContent(subtitles)` for the file content.
   - Download as `${subtitle.language || 'subtitle'}.vtt`.
   - Revoke the object URL after download.
   - Disable export when there are no valid cues.
   - If Feature 3 later adds local timestamp drafts, commit, normalize, or reject those drafts before export so the downloaded file matches the visible editor state.

4. Styles/UI
   - Keep the existing tooltip and download icon.
   - Place export with the other toolbar actions once the toolbar is complete.

### Edge Cases

- Export should work after text, timestamp, add, and delete edits.
- Export should work after timestamp edits even if formatted `start` and `end` strings are stale, because it uses `startTime` and `endTime`.
- Export should not mutate the current subtitle order in the store; sort a copied array.
- The downloaded file should end with a newline for better compatibility with subtitle tools.

### Acceptance Checks

- [x] Export button triggers a client-side file download.
- [x] Exported file starts with `WEBVTT`.
- [x] Exported cues are sorted by `startTime`.
- [x] Exported timestamps are normalized as `hh:mm:ss.mmm`.
- [x] Multiline subtitle text remains multiline in the exported file.
- [x] Export button is disabled when there are no valid cues.

---

## Final Verification Checklist

### Functional

- [x] Subtitles load from source files on page render.
- [x] Draft captions display dynamically on top of video.
- [x] Subtitle list renders inside the `@tanstack/react-virtual` wrapper container.
- [x] Active subtitle segment highlights and auto-scrolls into view.
- [x] Textarea edits update subtitle text in the store.
- [ ] Timestamp edits update formatted and second-based timing fields.
- [x] VTT export button triggers a browser download.
- [x] VTT export uses sorted second-based timings and normalized timestamps.
- [ ] Add/delete toolbar actions execute properly and keep selection predictable.

### Quality

- [x] `yarn lint` passes as of 2026-06-03 with 1 existing warning in `src/components/form/multi-select-field.tsx`.
- [x] `yarn tsc --noEmit --pretty false` passes as of 2026-06-03.
- [x] `yarn build` and `yarn next build` compile successfully without errors.
