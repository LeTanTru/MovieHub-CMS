# Media & Upload Hooks

This document provides an exhaustive breakdown of the custom hooks designed to manage file uploading, multi-part chunk uploading for large videos, and file state management during form sessions.

---

## 1. `useFileUpload`

**File**: `src/hooks/use-file-upload.ts`

A comprehensive hook for managing local file selection, drag-and-drop state, file validation, and automatic preview generation before files are uploaded to a server.

### Parameters Breakdown (`FileUploadOptions`)

Accepts a single configuration object:

- **`maxFiles`** (`number`, optional): The maximum number of files allowed (only applies if `multiple: true`). Defaults to `Infinity`.
- **`maxSize`** (`number`, optional): The maximum allowed size per file in bytes. Defaults to `Infinity`.
- **`accept`** (`string`, optional): A comma-separated string of accepted MIME types or file extensions (e.g., `'image/jpeg, image/png, .pdf'`). Defaults to `'*'`.
- **`multiple`** (`boolean`, optional): Whether the user is allowed to select multiple files. Defaults to `false`.
- **`initialFiles`** (`FileMetadata[]`, optional): An array of files that have already been uploaded (useful for initializing edit forms).
- **`onFilesChange`** (`(files: FileWithPreview[]) => void`, optional): Callback triggered whenever the internal `files` state is modified.
- **`onFilesAdded`** (`(addedFiles: FileWithPreview[]) => void`, optional): Callback triggered exclusively when _new_, valid files are added by the user.

### Return Values Breakdown

Returns a tuple containing `[state, actions]`:

#### `state` (Object)

- **`files`** (`FileWithPreview[]`): Array of currently valid files. Each object contains the raw `file`, a unique `id`, and a `preview` string (a generated `blob:` URL for images).
- **`isDragging`** (`boolean`): True if a file is currently being dragged over the drop zone.
- **`errors`** (`string[]`): Array of string error messages generated during validation (e.g., file too large, invalid type).

#### `actions` (Object)

- **`getInputProps(props?)`**: Returns an object of props to spread onto a hidden `<input type="file" />`. Automatically attaches `ref`, `onChange`, `accept`, and `multiple`.
- **`openFileDialog()`**: Programmatically triggers the hidden file input to open the OS file selector.
- **`addFiles(files)`**: Manually add a `FileList` or array of `File`s to the state (runs them through validation first).
- **`removeFile(id)`**: Removes a file by its unique ID and immediately invokes `URL.revokeObjectURL` on its preview to free memory.
- **`clearFiles()`** / **`clearErrors()`**: Reset methods for the state.
- **`handleDragEnter`**, **`handleDragLeave`**, **`handleDragOver`**, **`handleDrop`**: React event handlers to attach to your visible drag-and-drop container.

---

## 2. `useChunkUpload`

**File**: `src/hooks/use-chunk-upload.ts`

A specialized hook designed to handle **large file uploads** (like video files) by splitting them into chunks and uploading them directly to MinIO/S3.

### Parameters Breakdown

This hook takes no initial parameters.

### Return Values Breakdown

- **`upload`** (`(file: File, onProgress?: (progress: number) => void) => Promise<string>`): The primary function to execute the upload. It handles calculating optimal chunk sizes, batch-fetching presigned URLs, and concurrent PUT requests. It returns a promise resolving to the final `filePath` string on the server.
- **`progress`** (`number`): The current total upload progress, from `0` to `100`.
- **`uploading`** (`boolean`): True while the multipart upload is in progress.

---

## 3. `useFileUploadManager`

**File**: `src/hooks/use-file-upload-manager.ts`

A state machine hook used to track intermediate uploads during a "Create" or "Edit" form session. It ensures orphaned files are deleted from the server if a user uploads a file but then cancels the form.

### Parameters Breakdown

- **`initialUrl`** (`string`, optional): The URL of the file already saved on the server (used during edit mode).
- **`deleteFileMutate`** (`UseMutateAsyncFunction`, **required**): A TanStack Query mutation function that executes the server-side deletion.
- **`isEditing`** (`boolean`, **required**): Modifies the garbage collection logic. If `true`, the hook protects the `initialUrl` from being deleted until submission.
- **`onOpen`** (`boolean`, optional): A trigger flag (usually tied to a modal's `isOpen` state). When it toggles to `true`, the hook resets its internal trackers to the `initialUrl`.

### Return Values Breakdown

- **`currentUrl`** (`string`): The URL of the currently active file representing the final form state.
- **`uploadedFiles`** (`string[]`): A history of every file URL generated during the session.
- **`originalUrl`** (`string`): A static reference to the `initialUrl`.
- **`isUploading`** (`boolean`): State tracking if a network upload is in progress.
- **`trackUploadStart()`**: Sets `isUploading` to true. Call this before triggering your upload mutation.
- **`trackUpload(url)`**: Records a newly generated server URL into the `uploadedFiles` history array and sets it as the `currentUrl`.
- **`handleDeleteOnClick(url)`**: Logic for an "X" button. If the user deletes a brand-new upload, it immediately hits the server to delete it. If they delete the `originalUrl` during an edit session, it only clears the UI state (protecting the file until they click Submit).
- **`handleCancel(shouldNavigate?)`**: Aggregates all intermediate files and deletes them from the server.
- **`handleSubmit()`**: Computes the final diff. It deletes the `originalUrl` if it was replaced, and deletes any unused intermediate uploads.
- **`reset()`**: Clears all internal trackers.

---

## 4. `useImageStatus`

**File**: `src/hooks/use-image-status.ts`

A utility hook to track whether an image is loading, has loaded successfully, or encountered an error. Usually bound to an `<img>` element's `onLoad` and `onError` events.

### Parameters Breakdown

- **`src`** (`string`, optional): The URL of the image to track.

### Return Values Breakdown

Returns an object mapping the lifecycle of the image request:

- **`status`** (`'loading' | 'loaded' | 'error'`): The raw string status.
- **`isLoading`** (`boolean`): True while the image is fetching.
- **`isLoaded`** (`boolean`): True if the image successfully resolved.
- **`isError`** (`boolean`): True if the image threw a network or 404 error.
