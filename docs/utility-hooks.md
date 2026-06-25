# Utility Hooks & Functions Documentation

This document provides a deep dive into the general-purpose utility hooks and core utility functions used throughout the MovieHub CMS application. Each utility is designed to encapsulate complex logic, ensure type safety, and enforce consistent patterns across the codebase.

---

## State & URL Management

### `useQueryParams`

**File**: `src/hooks/use-query-params.ts`
Manages URL search parameters by acting as an interface between component state and the Next.js router. It handles serialization and ensures query parameters are always alphabetized for consistent caching.

#### Parameters Breakdown

- No input parameters, but heavily utilizes TypeScript generics: `useQueryParams<YourSearchType>()`.

#### Return Values Breakdown

- **`getQueryParam(key)`**: Retrieves a specific query parameter from the current URL.
- **`setQueryParam(key, value)`**: Updates a single parameter and pushes the change to the URL. If the value is `null` or `''`, it deletes the parameter.
- **`setQueryParams(newParams)`**: Updates multiple parameters simultaneously via `navigate.push`.
- **`serializeParams(obj)`**: Converts an object into a sorted query string `key=value&key2=value2`, stripping out `null` or `undefined` values.
- **`deserializeParams(str)`**: Parses a URL query string back into a Record object.
- **`searchParams`**: A parsed JavaScript object of the current URL parameters.
- **`queryString`**: The current raw, serialized query string from the URL.
- **`prefixParams(params, prefix)`** / **`deprefixParams(params, prefix)`**: Utilities for managing nested or parent-related parameters, ensuring they don't collide with the current page's parameters.

---

### `useNavigate`

**File**: `src/hooks/use-navigate.ts`
A lightweight wrapper around the Next.js `useRouter` that automatically integrates with `nextjs-toploader` to display a progress bar at the top of the page during navigation transitions.

#### Parameters Breakdown

- **`startLoader`** (`boolean`, optional): If `true`, navigation actions will trigger the top loading bar. Defaults to `true`.

#### Return Values Breakdown

Provides wrapped routing methods:

- **`push(path)`**, **`replace(path)`**, **`back()`**, **`forward()`**, **`refresh()`**: Execute standard Next.js router transitions while calling `loading.start()` before execution.
- **`prefetch(path)`**: Prefetches the route without showing the loader.

---

### `useAuth`

**File**: `src/hooks/use-auth.ts`
Provides quick access to the Zustand authentication store (`useAuthStore`) using `useShallow` to prevent unnecessary re-renders when other store properties change.

#### Return Values Breakdown

- **`isAuthenticated`** (`boolean`): Evaluates to `true` if `accessToken`, `userKind`, and `profile` all exist in the store.
- **`profile`** (`UserProfile`): The raw user profile object from Zustand.
- **`kind`** (`number`): The specific `userKind` from the profile.
- **`permissionCode`** (`string[]`): An array of string permission codes dynamically extracted by decoding the JWT `accessToken`'s `authorities` claim.

---

## Realtime & System

### `useMqtt`

**File**: `src/hooks/use-mqtt.ts`
Subscribes a component to a specific MQTT topic, ensuring that messages are correctly parsed, validated against a Zod schema, and filtered by command type.

#### Parameters Breakdown

Accepts a single configuration object:

- **`topic`** (`string`, **required**): The MQTT topic string to listen to.
- **`cmd`** (`string`, **required**): The expected command string to filter incoming messages.
- **`callback`** (`(data: T) => void`, **required**): A strongly typed function that executes only if the message passes `mqttMessageSchema` validation and the `cmd` matches.

---

### `useValidatePermission`

**File**: `src/hooks/use-validate-permission.ts`
Evaluates whether the currently logged-in user meets a set of required permissions. It serves as the core logic for the `<HasPermission>` component.

#### Return Values Breakdown

Returns a function `hasPermission(options)` which accepts:

- **`requiredPermissions`** (`string[]`, **required**): Array of permission codes (e.g., `['MOV_C', 'MOV_U']`).
- **`requiredKind`** (`number`, optional): A specific user kind requirement.
- **`excludeKind`** (`string[]`, optional): Array of user kinds to explicitly deny.
- **`separate`** (`boolean`, optional): Determines whether checking relies on strict creation vs editing separation keys.

The function returns a `boolean`: True if the user has at least one of the required permissions and passes the kind checks.

---

### `useFirstActiveRoute`

**File**: `src/hooks/use-first-active-route.ts`
Used immediately after a user logs in. It calculates and returns the very first accessible route string from the `route.ts` configuration by comparing the route requirements against the user's current `permissionCode` array. Returns a `string` URL path or `undefined`.

---

## UI & Interactions

### `useDragDrop`

**File**: `src/hooks/use-drag-drop.ts`
Integrates with `@dnd-kit` to handle drag-and-drop table row reordering and API synchronization.

#### Parameters Breakdown

- **`key`** (`string`, **required**): Query key string used to invalidate queries after a successful update.
- **`objectName`** (`string`, **required**): Entity name used for success/error toasts.
- **`data`** (`T[]`, **required**): The initial array of records from the server.
- **`apiConfig`** (`ApiConfig`, **required**): The endpoint to send the PUT request containing the new ordering map.
- **`sortField`** (`keyof T`, optional): The object property indicating order. Defaults to `'ordering'`.
- **`updateOnDragEnd`** (`boolean`, optional): If `true`, dropping a row immediately fires the `handleUpdate` network request.
- **`mappingData`** (`(record, index) => Record<string, unknown>`, optional): Custom function to format the payload sent to the API.

#### Return Values Breakdown

- **`sortColumn`**: Pre-configured column definition for displaying the drag handle in tables.
- **`sortedData`**: The current, internally managed array of items, sorted by `sortField`.
- **`isChanged`**: True if the user has altered the order but it hasn't been saved.
- **`loading`**: True while the backend PUT request is pending.
- **`onDragEnd`**: The handler to pass to `@dnd-kit`'s `<DndContext>`.
- **`handleUpdate(dataOverride?)`**: Manually dispatch the PUT request.

---

### `useDisclosure`

**File**: `src/hooks/use-disclosure.ts`
A standard boolean toggle hook, used heavily for managing the visibility state of Modals, Drawers, or dropdowns.

#### Parameters Breakdown

- **`initial`** (`boolean`, optional): The starting state. Defaults to `false`.

#### Return Values Breakdown

- **`opened`** (`boolean`): The current state.
- **`open()`**: Function to set to `true`.
- **`close()`**: Function to set to `false`.
- **`toggle()`**: Function to invert the current state.

---

### `useClickOutside`

**File**: `src/hooks/use-click-out-side.ts`
Detects clicks outside of a referenced DOM element. Specifically designed to work with Radix UI by ignoring clicks that occur inside Radix portals (`[data-radix-portal]`) or overlays.

#### Parameters Breakdown

- **`onClickOutside`** (`() => void`, **required**): The callback triggered upon an outside click.

#### Return Values Breakdown

- **`ref`** (`React.RefObject<T>`): A React ref that must be attached to the target container element.

---

### `useBaseForm`

**File**: `src/hooks/use-base-form.ts`
Provides a pre-configured instance of `react-hook-form` connected to a Zod schema.

#### Parameters Breakdown

- **`schema`** (`ZodType`, **required**): The Zod schema to enforce validation.
- **`defaultValues`** (`DefaultValues<T>`, **required**): Initial form values.
- **`mode`** (`string`, optional): The validation trigger mode (`'onChange'`, `'onBlur'`, etc). Defaults to `'onChange'`.

#### Return Values Breakdown

Returns a fully initialized `react-hook-form` instance, specifically extending it to also export `formState` generated via `useFormState` to guarantee reactive rerenders on dirty state changes.

---

### `useMobile`

**File**: `src/hooks/use-mobile.ts`
Returns a `boolean` indicating if the viewport is below the standard mobile breakpoint (768px). It attaches an event listener to `window.matchMedia` for dynamic resizing.

---

## React Lifecycles

### `useIsMounted`

**File**: `src/hooks/use-is-mounted.ts`
Returns a `boolean` indicating whether the component has mounted on the client. Very useful in Next.js to avoid hydration mismatches when rendering client-side only UI features.

---

### `useIsomorphicLayoutEffect`

**File**: `src/hooks/use-isomorphic-layout-effect.ts`
Resolves to `useLayoutEffect` on the client and `useEffect` on the server. This prevents React from emitting SSR warnings while still maintaining synchronous DOM mutation timing on the client.

---

## Utility Functions

Located in the `src/utils/` directory, these are pure functions and standard side-effect utilities that do not rely on React's component lifecycle.

### `http.util.ts`

Manages the core Axios instance (`axiosInstance`) and handles all outgoing HTTP requests via the exported `sendRequest` and `http` objects.

- **Token Rotation**: Implements a 401 interceptor that pauses failed requests, fetches a new access token via the refresh endpoint, and replays the queued requests.
- **Atomic Logout**: If token refresh fails, it automatically clears the Zustand `useAuthStore` and redirects the user to the login page.

### `text.util.ts`

Contains string manipulation helpers.

- **`parseSelectOptions(options)`**: Safely parses a stringified JSON array into `{ label, value }` option arrays for Select components.
- **`parseVttContent(content)`**: Parses standard `.vtt` file content into structured `SubtitleType[]` arrays for the subtitle editor.

### `time.util.ts`

Contains date and time formatting helpers, often wrapping standard JS APIs or `date-fns`.

- **`secondsToVttTime(seconds)`**: Converts a float timestamp into standard `HH:MM:SS.mmm` VTT format.
- **`timeToSeconds(timeStr)`**: Parses a VTT timestamp back into a float.

### `validate-permission.util.ts`

The pure-function counterpart to `useValidatePermission`.

- **`hasPermission(options)`**: Takes the user's current permissions array and kind, and checks them against the required permission blocks. Useful for checking permissions outside of React components (e.g., inside route definitions or middleware-like checks).
