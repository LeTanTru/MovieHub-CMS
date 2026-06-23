# AGENTS.md — MovieHub CMS

## Commands

```bash
yarn              # Install deps
yarn dev          # Dev server (port 3001, Turbopack)
yarn clean-dev    # Clear .next then dev
yarn build        # Production build (output: standalone)
yarn start        # Production server (port 3001)
yarn lint         # ESLint
yarn format       # Prettier write all
ANALYZE=true yarn build  # Bundle analysis
```

**No test framework.** Do not invent tests.

**Pre-commit hooks** (Husky + lint-staged) auto-fix and format. Commit messages must follow conventional commits (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`).

## Architecture

- Next.js 16 App Router CMS (`src/app`). React Compiler enabled.
- Core page wrapper: `ThemeProvider` -> `QueryProvider` -> `AppProvider` -> `Suspense` -> `PermissionGuard`; `MqttProvider`, `NextTopLoader`, and `DisclaimerModal` mount inside `AppProvider`, while `ToastContainer` sits at the body level.
- `QueryProvider`: `staleTime: 60s`, `refetchOnWindowFocus: false`, `retry: false`.
- Auth session: `gcTime: 0`, `refetchOnMount: 'always'` (see `src/queries/auth.query.ts`).
- API endpoints + permissions: `src/constants/api-config.ts`
- Routes + permissions: `src/routes/route.ts`
- HTTP layer: `src/utils/http.util.ts` (10s timeout, auto-injects auth, refresh-token rotation, dedup queue, rethrows errors)
- Access: `PermissionGuard` enforces route-level auth/permission

## Environment Variables

Config-driven env validation: `src/config.ts` (Zod v4, uses `.safeParse()`). Add new env keys there and update `.env.example`.

**Public (`NEXT_PUBLIC_*`)**
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_NODE_ENV` | Environment mode |
| `NEXT_PUBLIC_AUTH_API_URL` | Auth API base URL |
| `NEXT_PUBLIC_API_URL` | Main API base URL |
| `NEXT_PUBLIC_API_MEDIA_URL` | Media API base URL |
| `NEXT_PUBLIC_TINYMCE_URL` | TinyMCE CDN URL |
| `NEXT_PUBLIC_MEDIA_HOST` | Media hostname (for `next/image` remotePatterns) |
| `NEXT_PUBLIC_CLIENT_TYPE` | Client type (used in HTTP header) |
| `NEXT_PUBLIC_MQTT_BROKER` | MQTT broker URL |
| `NEXT_PUBLIC_MQTT_USERNAME` | MQTT username |
| `NEXT_PUBLIC_MQTT_PASSWORD` | MQTT password |
| `NEXT_PUBLIC_URL` | App URL |

**Private (server-only, used in API routes)**

- `APP_USERNAME`, `APP_PASSWORD` — OAuth credentials
- `GRANT_TYPE`, `GRANT_TYPE_REFRESH_TOKEN` — OAuth grant types
- `MINIO_ENDPOINT`, `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`, `MINIO_BUCKET`, `MINIO_UPLOAD_FOLDER`, `MINIO_UPLOAD_PREFIX` — S3-compatible upload storage

## Stores

All stores exported from `src/store/index.ts`: `useAuthStore`, `useCommentStore`, `useReviewStore`, `useSidebarStore`, `useVideoLibrarySubtitleStore`.

- Use `useShallow` for selector optimization
- **Store updates in render**: Compute derived state during render. For store sync in effects, use `useLayoutEffect`, not `useEffect` (causes "update while rendering" error)

## React Patterns

- **Forms**: `BaseForm` + `useForm` (react-hook-form) + Zod resolver. `onFormChange(isDirty)` callback.
- **List pages**: `useListBase` hook
- **Save pages**: `useSaveBase` hook (create/edit, getById, submit, cache invalidation)
- **Server state**: TanStack Query (`useQuery`, `useMutation`)
- **Animations**: Import `m` from `framer-motion`, use `LazyMotion` + `domAnimation`

## Query Patterns

- All `useQuery` hooks in `src/queries/` must use `select: (data) => data.data` to extract the response payload.
- Mutations do not need `select`. Do not use destructuring aliases for mutation returns (e.g., use `mutate` and `isPending` directly instead of `mutate: loginMutate`).
- Query keys centralized in `queryKeys` (`src/constants/master-data/query-keys.ts`, exported via `@/constants`). Never hardcode query key strings.

## UI Patterns

- `ImageField`: `freeAspect`, `freePreviewAspect` props
- `UploadImageField`: `originalSize` prop
- Modal dirty guard:
  ```tsx
  <Modal confirmOnClose={isFormChanged}>
    <Modal.Header>Title</Modal.Header>
    <Modal.Body>{/* form */}</Modal.Body>
    <Modal.Confirm message='Bạn có chắc chắn muốn hủy không ?' />
  </Modal>
  ```

## Table Components

- `BaseTable` and `DragDropTable` use `w-auto min-w-fit` on `<Table>` to prevent column collapse on resize.
- The `Table` UI component (`src/components/ui/table.tsx`) does NOT force `w-full` on the `<table>` element — columns size to content and the wrapper handles overflow scrolling.
- `DragDropTable` uses `EMPTY_DATA_SOURCE` constant to avoid array literal recreation.

## ESLint Rules (Common Issues)

- **jsx-a11y/click-events-have-key-events**: Add `onKeyDown` handler to elements with `role='button'` or click handlers. Handle `Enter` or `Space`.
- **react-doctor/no-derived-state-effect**: Compute derived state during render, not in `useEffect`. For store sync, use `useLayoutEffect`.
- **react-doctor/no-inline-bounce-easing**: Use custom animation with `cubic-bezier(0.16, 1, 0.3, 1)`, not `animate-bounce`.
- **react-doctor/js-flatmap-filter**: Use `.flatMap()` instead of `.map().filter(Boolean)`.
- **react-doctor/prefer-dynamic-import**: Heavy libraries (e.g., `recharts`) must use `next/dynamic` with `ssr: false`.
- **react-doctor/no-usememo-simple-expression**: Do not wrap trivial expressions (string concat, property access, ternaries) in `useMemo`.
- **nextjs-no-img-element**: Use `next/image` with `fill` + `unoptimized` for external SVGs.

## Code Style

- `@/*` path aliases, never deep relative
- `'use client'` for browser APIs/hooks
- Zod v4: `.safeParse()` for validation (not `.check()`)
- Prefix unused: `_args`, `_var`
- Unused array index in map: `key={index}` satisfies `react/jsx-key`
- `cn()` from `@/lib/utils` for conditional classes
- `FormControl` (Radix `Slot`) requires the actual input as its direct child
- `Col` has no `span` prop — control width via utility classes
- Grid utilities: `grid-row`, `grid-col`, `grid-c-*` from `src/styles/grid.css`

## Git

- Branch: `feature/`, `fix/`, `refactor/` prefixes
- Commits: conventional
- Never commit `.env`, secrets, credentials

## Restricted Files

Files in this list MUST NOT be read:

- `.env`
- `credentials.json`
- `supersecrets.txt`

See also: `.kilo/rules/restricted-files.md`.
