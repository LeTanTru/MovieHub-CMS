# AGENTS.md — MovieHub CMS

## Build / Lint / Test Commands

```bash
yarn              # Install dependencies
yarn dev          # Start dev server (port 3001, Turbopack)
yarn clean-dev    # Clear .next cache then start dev
yarn build        # Production build
yarn start        # Production server (port 3001)
yarn lint         # ESLint on .ts/.tsx/.js/.jsx
yarn format       # Prettier write all
```

**No test framework is configured.** There is no `test` script in `package.json`. Do not invent test files or test commands unless the user asks.

**Pre-commit hooks** (Husky + lint-staged) auto-run `eslint --fix` and `prettier --write` on staged `*.{js,jsx,ts,tsx}` files. Commit messages must follow conventional commits (enforced by commitlint).

## Code Style

### Imports

- Use `@/*` path aliases (`src/*`), never deep relative paths.
- Group imports: React/Next first, then third-party libs, then `@/` internal modules, then relative imports.
- Use `type` imports for types: `import type { Foo } from '@/types'`.
- `'use client'` directive required for any file using browser APIs, hooks with side effects, or interactive components.

### Formatting (Prettier)

- Single quotes for JS/TS and JSX (`singleQuote: true`, `jsxSingleQuote: true`)
- Semicolons required
- Trailing commas: **none**
- Tab width: 2
- Tailwind classes sorted automatically via `prettier-plugin-tailwindcss`

### TypeScript

- `strict: true` — no `any` where a type exists, but `@typescript-eslint/no-explicit-any` is `off` (pragmatic).
- Prefix unused vars with `_` to suppress warnings (`argsIgnorePattern`, `varsIgnorePattern`).
- Use Zod v4 schemas for all form validation. Pattern: `.check(z.email(...))` for email.
- `FieldValues` from react-hook-form as generic constraint for form types.

### Naming Conventions

- Components: PascalCase (`CommentInput`, `BaseForm`)
- Hooks: camelCase starting with `use` (`useSaveBase`, `useListBase`)
- Constants: UPPER_SNAKE_CASE (`GROUP_KIND_ADMIN`, `queryKeys`)
- Files: kebab-case (`comment-input.tsx`, `api-config.ts`)
- Directories: kebab-case or flat (`_components/`, `use-list-base.tsx`)

### Error Handling

- API errors: caught in `useSaveBase` mutation `onError`, applied to form via `applyFormErrors`.
- HTTP layer (`http.util.ts`): auto-injects auth tokens, handles refresh-token rotation with dedup queue.
- `notify.success` / `notify.error` for user-facing messages (wraps `react-toastify`).
- Use `logger.info` for debug logging, not `console.log`.

### React Patterns

- **Forms**: `BaseForm` + `useForm` (react-hook-form) + Zod resolver. Use `onFormChange` callback for dirty tracking.
- **List pages**: `useListBase` hook — handles fetching, pagination, filters, delete, permission checks.
- **Save pages**: `useSaveBase` hook — handles create/edit, getById fetch, submit, cache invalidation.
- **Server state**: TanStack Query (`useQuery`, `useMutation`). Query keys centralized in `queryKeys`.
- **Client state**: Zustand stores in `src/store/`. Use `useShallow` for selector optimization.
- **Animations**: Import `m` from `framer-motion` (not `motion`). Use `LazyMotion` + `domAnimation`.
- **UI components**: Radix UI primitives wrapped in `src/components/ui/`. Use `cn()` from `@/lib/utils` for conditional classes.

### Styling

- Tailwind CSS v4 with utility classes.
- Use `cn()` (from `@/lib/utils`) for conditional class merging.
- Component variants via `class-variance-authority`.
- `Col` form layout defaults `span=12` (50% width).
- `FormControl` uses Radix Slot — props apply only to direct child.

### Git Conventions

- Branch naming: `feature/`, `fix/`, `refactor/` prefixes.
- Commit messages: conventional commits (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`).
- Never commit secrets, `.env` files, or credentials.
