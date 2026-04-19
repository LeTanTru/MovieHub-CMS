# AGENTS.md — MovieHub CMS

## Commands

```bash
yarn              # Install deps
yarn dev          # Dev server (port 3001, Turbopack)
yarn clean-dev    # Clear .next then dev
yarn build      # Production build
yarn start      # Production server (port 3001)
yarn lint       # ESLint
yarn format     # Prettier write all
```

**No test framework.** Do not invent tests.

**Pre-commit hooks** (Husky + lint-staged) auto-fix and format. Commit messages must follow conventional commits (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`).

## Architecture

- App Router CMS (`src/app`). Providers order: `ThemeProvider` → `QueryProvider` → `AppProvider` → `PermissionGuard`.
- `QueryProvider`: `staleTime: 60s`, `refetchOnWindowFocus: false`, `retry: false`.
- API endpoints + permissions: `src/constants/api-config.ts`
- Routes + permissions: `src/routes/route.ts`
- HTTP layer: `src/utils/http.util.ts` (auto-injects auth, refresh-token rotation, dedup queue)
- Access: `PermissionGuard` enforces route-level auth/permission

## Stores

- `useAuthStore` (Zustand): profile, auth state
- `useAppLoadingStore`: global loading state
- Use `useShallow` for selector optimization
- **Store updates in render**: If a parent component needs derived state, use `useLayoutEffect`, not direct render-time calls (causes "update while rendering" error)

## React Patterns

- **Forms**: `BaseForm` + `useForm` (react-hook-form) + Zod resolver. `onFormChange(isDirty)` callback.
- **List pages**: `useListBase` hook
- **Save pages**: `useSaveBase` hook (create/edit, getById, submit, cache invalidation)
- **Server state**: TanStack Query (`useQuery`, `useMutation`)
- **Animations**: Import `m` from `framer-motion`, use `LazyMotion` + `domAnimation`

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

## ESLint Rules (Common Issues)

- **jsx-a11y/click-events-have-key-events**: Add `onKeyDown` handler to elements with `role='button'` or click handlers. Handle `Enter` or `Space`.
- **react-doctor/no-derived-state-effect**: Compute derived state during render, not in `useEffect`. For store sync, use `useLayoutEffect`.
- **react-doctor/no-inline-bounce-easing**: Use custom animation with `cubic-bezier(0.16, 1, 0.3, 1)`, not `animate-bounce`.
- **nextjs-no-img-element**: Use `next/image` with `fill` + `unoptimized` for external SVGs.

## Code Style

- `@/*` path aliases, never deep relative
- `'use client'` for browser APIs/hooks
- Zod v4: `.check()` for validators
- Prefix unused: `_args`, `_var`
- Unused array index in map: `key={index}` satisfies `react/jsx-key`
- `cn()` from `@/lib/utils` for conditional classes

## Git

- Branch: `feature/`, `fix/`, `refactor/` prefixes
- Commits: conventional + `Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>`
- Never commit `.env`, secrets, credentials

## Restricted Files

- `.env`, `credentials.json`, `supesecrets.txt` — do not read
