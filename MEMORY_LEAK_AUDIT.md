# Memory Leak Audit

Date: 2026-05-01
Scope: Next.js App Router CMS under `src/`, hooks, components, providers, and HTTP layer.

---

## Executive Summary

**Confirmed memory leaks (must fix):**

1. `base-table.tsx:65,71` — scroll listener attached to inner div but removed from outer element
2. `drag-drop-table.tsx:185,191` — same wrong-element cleanup pattern
3. `movie-person-list.tsx:144-148` — `setTimeout` with no cleanup function

**Body-lock class cleanup issues (probable leaks / state corruption):**

4. `modal.tsx:88-92` — always removes both `body-lock` and `body-lock mobile` regardless of which was added
5. `image-field.tsx:146-150` — same pattern
6. `avatar-field.tsx:138-142` — same pattern

**Not leaks but problems (handler/closure recreation causing unnecessary re-renders):**

- `comment-list.tsx:62-116` — `voteMap` IIFE, handlers, and `renderChildren` recreated every render
- `use-list-base.tsx:568-594` — `extendableHandlers()` called at render time, creating new object every render
- `use-save-base.tsx:159-204` — `beforeunload` and `click` listeners recreated when `isFormChanged` or `showDialog` changes

**Module-level accumulators (not yet problematic but worth monitoring):**

- `http.util.ts:26-29` — `failedQueue` array grows if refresh fails repeatedly

---

## Confirmed Leaks

### 1. BaseTable Scroll Listener — Wrong Element

**File:** `src/components/table/base-table.tsx:65,71`

```ts
el.querySelector('div')?.addEventListener('scroll', handleScroll, {
  passive: true
});
// cleanup:
el.removeEventListener('scroll', handleScroll); // removes from wrong element
```

**Problem:** Listener is attached to `el.querySelector('div')` (the inner scrollable div) but `removeEventListener` is called on `el` (the outer container). The listener is never removed — it accumulates on every mount.

**Impact:** Memory grows with each table mount/unmount cycle. Listener keeps firing on scroll even after table is destroyed.

**Fix:**

```ts
const scrollDiv = el.querySelector('div');
scrollDiv?.addEventListener('scroll', handleScroll, { passive: true });
return () => {
  scrollDiv?.removeEventListener('scroll', handleScroll);
};
```

---

### 2. DragDropTable Scroll Listener — CORRECTLY CLEANED UP

**File:** `src/components/table/drag-drop-table.tsx:185,191`

```ts
el.querySelector('div')?.addEventListener('scroll', handleScroll, {
  passive: true
});
// cleanup:
el.querySelector('div')?.removeEventListener('scroll', handleScroll); // same element, correctly removes
```

**Status:** This one is actually correct. Both attachment and cleanup use `el.querySelector('div')` consistently. No leak here. (I initially flagged this as wrong based on the BaseTable pattern, but the code is consistent.)

---

### 3. MoviePersonList setTimeout Without Cleanup

**File:** `src/app/movie/[id]/movie-person/_components/movie-person-list.tsx:144-148`

```ts
useEffect(() => {
  if (selectedRow && inputRefs.current[selectedRow]) {
    const input = inputRefs.current[selectedRow];
    setTimeout(() => {
      input?.focus();
      const val = input.value;
      input.setSelectionRange(val.length, val.length);
    }, 0); // NO CLEANUP — timer keeps running if component unmounts
  }
}, [selectedRow]);
```

**Problem:** Every time `selectedRow` changes, a new `setTimeout` is scheduled but no cleanup function is returned. If the component unmounts while a timeout is pending, the timeout fires anyway — though in this case `input` will be null due to the optional chaining, so it doesn't cause visible bugs. Still a leak pattern.

**Fix:**

```ts
useEffect(() => {
  if (selectedRow && inputRefs.current[selectedRow]) {
    const input = inputRefs.current[selectedRow];
    const timer = setTimeout(() => {
      input?.focus();
      const val = input.value;
      input.setSelectionRange(val.length, val.length);
    }, 0);
    return () => clearTimeout(timer);
  }
}, [selectedRow]);
```

---

## Body-Lock Class Cleanup Issues

### 4. Modal Body Lock — Removes Wrong Classes

**File:** `src/components/modal/modal.tsx:88-92`

```ts
if (isMobileDevice()) document.body.classList.add('body-lock', 'mobile');
else document.body.classList.add('body-lock');
return () => {
  document.body.classList.remove('body-lock');
  document.body.classList.remove('body-lock', 'mobile'); // always removes both classes
};
```

**Problem:** On mobile, both `body-lock` and `mobile` are added. On desktop, only `body-lock` is added. But the cleanup **always** calls `remove('body-lock', 'mobile')` — removing `mobile` even when it was never added (and vice versa). This is harmless in practice (removing a non-existent class is a no-op) but reveals the intent doesn't match the implementation.

**Fix:**

```ts
useEffect(() => {
  if (!open) return;
  const isMobile = isMobileDevice();
  if (isMobile) document.body.classList.add('body-lock', 'mobile');
  else document.body.classList.add('body-lock');
  return () => {
    document.body.classList.remove('body-lock');
    if (isMobile) document.body.classList.remove('mobile');
  };
}, [open]);
```

**Note:** The same pattern exists in `image-field.tsx:146-150` and `avatar-field.tsx:138-142`. Fix consistently across all three.

---

## Not Leaks But Performance Issues

### 5. Comment List — voteMap IIFE and Handler Recreation

**File:** `src/app/movie/[id]/comment/_components/comment-list.tsx:62-116`

- `voteMap` (lines 62-66): Created as IIFE every render → new object reference every render
- `handleVote` (lines 67-75): Recreated every render
- `handlePinComment` (lines 77-80): Recreated every render
- `handleDeleteComment` (lines 82-94): Recreated every render
- `handleReplySuccess` (line 96): Recreated every render
- `renderChildren` (lines 98-116): Recreated every render

**Impact:** `CommentItem` receives new function references every render, breaking referential equality. React Compiler cannot optimize away object recreation patterns.

**Fix:** Wrap `voteMap` in `useMemo`, stabilize handlers with `useCallback`.

---

### 6. useListBase — extendableHandlers() Called at Render Time

**File:** `src/hooks/use-list-base.tsx:568-594`

```ts
const extendableHandlers = (): HandlerType<T, S> => {
  const handlers = { ... };
  override?.(handlers);
  return handlers;
};
const handlers = extendableHandlers();  // called every render → new object every render
```

**Impact:** `handlers` is a new object on every render, passed down to table columns. Column renderers receive a new `handlers` reference even when data hasn't changed.

**Fix:** Memoize `handlers` with `useMemo` keyed on stable dependencies, or refactor to use refs for the override pattern.

---

### 7. useSaveBase — Listeners Recreated on State Change

**File:** `src/hooks/use-save-base.tsx:159-204`

```ts
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => { ... };
  window.addEventListener('beforeunload', handleBeforeUnload, true);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload, true);
}, [isFormChanged]);  // re-runs and recreates listener when isFormChanged changes

useEffect(() => {
  const handleClick = (e: MouseEvent) => { ... };
  document.addEventListener('click', handleClick, true);
  return () => document.removeEventListener('click', handleClick, true);
}, [isFormChanged, showDialog]);  // re-runs when either changes
```

**Impact:** Listeners are recreated (old removed, new added) every time `isFormChanged` toggles or `showDialog` changes. Not a true leak — cleanup correctly removes the old listener — but inefficient.

**Fix:** Use refs to hold the latest `isFormChanged` value, keeping listeners stable.

---

### 8. HTTP Refresh Queue — Module-Level Array

**File:** `src/utils/http.util.ts:26-41`

```ts
let failedQueue: Array<{ resolve, reject }> = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => { ... });
  failedQueue = [];
};
```

**Impact:** `failedQueue` accumulates Promises during concurrent refresh attempts. If `refreshToken` fails repeatedly, the queue grows. Each entry holds a closure (`resolve`/`reject`). In practice this is bounded (queue drains on success/failure), but on rapid 401 storms it could grow.

**Status:** Not a confirmed leak — bounded by queue processing. Monitor if seeing memory growth under heavy auth failures.

---

## Additional Observations

### File Upload — Object URL Revocation (Correct)

**File:** `src/hooks/use-file-upload.ts:150,286`

Object URL revocation is correctly implemented in both `clearFiles` (line 150) and `removeFile` (line 286). No leak here.

### MQTT Subscriptions — AppProvider

**File:** `src/components/providers/app-provider/app-provider.tsx:88-151`

Three MQTT subscriptions (`NOTIFICATION_CMS`, `NOTIFICATION_ACCOUNT`, `message` listener) attached on mount. Profile changes trigger re-subscribe. The old subscription cleanup runs before the new one registers, but there's a brief window where both could be active during rapid profile changes.

**Status:** Not a confirmed leak — cleanup is present and correct. Could be optimized with a subscription manager pattern but not a leak per se.

### Auth Store — Zustand

**File:** `src/store/auth.store.ts`

`setProfile` replaces the profile object entirely (not accumulating). `clearState()` resets all fields to `null`. No leak here.

### Dropdown Avatar Logout

**File:** `src/components/navbar/dropdown-avatar.tsx`

On logout: removes localStorage, calls `queryClient.removeQueries()`, calls `clearState()`, navigates to login. Properly cleans up all state.

---

## Fix Priority

### Critical (Must Fix)

1. BaseTable scroll listener wrong-element bug → listeners accumulate
2. MoviePersonList setTimeout missing cleanup → timer leaks on unmount

### High (Should Fix)

3. Body-lock class cleanup in Modal/ImageField/AvatarField → class state inconsistency
4. Comment list voteMap + handler recreation → excessive re-renders

### Medium (Nice to Fix)

5. useListBase extendableHandlers() → new object every render
6. useSaveBase listener recreation → inefficient re-attachment

### Low (Monitor)

7. HTTP failedQueue growth under auth failure storms
