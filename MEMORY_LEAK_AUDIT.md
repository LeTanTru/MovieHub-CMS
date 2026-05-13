# Memory Leak Audit

Date: 2026-05-13
Scope: Next.js App Router CMS under `src/`, hooks, components, providers, table components, form previews, comments, MQTT, and HTTP layer.

---

## Executive Summary

**Confirmed memory leaks requiring immediate fixes:** none found in the current codebase.

The previously reported hard leaks have been fixed:

1. `src/components/table/base-table.tsx` now captures the scroll element and removes the listener from the same element.
2. `src/app/movie/[id]/movie-person/_components/movie-person-list.tsx` now clears the pending focus `setTimeout`.
3. `src/components/form/image-field.tsx` and `src/components/form/avatar-field.tsx` now clean up wheel, resize, and body-lock state consistently.

**Remaining issues are mostly lifecycle robustness or render-performance concerns:**

- `src/components/modal/modal.tsx` uses global body scroll-lock state without coordination for stacked overlays.
- `src/components/table/drag-drop-table.tsx` removes its scroll listener via a fresh `querySelector` call instead of capturing the exact node used during registration.
- `src/app/movie/[id]/comment/_components/comment-list.tsx` recreates `voteMap`, handlers, and `renderChildren` every render.
- `src/hooks/use-list-base.tsx`, `src/hooks/use-inifinite-list-base.tsx`, and `src/hooks/use-save-base.tsx` create new handler objects every render.
- `src/hooks/use-save-base.tsx` recreates global `beforeunload` and document click listeners when dirty/dialog state changes. Cleanup is correct, so this is not a leak.
- `src/utils/http.util.ts` has a module-level refresh queue. It is bounded by queue draining, but should be monitored during 401 storms.

---

## Resolved Findings

### 1. BaseTable Scroll Listener

**File:** `src/components/table/base-table.tsx`

**Current status:** fixed.

The scroll listener is now attached to `scrollDiv` and removed from the same captured `scrollDiv` reference:

```ts
const scrollDiv = el.querySelector('div');
scrollDiv?.addEventListener('scroll', handleScroll, {
  passive: true
});

return () => {
  scrollDiv?.removeEventListener('scroll', handleScroll);
};
```

This resolves the old wrong-element cleanup bug.

### 2. MoviePersonList Pending Focus Timer

**File:** `src/app/movie/[id]/movie-person/_components/movie-person-list.tsx`

**Current status:** fixed.

The focus timer is now cleared on dependency changes or unmount:

```ts
const timer = setTimeout(() => {
  input?.focus();
  const val = input.value;
  input.setSelectionRange(val.length, val.length);
}, 0);
return () => clearTimeout(timer);
```

### 3. ImageField and AvatarField Preview Cleanup

**Files:**

- `src/components/form/image-field.tsx`
- `src/components/form/avatar-field.tsx`

**Current status:** fixed for the originally reported issue.

Both components now:

- capture the preview node before adding the `wheel` listener,
- remove the listener from the same node,
- remove the `mobile` class only if the preview added it,
- remove the `resize` listener when responsive breakpoints are active.

---

## Current Findings

### 1. Modal Body Scroll Lock Is Not Coordinated Across Stacked Overlays

**File:** `src/components/modal/modal.tsx`

**Severity:** medium, state consistency issue.

`Modal` currently locks body scroll when `open` is true and unlocks it when that modal closes:

```ts
document.body.classList.add('body-lock');
document.body.style.overflow = 'hidden';

return () => {
  document.body.classList.remove('body-lock');
  document.body.style.overflow = '';
  document.body.style.marginRight = '';
};
```

This is correct for one modal. It can become incorrect when multiple overlays are mounted at the same time, for example a modal plus a nested confirm dialog, image preview, or another portal overlay. The first overlay to unmount can remove `body-lock` and restore body scrolling while another overlay is still open.

**Impact:** Not a memory leak, but it can corrupt global page state and cause body scrolling/layout shift while an overlay remains visible.

**Recommended fix:** centralize body-lock ownership with a small reference counter/helper, for example `lockBodyScroll()` returning an unlock function. Each modal/preview increments on open and decrements on cleanup; only the final unlock restores body styles.

### 2. DragDropTable Scroll Listener Cleanup Is Correct but Brittle

**File:** `src/components/table/drag-drop-table.tsx`

**Severity:** low.

Current code attaches and removes from `el.querySelector('div')`:

```ts
el.querySelector('div')?.addEventListener('scroll', handleScroll, {
  passive: true
});

return () => {
  el.querySelector('div')?.removeEventListener('scroll', handleScroll);
};
```

This is currently consistent and is not a confirmed leak. However, it is less robust than `BaseTable` because cleanup performs a new lookup instead of capturing the original scroll node. If the inner scroll element were replaced before unmount, cleanup could remove from the wrong node.

**Recommended fix:**

```ts
const scrollDiv = el.querySelector('div');
scrollDiv?.addEventListener('scroll', handleScroll, { passive: true });

return () => {
  scrollDiv?.removeEventListener('scroll', handleScroll);
};
```

### 3. CommentList Recreates Objects and Handlers Every Render

**File:** `src/app/movie/[id]/comment/_components/comment-list.tsx`

**Severity:** medium performance issue.

The following values are recreated every render:

- `voteMap`
- `handleVote`
- `handlePinComment`
- `handleDeleteComment`
- `handleReplySuccess`
- `renderChildren`

These are passed into `CommentItem`, so child components receive new references even when the underlying data has not changed.

**Impact:** Not a memory leak. It can cause avoidable rerenders across a recursive comment tree.

**Recommended fix:** use `useMemo` for `voteMap` and `useCallback` for handlers/render helpers where it provides stable references without making dependencies harder to reason about.

### 4. Handler Objects Are Recreated in Base Hooks

**Files:**

- `src/hooks/use-list-base.tsx`
- `src/hooks/use-inifinite-list-base.tsx`
- `src/hooks/use-save-base.tsx`

**Severity:** medium performance issue.

These hooks call `extendableHandlers()` during render and return a new `handlers` object every render.

Example from `use-list-base.tsx`:

```ts
const handlers = extendableHandlers();
```

**Impact:** Not a leak. However, consumers that include `handlers` in dependency arrays or pass handlers deep into memoized children lose referential stability. `CommentList` currently has an effect depending on `handlers`, which means that effect can rerun more often than the meaningful dependencies require.

**Recommended fix:** either memoize the returned handlers object or expose stable callback functions directly. If the `override` pattern makes full memoization awkward, move mutable extension points into refs and keep the public handler object stable.

### 5. useSaveBase Reattaches Global Listeners on State Changes

**File:** `src/hooks/use-save-base.tsx`

**Severity:** low performance issue.

`beforeunload` is recreated when `isFormChanged` changes, and the document click listener is recreated when `isFormChanged` or `showDialog` changes:

```ts
window.addEventListener('beforeunload', handleBeforeUnload, true);
return () =>
  window.removeEventListener('beforeunload', handleBeforeUnload, true);

document.addEventListener('click', handleClick, true);
return () => document.removeEventListener('click', handleClick, true);
```

Cleanup is correct, so this is not a memory leak.

**Recommended fix:** use refs for the latest dirty/dialog state and register each global listener once.

### 6. HTTP Refresh Queue Is Bounded but Worth Monitoring

**File:** `src/utils/http.util.ts`

**Severity:** low, monitor.

`failedQueue` is a module-level array used to queue requests while one refresh is in progress. It is cleared in `processQueue()` on success or handled failure.

**Impact:** Not a confirmed leak. During a large 401 storm, the queue can temporarily hold many Promise closures until refresh completes or fails.

**Recommended hardening:**

- keep `processQueue(error, null)` in every refresh failure path,
- avoid logging the full queue in production,
- consider a maximum queue size or fail-fast behavior if auth failures spike.

---

## Additional Checks

### Emoji Picker Components

**Files:**

- `src/app/movie/[id]/comment/_components/comment-input.tsx`
- `src/app/movie/[id]/comment/_components/comment-form.tsx`

Both components dynamically create an `emoji-picker` element and attach an anonymous `emoji-click` listener. On cleanup they remove the entire picker node and guard async import completion with `mounted = false`.

**Status:** not a confirmed leak. Removing the node should allow the picker and its listener to be garbage collected. For clarity and explicit cleanup, the listener could be named and removed before removing the node.

### File Upload Object URLs

**File:** `src/hooks/use-file-upload.ts`

Object URLs are revoked in both `clearFiles` and `removeFile`.

**Status:** no leak found.

### MQTT Subscriptions and Message Listeners

**Files:**

- `src/components/providers/mqtt-provider/mqtt-provider.tsx`
- `src/hooks/use-mqtt.ts`
- `src/lib/mqtt.ts`

MQTT subscriptions and message listeners have cleanup paths:

- `client.unsubscribe(...)` in provider effects,
- `client.off('message', handler)` in provider and `useMqtt`.

`src/lib/mqtt.ts` registers lifecycle logging listeners on a module-level singleton client. This is expected to live for the app session.

**Status:** no confirmed leak.

### Modal Body Scroll Listener

**File:** `src/components/modal/modal.tsx`

`Modal.Body` captures the scroll element and removes the `scroll` and `resize` listeners on cleanup.

**Status:** no leak found.

### Auth Store

**File:** `src/store/auth.store.ts`

The Zustand auth store replaces profile/token state and clears fields on logout.

**Status:** no leak found.

---

## Fix Priority

### High

1. Centralize body scroll-lock management so multiple modals/previews cannot unlock the body while another overlay is open.

### Medium

2. Stabilize `CommentList` `voteMap`, handlers, and recursive renderer.
3. Stabilize `handlers` returned by `use-list-base`, `use-inifinite-list-base`, and `use-save-base`.

### Low

4. Capture `DragDropTable` scroll element before listener registration, matching `BaseTable`.
5. Keep `useSaveBase` global listeners stable with refs.
6. Optionally make emoji picker event cleanup explicit.
7. Monitor `http.util.ts` refresh queue behavior under heavy 401 failures.
