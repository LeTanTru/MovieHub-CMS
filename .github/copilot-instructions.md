# Copilot Instructions for MovieHub-CMS

## Build, lint, and run commands

- Install dependencies: `yarn`
- Start dev server (port 3001, Turbopack enabled): `yarn dev`
- Start dev server with cache cleanup: `yarn clean-dev`
- Build production bundle: `yarn build`
- Run production server (port 3001): `yarn start`
- Lint: `yarn lint`
- Format: `yarn format`

### Test commands

- There is currently no test script in `package.json` (no `test` command is defined).
- Single-test execution is not configured in repository scripts yet.

### Pre-commit hooks

- Husky + lint-staged automatically runs `eslint --fix` and `prettier --write` on staged `*.{js,jsx,ts,tsx}` files
- Commitlint enforces conventional commits format (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`)
- All commits must include the Co-authored-by trailer: `Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>`

### Git workflow

- Branch naming: `feature/`, `fix/`, `refactor/` prefixes
- Never commit secrets, `.env` files, or credentials

## High-level architecture

- This is a Next.js App Router CMS (`src/app`) with feature routes (admin, employee, movie, category, collection, style, sidebar, etc.) and centralized auth/permission gating.
- `src/app/layout.tsx` composes global providers in this order:
  `ThemeProvider` -> `QueryProvider` -> `AppProvider` -> `PermissionGuard`.
- `QueryProvider` uses a shared TanStack Query client with `staleTime: 60s`, `refetchOnWindowFocus: false`, and `retry: false`.
- `AppProvider` bootstraps authenticated session state by reading token from storage, fetching profile (`useProfileQuery`), syncing Zustand stores, and exposing Framer Motion `LazyMotion`.
- API integration is config-driven:
  - Endpoints, HTTP methods, permissions, and request metadata live in `src/constants/api-config.ts`.
  - Runtime HTTP behavior lives in `src/utils/http.util.ts` (token injection, refresh-token queue, path param replacement, multipart handling).
- Access control is route-driven and permission-code driven:
  - Route metadata (`auth`, `permissionCode`, `separate`, etc.) is defined in `src/routes/route.ts`.
  - `PermissionGuard` resolves the current route by path pattern and enforces auth + permission checks before rendering.
- List pages are standardized around `useListBase` (`src/hooks/use-list-base.tsx`), which centralizes:
  query-sync filters, pagination, list fetching, delete mutation, action columns, and permission-aware UI actions.

## Code style

### Imports

- Use `@/*` path aliases (`src/*`), never deep relative paths
- Group imports: React/Next first, then third-party libs, then `@/` internal modules, then relative imports
- Use `type` imports for types: `import type { Foo } from '@/types'`
- `'use client'` directive required for any file using browser APIs, hooks with side effects, or interactive components

### Formatting (Prettier)

- Single quotes for JS/TS and JSX (`singleQuote: true`, `jsxSingleQuote: true`)
- Semicolons required
- Trailing commas: **none**
- Tab width: 2
- Tailwind classes sorted automatically via `prettier-plugin-tailwindcss`

### TypeScript

- `strict: true` — no `any` where a type exists, but `@typescript-eslint/no-explicit-any` is `off` (pragmatic)
- Prefix unused vars with `_` to suppress warnings (`argsIgnorePattern`, `varsIgnorePattern`, `caughtErrorsIgnorePattern`)
- Use Zod v4 schemas for all form validation. Pattern: `.check(z.email(...))` for email
- `FieldValues` from react-hook-form as generic constraint for form types
- `noNonNullAssertedOptionalChain` is off — avoid `?.!` but don't fight the linter

### ESLint rules

- `no-duplicate-imports` enforced as warning
- `no-console` is a warning (use `logger.info` for debug logging instead)

### Naming conventions

- Components: PascalCase (`CommentInput`, `BaseForm`)
- Hooks: camelCase starting with `use` (`useSaveBase`, `useListBase`)
- Constants: UPPER_SNAKE_CASE (`GROUP_KIND_ADMIN`, `queryKeys`)
- Files: kebab-case (`comment-input.tsx`, `api-config.ts`)
- Directories: kebab-case or flat (`_components/`, `use-list-base.tsx`)

## Key repository conventions

### API and routing patterns

- Use `apiConfig` as the source of truth for endpoint wiring and permission codes; route permissions in `src/routes/route.ts` reference these same codes.
- For required fixed filters in list pages that should not appear in URL params, use:
  `defaultFilters` + `notShowFromSearchParams` in `useListBase` options.
- When passing required ID filters to `useListBase` that should not appear in URL search params, use `defaultFilters` + `notShowFromSearchParams` rather than `handlers.additionalParams` override.
- Prefer dedicated `autoComplete` endpoints when available (`apiConfig.*.autoComplete`) for autocomplete fields instead of list endpoints.

### Client-side patterns

- Many hooks are explicitly client-only (`'use client'`) and should stay client components when they depend on navigation, storage, or browser APIs.
- Hook modules under `src/hooks` typically start with the `'use client'` directive.

### Authentication and permissions

- Auth state is profile-based in UI (`useAuthStore.profile`) while permission extraction comes from decoded JWT authorities in `useAuth`.

### Storage and caching

- Storage keys are centralized in `src/constants/storage-key.ts`:
  - `storageKeys` values like `'X-Client-Type'` are intentionally used both as localStorage keys AND as HTTP header names in `sendRequest`. This is a deliberate dual-use pattern.
  - `removeData(key)` supports string or string[] to batch-remove localStorage keys.
- Query keys are centralized in `src/constants/master-data.ts` (`queryKeys`) and should be reused for React Query hooks.
- `useSaveBase` invalidates React Query caches for `[queryKey]` and `[`${queryKey}-list`]` after successful create/update.

### UI and styling patterns

- Framer Motion convention: import and use `m` components (not `motion`) in component code.
- Modal styling convention: use `bodyWrapperClassName` for modal wrapper customization and `confirmOnClose` / `confirmOnCloseMessage` for close confirmation behavior.
- `Col` form layout component defaults `span` to 12 (50% width) when not provided.
- `FormControl` uses Radix Slot; its id/aria props apply only to its direct child (don't wrap controls in an extra div inside FormControl).
- Tailwind `font-sans` is configured as `fontFamily.sans: ['var(--font-sans)']`; globals should define `--font-sans` accordingly.
- Form grid system uses `grid-row`/`grid-col` utilities + `grid-c-0..12` sizing classes (12-column) defined in `src/styles/grid.css` and imported via `globals.css`.

### Form components

- `BaseForm` supports `onFormChange(isDirty)` callback to track form dirty state.
- `ImageField` supports `freeAspect` and `freePreviewAspect` props for rendering images without fixed aspect ratios.
- `UploadImageField` supports `originalSize` prop that adds 'Gốc' checkbox for uploading images at original dimensions without cropping.
- Repository uses Zod v4 and prefers `.check(z.email(...))` for email validation in schemas.

### Navigation and HTTP

- HTTP wrapper methods (`http.get`/`post`/`put`/...) all delegate to `sendRequest`, which uses `apiConfig.method` to choose the HTTP verb.
- `ProfileForm` cancel reads `localStorage` key `storageKeys.PREVIOUS_PATH` (then removes it) to navigate back; otherwise it falls back to `route.home.path`.

## Error handling

- API errors: caught in `useSaveBase` mutation `onError`, applied to form via `applyFormErrors`
- HTTP layer (`src/utils/http.util.ts`): auto-injects auth tokens, handles refresh-token rotation with dedup queue
- `notify.success` / `notify.error` for user-facing messages (wraps `react-toastify`)
- Use `logger.info` for debug logging, not `console.log`

## React patterns

- **Forms**: `BaseForm` + `useForm` (react-hook-form) + Zod resolver
- **List pages**: `useListBase` hook — handles fetching, pagination, filters, delete, permission checks
- **Save pages**: `useSaveBase` hook — handles create/edit, getById fetch, submit, cache invalidation
- **Server state**: TanStack Query (`useQuery`, `useMutation`). Query keys centralized in `queryKeys`
- **Client state**: Zustand stores in `src/store/`. Use `useShallow` for selector optimization
- **Animations**: Import `m` from `framer-motion` (not `motion`). Use `LazyMotion` + `domAnimation`
- **UI components**: Radix UI primitives wrapped in `src/components/ui/`. Use `cn()` from `@/lib/utils` for conditional classes
