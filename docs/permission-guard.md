# Permission Guard (`src/components/permission-guard/permission-guard.tsx`)

## Overview

The `PermissionGuard` is a critical security and routing component in the MovieHub CMS application. It acts as a client-side interceptor for route transitions, enforcing authentication rules, managing route redirects (like login flow and home redirection), and validating user permissions against the requested route. It ensures that users can only access pages they are explicitly authorized to view.

## Core Responsibilities

### 1. Route Caching & Matching (`buildRouteCache`)

- The file maintains a localized `routeMatcherCache` array to optimize route lookups.
- During initialization, `buildRouteCache` recursively iterates over the application's central `route` configuration object.
- It converts static and dynamic string paths (e.g., `/movies/:id/edit`) into compiled regular expressions (`RegExp`) and caches them alongside their corresponding `RouteItem` definitions.
- `findRouteByPath` uses this cache to efficiently identify the current route configuration by matching the active URL `pathname` against the cached regex patterns.

### 2. Authentication Flow & Redirections

- **Unauthenticated Users on Protected Routes:** If an unauthenticated user attempts to access a protected route (where `matchedRoute.auth` is not `false`), the guard intercepts the render and redirects them to the login page. It uses `buildLoginRedirectPath` to append the originally requested destination as a query parameter (e.g., `?redirect=/movies`), ensuring a seamless flow after they successfully log in.
- **Authenticated Users on Public/Auth Routes:** If a logged-in user navigates to the login page or the base home route (`/`), they are automatically redirected away. The guard prioritizes destinations in this order:
  1. The `redirect` query parameter (if it exists and passes `isSafeInternalPath` validation).
  2. The `firstActiveRoute` (the first route in the sidebar they have permission to access).
  3. Fallback: The user profile page (`route.profile.savePage.path`).

### 3. Permission Validation (`validatePermission`)

- Once the user is authenticated and the route is matched, the guard extracts the `requiredPermissions` (`permissionCode`) from the matched route object.
- If the route specifies required permissions, the guard invokes the `validatePermission` utility. It evaluates the user's access based on:
  - `requiredPermissions`: The array of codes required for the route.
  - `userPermissions`: The permission codes currently held by the authenticated user.
  - Route-specific configuration flags (`separate`, `excludeKind`, `requiredKind`, `userKind`). These handle fine-grained access scenarios, such as distinguishing between "Create" vs "Edit" modes when both share the same save-page path.

### 4. UI Rendering States

- **Loading State:** While the application is initializing (`!isMounted`), fetching the global loading context, or verifying authentication for a protected route, it renders a full-screen loading spinner to prevent UI flashes.
- **Forbidden State:** If the user is authenticated but fails the `validatePermission` check (i.e., they lack the required `permissionCode`), the guard prevents the page from rendering and instead displays the `<Forbidden />` component (typically a 403 error UI).
- **Authorized State:** If all checks pass—or if the route is entirely public—the guard simply renders its `children`.

## Implementation Details

### Key Dependencies

- **State & Routing Hooks:** Uses `useAuth` (user session state), `useAppContext` (global loading state), `useFirstActiveRoute`, `useQueryParams`, and Next.js `usePathname`.
- **Utilities:** Relies heavily on `validatePermission`, `buildLoginRedirectPath`, and `isSafeInternalPath`.

### Performance Optimizations

- **Memoized Route Lookup:** The matching process (`findRouteByPath`) is wrapped in a `useMemo` dependency array tied to `pathname`, meaning the application won't re-scan the regex cache on unrelated state updates.
- **Flat Route Cache:** By flattening the hierarchical route tree into an array of regex tests on load, it avoids expensive recursive tree traversals on every URL change.

## Placement in Architecture

According to the project architecture, `PermissionGuard` is mounted high up in the core page wrapper hierarchy:
`ThemeProvider` -> `QueryProvider` -> `AppProvider` -> `Suspense` -> **`PermissionGuard`**

Because it sits above the main content and layout, any component rendered inside `PermissionGuard` can safely assume the user has passed all necessary authentication and authorization checks defined in `src/routes/route.ts`.
