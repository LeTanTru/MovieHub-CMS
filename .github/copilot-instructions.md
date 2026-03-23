# Copilot Instructions for MovieHub-CMS

## Build, lint, and run commands

- Install dependencies: `yarn`
- Start dev server (port 3001): `yarn dev`
- Start dev server with cache cleanup: `yarn clean-dev`
- Build production bundle: `yarn build`
- Run production server (port 3001): `yarn start`
- Lint: `yarn lint`
- Format: `yarn format`

### Test commands

- There is currently no test script in `package.json` (no `test` command is defined).
- Single-test execution is not configured in repository scripts yet.

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

## Key repository conventions

- Use `apiConfig` as the source of truth for endpoint wiring and permission codes; route permissions in `src/routes/route.ts` reference these same codes.
- For required fixed filters in list pages that should not appear in URL params, use:
  `defaultFilters` + `notShowFromSearchParams` in `useListBase` options.
- Prefer dedicated `autoComplete` endpoints when available (`apiConfig.*.autoComplete`) for autocomplete fields instead of list endpoints.
- Many hooks are explicitly client-only (`'use client'`) and should stay client components when they depend on navigation, storage, or browser APIs.
- Auth state is profile-based in UI (`useAuthStore.profile`) while permission extraction comes from decoded JWT authorities in `useAuth`.
- Storage keys are centralized in `src/constants/storage-key.ts`; `storageKeys.X_CLIENT_TYPE` is intentionally used as an HTTP header name in request assembly.
- Query keys are centralized in `src/constants/master-data.ts` (`queryKeys`) and should be reused for React Query hooks.
- Framer Motion convention: import and use `m` components (not `motion`) in component code.
- Modal styling convention: use `bodyWrapperClassName` for modal wrapper customization and `confirmOnClose` / `confirmOnCloseMessage` for close confirmation behavior.
- Path aliases are enabled via `@/*` -> `src/*` (`tsconfig.json`); prefer alias imports over deep relative paths.
