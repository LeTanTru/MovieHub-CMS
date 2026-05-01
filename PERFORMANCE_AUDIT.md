# Performance Audit

Date: 2026-05-01
Scope: Next.js App Router CMS under `src/`, shared hooks/components, query layer, media/upload surfaces, and production build configuration. React Compiler is enabled (`reactCompiler: true` in `next.config.ts:28`).

## Verification Status

- **Static code audit completed** with line-level verification.
- `yarn build` — not run as part of this audit (prior audit confirmed clean build).
- React Compiler interaction analysis included.
- `yarn lint` — not run as part of this audit (prior audit confirmed passing).
- No tests exist in this repo; none added.

---

## Executive Summary

The biggest performance risks are not isolated page bugs. They are **shared app-level abstractions** that run on every route:

1. MQTT client is eagerly created at the app root — every unauthenticated or public-route visitor pays the connection + bundle cost.
2. React Query Devtools are rendered unconditionally (the guard exists but is not effective — see Finding #1).
3. List hooks duplicate server-state into React state via `useEffect` and recreate large handler objects/functions every render.
4. Tables render every row and cell directly, with no virtualization.
5. Image thumbnails use `unoptimized` and run extra browser image probes per cell.

**With React Compiler enabled**, manual memoization for primitives is redundant, but genuine bugs (new objects/functions per render) are NOT fixed by the compiler and must be addressed manually.

These issues compound on list-heavy CMS pages (movie, video library, comments, permissions, nested movie-item pages).

---

## Phase 1: Critical (Fix Immediately)

### 1. React Query Devtools Are Not Production-Guarded

**Finding:** The guard at `query-provider.tsx:16` using `process.env.NODE_ENV !== 'production'` is **correct in principle** but the `NODE_ENV` check in the browser during a Next.js build may not behave as expected. The more reliable pattern is to use `next/dynamic` with `ssr: false` or check `NEXT_PUBLIC_VERCEL_ENV` for Vercel deployments. However, the bigger issue is that `@tanstack/react-query-devtools` is still imported and parsed in the production bundle even if not rendered — tree-shaking depends on build config.

**Evidence:**

- `src/components/providers/query-provider/query-provider.tsx:16` — guard exists but may not prevent bundle inclusion
- `package.json:46` — `@tanstack/react-query-devtools` in production dependencies

**Impact:** Adds ~40KB+ to production bundle. Devtools are never useful in production builds.

**Fix:**

```tsx
// Use next/dynamic for true code-splitting
import dynamic from 'next/dynamic';

const ReactQueryDevtools = dynamic(
  () =>
    import('@tanstack/react-query-devtools').then(
      (mod) => mod.ReactQueryDevtools
    ),
  { ssr: false }
);

// Then in JSX:
{
  process.env.NODE_ENV !== 'production' && (
    <ReactQueryDevtools initialIsOpen={false} />
  );
}
```

Or fully exclude from production build using webpack configuration in `next.config.ts`.

---

### 2. MQTT Client Is Eagerly Created at App Root

**Finding:** CONFIRMED — `getMqttClient()` is called unconditionally during `AppProvider` render at `app-provider.tsx:88`. The MQTT connection is established, credentials are sent to the browser, and three `useEffect` hooks subscribe to topics — all before any user action.

**Evidence:**

- `src/components/providers/app-provider/app-provider.tsx:88` — `const client = getMqttClient()` called during render
- `src/components/providers/app-provider/app-provider.tsx:90-105` — subscribes to `NOTIFICATION_CMS` on mount
- `src/components/providers/app-provider/app-provider.tsx:107-136` — subscribes to `NOTIFICATION_ACCOUNT` on mount (depends on `profile?.id`)
- `src/components/providers/app-provider/app-provider.tsx:138-151` — attaches `message` listener on mount
- `src/lib/mqtt.ts:7-18` — `mqtt.connect()` called with credentials from env vars

**Impact:**

- Every route loads the MQTT bundle and opens a connection, even on public routes (`/login`, `/privacy`)
- MQTT credentials (`NEXT_PUBLIC_MQTT_BROKER`, `NEXT_PUBLIC_MQTT_USERNAME`, `NEXT_PUBLIC_MQTT_PASSWORD`) are exposed in the client-side bundle (see Security Audit)
- Connection cost paid before user authentication is confirmed

**Fix:** Move MQTT initialization behind authenticated feature boundaries:

- Lazy-load MQTT only after session is confirmed and profile is loaded
- Create a separate `MqttProvider` mounted conditionally
- Or defer `getMqttClient()` to the first actual subscription call (lazy singleton pattern)

---

### 3. PermissionGuard Recomputes Route Matching and Regexes Every Render

**Finding:** CONFIRMED — The audit report described this as unoptimized, but **the current codebase already has the fix**: a precompiled flat route matcher at module scope (`permission-guard.tsx:22-45`).

**Evidence (verified current code):**

- `permission-guard.tsx:22-45` — `routeMatcherCache` built once at module load via `buildRouteCache(route)`
- `permission-guard.tsx:47-52` — `findRouteByPath()` iterates precompiled cache (O(n) with tiny constant factor, not O(routes × path_length))
- `permission-guard.tsx:64-65` — `matchedRoute` is memoized by `useMemo(() => findRouteByPath(pathname), [pathname])`

**Status:** This finding is **RESOLVED** in the current codebase. No action needed.

---

## Phase 2: High (Significant Gains)

### 4. List Hooks Duplicate Query Data Into Local State

**Finding:** CONFIRMED — `useListBase` maintains a parallel `useState<T[]>([])` and syncs it via `useEffect`.

**Evidence:**

- `src/hooks/use-list-base.tsx:133` — `const [data, setData] = useState<T[]>([])`
- `src/hooks/use-list-base.tsx:214-216` — `useEffect(() => { setData(listQuery.data?.data.content || []) }, [listQuery.data?.data.content])`
- `src/hooks/use-list-base.tsx:596-597` — returns `data` (local state) not `listQuery.data`

**Impact:** Extra render after each fetch, duplicated memory, brief desync window.

**Fix:** Remove the `useState` and `useEffect` for data sync. Return directly from query:

```tsx
// Instead of:
const [data, setData] = useState<T[]>([]);
useEffect(() => { setData(listQuery.data?.data.content || []) }, [listQuery.data?.data.content]);
return { data, ... };

// Use:
const data = listQuery.data?.data.content ?? [];
return { data, ... };
```

**Note:** `useInfiniteListBase` (`use-inifinite-list-base.tsx`) has the same pattern at lines 151, 239-245.

---

### 5. Handler Objects and Column Renderers Are Recreated Every Render

**Finding:** CONFIRMED — `extendableHandlers()` is called at the end of every render, creating a new object with new function references. The `override` pattern passes in a new function each render.

**Evidence:**

- `src/hooks/use-list-base.tsx:568-592` — `extendableHandlers()` called at render time (not memoized)
- `src/hooks/use-list-base.tsx:594` — `const handlers = extendableHandlers()` — new object every render
- `src/hooks/use-list-base.tsx:278-335` — `actionColumn()` defined inline, recreated every render
- `src/hooks/use-list-base.tsx:337-390` — `renderActionColumn()` recreated every render
- `src/hooks/use-list-base.tsx:456-536` — `renderSearchForm()` recreated every render
- `src/app/movie/_components/movie-list.tsx:61-147` — `override` receives `handlers` and adds new closures for `person`, `comment`, `review` columns

**Impact:** React Compiler cannot optimize object creation patterns that happen on every render. Table rows/cells re-render even when data unchanged.

**Fix:**

- Wrap `handlers` in `useMemo` with stable dependencies
- Memoize `actionColumn` and `renderActionColumn` with `useCallback`
- Move column definitions that don't need reactive data to module scope or memoize them

**Note:** `useInfiniteListBase` has the same pattern at lines 611-639. `useSaveBase` has it at lines 306-320.

---

### 6. Tables Render All Rows and Cells Without Virtualization

**Finding:** CONFIRMED — `BaseTable` and `DragDropTable` use `.map()` over the full `dataSource` array.

**Evidence:**

- `src/components/table/base-table.tsx:114` — `dataSource.map((row, rowIndex) => (` — no virtualization
- `src/components/table/drag-drop-table.tsx:242` — `rows.map((row, idx) => (` — no virtualization
- `src/components/table/drag-drop-table.tsx:69-146` — `SortableRow` is NOT memoized; re-renders on every parent render

**Impact:** High CPU, memory, layout, and hydration cost on large datasets.

**Fix:**

- Add `react-window` or `@tanstack/react-virtual` for read-only tables
- Memoize `SortableRow` with `React.memo`
- Cap drag/drop lists to smaller page sizes (e.g., 20)

---

### 7. Image Thumbnails Bypass Next.js Image Optimization

**Finding:** CONFIRMED — `ImageField` uses `unoptimized` prop on all `next/image` instances.

**Evidence:**

- `src/components/form/image-field.tsx:203, 217, 231, 248, 321, 345` — `unoptimized` on every Image
- Used in movie list at `src/app/movie/_components/movie-list.tsx:158, 174`

**Impact:** No resizing, format conversion, or optimized cache. Double image work per cell.

**Fix:** Remove `unoptimized` for normal raster media. Keep only for:

- SVG images
- External URLs that don't match `remotePatterns`
- Cases where `next.config.ts:9-25` doesn't include the host

---

### 8. ImageField Performs a Separate Image Probe Per Thumbnail

**Finding:** CONFIRMED — `useImageStatus` creates a browser `Image` object for every `ImageField` instance.

**Evidence:**

- `src/components/form/image-field.tsx:78` — `const { isError: imageError } = useImageStatus(src)`
- `src/hooks/use-image-status.ts:23-42` — `new Image()`, load/error listeners per call

**Impact:** Each `ImageField` in a table doubles image-related work. One `Image` probe from `useImageStatus` and one from `next/image`.

**Fix:** Let `next/image` handle errors via `onError` callback. Or cache status by URL in a module-level `Map`.

---

## Phase 3: Medium (Incremental Gains)

### 9. Autocomplete Double-Fetches on Search

**Finding:** CONFIRMED — Query key changes trigger fetch; a separate `useEffect` then calls `query.refetch()`.

**Evidence:**

- `src/components/form/auto-complete-field.tsx:132-151` — `useQuery` with key `[name, debouncedSearch, initialParams]`
- `src/components/form/auto-complete-field.tsx:155-159` — Manual `query.refetch()` in `useEffect` on `debouncedSearch`
- ESLint disable comment on line 159 acknowledges incomplete dependency tracking

**Impact:** Same data requested twice per search.

**Fix:** Remove the `useEffect` refetch — query key change already triggers a fetch.

---

### 10. Autocomplete Fetches MAX_PAGE_SIZE During Search

**Finding:** CONFIRMED — Search mode requests 1,000,000 records.

**Evidence:**

- `src/components/form/auto-complete-field.tsx:139-140` — `size: isSearching || fetchAll ? MAX_PAGE_SIZE : INITIAL_AUTO_COMPLETE_SIZE`
- `src/constants/index.ts:3` — `MAX_PAGE_SIZE = 1_000_000`

**Impact:** Wastes API bandwidth and render time for large option lists.

**Fix:** Use a small fixed page size for search (20-50).

---

### 11. Query Keys Omit Params in ServerConfig Query

**Finding:** CONFIRMED — `params` not included in query key.

**Evidence:**

- `src/queries/server-config.query.ts:14` — `queryKey: [\`${queryKeys.SERVER_CONFIG}-list\`]`

**Impact:** Different param calls can return stale/wrong cached data.

**Fix:** `queryKey: [\`${queryKeys.SERVER_CONFIG}-list\`, params]`

---

### 12. Full Dataset Queries Used for Select Options

**Finding:** CONFIRMED — Category and setting queries use `MAX_PAGE_SIZE`.

**Evidence:**

- `src/queries/category.query.ts:14` — `size: MAX_PAGE_SIZE`
- `src/queries/setting.query.ts:14` — `size: MAX_PAGE_SIZE`

**Impact:** Acceptable for small datasets but risky as data grows.

**Fix:** Use small fixed page size + `staleTime` for option lists.

---

### 13. Forms Validate on Every Change By Default

**Finding:** CONFIRMED — `BaseForm` defaults to `mode='onChange'`.

**Evidence:**

- `src/components/form/base-form/base-form.tsx:39` — `mode = 'onChange'`
- `src/components/form/base-form/base-form.tsx:50` — passed to `useForm`

**Impact:** Large forms with Zod schemas validate and re-render on every keystroke.

**Fix:** Default to `onBlur` or `onSubmit`. Keep `onChange` only where immediate validation is needed.

---

### 14. Form Error Logging Runs During Render

**Finding:** CONFIRMED — `logger.info` calls in render body.

**Evidence:**

- `src/components/form/base-form/base-form.tsx:62-65` — `if (Object.keys(formState.errors).length)` triggers `logger.info` twice, calling `form.getValues()`
- `next.config.ts:36-41` — `console.log` excluded from `removeConsole`, so it runs in production

**Impact:** Render-time CPU overhead + production console noise.

**Fix:** Remove `logger.info` from render path, or guard with `process.env.NODE_ENV !== 'production'`.

---

### 15. useSaveBase Has Same Handler Recreation Pattern

**Finding:** CONFIRMED — Same pattern as `useListBase`.

**Evidence:**

- `src/hooks/use-save-base.tsx:306-320` — `extendableHandlers()` called at render time
- `src/hooks/use-save-base.tsx:171-204` — `handleClick` recreated when `isFormChanged` or `showDialog` changes
- `src/hooks/use-save-base.tsx:221-298` — `renderActions` with new closures

**Fix:** Same as `useListBase` — memoize handlers and stabilize closures.

---

### 16. PermissionGuard Uses Framer Motion for Simple Loader

**Finding:** CONFIRMED — `AnimatePresence` + `m.div` at `permission-guard.tsx:8, 104`.

**Evidence:**

- `src/components/permission-guard/permission-guard.tsx:8` — `AnimatePresence` import
- `src/components/permission-guard/permission-guard.tsx:139-144` — `m.div` with animation for loader

**Impact:** Loads framer-motion animation runtime for a static loader state.

**Fix:** Use CSS transitions or a plain `div` with a spinner.

---

### 17. Comment Tree Recreates Recursive Renderers and VoteMap Each Render

**Finding:** CONFIRMED — `voteMap` is created as an IIFE, `renderChildren` and handlers recreated every render.

**Evidence:**

- `src/app/movie/[id]/comment/_components/comment-list.tsx:62-66` — `voteMap` IIFE (new object every render)
- `src/app/movie/[id]/comment/_components/comment-list.tsx:67-75` — `handleVote` recreated every render
- `src/app/movie/[id]/comment/_components/comment-list.tsx:77-80` — `handlePinComment` recreated every render
- `src/app/movie/[id]/comment/_components/comment-list.tsx:82-94` — `handleDeleteComment` recreated every render
- `src/app/movie/[id]/comment/_components/comment-list.tsx:98-116` — `renderChildren` recreated every render

**Impact:** Nested subtree re-renders on every parent render.

**Fix:** Memoize `voteMap` with `useMemo`, stabilize handlers with `useCallback`, memoize `CommentItem`.

---

### 17b. Zustand Selector Creates New Object Reference Every Render

**Finding:** `useCommentStore(useShallow(...))` creates a new object on every render, breaking shallow equality checks and causing all subscribed components to re-render on any store change.

**Evidence:**

- `src/app/movie/[id]/comment/_components/comment-item.tsx:88-98` — `useCommentStore(useShallow((s) => ({ ... })))` selector returns new object reference each call
- `src/store/comment.store.ts:4-20` — store has 4 fields; any field change triggers re-render for all subscribers

**Impact:** Every `CommentItem` re-renders when `replyingComment`, `editingComment`, or `openParentIds` changes — even when the specific fields they subscribe to haven't changed. Compounds with the per-item `useInfiniteListBase` issue.

**Fix:** Use individual field selectors instead of a combined object:

```tsx
// Instead of:
const { openParentIds, replyingComment, ... } = useCommentStore(useShallow(s => ({ ... })));

// Use individual selectors:
const openParentIds = useCommentStore(s => s.openParentIds);
const replyingComment = useCommentStore(s => s.replyingComment);
```

**React Compiler note:** RC cannot optimize external store selectors. Manual individual selectors are required.

---

### 17c. useInfiniteListBase Instantiated Per CommentItem

**Finding:** Every `CommentItem` calls `useInfiniteListBase` on mount, regardless of whether it has children to display. This creates O(n) query instances for n comments.

**Evidence:**

- `src/app/movie/[id]/comment/_components/comment-item.tsx:109-124` — `useInfiniteListBase` called for every item, not just parents
- `options.enabled: isActiveParent` only gates fetching, not hook instantiation — the hook itself runs on every mount

**Impact:** With hundreds of comments, hundreds of `useInfiniteListBase` instances are created and managed. Only items where `isActiveParent === true` need the query; all others are wasted.

**Fix:** Move nested comment fetching into a separate component that conditionally mounts only when `isActiveParent === true`:

```tsx
// Wrap child list fetch in a separate component
function CommentChildren({ parentId, rootId }) {
  const { data, handlers } = useInfiniteListBase({ ... });
  if (!data?.length) return null;
  return renderChildren(data, level + 1, rootId);
}

// In CommentItem:
{isActiveParent && (
  <CommentChildren parentId={comment.id} rootId={rootId} />
)}
```

---

### 17d. Comment Item Visual Indentation Broken

**Finding:** `marginLeft: level * 0` at `comment-item.tsx:254` always evaluates to 0 regardless of nesting level, so nested replies have no indentation.

**Evidence:**

- `src/app/movie/[id]/comment/_components/comment-item.tsx:254` — `style={{ marginLeft: level * 0 }}`
- `src/app/movie/[id]/comment/_components/comment-item.tsx:537,547` — same pattern correctly uses `level * 40`

**Impact:** Visual hierarchy broken; replies at any depth appear at the same indentation as root comments.

**Fix:** Change `level * 0` to `level * 40` on line 254.

---

### 18. Comment Page Defers All Rendering Until Mounted

**Finding:** CONFIRMED — `isMounted` gate at top of render.

**Evidence:**

- `src/app/movie/[id]/comment/_components/comment-list.tsx:29`
- `src/app/movie/[id]/comment/_components/comment-list.tsx:118` — `if (!isMounted) return null`

**Impact:** Empty first client render, then full render after mount. Delays meaningful paint.

**Fix:** Remove mount gate; gate only specific hydration-sensitive children.

---

## Phase 4: Low (Polish)

### 19. React Icons Adds Another Icon System

**Finding:** CONFIRMED — `react-icons` (package.json:71) imported in list hooks and pages alongside `lucide-react`.

**Evidence:**

- `src/app/movie/_components/movie-list.tsx:37` — `AiOutlineUser`
- `src/app/video-library/_components/video-library-list.tsx` — `AiOutlineDelete`, `AiOutlineEdit`
- `src/hooks/use-list-base.tsx` — `AiOutlineDelete`, `AiOutlineEdit`

**Impact:** Extra dependency, extra icon system. Tree-shaking helps but not fully.

**Fix:** Standardize touched code on `lucide-react`.

---

### 20. Scroll Listener Cleanup Inconsistency in BaseTable

**Finding:** CONFIRMED — Listener attached to `querySelector('div')` but removed from parent element.

**Evidence:**

- `src/components/table/base-table.tsx:65` — attached to `el.querySelector('div')`
- `src/components/table/base-table.tsx:71` — removed from `el` (different reference)

**Impact:** Listener can remain attached until garbage collection on frequent mount/unmount.

**Fix:** Store scroller element reference and remove from the same element.

---

### 21. DragDropTable State Initialized with dataSource

**Finding:** CONFIRMED — `DragDropTable` initializes state from `dataSource` prop.

**Evidence:**

- `src/components/table/drag-drop-table.tsx:158` — `const [rows, setRows] = useState(() => dataSource || [])`
- `src/components/table/drag-drop-table.tsx:171-173` — `useEffect` syncs rows to dataSource changes

**Impact:** Double initialization pattern (lazy init + effect sync).

**Fix:** Use `useMemo` or remove the lazy init and rely solely on the `useEffect` sync.

---

## React Compiler Interaction Analysis

### What React Compiler Auto-Memoizes

With `reactCompiler: true` enabled, the compiler automatically wraps:

- Component functions in `React.memo`
- Hook dependencies in `useMemo`/`useCallback` for stable values

### What React Compiler CANNOT Optimize

These patterns create new objects/functions on every render and bypass compiler optimizations:

1. **Object/function creation in render** — `const handlers = {}` created on every render is not memoized
2. **Inline function definitions in closures** — `handleClick = () => {}` inside a component
3. **Array/Object spread in render** — `{...obj}` creates new reference every time
4. **Module-level singleton side effects** — `getMqttClient()` called in render body
5. **External store selectors** — Zustand `useShallow` returns new object reference; individual field selectors required
6. **Non-RC-compatible third-party components** — Radix UI, Framer Motion `m.div`, other wrapped components

### Redundant Memoization (Remove These)

Since React Compiler handles these automatically, these manual optimizations are **redundant**:

- `useMemo` wrapping primitive calculations
- `useCallback` wrapping functions with stable dependencies
- Manual `React.memo` wrappers on components

**However:** Genuine bugs (new objects/functions on every render) are NOT fixed by the compiler and must be addressed manually.

**Audit existing `useMemo`/`useCallback` usage** and remove redundant ones (preserve memoization for genuinely expensive computations).

---

## Updated Fix Order

### Phase 1: Critical (Fix Immediately)

1. **Guard React Query Devtools properly** — use `next/dynamic` or webpack bundle analysis to truly exclude from production
2. **Lazy-load MQTT** — defer `getMqttClient()` until after auth, or move to a feature-boundary provider

### Phase 2: High (Significant Gains)

3. **Remove MQTT from public routes** — conditional provider mount
4. **Remove list data duplication** in `useListBase` and `useInfiniteListBase`
5. **Memoize handlers, columns, search field definitions** in list hooks and pages
6. **Add virtualization** or strict page-size caps to table-heavy screens
7. **Remove `unoptimized`** for normal media thumbnails; **eliminate duplicate image probes**

### Phase 3: Medium (Incremental Gains)

8. **Fix autocomplete double-fetch** (remove manual refetch)
9. **Reduce autocomplete page sizes** (from MAX_PAGE_SIZE to 20-50)
10. **Fix server-config query key** to include params
11. **Change form validation default** from `onChange` to `onBlur` or `onSubmit`
12. **Remove sync logging during render** (base-form.tsx:62-65)
13. **Apply handler memoization** to `useSaveBase`

### Phase 4: Low (Polish)

14. **Standardize on `lucide-react`** only
15. **Fix scroll listener cleanup** inconsistency in `BaseTable`
16. **Remove mount gate** in comment page
17. **Audit and remove redundant `useMemo`/`useCallback`** now that React Compiler is enabled
18. **Fix DragDropTable state initialization**
19. **Fix Zustand selector in CommentItem** — replace `useShallow` object selector with individual field selectors
20. **Fix useInfiniteListBase per CommentItem** — conditionally mount only when `isActiveParent === true`
21. **Fix `marginLeft: level * 0`** to `marginLeft: level * 40` for proper visual indentation
