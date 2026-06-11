# ArtPlayer Video Player V2 Plan

## Goal

Build a new `VideoPlayerV2` based on ArtPlayer while preserving the public behavior of the current [`VideoPlayer`](../src/components/video-player/video-player.tsx). The first implementation should be a drop-in candidate for CMS preview modals, video-library forms, and subtitle editing before replacing the existing Vidstack player.

## Research Summary

ArtPlayer is an imperative browser video player, not a React component. The official React example mounts `new Artplayer(...)` in an effect and calls `art.destroy(false)` during cleanup. The docs also warn that changing the React `option` object directly will not update an existing player, so our React wrapper must explicitly synchronize prop changes through the ArtPlayer instance instead of relying on React re-rendering. Source: [ArtPlayer React usage](https://artplayer.org/document/en/).

The current official docs site is labeled `5.3.x`, while the GitHub repository shows `5.4.0` as the latest release on March 13, 2026. Treat `5.4.x` as the dependency target, but verify plugin compatibility during implementation. Source: [ArtPlayer GitHub repository](https://github.com/zhw2590582/ArtPlayer).

ArtPlayer can cover the core player surface:

- Basic playback options include `container`, `url`, `poster`, `theme`, `volume`, `muted`, `autoplay`, `hotkey`, `pip`, `fullscreen`, `fullscreenWeb`, `playbackRate`, `setting`, `lock`, `gesture`, `fastForward`, and `autoPlayback`. Source: [basic options](https://artplayer.org/document/en/start/option.html).
- Non-native formats such as HLS require `type` plus `customType`, where the handler receives the video element, URL, and ArtPlayer instance. This is the right place to attach `hls.js` and inject internal-media auth headers. Source: [type/customType options](https://artplayer.org/document/en/start/option.html).
- Custom controls support named items, left/right placement, HTML/element rendering, click handlers, selectors, and mounted hooks. Source: [controls](https://artplayer.org/document/en/component/controls.html).
- The settings panel supports built-in items and custom selector lists, which can host subtitle, quality, speed, and volume controls. Source: [settings panel](https://artplayer.org/document/en/component/setting.html).
- Built-in subtitles support `vtt`, `srt`, and `ass`; multiple subtitles need the official plugin. Source: [subtitle option](https://artplayer.org/document/en/start/option.html) and [plugin list](https://github.com/zhw2590582/ArtPlayer).
- Preview thumbnails can use ArtPlayer's sprite thumbnail option, while current VTT thumbnail support should use `artplayer-plugin-vtt-thumbnail`. Source: [thumbnail option](https://artplayer.org/document/en/start/option.html) and [plugin list](https://github.com/zhw2590582/ArtPlayer).
- ArtPlayer exposes playback events such as `play`, `error`, `click`, `hotkey`, `destroy`, and DOM-like media events through `art.on(...)`, and instance properties include `currentTime`, `duration`, `muted`, `switchUrl`, and `switchQuality`. Sources: [events](https://artplayer.org/document/en/advanced/event.html), [instance properties](https://artplayer.org/document/en/advanced/property.html).

## Current Player Contract

The current player accepts all base Vidstack `MediaPlayer` props except `ref`, `children`, `viewType`, and `streamType`, plus CMS-specific props:

- `auth`, `token`: add `Authorization: Bearer <token>` to HLS requests for internal videos.
- `src`, `thumbnailUrl`, `vttUrl`, `title`, `autoPlay`, `volume`, `className`.
- `duration`, `introStart`, `introEnd`, `outroStart`, `skipOutro`.
- `defaultQuality`: maps CMS quality preference to HLS rendition height.
- `textTracks`: optional subtitle/caption tracks.
- `markers`, `activeMarkerId`: timeline ranges for subtitle editor.
- `prev`, `next`, `onPrevClick`, `onNextClick`: episode navigation controls.
- `onTimeUpdate`, `onSeeked`, `onEnded`, `onSeeking`: used by modals and subtitle editor.
- `hideVolumeIndicator`, `slots`: UI customization hooks.
- `ref`: exposes imperative player access, currently `MediaPlayerInstance`.

Current behavior that must remain:

| Capability                     | Current behavior                                                                              | V2 approach                                                              |
| ------------------------------ | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Browser-only render            | Imported with `next/dynamic(..., { ssr: false })` by callers                                  | Keep dynamic import support; also mark wrapper `'use client'`            |
| Autoplay and inline playback   | `autoPlay`, `playsInline`, `crossOrigin`                                                      | Use ArtPlayer `autoplay` and `moreVideoAttr.playsInline`                 |
| Poster                         | `Poster` from Vidstack                                                                        | ArtPlayer `poster`                                                       |
| HLS internal auth              | Vidstack HLS provider `xhrSetup`                                                              | `customType.m3u8` with `hls.js` `xhrSetup`                               |
| Play/pause overlay             | `PlayPauseIndicator` updates on play/pause                                                    | Custom ArtPlayer layer or CSS state overlay                              |
| Volume overlay                 | `VolumeIndicator` unless hidden                                                               | Custom layer controlled by `volumechange`                                |
| Buffering indicator            | Vidstack buffering slot                                                                       | ArtPlayer loading indicator plus optional custom layer                   |
| Click to play/pause            | Full overlay `Gesture`                                                                        | ArtPlayer `click` handler or custom layer with `art.toggle()`            |
| Seek buttons                   | Back/forward 10 seconds                                                                       | Custom controls call `art.currentTime +=/-= 10`                          |
| Prev/next buttons              | Optional slot buttons                                                                         | Custom controls call callbacks                                           |
| Skip intro                     | Visible when `currentTime >= introStart && currentTime < introEnd`; click seeks to `introEnd` | Custom layer updated from `timeupdate`                                   |
| Skip outro                     | Visible when enabled and `currentTime >= outroStart`; click calls `onNextClick`               | Custom layer updated from `timeupdate`                                   |
| Timeline intro/outro highlight | Overlay ranges on Vidstack slider                                                             | Custom timeline plugin that draws range elements over ArtPlayer progress |
| Subtitle editor markers        | Red ranges on timeline; active range highlighted                                              | Same custom timeline plugin                                              |
| VTT thumbnails                 | Vidstack thumbnails from `vttUrl`                                                             | `artplayer-plugin-vtt-thumbnail` if `vttUrl` points to VTT thumbnails    |
| Subtitles                      | Imperative `TextTrack` sync                                                                   | Built-in `subtitle` for one track, multiple-subtitles plugin for many    |
| Quality                        | Vidstack HLS quality options and default-quality effect                                       | `artplayer-plugin-hls-control` plus `hls.js` level selection             |
| Speed                          | Slider from 0.25x to 2x                                                                       | Custom setting item or built-in `playbackRate` with our required range   |
| Volume setting                 | Custom slider                                                                                 | Custom setting item or ArtPlayer built-in volume UI plus CSS             |
| PiP/fullscreen                 | Vidstack buttons                                                                              | ArtPlayer `pip`, `fullscreen`, `fullscreenWeb`                           |
| Callbacks                      | Pass through Vidstack event detail                                                            | Adapter emits compatible enough event payloads for current consumers     |

## Proposed Architecture

Create a parallel component instead of mutating the existing one in place:

```text
src/components/video-player-v2/
  index.tsx
  video-player-v2.tsx
  video-player-v2.css
  types.ts
  _lib/
    create-artplayer-options.ts
    hls.ts
    normalize-tracks.ts
    quality.ts
  _plugins/
    timeline-ranges.ts
    skip-buttons.ts
    cms-controls.ts
    indicators.ts
```

Keep `src/components/video-player` unchanged until V2 passes parity checks. The rollout can then switch dynamic imports one caller at a time.

### React Wrapper

`VideoPlayerV2` should:

1. Render a fixed-size container `<div ref={containerRef} className={cn('video-player-v2', className)} />`.
2. Lazily instantiate ArtPlayer in a client effect after the container exists.
3. Store the instance in `useRef<Artplayer | null>`.
4. Destroy the instance on unmount.
5. Expose a small imperative handle through `ref` that matches the current caller needs: `currentTime`, `pause()`, `play()`, and `el`.
6. Sync prop changes explicitly:
   - `src` -> `art.switchUrl(src)` or recreate if `type/customType` changes.
   - `volume` -> `art.volume`.
   - `thumbnailUrl` -> update poster if supported, otherwise recreate.
   - `textTracks`, `markers`, `activeMarkerId`, intro/outro windows -> plugin update methods.

Avoid putting high-frequency playback state in React state. Time, volume, and loading indicators should update DOM elements through plugin methods or refs to avoid re-rendering on every `timeupdate`.

### HLS Adapter

Use existing `hls.js` dependency. The adapter should:

- Detect HLS by extension or explicit `type: 'm3u8'`.
- Use native HLS on Safari if reliable, otherwise attach `Hls` to the ArtPlayer video element.
- Pass `xhrSetup` only when `auth` is true and `token` is non-empty.
- Destroy the HLS instance when ArtPlayer switches source or unmounts.
- Wire HLS levels to quality controls and apply `defaultQuality` after the manifest is parsed.

Default quality mapping should preserve the current table:

```ts
const QUALITY_MAP: Record<number, number> = {
  0: 0,
  1: 720,
  2: 1080,
  3: 1440,
  4: 9999
};
```

When `defaultQuality` is `0`, keep auto quality. When it is the max CMS value, select the highest available level.

### Event Adapter

Current consumers only need a narrow event subset. Define stable V2 callback payloads instead of leaking raw ArtPlayer internals everywhere:

```ts
type VideoPlayerV2TimeUpdateDetail = {
  currentTime: number;
  duration: number;
};
```

Map events:

- `timeupdate` -> `onTimeUpdate({ currentTime, duration }, nativeEvent)`
- `seeking` -> `onSeeking(nativeEvent)`
- `seeked` -> `onSeeked(currentTime)`
- `ended` -> `onEnded(nativeEvent)`
- `play`, `pause`, `volumechange`, waiting/loading events -> indicators only

The subtitle preview currently expects `onTimeUpdate((detail) => setCurrentTime(detail.currentTime))` and `onSeeked((currentTime) => completeSeek(currentTime))`, so those shapes must be preserved.

### Timeline Plugin

Implement one ArtPlayer plugin that owns all CMS timeline overlays:

- Intro highlight: `introStart` to `introEnd`.
- Outro highlight: `outroStart` to `duration`.
- Subtitle markers: validated/clamped ranges from `markers`.
- Active marker style from `activeMarkerId`.
- Optional VTT thumbnail plugin integration.

This plugin should expose an update method:

```ts
art.plugins.cmsTimeline.update({
  duration,
  introStart,
  introEnd,
  outroStart,
  markers,
  activeMarkerId
});
```

Use the same marker validation logic as the current [`time-slider-marker.tsx`](../src/components/video-player/_components/time-slider-marker.tsx): ignore non-finite values, invalid ranges, ranges outside duration, and zero-width ranges.

### Skip Buttons Plugin

Implement skip buttons as ArtPlayer layers:

- `skip-intro`: visible only inside `[introStart, introEnd)`, click sets `art.currentTime = introEnd`.
- `skip-outro`: visible only when `skipOutro && onNextClick && outroStart < duration && currentTime in [outroStart, duration)`, click calls `onNextClick`.

Button text should keep the existing Vietnamese UI copy, but fix encoding when touching the implementation.

### Controls And Settings

Use ArtPlayer controls/settings rather than rendering React children inside ArtPlayer:

- Left controls: play/pause is built in; add previous, next, back 10 seconds, forward 10 seconds.
- Right controls: PiP, fullscreen, settings.
- Settings:
  - subtitles: off plus available tracks.
  - speed: exact supported range from current player, `0.25` through `2` in `0.05` increments.
  - volume: 0-100 slider.
  - quality: auto plus HLS levels sorted descending.

Use ArtPlayer's custom `controls` and `settings` APIs for first pass. If styling becomes too constrained, move only the problematic control to a small DOM plugin. Do not introduce a React portal layer unless ArtPlayer DOM APIs cannot support the behavior.

### Subtitles

Support two modes:

1. `textTracks` empty and `vttUrl` is thumbnail-only: no subtitle track.
2. `textTracks` has one item: use ArtPlayer `subtitle`.
3. `textTracks` has multiple items: use `artplayer-plugin-multiple-subtitles`.

Normalize incoming Vidstack `TrackProps` into an internal shape:

```ts
type VideoPlayerV2TextTrack = {
  src: string;
  label: string;
  language?: string;
  kind?: 'subtitles' | 'captions';
  type?: 'vtt' | 'srt' | 'ass';
  default?: boolean;
};
```

The current player uses `getLanguageLabel(label)` in the settings menu. Reuse that behavior for display labels.

## Dependency Plan

Add runtime dependencies only when implementing, not in this planning change:

```bash
yarn add artplayer artplayer-plugin-hls-control artplayer-plugin-vtt-thumbnail artplayer-plugin-multiple-subtitles
```

Do not remove `@vidstack/react` until all imports have migrated away from the old player.

## Rollout Plan

### Phase 1: Compatibility Shell

- Add `src/components/video-player-v2`.
- Define `VideoPlayerV2Props` from current `VideoPlayerProps` instead of exposing ArtPlayer options directly.
- Implement mount/destroy, poster, source, volume, autoplay, fullscreen, PiP, hotkeys, and core callbacks.
- Add CSS with `.video-player-v2 { position: relative; height: 100%; }`.
- Manually verify in a simple internal video preview.

### Phase 2: HLS And Auth

- Implement `customType.m3u8` using `hls.js`.
- Inject `Authorization` header for internal media.
- Destroy HLS instances correctly on source switch and unmount.
- Add default quality selection and quality settings.
- Verify internal and external videos in both modal and form preview.

### Phase 3: CMS Timeline Parity

- Add timeline plugin for intro/outro highlights and subtitle markers.
- Add skip intro/outro layers.
- Add seek +/-10, prev, and next controls.
- Verify subtitle editor active marker updates without React render churn.

### Phase 4: Thumbnails And Subtitles

- Add VTT thumbnail plugin integration.
- Add subtitle track normalization and settings.
- Support multiple subtitle tracks behind the plugin.
- Verify existing `textTracks` usage and the subtitle editor overlay.

### Phase 5: Consumer Migration

- Switch one low-risk caller to `VideoPlayerV2`, likely a read-only preview modal.
- Then migrate `VideoLibraryForm`.
- Migrate `SubtitlePreviewPlayer` last because it relies on imperative seek/pause and high-frequency time sync.
- Keep old `VideoPlayer` exported until all consumers are stable.

### Phase 6: Cleanup

- Remove Vidstack-only components after migration:
  - `src/components/video-player/_components/*`
  - Vidstack CSS imports
  - `@vidstack/react` dependency
- Rename `video-player-v2` to `video-player` only after callers are migrated or keep both exports if rollback is desired.

## Verification Checklist

There is no test framework in this project, so verification is manual plus lint/build:

- `yarn lint`
- `yarn build`
- Internal HLS video loads with auth token.
- External video URL loads without auth header.
- Poster displays before playback.
- Autoplay behavior matches current environment/device volume logic.
- Play/pause, volume, buffering indicators display.
- Click toggles play/pause.
- Seek backward/forward jumps exactly 10 seconds.
- Prev/next buttons appear only when enabled and callbacks exist.
- Skip intro appears only in the configured intro window and seeks to `introEnd`.
- Skip outro appears only in the configured outro window and triggers next callback.
- Intro/outro timeline highlights match current player.
- Subtitle markers are clamped, invalid ranges are ignored, and active marker is highlighted.
- VTT thumbnails display on timeline hover.
- Subtitle settings show off/single/multiple tracks correctly.
- Quality setting includes auto plus available HLS levels and honors `defaultQuality`.
- Subtitle editor can seek to selected subtitle, pause the player, update current time, and complete seeks.

## Risks And Mitigations

- ArtPlayer options are not reactive. Use explicit update methods and small plugins with `update(...)` APIs.
- HLS quality behavior may differ from Vidstack. Keep all quality logic in `hls.ts` and verify with real encoded ladders.
- VTT thumbnail support may need the plugin instead of the built-in thumbnail sprite config. Prefer plugin integration because the CMS stores `vttUrl`.
- ArtPlayer control DOM may constrain exact Vidstack UI parity. Start with ArtPlayer APIs; fall back to DOM plugins only for controls that cannot be expressed cleanly.
- High-frequency `timeupdate` can cause React re-renders. Keep transient player state in refs/plugin DOM and only invoke existing callbacks.
- Current UI files show mojibake in Vietnamese strings. Preserve user-visible labels semantically, and fix encoding only in files touched during the V2 implementation.
