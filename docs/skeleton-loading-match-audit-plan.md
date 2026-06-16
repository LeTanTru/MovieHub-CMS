# Skeleton Loading Match Audit Plan

## Goal

Audit every user-visible skeleton loading state and verify that it matches the real component it replaces closely enough to avoid layout jumps, misleading placeholder structure, and jarring visual transitions.

The target is not pixel-perfect duplication. The target is matching the real component's major structure: page shell, spacing, visual groups, media ratios, table/list density, action placement, and responsive behavior.

## Scope

In scope:

- Route-level `loading.tsx` files under `src/app`.
- Module-local form skeletons under `src/app/*/_components/*-form-skeleton.tsx`.
- Shared page skeletons in `src/components/loading`.
- Component-level item skeletons such as `CommentItem.Skeleton` and `ReviewItem.Skeleton`.
- Custom route skeletons such as the subtitle editor loading route.

Out of scope for the first audit:

- Button spinners and small inline pending states.
- Upload progress states that represent active user work rather than initial loading.
- Adding an automated visual testing framework. This repo currently has no test framework.

## Audit Principles

1. Compare skeletons against real rendered components, not only source code.
2. Match major layout groups before matching exact field counts.
3. Keep route-level skeletons at the same outer page width, padding, and scroll behavior as the loaded route.
4. Preserve action bars, footer buttons, tabs, filters, and table/list density.
5. Use the same media aspect ratios as the real component for posters, thumbnails, avatars, video panels, and upload previews.
6. For forms, represent section order and grouped fields accurately.
7. For lists, represent search controls, toolbar actions, row density, and pagination/footer placement.
8. For item skeletons, match avatar size, header metadata, content block, and action row.
9. Do not use a centered spinner when the final page has a stable structured layout, except for intentionally simple static/public routes.
10. Do not commit temporary artificial delays used during manual inspection.

## Current Inventory

### Shared Skeleton Infrastructure

| File                                                    | Purpose                        | Audit focus                                                                     |
| ------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------- |
| `src/components/loading/list-page-skeleton.tsx`         | Generic list route loading     | Check against real list pages with filters, toolbar actions, table/list density |
| `src/components/loading/form-page-skeleton.tsx`         | Shared form page shell         | Check breadcrumb/action/footer shell against real save pages                    |
| `src/components/loading/form-image-upload-skeleton.tsx` | Upload/image placeholder block | Check dimensions against `ImageField` and `UploadImageField` usages             |
| `src/components/loading/circle-loading.tsx`             | Spinner                        | Verify it is only used where structure is intentionally unavailable             |
| `src/components/loading/dot-loading.tsx`                | Inline incremental loading     | Check nested/reply loading placement only                                       |

### Module Form Skeletons

These should be checked against their corresponding real form components:

| Skeleton                                                            | Real component     |
| ------------------------------------------------------------------- | ------------------ |
| `src/app/admin/_components/admin-form-skeleton.tsx`                 | `AdminForm`        |
| `src/app/app-version/_components/app-version-form-skeleton.tsx`     | `AppVersionForm`   |
| `src/app/collection/_components/collection-form-skeleton.tsx`       | `CollectionForm`   |
| `src/app/employee/_components/employee-form-skeleton.tsx`           | `EmployeeForm`     |
| `src/app/group-permission/_components/group-form-skeleton.tsx`      | `GroupForm`        |
| `src/app/movie/_components/movie-form-skeleton.tsx`                 | `MovieForm`        |
| `src/app/person/_components/person-form-skeleton.tsx`               | `PersonForm`       |
| `src/app/profile/_components/profile-form-skeleton.tsx`             | `ProfileForm`      |
| `src/app/server-config/_components/server-config-form-skeleton.tsx` | `ServerConfigForm` |
| `src/app/sidebar/_components/sidebar-form-skeleton.tsx`             | `SidebarForm`      |
| `src/app/style/_components/style-form-skeleton.tsx`                 | `StyleForm`        |
| `src/app/video-library/_components/video-library-form-skeleton.tsx` | `VideoLibraryForm` |

### Component-Level Skeletons

| Skeleton                                                                            | Real component sections to match                                                 |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `CommentItem.Skeleton` in `src/app/movie/[id]/comment/_components/comment-item.tsx` | Avatar, `CommentHeader`, `CommentContent`, `CommentAction`, nested reply spacing |
| `ReviewItem.Skeleton` in `src/app/movie/[id]/review/_components/review-item.tsx`    | Avatar, `ReviewHeader`, `ReviewContent`, `ReviewAction`                          |

### Route-Level Loading Files

Use this as the first route audit set:

| Route loading type                         | Examples                                                                                                                                 | Expected check                                                                                    |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| List routes using `ListPageSkeleton`       | `admin/loading.tsx`, `movie/loading.tsx`, `video-library/loading.tsx`, `movie/[id]/comment/loading.tsx`, `movie/[id]/review/loading.tsx` | Confirm real route is list-like and generic list skeleton matches filters/table/list density      |
| Save routes using module form skeletons    | `admin/[id]/loading.tsx`, `movie/[id]/loading.tsx`, `style/[id]/loading.tsx`, `video-library/[id]/loading.tsx`                           | Confirm skeleton mirrors the local form                                                           |
| Public/static routes using `CircleLoading` | `login/loading.tsx`, `contact/loading.tsx`, `privacy/loading.tsx`                                                                        | Confirm spinner is acceptable for simple public/static routes                                     |
| Custom editor route                        | `video-library/[id]/subtitle/[subtitleId]/loading.tsx`                                                                                   | Confirm editor shell, preview/player, form panel, and transcript/list regions match loaded editor |

## Audit Workflow

### Phase 1: Build The Pairing Table

Create an audit table with one row per skeleton:

```text
Route/component | Real component | Skeleton component | Status | Severity | Notes | Owner
```

Recommended statuses:

- `not-started`
- `matches`
- `minor-mismatch`
- `major-mismatch`
- `wrong-skeleton-type`
- `fixed`

### Phase 2: Inspect Real Component Shape

For each row, record the real component's major layout:

- outer shell: page wrapper, card/list wrapper, modal, or inline item
- header: breadcrumb, title, tabs, status badges, action buttons
- content groups: sections, grids, upload blocks, table/list rows, editor panes
- footer/actions: save/cancel, pagination, list actions
- responsive behavior: desktop columns, mobile stacking, overflow scrolling

### Phase 3: Compare Skeleton Shape

Use this checklist for every skeleton:

- Same outer width and page padding.
- Same major vertical order.
- Same number of primary visual sections.
- Same action placement.
- Same avatar/media/upload dimensions.
- Same grid column count at desktop and mobile breakpoints.
- Same table/list row height range.
- Same count or representative count of repeated rows/items.
- Same tab/filter/search area when the real component has one.
- No placeholder text/shape overlap on narrow widths.
- No large blank areas where the real component has dense content.

### Phase 4: Classify Mismatches

Use severity consistently:

| Severity | Meaning                     | Example                                                                     |
| -------- | --------------------------- | --------------------------------------------------------------------------- |
| P0       | Wrong skeleton type         | A save form route renders `ListPageSkeleton`                                |
| P1       | Major structure mismatch    | Real form has media panels and sections; skeleton is only simple input rows |
| P2       | Section/order mismatch      | Skeleton has correct type but missing tabs, footer, or a major section      |
| P3       | Minor sizing/count mismatch | Field widths, row count, or label widths are slightly off                   |

### Phase 5: Fix By Locality

Fix skeletons near the component they mirror:

- Page save skeletons stay in `src/app/<module>/_components`.
- Item skeletons stay on the item component or in a sibling file if the item is already split.
- Shared skeletons should only represent truly shared shapes.
- Avoid pushing module-specific placeholders into `src/components/loading`.

## Route-Specific Checks

### Save Forms

For every `*-form-skeleton.tsx`:

1. Open the real form component and list its top-level sections.
2. Confirm skeleton section order matches the real form.
3. Confirm upload placeholders match `ImageField`, `UploadImageField`, video, or file upload dimensions.
4. Confirm rich text fields use tall blocks, not normal input rows.
5. Confirm footer action buttons stay in the same location.
6. Confirm route `loading.tsx` imports the module-local skeleton.

### List Pages

For every route using `ListPageSkeleton`:

1. Confirm the route's real component is actually list-like.
2. Compare search/filter controls count and height.
3. Compare toolbar action position.
4. Compare table/list row density.
5. Check routes with tabs or non-table lists separately; generic `ListPageSkeleton` may be insufficient.

### Comment And Review Items

For `CommentItem.Skeleton`:

1. Match avatar size to `AVATAR_SIZE_COMMENT`.
2. Match header line density after the `CommentHeader` split.
3. Include status/pin/movie-item metadata placeholder space if commonly visible.
4. Match content height and action row spacing.
5. Leave reply/nested-loading space consistent with `CommentReplyList`.

For `ReviewItem.Skeleton`:

1. Match avatar size to `AVATAR_SIZE_COMMENT`.
2. Match `ReviewHeader` line density.
3. Include content and rating placeholder shape.
4. Match the like/dislike/action row spacing from `ReviewAction`.

### Subtitle Editor

For `video-library/[id]/subtitle/[subtitleId]/loading.tsx`:

1. Compare preview/player aspect ratio.
2. Compare subtitle metadata form panel.
3. Compare transcript/list panel height and scroll shape.
4. Confirm mobile stacking does not collapse into unusable placeholder blocks.

## Manual Verification Method

Use the existing app manually; do not add a test framework for this audit.

Recommended steps:

1. Start the app with `yarn dev`.
2. Use browser devtools network throttling to make route loading visible.
3. Navigate between routes rather than only refreshing, so Next route-level `loading.tsx` states appear.
4. Capture screenshots of skeleton and loaded states at desktop and mobile widths.
5. Compare the screenshots using the checklist above.
6. If a temporary local delay is needed to inspect a fast route, remove it before committing.

Suggested viewport set:

- Desktop: `1440x900`
- Tablet-ish: `1024x768`
- Mobile: `390x844`

## Rollout Order

### Phase 1: P0/P1 Route Mismatches

Audit route `loading.tsx` files first and fix any route using the wrong skeleton type.

Priority routes:

- save form routes under `[id]`
- custom editor route
- nested movie routes with list/detail behavior

### Phase 2: Form Skeleton Shape

Audit module-local form skeletons in this order:

1. `server-config`, `admin`, `employee`
2. `person`, `app-version`, `group-permission`
3. `style`, `sidebar`
4. `movie`, `video-library`
5. `collection`, `profile`

### Phase 3: List Skeleton Fit

Audit all `ListPageSkeleton` consumers and identify pages that need a module-local list skeleton because they have tabs, unusual filters, non-table rows, or nested route context.

### Phase 4: Item Skeletons

Audit component-level skeletons after recent component splits:

- comment item
- review item

### Phase 5: Cleanup

After fixes:

1. Remove unused skeleton imports.
2. Remove stale shared skeleton code only if it has no consumers.
3. Update this plan or create a completed audit table with final statuses.

## Acceptance Criteria

- Every route-level loading state uses the correct skeleton type for the loaded page.
- Every module-local form skeleton matches the real form's major structure.
- Every list skeleton matches the route's filter/action/list density well enough to avoid a visible layout jump.
- `CommentItem.Skeleton` and `ReviewItem.Skeleton` match their split real component sections.
- No structured page relies on a centered spinner unless explicitly accepted as simple/static.
- `yarn lint` passes after any skeleton changes.

## Deliverable

Create a follow-up audit table after inspection:

```text
docs/skeleton-loading-audit-results.md
```

That document should list every audited skeleton, its status, mismatch severity, and the file changed to resolve it.
