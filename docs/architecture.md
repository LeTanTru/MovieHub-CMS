# MovieHub CMS Architecture

## High-Level Model

The codebase is a config-driven Next.js CMS. Most feature pages are thin route components that compose shared primitives:

- `apiConfig` defines endpoint URLs, HTTP methods, headers, upload flags, CSRF requirements, and permission codes.
- `route` defines App Router paths, auth requirements, and route-level permission requirements.
- `queries` wrap `http` calls in TanStack Query hooks.
- `useListBase` and `useSaveBase` implement repeatable list and create/edit page behavior.
- `PermissionGuard` enforces route access globally.
- Zustand stores hold short-lived client state that does not belong in the URL or query cache.

## Provider Tree

`src/app/layout.tsx` wraps every page in this order:

```text
ThemeProvider
  QueryProvider
    AppProvider
      Suspense
        PermissionGuard
          Page content
      MqttProvider
      NextTopLoader
      DisclaimerModal
ToastContainer
```

Provider responsibilities:

- `ThemeProvider`: `next-themes` wrapper. Default theme is light.
- `QueryProvider`: creates/provides a TanStack Query client and conditionally loads React Query Devtools in development.
- `AppProvider`: hydrates session/profile into `useAuthStore`, exposes global loading state, and initializes `LazyMotion`.
- `PermissionGuard`: finds the current route metadata and enforces authentication/authorization.
- `MqttProvider`: subscribes to global and per-account notification topics and invalidates query caches on relevant events.

## Query Client Defaults

`src/components/providers/query-provider/get-query-client.ts` creates a new query client per server render and one singleton browser query client.

Defaults:

- `staleTime`: `QUERY_STALE_TIME`
- `refetchOnWindowFocus`: `false`
- `retry`: `false`

The session query in `src/queries/auth.query.ts` is intentionally different:

- `refetchOnMount`: `always`
- `gcTime`: `0`

This keeps auth state fresh when the app remounts.

## Auth Flow

Primary files:

- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/logout/route.ts`
- `src/app/api/auth/refresh-token/route.ts`
- `src/app/api/auth/session/route.ts`
- `src/app/api/auth/_lib/*`
- `src/queries/auth.query.ts`
- `src/store/auth.store.ts`
- `src/utils/http.util.ts`
- `src/components/providers/app-provider/app-provider.tsx`

Flow:

1. The login UI calls `useLoginMutation`, which posts to internal route `/api/auth/login`.
2. The internal route calls the auth backend, then stores session cookies.
3. `useSession` reads `/api/auth/session` on mount.
4. `AppProvider` writes `accessToken`, `csrfToken`, and `userKind` into `useAuthStore` using `useLayoutEffect`.
5. `AppProvider` loads the correct profile query based on `userKind`.
6. `http` injects the access token into backend requests.
7. On a 401, `http` attempts refresh-token rotation.
8. If refresh succeeds, failed requests are replayed with the new access token.
9. If refresh fails with auth-related status, the app logs out, clears Zustand auth state, and redirects to login.

Important details:

- `useAuthStore.clearState()` resets token, CSRF token, profile, and user kind atomically.
- Refresh handling uses `isRefreshing` and `failedQueue` to deduplicate concurrent 401 refreshes.
- `sendRequest` supports client and server contexts. Client tokens come from Zustand; server tokens come from cookies.

## Permission Flow

Primary files:

- `src/constants/api-config.ts`
- `src/routes/route.ts`
- `src/components/permission-guard/permission-guard.tsx`
- `src/components/has-permission`
- `src/hooks/use-validate-permission.ts`
- `src/utils/validate-permission.util.ts`

Permission sources:

- API-level permission codes are attached to endpoint configs in `apiConfig`.
- Route-level permissions are attached to `route` entries.
- UI-level conditional rendering uses `HasPermission`.

`PermissionGuard` builds a route matcher cache from `route`, matches the current pathname, and applies these decisions:

- Public routes have `auth: false`.
- Unauthenticated users are redirected to `/login` with a safe internal redirect path.
- Authenticated users visiting `/` or `/login` are redirected to the first active route or profile.
- If a route has permission codes, `validatePermission` checks user permissions and route options.
- If authenticated but unauthorized, `Forbidden` is rendered.

`separate: true` is used for create/edit routes that share one path pattern but require different permission codes depending on whether the final path segment is `create` or an existing id.

## HTTP Layer

`src/utils/http.util.ts` exports `http` with `get`, `post`, `put`, `patch`, and `delete` methods. All delegate to `sendRequest`.

Responsibilities:

- Resolve `baseUrl`, `method`, headers, path params, query params, and body.
- Inject `Authorization` unless `ignoreAuth` is set.
- Inject `X_CLIENT_TYPE` when `isRequiredXClientType` is true.
- Inject CSRF token when `isRequiredCsrfToken` is true.
- Replace `:pathParam` tokens in configured URLs.
- Use a 10 second timeout.
- Support `FormData` and object-to-`FormData` upload payloads.
- Re-throw request errors for callers and TanStack Query.

## CRUD Page Pattern

### List Pages

`useListBase` centralizes:

- Query-string parsing and serialization.
- Default filters.
- Pagination.
- List query using key pattern `[queryKey-list, queryFilter]`.
- Delete mutation.
- Search form rendering.
- Add button rendering with permission checks.
- Action column rendering.
- Status column rendering.
- Query invalidation.
- Extension through an `override` handler hook.

List page modules usually:

1. Pick `apiConfig.<domain>`.
2. Pick `queryKeys.<DOMAIN>`.
3. Define search fields and columns.
4. Use `handlers.renderSearchForm`, `handlers.renderAddButton`, `handlers.renderActionColumn`, and `BaseTable`.

### Save Pages

`useSaveBase` centralizes:

- Create/edit mode detection.
- Get-by-id query for edit pages.
- Create/update mutation.
- Submit success/error handling.
- Form dirty state tracking.
- Browser before-unload guard.
- Internal link navigation dirty guard.
- Back/cancel/save action rendering.
- Query invalidation after save.

Save pages usually compose:

1. `useForm` with Zod resolver.
2. `BaseForm`.
3. Shared form field components.
4. `handlers.handleSubmit` from `useSaveBase`.
5. `renderActions(form)`.

## Server API Routes

The app uses internal API routes as a BFF/security layer.

Auth routes:

- `/api/auth/login`
- `/api/auth/logout`
- `/api/auth/refresh-token`
- `/api/auth/session`

File routes:

- `/api/file/delete`
- `/api/file/upload/video/chunk/init`
- `/api/file/upload/video/chunk/presign-batch`
- `/api/file/upload/video/chunk/complete`
- `/api/file/upload/video/chunk/abort`

The chunked video upload routes require CSRF and client type headers via `apiConfig.file.*` settings. They are used to keep storage credentials and presigning logic server-side.

## Realtime Notifications

`MqttProvider` subscribes to two topics:

- `notification/cms` — global CMS processing events (video conversion, audio, subtitle).
- `notification/:accountId` — per-account user-facing events (comments, votes, toxic content locks).

Handled `cmd` values:

| Command                 | Topic   | Action                                                                              |
| ----------------------- | ------- | ----------------------------------------------------------------------------------- |
| `DONE_CONVERT_VIDEO`    | CMS     | Invalidate `VIDEO_LIBRARY_LIST`, notification counts                                |
| `DONE_CONVERT_AUDIO`    | CMS     | Invalidate `VIDEO_LIBRARY_LIST`, notification counts                                |
| `DONE_PROCESS_SUBTITLE` | CMS     | Invalidate `VIDEO_LIBRARY_SUBTITLE_LIST`, notification counts                       |
| `REPLY_COMMENT`         | Account | Parse typed body, invalidate notification counts + comment list/replies             |
| `VOTE_COMMENT`          | Account | Parse typed body, invalidate notification counts + comment list/replies + vote list |
| `TOXIC_COMMENT_LOCKED`  | Account | Parse typed body, invalidate notification counts + comment list/replies             |

The CMS handler uses a `cmsNotificationQueryKeys` lookup map (cmd → query key) to avoid a verbose switch. The account handler uses a `switch` with `parseJSON<T>` to extract typed notification body payloads (`ReplyCommentNotificationType`, `VoteCommentNotificationType`, `ToxicCommentLockedNotificationType`) for targeted cache invalidation.

Helper utilities in `MqttProvider`:

- `invalidateNotificationQueries(...keys)` — always invalidates `UNREAD_NOTIFICATION_COUNT` and `NOTIFICATION_INFINITE` plus any extra keys.
- `invalidateCommentQueries({ movieId, parentId, includeVoteList })` — invalidates the comment infinite list and optionally reply list and vote list.
- `isValidMqttCMD(cmd)` — guards against unknown commands.

## Security Model

Security controls visible in this frontend:

- HTTP-only session cookie flow through internal auth routes.
- CSRF token support for protected internal API routes.
- Route-level permission enforcement.
- UI-level permission checks.
- Centralized auth header injection.
- Refresh-token retry queue and logout on invalid refresh.
- Next.js security headers and CSP in `next.config.ts`.
- `frame-ancestors 'none'` and `X-Frame-Options: DENY`.

The current static security review and remediation backlog is `docs/security-scan.md`. Re-check that document before changing auth/session handling, internal file APIs, token exposure, MQTT credentials, rich text sanitization, CSP, deployment SSH, or dependency versions.

## Performance Model

Notable patterns:

- React Compiler is enabled.
- Query cache defaults avoid retries and window-focus refetches.
- Heavy/dev-only tooling like React Query Devtools is dynamically imported in development.
- Vidstack package imports are optimized in Next config.
- Production build removes console calls except `log` and `error`.
- Long UI lists can use TanStack Virtual where necessary.
- Recharts should be dynamically imported with `ssr: false` when used in heavy chart views.
