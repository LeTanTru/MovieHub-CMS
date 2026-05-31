# MovieHub CMS Module Map

## Core Infrastructure

| Area             | Main Files                                               | Responsibility                                                          |
| ---------------- | -------------------------------------------------------- | ----------------------------------------------------------------------- |
| Root layout      | `src/app/layout.tsx`                                     | Global providers, font, metadata, toast, loader, MQTT, permission guard |
| Query setup      | `src/components/providers/query-provider/*`              | TanStack Query client defaults and provider                             |
| App provider     | `src/components/providers/app-provider/app-provider.tsx` | Session/profile hydration, global loading state, LazyMotion             |
| Permission guard | `src/components/permission-guard/permission-guard.tsx`   | Route matching, login redirects, forbidden state                        |
| HTTP             | `src/utils/http.util.ts`                                 | Axios wrapper, auth injection, CSRF, refresh queue, uploads             |
| Routes           | `src/routes/route.ts`                                    | Central App Router path and permission metadata                         |
| API config       | `src/constants/api-config.ts`                            | Endpoint URLs, methods, headers, permission codes                       |
| Env config       | `src/config.ts`                                          | Zod-validated public environment                                        |
| Stores           | `src/store/*`                                            | Zustand client state                                                    |

## App Route Modules

| Module              | Route Folder                         | Main Concern                                                  |
| ------------------- | ------------------------------------ | ------------------------------------------------------------- |
| Auth                | `src/app/(auth)`                     | Login page and login form                                     |
| Admin               | `src/app/admin`                      | Admin account list and create/edit                            |
| Employee            | `src/app/employee`                   | Employee list and create/edit                                 |
| User                | `src/app/user`                       | End-user management                                           |
| Group permission    | `src/app/group-permission`           | Role/group and permission management                          |
| Category            | `src/app/category`                   | Category CRUD                                                 |
| Person              | `src/app/person`                     | Actor/director CRUD                                           |
| Movie               | `src/app/movie`                      | Movie CRUD, movie items, people, comments, reviews            |
| Video library       | `src/app/video-library`              | Source videos, processing actions, subtitles, subtitle editor |
| Collection          | `src/app/collection`                 | Collection CRUD and collection items                          |
| Sidebar             | `src/app/sidebar`                    | Sidebar content/configuration                                 |
| Style               | `src/app/style`                      | Style records and media presentation config                   |
| App version         | `src/app/app-version`                | Version release records and app package upload                |
| Server config       | `src/app/server-config`              | Server config records                                         |
| Setting             | `src/app/setting`                    | Dynamic platform settings                                     |
| Notification        | `src/app/notification`               | Notification list and read/delete actions                     |
| Statistics          | `src/app/statistics`                 | Overview, movie distribution, top movies                      |
| Static public pages | `src/app/contact`, `src/app/privacy` | Public routes with no auth                                    |

## Internal API Routes

| Route Area            | Files                                                        | Purpose                                         |
| --------------------- | ------------------------------------------------------------ | ----------------------------------------------- |
| Auth login            | `src/app/api/auth/login/route.ts`                            | Exchange credentials for session cookies        |
| Auth logout           | `src/app/api/auth/logout/route.ts`                           | Clear backend/session state                     |
| Auth refresh          | `src/app/api/auth/refresh-token/route.ts`                    | Rotate refresh/access tokens                    |
| Auth session          | `src/app/api/auth/session/route.ts`                          | Read current session for the client             |
| Auth helpers          | `src/app/api/auth/_lib/*`                                    | Cookie options, CSRF generation, refresh helper |
| File delete           | `src/app/api/file/delete/route.ts`                           | Protected media object deletion                 |
| Chunk upload init     | `src/app/api/file/upload/video/chunk/init/route.ts`          | Start chunked upload                            |
| Chunk upload presign  | `src/app/api/file/upload/video/chunk/presign-batch/route.ts` | Presign upload parts                            |
| Chunk upload complete | `src/app/api/file/upload/video/chunk/complete/route.ts`      | Complete multipart upload                       |
| Chunk upload abort    | `src/app/api/file/upload/video/chunk/abort/route.ts`         | Abort multipart upload                          |
| Chunk validation      | `src/app/api/file/upload/video/chunk/_lib/validation.ts`     | Validate upload inputs                          |

## Shared Components

| Folder                          | Responsibility                                                         |
| ------------------------------- | ---------------------------------------------------------------------- |
| `src/components/form`           | Form fields, buttons, labels, file/image/video uploads, layout helpers |
| `src/components/ui`             | Radix-style low-level UI primitives                                    |
| `src/components/table`          | Base and drag/drop table components                                    |
| `src/components/search-form`    | Search form renderer used by list pages                                |
| `src/components/modal`          | Modal and confirmation patterns                                        |
| `src/components/layout`         | Page/list wrappers and layout components                               |
| `src/components/sidebar`        | CMS navigation/sidebar UI                                              |
| `src/components/navbar`         | Top navigation                                                         |
| `src/components/video-player`   | Vidstack player integration                                            |
| `src/components/notification`   | Notification UI                                                        |
| `src/components/has-permission` | Permission-aware conditional rendering                                 |
| `src/components/forbidden`      | Unauthorized screen                                                    |
| `src/components/loading`        | Loading indicators                                                     |

## Shared Hooks

| Hook                    | Purpose                                                    |
| ----------------------- | ---------------------------------------------------------- |
| `useAuth`               | Read auth store and derive auth/user permission info       |
| `useListBase`           | Standard list page lifecycle                               |
| `useInifiniteListBase`  | Infinite list variant, used for comment/review style feeds |
| `useSaveBase`           | Standard create/edit page lifecycle                        |
| `useBaseForm`           | Shared form setup helper                                   |
| `useQueryParams`        | Query-string parsing, serialization, and updates           |
| `useNavigate`           | Navigation helper                                          |
| `useValidatePermission` | Component/hook permission checker                          |
| `useFirstActiveRoute`   | Find first route available to current user                 |
| `useFileUpload`         | Client-side file input/drop behavior                       |
| `useFileUploadManager`  | File state management around upload fields                 |
| `useChunkUpload`        | Chunked video upload orchestration                         |
| `useMqtt`               | Subscribe/filter MQTT messages by topic and command        |
| `useDragDrop`           | Drag/drop ordering support                                 |

## Query Modules

Query modules live in `src/queries` and map backend domains to TanStack Query hooks:

- `account.query.ts`
- `auth.query.ts`
- `category.query.ts`
- `comment.query.ts`
- `employee.query.ts`
- `file.query.ts`
- `group.query.ts`
- `group-permission.query.ts`
- `movie-item.query.ts`
- `movie-person.query.ts`
- `notification.query.ts`
- `permission.query.ts`
- `review.query.ts`
- `server-config.query.ts`
- `sidebar.query.ts`
- `statistics.query.ts`
- `user.query.ts`
- `video-library.query.ts`
- `video-library-subtitle.query.ts`

Use `select: (data) => data.data` for query hooks that return an API response wrapper.

## State Stores

| Store          | File                                        | State                                        |
| -------------- | ------------------------------------------- | -------------------------------------------- |
| Auth           | `src/store/auth.store.ts`                   | Access token, CSRF token, user kind, profile |
| Comment        | `src/store/comment.store.ts`                | Comment tree/open reply state                |
| Sidebar        | `src/store/sidebar.store.ts`                | Sidebar UI state                             |
| Video subtitle | `src/store/video-library-subtitle.store.ts` | Subtitle cues and current playback time      |

## Data And Type Layers

| Folder                  | Role                                                                 |
| ----------------------- | -------------------------------------------------------------------- |
| `src/types`             | TypeScript DTOs, API response types, form/search/body types          |
| `src/schemaValidations` | Zod schemas for forms and message validation                         |
| `src/constants`         | Option lists, query keys, API config, route-independent constants    |
| `src/utils`             | HTTP, storage, notification, URL, permission, media URL, VTT helpers |

## Important Cross-Cutting Keys

`queryKeys` in `src/constants/master-data.ts` is the central source for query cache keys. Avoid hardcoded query key strings in feature code.

`apiConfig` is the central source for:

- Backend URL.
- HTTP method.
- Required headers.
- Permission code.
- Upload mode.
- CSRF requirement.
- Client-type header requirement.

`route` is the central source for:

- App path.
- Auth requirement.
- Route permission code list.
- Create/edit split behavior through `separate`.

## Video Library And Subtitle Editor

The video library area has several connected responsibilities:

- List/create/edit video library records.
- Upload videos directly or through chunked upload APIs.
- Trigger media processing actions such as retry process or process audio.
- Display processing completion through MQTT events.
- Manage subtitle records for a video.
- Translate subtitles through `videoLibrarySubtitle.translate`.
- Edit subtitle transcript cues using parsed VTT content and `useVideoLibrarySubtitleStore`.

Key files:

- `src/app/video-library`
- `src/queries/video-library.query.ts`
- `src/queries/video-library-subtitle.query.ts`
- `src/store/video-library-subtitle.store.ts`
- `src/utils/video.util.ts`
- `src/utils/vtt.util.ts`
- `src/components/video-player`

## Known Project Notes

- The repository has no automated test framework configured.
- The root README is detailed, but terminal output in this environment may show Vietnamese text as mojibake because of PowerShell codepage issues.
- Some older docs/audit files exist at the root. Treat code as source of truth when docs disagree.
- Current docs were written without reading restricted files such as `.env`.
