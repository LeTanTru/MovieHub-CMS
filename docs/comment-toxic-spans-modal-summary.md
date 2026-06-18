# Comment Toxic Spans Modal Summary

File:

```text
src/app/movie/[id]/comment/_components/comment-toxic-spans-modal.tsx
```

## Purpose

`CommentToxicSpansModal` lets a moderator mark toxic words or phrases inside a comment by selecting text in the rendered comment preview. Moderators do not type the toxic span JSON manually.

The component submits the existing backend contract:

```ts
{
  id: string;
  toxic_spans: string;
}
```

`toxic_spans` is a hidden form field containing `JSON.stringify(ToxicSpan[])`.

## Data Model

```ts
type ToxicSpan = {
  start: number;
  end: number;
};
```

Indexes use JavaScript string offsets:

- `start` is inclusive.
- `end` is exclusive.
- The marked text is `comment.content.slice(start, end)`.

## Form Setup

The modal uses `BaseForm` with `commentToxicSpansSchema`.

Default values:

```ts
{
  id: '',
  toxic_spans: '[]'
}
```

Initial values are derived from the current comment:

1. Parse `comment.toxicSpans` with `parseToxicSpans()`.
2. Normalize parsed spans with `normalizeToxicSpans(parsed, content.length)`.
3. Store the normalized array as the hidden `toxic_spans` string.

`BaseForm` tracks dirty state through `onFormChange`, and the modal uses that state for `confirmOnClose`.

## UI Behavior

The modal renders:

- A selectable comment preview.
- Existing toxic spans highlighted in the preview.
- A mark button that converts the current text selection into a span.
- A clear-all button.
- A list of selected toxic keywords.
- A remove button for each selected toxic keyword.
- Hidden `id` and `toxic_spans` form fields.

There is no visible JSON textarea.

## Selection Flow

When the moderator selects text and clicks the mark button:

1. `previewRef` points to the rendered comment preview container.
2. `getSelectedToxicSpan(previewRef.current)` reads the browser selection.
3. The selection is converted into `{ start, end }` offsets.
4. The new span is appended to the current span list.
5. `normalizeToxicSpans()` clamps, sorts, drops invalid spans, and merges overlaps or adjacent ranges.
6. The normalized array is serialized into the hidden `toxic_spans` field with `form.setValue()`.
7. Browser selection is cleared and focus returns to the preview.

If no valid selection exists, the modal shows an error toast.

## Rendering

Current spans are read from `form.watch('toxic_spans')`, parsed, and normalized on render.

The component derives:

- `toxicSpanSegments` from `createToxicSpanSegments(content, currentToxicSpans)` for the highlighted preview.
- `toxicSpanPreviews` from `createToxicSpanPreviews(content, currentToxicSpans)` for the selected keyword list.

Each rendered text segment includes:

```tsx
data-start={segment.start}
data-end={segment.end}
data-toxic-span-segment=''
```

Those attributes let the selection helper map DOM selection boundaries back to comment string offsets.

## Helper Functions

`parseToxicSpans(value)` parses the stored toxic span string into `ToxicSpan[]`. Invalid, empty, or missing values are treated as an empty list so malformed backend data does not break the modal.

`normalizeToxicSpans(spans, content.length)` sanitizes the span list before render or submit. It clamps indexes into the current comment length, removes invalid or empty ranges, sorts by `start`, and merges overlapping or adjacent spans.

`createToxicSpanPreviews(content, currentToxicSpans)` creates the selected keyword list shown below the preview. Each item includes the original `{ start, end }` plus `text`, where `text` is `content.slice(start, end)`.

`createToxicSpanSegments(content, currentToxicSpans)` splits the full comment into normal and toxic segments for rendering. Toxic segments are highlighted, while normal segments are rendered as plain text.

`getSegmentFromNode(node, container)` finds the rendered preview segment that contains a browser selection boundary. It looks for the nearest element with `data-toxic-span-segment` and verifies that it belongs to the current preview container.

`getBoundaryOffset(container, boundaryContainer, boundaryOffset)` converts one DOM selection boundary into a JavaScript string offset. It reads the segment's `data-start` value and adds the local text offset inside that segment.

`getSelectedToxicSpan(container)` reads `window.getSelection()`, validates that the selection is inside the preview, converts both boundaries with `getBoundaryOffset()`, and returns a normalized `{ start, end }` pair. It returns `null` for collapsed or invalid selections.

## Save Flow

On submit:

1. Parse the hidden `toxic_spans` value.
2. Normalize spans against the current comment content length.
3. Submit through `useUpdateCommentToxicSpansMutation()`.
4. Send `toxic_spans: JSON.stringify(normalizedSpans)`.

On success:

- If the comment is a reply, invalidate:

```ts
[
  `${queryKeys.COMMENT}-${comment.parent.id}-infinite`,
  { parentId: comment.parent.id }
];
```

- If the comment is root-level, invalidate:

```ts
[queryKeys.COMMENT_INFINITE, { movieId: comment.movieId }];
```

The modal then shows a success toast and closes.

On failure, it logs `[UPDATE_COMMENT_TOXIC_SPANS_ERROR]` and shows an error toast.

## Important Notes

- The user-facing workflow is selection-based, not JSON editing.
- `toxic_spans` remains a string only because the API schema requires it.
- Empty selections are ignored.
- Empty content disables the mark action.
- Clear all writes `[]` to the hidden field.
- Save is disabled until the form is dirty or while the mutation is pending.
