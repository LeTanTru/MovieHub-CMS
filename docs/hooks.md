# Custom Hooks Documentation

The MovieHub CMS project relies on a comprehensive set of custom React hooks located in the `src/hooks/` directory. These hooks encapsulate complex logic for data fetching, state management, file uploading, and UI interactions to keep components clean and maintainable.

The documentation for these hooks is organized into the following categories:

## 1. [CRUD & Data Hooks](./crud-hooks.md)

Contains the core foundational hooks used for standard page layouts.

- `useListBase`: Standard data tables, filtering, and pagination.
- `useInfiniteListBase`: Infinite scrolling lists.
- `useSaveBase`: Create/Edit forms, API orchestration, and dirty-state protection.

## 2. [Media & Upload Hooks](./media-hooks.md)

Contains hooks designed for handling files, multi-part video uploads, and garbage collection.

- `useFileUpload`: Local file drag-and-drop and validation.
- `useChunkUpload`: Large file chunking directly to object storage via presigned URLs.
- `useFileUploadManager`: Lifecycle tracking to delete orphaned intermediate uploads.
- `useImageStatus`: Tracking `<img>` loading states.

## 3. [Utility & General Hooks](./utility-hooks.md)

Contains general-purpose hooks for routing, real-time, UI state, and permissions.

- `useQueryParams`: Advanced URL parameter syncing.
- `useNavigate`: Progress-bar aware routing wrapper.
- `useAuth`: Quick access to decoded JWT and authentication store.
- `useMqtt`: Real-time topic subscription and schema validation.
- `useValidatePermission`: Role-Based Access Control execution.
- `useFirstActiveRoute`: Determine the first accessible view on login.
- `useDragDrop`: Integration with `@dnd-kit` for reordering.
- `useDisclosure`: Modal and dialog toggle state management.
- `useClickOutside`: Click detection aware of Radix portals.
- `useBaseForm`: Pre-configured Zod + React Hook Form instance.
- `useMobile`: Viewport media query tracking.
- `useIsMounted`: Client hydration state tracking.
- `useIsomorphicLayoutEffect`: SSR-safe layout effects.

## 4. [Utility Functions](./utility-hooks.md#utility-functions)

Contains core helper functions that are pure or side-effect utilities not bound to the React component lifecycle. Located in `src/utils/`.

- `http.util.ts`: Configures Axios interceptors for JWT token rotation and request deduping.
- `text.util.ts`: Text formatting, HTML parsing, and VTT subtitle utilities.
- `time.util.ts`: Time conversions and date formatting.
- `validate-permission.util.ts`: Pure functions for role-based access control.
