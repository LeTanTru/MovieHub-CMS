# Copilot Instructions for MovieHub-CMS

## Build, lint, and test commands

- Install dependencies: `yarn`
- Dev server (port 3001, Turbopack): `yarn dev`
- Dev server with cache cleanup: `yarn clean-dev`
- Production build: `yarn build`
- Production server (port 3001): `yarn start`
- Lint: `yarn lint`
- Format: `yarn format`
- Tests: no `test` script is configured in `package.json`
- Single-test run: not available (no test framework/scripts configured)

## High-level architecture

- Next.js App Router CMS with route-level permission gating.
- Global provider chain in `src/app/layout.tsx`: `ThemeProvider` → `QueryProvider` → `AppProvider` → `PermissionGuard`.
- `QueryProvider` creates one shared TanStack Query client with defaults from `get-query-provider.ts` (`staleTime: 60s`, `refetchOnWindowFocus: false`, `retry: false`).
- `AppProvider` bootstraps authenticated app state by:
  - reading token/user kind from storage,
  - fetching the matching profile query (`useProfileQuery` for admin, `useEmployeeProfileQuery` for employee),
  - syncing `useAuthStore.profile`,
  - and driving `useAppLoadingStore.loading`.
- API, route, and permission wiring is config-driven:
  - endpoint definitions + permission codes in `src/constants/api-config.ts`,
  - route metadata (`auth`, `permissionCode`, `separate`) in `src/routes/route.ts`,
  - runtime auth headers/refresh queue/path-param replacement/upload handling in `src/utils/http.util.ts`.
- `PermissionGuard` resolves the current route by path pattern and enforces auth + permission before rendering. Save-page permission split (`separate`) is interpreted in `validate-permission.util.ts` (create vs edit permission).
- CRUD screens are standardized around:
  - `useListBase` for list/search/pagination/delete/query-sync,
  - `useSaveBase` for create/edit fetch + submit + optimistic UX around dirty-form navigation.

## Key conventions for this codebase

- Keep `apiConfig` as the source of truth. Route permissions should reference `apiConfig.*.permissionCode` instead of duplicating strings.
- `useListBase` conventions:
  - Use `defaultFilters` + `notShowFromSearchParams` for required filters that should not appear in URL params.
  - Reuse the standardized query key shape (`[${queryKey}-list, queryFilter]`) for list invalidation/refetch behavior.
- `useSaveBase` convention: successful create/update invalidates both `[queryKey]` and `[${queryKey}-list]`.
- Prefer dedicated `apiConfig.*.autoComplete` endpoints for autocomplete controls when available.
- Storage keys are centralized in `src/constants/storage-key.ts`; `storageKeys.X_CLIENT_TYPE` is intentionally dual-use (local storage key and HTTP header name in `sendRequest`).
- Auth/permission model is split by design:
  - UI authentication state comes from `useAuthStore.profile`,
  - permission codes come from JWT authorities decoded in `useAuth`.
- Form layout and accessibility conventions:
  - Use the custom grid utilities from `src/styles/grid.css` (`grid-row`, `grid-col`, `grid-c-*`) via `globals.css`.
  - `FormControl` is a Radix `Slot`; the actual input must be its direct child so id/aria props are applied correctly.
- Animation convention: use Framer Motion `m` components (not `motion`) and keep animations inside the existing `LazyMotion` setup.

## Existing contributor/assistant constraints to preserve

- Commit format is enforced by commitlint (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`).
- Husky + lint-staged runs `eslint --fix` and `prettier --write` on staged files.
- Branch naming convention: `feature/`, `fix/`, `refactor/`.
