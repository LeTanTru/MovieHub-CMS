# CRUD Base Hooks Documentation

This project uses standardized base hooks to minimize boilerplate for standard list and create/edit pages. All of these hooks integrate TanStack Query (React Query) for state management, Axios (`http.util.ts`) for API calls, and automatically handle common UI patterns like pagination, URL sync, and dirty-form guarding.

---

## 1. `useListBase`

**File**: `src/hooks/use-list-base.tsx`

Designed for standard paginated list pages (e.g., standard data tables).

### Parameters Breakdown

The hook accepts a single configuration object with three main properties: `apiConfig`, `options`, and `override`.

#### `apiConfig`

Defines the API endpoints used by the list view.

- **`getList`** (`ApiConfig`, **required**): The endpoint configuration for fetching the paginated list.
- **`delete`** (`ApiConfig`, optional): The endpoint used when a user clicks the delete button.
- **`create`** (`ApiConfig`, optional): Required if you want the `renderAddButton` handler to work automatically. It checks the `permissionCode` attached to this config to conditionally render the "Add" button.
- **`update`** / **`getById`** (`ApiConfig`, optional): Usually unused directly by the list hook, but defined for strict typing compatibility.

#### `options`

Configures the behavior of the list, pagination, and URL sync.

- **`queryKey`** (`string`, **required**): The base key used for TanStack Query caching (e.g., `'movie-list'`).
- **`objectName`** (`string`, **required**): The human-readable name of the entity, used in tooltips and toast notifications (e.g., `'Phim'`, `'Tài khoản'`).
- **`pageSize`** (`number`, optional): Number of items per page. Defaults to `10`.
- **`defaultFilters`** (`Partial<S>`, optional): The default search parameters applied on initial load (e.g., `{ status: 1 }`).
- **`enabled`** (`boolean`, optional): Whether the `getList` query should run immediately. Defaults to `true`.
- **`excludeFromQueryFilter`** (`string[]`, optional): Array of parameter keys that should exist in the URL/state but should **not** be sent to the backend API.
- **`notShowFromSearchParams`** (`string[]`, optional): Array of parameter keys that should be sent to the API but should **not** appear in the browser's URL bar.
- **`syncSearchParams`** (`boolean`, optional): If `true`, search filters and pagination state are synchronized bidirectionally with the URL query string. Defaults to `true`.
- **`showNotify`** (`boolean`, optional): Whether to display standard success/error toast notifications for actions like deletion. Defaults to `true`.

#### `override(handlers)`

A callback function that allows you to safely override or extend the default hook handlers before they are returned.

- **`handlers.renderActionColumn(options)`**: Override to define which actions (edit, delete) appear in the table column, or provide custom conditions for rendering them.
- **`handlers.additionalColumns()`**: Define extra actions to append to the action column.
- **`handlers.additionalParams()`**: Return dynamic extra payload data to be sent with the `getList` request.

### Setup & Usage

```tsx
const { data, pagination, loading, handlers, renderSearchForm, listQuery } =
  useListBase<YourDataType, YourSearchType>({
    apiConfig: {
      getList: API_ENDPOINTS.YOUR_LIST,
      delete: API_ENDPOINTS.YOUR_DELETE,
      create: API_ENDPOINTS.YOUR_CREATE // Needed for Add Button to work and check permissions
    },
    options: {
      queryKey: 'your-unique-query-key',
      objectName: 'Item Name',
      pageSize: 10,
      defaultFilters: { status: 1 },
      syncSearchParams: true
    },
    override: (handlers) => {
      // Override any handlers to customize logic or table columns
      const originalActionColumn = handlers.renderActionColumn;
      handlers.renderActionColumn = (options) => {
        return originalActionColumn({
          actions: {
            edit: true,
            // Only allow deletion if status is 0
            delete: (record) => record.status === 0
          }
        });
      };

      handlers.additionalColumns = () => ({
        customCol: (record) => <span>{record.custom}</span>
      });

      return handlers;
    }
  });
```

---

## 2. `useInfiniteListBase`

**File**: `src/hooks/use-inifinite-list-base.tsx`

Designed for lists that utilize infinite scrolling (e.g., loading more comments, notifications, or a large continuous feed).

### Parameters Breakdown

The parameters for `useInfiniteListBase` are **exactly identical** to `useListBase` (`apiConfig`, `options`, `override`).

### Infinite Scroll Specific Features

Because it uses `useInfiniteQuery` under the hood, the returned object has additional properties tailored for continuous scrolling:

- **`handlers.loadMore()`**: A function to manually trigger fetching the next page of results.
- **`handlers.handleScrollLoadMore(e)`**: A UI Event handler designed to be attached to `onScroll`. It automatically triggers `loadMore()` when the user scrolls within `100` pixels of the bottom of the container.
- **`isFetchingMore`**: `boolean`. True when the next page is currently being fetched.
- **`hasMore`**: `boolean`. True if there are more pages available to fetch.
- **`totalLeft`**: `number`. The number of remaining items on the server that have not been loaded yet.

---

## 3. `useSaveBase`

**File**: `src/hooks/use-save-base.tsx`

Designed for "Create" or "Edit" form pages. It manages data fetching, form dirty states, warnings before leaving the page, and API submission orchestration.

### Parameters Breakdown

The hook accepts a configuration object with three main properties: `apiConfig`, `options`, and `override`.

#### `apiConfig`

Defines the API endpoints used by the form.

- **`getById`** (`ApiConfig`, optional): The endpoint used to fetch the initial data if `mode === 'edit'`.
- **`create`** (`ApiConfig`, optional): The endpoint hit upon submission if `mode === 'create'`.
- **`update`** (`ApiConfig`, optional): The endpoint hit upon submission if `mode === 'edit'`.

#### `options`

Configures the behavior, routing, and UI metadata.

- **`queryKey`** (`string`, **required**): The base key used for TanStack Query caching (e.g., `'movie-detail'`). It automatically invalidates the associated list query (`${queryKey}-list`) upon a successful save.
- **`objectName`** (`string`, **required**): The human-readable name of the entity, used in the success toast notification (e.g., `'Thêm mới Phim thành công'`).
- **`mode`** (`'create' | 'edit'`, **required**): Hard-toggles the logic of the hook. If `'edit'`, the hook will immediately trigger `getById` and use the `update` mutation. If `'create'`, it skips fetching and uses the `create` mutation.
- **`pathParams`** (`Record<string, string|number|null|undefined>`, **required**): The parameters injected into the API URL. For example, `{ id: params.id }` ensures the `getById` call hits `/api/movie/{id}`.
- **`listPageUrl`** (`string`, optional): The local route string (e.g., `/admin/movies`) that the hook should navigate back to if the user clicks "Cancel" or successfully saves the form.
- **`showNotify`** (`boolean`, optional): Whether to display a standard success/error toast notification upon form submission. Defaults to `true`.

#### `override(handlers)`

- **`handlers.handleSubmitSuccess()`**: A callback triggered immediately after a successful API mutation (before routing away). Useful for custom cleanup logic.
- **`handlers.handleSubmitError(code)`**: A callback triggered if the API returns an error `code` that isn't mapped directly to a form field via the `errorMaps` parameter of `handleSubmit`.

### Setup & Usage

```tsx
const { data, isEditing, loading, handleSubmit, renderActions, onFormChange } =
  useSaveBase<ItemType, FormType>({
    apiConfig: {
      getById: API_ENDPOINTS.YOUR_GET_BY_ID,
      create: API_ENDPOINTS.YOUR_CREATE,
      update: API_ENDPOINTS.YOUR_UPDATE
    },
    options: {
      queryKey: 'your-unique-query-key',
      objectName: 'Item Name',
      mode: params.id ? 'edit' : 'create',
      pathParams: { id: params.id },
      listPageUrl: '/admin/your-list-route'
    },
    override: (handlers) => {
      handlers.handleSubmitSuccess = () => {
        console.log('Successfully saved!');
      };
      return handlers;
    }
  });
```

### Integration with `react-hook-form`

To fully utilize `useSaveBase`, you should connect its methods to your form:

1. **Watch for changes**: Bind `onFormChange(form.formState.isDirty)` within a `useEffect` inside your form component to inform `useSaveBase` when the form is dirty. This automatically enables the "Are you sure you want to leave?" protection prompt.
2. **Handle Submit**: Pass the form data and optionally `form` and `errorMaps` to `handleSubmit` for automatic field-level API error mapping.
3. **Render Actions**: Use `renderActions(form)` to render standard `Save` and `Cancel` buttons. It will correctly disable the `Save` button if the form is pristine or submitting, and show the discard confirmation dialog if the user clicks `Cancel` with unsaved changes.
