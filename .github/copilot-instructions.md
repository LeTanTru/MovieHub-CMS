# Copilot Instructions for MovieHub-CMS

## Build, lint, and test commands

- Install dependencies: `yarn`
- Start dev server (port 3001, Turbopack): `yarn dev`
- Start dev server after clearing `.next`: `yarn clean-dev`
- Build production bundle: `yarn build`
- Start production server (port 3001): `yarn start`
- Lint: `yarn lint`
- Format: `yarn format`
- Tests: no test framework is configured
- Single-test run: not available (no `test` script / test runner in `package.json`)

## High-level architecture

- Next.js App Router CMS with React Compiler enabled (`next.config.ts`).
- Provider chain in `src/app/layout.tsx`: `ThemeProvider` -> `QueryProvider` -> `AppProvider` -> `PermissionGuard`.
- `QueryProvider` uses one shared TanStack Query client (`src/components/providers/query-provider/get-query-provider.ts`) with:
  - `staleTime: 60s`
  - `refetchOnWindowFocus: false`
  - `retry: false`
- `AppProvider` (`src/components/providers/app-provider/app-provider.tsx`) handles:
  - profile bootstrapping (`useProfileQuery` / `useEmployeeProfileQuery`)
  - syncing auth profile into Zustand (`useAuthStore`)
  - global animation setup (`LazyMotion` + `domAnimation`)
  - MQTT topic subscription lifecycle
- Auth + permission are configuration-driven across multiple layers:
  - endpoint definitions + permission codes in `src/constants/api-config.ts`
  - route metadata (`auth`, `permissionCode`, `separate`) in `src/routes/route.ts`
  - request/refresh-token queue/path-param/upload handling in `src/utils/http.util.ts`
  - save-page permission split (create vs edit) in `src/utils/validate-permission.util.ts`
- CRUD pages are standardized by hooks:
  - `useListBase` for list, filters, query-param sync, delete flows
  - `useSaveBase` for create/edit fetch, submit, dirty-navigation guard, cache invalidation

## Key conventions for this codebase

- Keep `apiConfig` as the source of truth for endpoints and permission codes. Avoid duplicating permission strings in pages/components.
- `useListBase` conventions:
  - Keep required hidden filters in `defaultFilters` + `notShowFromSearchParams`.
  - Preserve query key shape for list data: ``[`${queryKey}-list`, queryFilter]``.
- `useSaveBase` invalidates both `[queryKey]` and ``[`${queryKey}-list`]`` after successful create/update.
- Prefer `apiConfig.*.autoComplete` endpoints for autocomplete fields when available.
- Storage keys are centralized in `src/constants/storage-key.ts`; `storageKeys.X_CLIENT_TYPE` is intentionally both:
  - a localStorage key
  - an HTTP header name in `sendRequest`
- Form/layout patterns:
  - Use grid utilities from `src/styles/grid.css` (`grid-row`, `grid-col`, `grid-c-*`).
  - `Col` does not have a `span` prop; width is controlled via classes.
  - `FormControl` is a Radix `Slot`; the form control element must be the direct child so `id`/`aria-*` props are applied.
- Motion/style patterns:
  - Use `m` from `framer-motion` (not `motion`) and stay within existing `LazyMotion` setup.
  - Use `cn()` from `@/lib/utils` for class composition.
- Import/style conventions:
  - Use `@/*` aliases instead of deep relative imports.
  - Use `type` imports where appropriate.
- Git workflow constraints:
  - Conventional commits are enforced (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`).
  - Pre-commit hooks run `eslint --fix` and `prettier --write` via lint-staged.
  - Branch prefixes: `feature/`, `fix/`, `refactor/`.
