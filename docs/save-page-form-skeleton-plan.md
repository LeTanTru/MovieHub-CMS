# Save Page Form Skeleton Plan

## Goal

Replace the generic `src/components/loading/form-skeleton.tsx` usage with module-specific save-page skeletons that match the real form layouts more closely.

The target is better loading continuity for every page-level save flow, without introducing a second overly generic abstraction.

## Scope

In scope for the first rollout:

- Page routes that render a dedicated form component and are used as save/edit pages.
- `profile` even though it currently uses a spinner instead of `FormSkeleton`.

Out of scope for the first rollout:

- Modal-only save flows such as category, collection item modal, movie item modal, permission modal, setting modal, and subtitle modal.
- List pages.
- The subtitle editor route under `video-library/[id]/subtitle/[subtitleId]` as part of the initial `BaseForm` migration. It should get its own editor-specific loading state later.

## Current Audit

### Shared skeleton problem

`src/components/loading/form-skeleton.tsx` currently assumes a simple page shape:

- header actions
- one full-width field
- repeated 2-column rows
- one large text area
- footer actions

That matches only the simplest forms. It does not match media-heavy, filter-heavy, permission-heavy, or editor-like pages.

### Route mismatches found during audit

- `src/app/sidebar/[id]/loading.tsx` renders `ListPageSkeleton`, but `src/app/sidebar/[id]/page.tsx` is a save form page.
- `src/app/collection/[id]/collection-item/loading.tsx` renders `FormSkeleton`, but `src/app/collection/[id]/collection-item/page.tsx` is a list page — it should use `ListPageSkeleton`.
- `src/app/profile/loading.tsx` still uses a centered `CircleLoading`, so it should be considered separately in the save-page loading cleanup.
- `src/app/privacy/loading.tsx` also uses `CircleLoading`, but `privacy` is a **static content page** (no form, no `useSaveBase`) and is **out of scope** for this plan.

## Placement Strategy

Do not keep adding page-specific skeletons into `src/components/loading`.

Instead, colocate each skeleton with its form module:

```text
src/app/<module>/_components/<module>-form-skeleton.tsx
```

Then export it from the module barrel:

```text
src/app/<module>/_components/index.tsx
```

And consume it from the route segment loading file:

```text
src/app/<module>/[id]/loading.tsx
src/app/<module>/loading.tsx
```

This keeps the skeleton close to the form it mirrors and avoids a global loading folder full of one-off components.

## Implementation Rules

1. Each save page gets its own `<Module>FormSkeleton`.
2. Match section structure, not exact field count.
3. Reuse tiny skeleton primitives only when the same block repeats in at least 3 modules.
4. Keep the same outer page shell spacing as the real page.
5. Preserve action bar placement so the page does not jump when data resolves.
6. For media blocks, use upload-panel placeholders instead of plain input rows.
7. For rich text areas, use a tall content block instead of a normal field row.
8. For permission matrices or filter groups, use grouped card/block placeholders that reflect the real shape.
9. Every skeleton file must have `'use client'` at the top — the `Skeleton` UI component requires it.
10. Always import `Skeleton` from `@/components/ui/skeleton`, not from the loading barrel.

## Page Inventory

### Standard save-form routes

| Route                           | Real component     | Current loading    | Proposed skeleton          | Layout notes                                                                                                |
| ------------------------------- | ------------------ | ------------------ | -------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `src/app/admin/[id]`            | `AdminForm`        | `FormSkeleton`     | `AdminFormSkeleton`        | Avatar upload, multiple 2-column rows, role/status selects, footer actions                                  |
| `src/app/app-version/[id]`      | `AppVersionForm`   | `FormSkeleton`     | `AppVersionFormSkeleton`   | APK upload block, version fields, changelog row, checkbox row, footer actions                               |
| `src/app/collection/[id]`       | `CollectionForm`   | `FormSkeleton`     | `CollectionFormSkeleton`   | Basic info section, color list block, optional style selector area, large filter `FieldSet`, footer actions |
| `src/app/employee/[id]`         | `EmployeeForm`     | `FormSkeleton`     | `EmployeeFormSkeleton`     | Avatar upload plus dense grouped 2-column account/profile rows                                              |
| `src/app/group-permission/[id]` | `GroupForm`        | `FormSkeleton`     | `GroupFormSkeleton`        | Name/kind row, color picker row, textarea row, permission-card matrix, footer actions                       |
| `src/app/movie/[id]`            | `MovieForm`        | `FormSkeleton`     | `MovieFormSkeleton`        | Three upload panels, dense metadata grid, conditional notification block, rich text block                   |
| `src/app/person/[id]`           | `PersonForm`       | `FormSkeleton`     | `PersonFormSkeleton`       | Avatar upload, short metadata grid, multi-select row, biography block                                       |
| `src/app/profile`               | `ProfileForm`      | `CircleLoading`    | `ProfileFormSkeleton`      | Avatar upload, full-width text/password stack, footer actions                                               |
| `src/app/server-config/[id]`    | `ServerConfigForm` | `FormSkeleton`     | `ServerConfigFormSkeleton` | Compact 3-row 2-column settings form                                                                        |
| `src/app/sidebar/[id]`          | `SidebarForm`      | `ListPageSkeleton` | `SidebarFormSkeleton`      | Two image upload panels, movie autocomplete, color picker, checkbox row, rich text block                    |
| `src/app/style/[id]`            | `StyleForm`        | `FormSkeleton`     | `StyleFormSkeleton`        | Two image upload panels, short config rows, rich text block                                                 |
| `src/app/video-library/[id]`    | `VideoLibraryForm` | `FormSkeleton`     | `VideoLibraryFormSkeleton` | Thumbnail upload, metadata rows, time fields, large video/upload area, rich text block                      |

### Custom save/editor route

| Route                                              | Real component   | Current loading | Follow-up                                                                                              |
| -------------------------------------------------- | ---------------- | --------------- | ------------------------------------------------------------------------------------------------------ |
| `src/app/video-library/[id]/subtitle/[subtitleId]` | `SubtitleEditor` | none            | Add a dedicated editor loading state later. This should not reuse the standard form skeleton approach. |

## Recommended Rollout Order

### Phase 1: Fix obvious route mismatches

1. Replace `src/app/sidebar/[id]/loading.tsx` with `SidebarFormSkeleton`.
2. Change `src/app/collection/[id]/collection-item/loading.tsx` back to `ListPageSkeleton` because it is not a save page.
3. Replace the `CircleLoading` in the existing `src/app/profile/loading.tsx` with `ProfileFormSkeleton`. No new file is needed — `profile` has no `[id]` sub-route.

### Phase 2: Low-complexity forms

Implement first where the layout is stable and compact:

- `server-config`
- `admin`
- `employee`
- `person`
- `app-version`
- `group-permission`

This phase establishes the local pattern without starting on the largest modules first.

### Phase 3: Media-heavy forms

Implement:

- `style`
- `sidebar`
- `movie`
- `video-library`

These need upload/video placeholders and should be shaped around media blocks, not plain input rows.

### Phase 4: Complex structured form

Implement:

- `collection`

`collection` is separate because its color list and filter `FieldSet` need a more deliberate skeleton layout than the rest.

### Phase 5: Cleanup

1. Remove `FormSkeleton` imports from migrated route loading files.
2. Delete `src/components/loading/form-skeleton.tsx` only after it has no remaining consumers.
3. Remove the `FormSkeleton` export from `src/components/loading/index.tsx` when the file is deleted.

## Suggested File Pattern

Example for `movie`:

```text
src/app/movie/_components/movie-form-skeleton.tsx
src/app/movie/_components/index.tsx
src/app/movie/[id]/loading.tsx
```

Expected barrel update:

```ts
export { MovieList } from './movie-list';
export { MovieForm } from './movie-form';
export { MovieFormSkeleton } from './movie-form-skeleton';
```

> Keep the existing export order intact and append the new skeleton export at the end.

Expected route loading shape:

```tsx
import { MovieFormSkeleton } from '@/app/movie/_components';

export default function Loading() {
  return <MovieFormSkeleton />;
}
```

## Acceptance Criteria

- Every page-level save form has its own skeleton component.
- Every save-page `loading.tsx` imports a module-local skeleton, not the shared `FormSkeleton`.
- Each skeleton matches the real page's main visual groups: media blocks, field grids, grouped cards, large text areas, and action footer.
- Non-save routes do not use form skeletons.
- `yarn lint` passes after the rollout.

## Follow-up

After the standard save forms are migrated, evaluate whether the subtitle editor needs:

- a route-level `loading.tsx`
- a local editor-shell skeleton
- finer-grained loading placeholders inside the editor itself

That should be handled as a separate pass because the editor layout is not a normal `BaseForm` page.
