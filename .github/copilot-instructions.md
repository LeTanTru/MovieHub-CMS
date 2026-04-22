# Copilot Instructions for MovieHub-CMS

## Build, lint, and test commands

- Install dependencies: `yarn`
- Start dev server (port 3001, Turbopack): `yarn dev`
- Start dev server after clearing `.next`: `yarn clean-dev`
- Clean build artifacts before build: `yarn prebuild`
- Build production bundle: `yarn build`
- Start production server (port 3001): `yarn start`
- Lint: `yarn lint`
- Format: `yarn format`
- Staged-file lint/format (used by pre-commit hooks): `yarn lint-staged`
- Tests: no test framework is configured in this repo
- Single-test run: not available (no `test` script in `package.json`)

## High-level architecture

- Next.js App Router CMS (`src/app`) with `reactCompiler: true` in `next.config.ts`.
- Provider chain in `src/app/layout.tsx`: `ThemeProvider` -> `QueryProvider` -> `AppProvider` -> `PermissionGuard`.
- `QueryProvider` (`src/components/providers/query-provider/get-query-provider.ts`) keeps a single browser QueryClient with:
  - `staleTime: 60s`
  - `refetchOnWindowFocus: false`
  - `retry: false`
- `AppProvider` (`src/components/providers/app-provider/app-provider.tsx`) bootstraps profile data (admin/employee), syncs profile into `useAuthStore`, wraps `LazyMotion`, and manages MQTT subscribe/unsubscribe lifecycle.
- Access control is config-driven and cross-cutting:
  - endpoint methods + permission codes: `src/constants/api-config.ts`
  - route metadata (`auth`, `permissionCode`, `separate`): `src/routes/route.ts`
  - route-level auth/redirect and unauthorized rendering: `src/components/permission-guard/permission-guard.tsx`
  - permission resolution (including create/edit split when `separate`): `src/utils/validate-permission.util.ts`
- HTTP behavior is centralized in `src/utils/http.util.ts`: auth header injection, refresh-token queue on concurrent 401s, path param replacement, and upload payload handling.
- CRUD screens are built around shared hooks:
  - `useListBase`: list query state, query-param sync, delete flow, table helpers
  - `useSaveBase`: create/edit fetch-submit flow, dirty-leave guard, and cache invalidation

## Key conventions for this codebase

- Keep `apiConfig` as the source of truth for endpoint URLs/methods and permission codes; do not hardcode permission strings in pages.
- `useListBase` conventions:
  - Keep required hidden filters in `defaultFilters` + `notShowFromSearchParams`.
  - Preserve query key shape for list data: ``[`${queryKey}-list`, queryFilter]``.
- `useSaveBase` invalidates both `[queryKey]` and ``[`${queryKey}-list`]`` after successful create/update mutations.
- Prefer `apiConfig.*.autoComplete` endpoints for autocomplete fields when available.
- `storageKeys.X_CLIENT_TYPE` is intentionally dual-purpose: local storage key and outbound HTTP header name in `sendRequest`.
- Environment variables are validated through Zod in `src/config.ts`; add new env vars there (and update `.env.example`) when introducing config.
- Form/layout patterns:
  - Use grid utilities from `src/styles/grid.css` (`grid-row`, `grid-col`, `grid-c-*`).
  - `Col` does not accept a `span` prop; width is controlled by utility classes.
  - `FormControl` is a Radix `Slot`; the form control element must be the direct child so `id`/`aria-*` props are applied.
- Motion/style patterns:
  - Use `m` from `framer-motion` (not `motion`) and stay within existing `LazyMotion` setup.
  - Use `cn()` from `@/lib/utils` for class composition.
- Import/style conventions: use `@/*` aliases instead of deep relative paths; use `type` imports where appropriate.
- Git workflow constraints:
  - Conventional commits are enforced (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`).
  - Pre-commit hooks run `eslint --fix` and `prettier --write` via lint-staged.
  - Branch prefixes: `feature/`, `fix/`, `refactor/`.
