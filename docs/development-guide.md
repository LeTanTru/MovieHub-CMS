# MovieHub CMS Development Guide

## Local Setup

```bash
yarn
yarn dev
```

The app runs on port 3001.

Use `.env.example` as the environment template. Do not read, commit, or share `.env`.

## Development Commands

```bash
yarn dev
yarn clean-dev
yarn build
yarn start
yarn lint
yarn format
ANALYZE=true yarn build
```

There is no test framework configured. Do not invent test commands.

## Code Organization Rules

- Use `@/*` imports instead of deep relative paths.
- Put App Router pages under `src/app`.
- Put route metadata in `src/routes/route.ts`.
- Put endpoint metadata and permission codes in `src/constants/api-config.ts`.
- Put query keys in `queryKeys` in `src/constants/master-data.ts`.
- Put server-state hooks in `src/queries`.
- Put form validation schemas in `src/schemaValidations`.
- Put DTO/domain types in `src/types`.
- Export stores from `src/store/index.ts`.

## Adding A New CRUD Module

1. Add endpoint config to `src/constants/api-config.ts`.
2. Add a query key to `queryKeys`.
3. Add route metadata to `src/routes/route.ts`.
4. Add Zod schema in `src/schemaValidations`.
5. Add request/response/search/body types in `src/types`.
6. Add TanStack Query wrappers in `src/queries`.
7. Add route folders in `src/app/<module>`.
8. For list pages, use `useListBase`.
9. For create/edit pages, use `useSaveBase`.
10. Add permission-aware buttons/actions with `HasPermission` or list hook render helpers.

## Query Conventions

All query hooks in `src/queries` should:

- Use centralized `queryKeys`.
- Use `apiConfig`.
- Use `http`.
- Use `select: (data) => data.data` for `useQuery` response payload extraction.

Mutations do not need `select`.

Recommended query shape:

```ts
useQuery({
  queryKey: [queryKeys.SOMETHING, params],
  queryFn: ({ signal }) =>
    http.get<ApiResponse<Something>>(apiConfig.something.getById, {
      pathParams,
      signal
    }),
  select: (data) => data.data
});
```

## Form Conventions

Use:

- `BaseForm`
- `useForm`
- Zod resolver
- Shared form fields from `src/components/form`
- `onFormChange(isDirty)` where a dirty guard is needed

Important details:

- `FormControl` is a Radix `Slot`; the real input must be its direct child.
- `Col` has no `span` prop; use grid utility classes.
- Grid utilities come from `src/styles/grid.css`, for example `grid-row`, `grid-col`, and `grid-c-*`.
- Use `ImageField` with `freeAspect` and `freePreviewAspect` when free cropping/preview is required.
- Use `UploadImageField` with `originalSize` when the original image dimensions must be preserved.

## Store Conventions

Zustand stores are small and focused:

- `useAuthStore`: access token, CSRF token, user kind, profile.
- `useCommentStore`: comment UI state.
- `useSidebarStore`: sidebar UI state.
- `useVideoLibrarySubtitleStore`: subtitle editor/transcript state.

When selecting multiple store fields, use `useShallow`.

When syncing external data into a store inside a component, prefer `useLayoutEffect` if render timing matters. Avoid store updates during render.

## Routing And Navigation

- Define routes in `src/routes/route.ts`.
- Use `generatePath` for dynamic route paths.
- Use `renderListPageUrl` and `serializeParams` to preserve list filters when navigating.
- Use `useNavigate` instead of raw router calls where the project already expects custom navigation behavior.
- Keep hidden parent filters in `defaultFilters` and `notShowFromSearchParams`.

## Permissions

Permission setup has three layers:

- Endpoint permission code in `apiConfig`.
- Route permission requirement in `route`.
- Component-level conditional UI through `HasPermission`.

For save pages that combine create/edit in one route pattern, set `separate: true` and include both create and update permission codes.

## UI Conventions

- Existing design uses Tailwind utilities and shared components.
- Preserve established module patterns unless doing a targeted redesign.
- Use `cn()` from `@/lib/utils` for conditional classes.
- Use `m` from `framer-motion`; `LazyMotion` is already provided globally by `AppProvider`.
- Use `next/image` instead of raw `<img>` where the lint rules require it.
- For external SVGs with `next/image`, use `fill` and `unoptimized`.
- For tables, `BaseTable` and `DragDropTable` rely on content-sized columns and overflow wrappers.

## Modal Dirty Guard Pattern

```tsx
<Modal confirmOnClose={isFormChanged}>
  <Modal.Header>Title</Modal.Header>
  <Modal.Body>{/* form */}</Modal.Body>
  <Modal.Confirm message='Ban co chac chan muon huy khong?' />
</Modal>
```

Use the actual Vietnamese copy in UI files. This documentation uses ASCII to avoid terminal codepage issues.

## Uploads And Files

The project has two upload paths:

- Direct media API upload through `apiConfig.file.upload` and `apiConfig.file.uploadVideo`.
- Chunked video upload through internal API routes under `/api/file/upload/video/chunk/*`.

Use the existing upload hooks and file field components:

- `useFileUpload`
- `useFileUploadManager`
- `useChunkUpload`
- `UploadFileField`
- `UploadImageField`
- `UploadVideoField`

Do not expose storage credentials to client components. Keep presigning and deletion logic in server API routes.

## Realtime Updates

For notification-driven refreshes:

- Add new MQTT command constants to `mqttCMDs`.
- Validate message shape with Zod schemas.
- Handle query invalidation in `MqttProvider` or a focused hook.
- Use centralized `queryKeys`.

## Environment Changes

When adding env variables:

1. Add the key to `src/config.ts` if it is public runtime config.
2. Add the key to `.env.example`.
3. Do not read or commit `.env`.
4. If the key is server-only, keep it out of client components and avoid `NEXT_PUBLIC_`.

## Lint And Formatting

Common lint-sensitive rules:

- Add keyboard handlers to clickable non-button elements.
- Compute derived state during render instead of effects.
- Use `.flatMap()` instead of `.map().filter(Boolean)`.
- Dynamically import heavy libraries.
- Do not wrap trivial expressions in `useMemo`.
- Prefix intentionally unused variables with `_`.
- If using an unused map index only for a key, `key={index}` is accepted by project guidance.

## Git Conventions

- Branch prefixes: `feature/`, `fix/`, `refactor/`.
- Commit messages: conventional commits.
- Include the configured co-author line when committing if project policy requires it.
- Never commit `.env`, credentials, or secrets.
