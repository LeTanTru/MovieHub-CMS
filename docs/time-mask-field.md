# TimeMaskField

`src/components/form/time-mask-field.tsx` is a react-hook-form field for entering a fixed-format time string `HH:mm:ss.SSS` (e.g. `01:23:45.678`). Instead of free-text input, it behaves like a masked input found in date/time pickers: the punctuation (`:` and `.`) never moves, and typing/deleting only ever affects one digit slot at a time.

## Mask model

```
Index:  0 1 2 3 4 5 6 7 8 9 10 11
Char:   0 0 : 0 0 : 0  0  .  0  0  0
```

- `TIME_MASK_TEMPLATE = '00:00:00.000'` — the blank/reset value.
- `TIME_MASK_DIGIT_INDEXES = [0, 1, 3, 4, 6, 7, 9, 10, 11]` — the string indexes that hold digits; indexes `2`, `5`, `8` (`:`, `:`, `.`) are fixed and skipped entirely by navigation/editing.
- `TIME_MASK_MAX_DIGIT = { 3: 5, 6: 5 }` — caps the tens-digit of minutes (index 3) and seconds (index 6) at `5`, since minutes/seconds only go up to 59.
- `TIME_MASK_PATTERN` validates a full `HH:mm:ss.SSS` string. If the current form value doesn't match (empty, partial, or invalid), the component falls back to displaying `TIME_MASK_TEMPLATE`.

Three small helpers walk the digit-index array:

- `nearestDigitIndex(index)` — snaps any caret position forward to the next valid digit slot (used whenever the caret lands on/near punctuation).
- `advanceDigitIndex(index)` / `retreatDigitIndex(index)` — step to the next/previous digit slot, used after a digit is entered or on arrow-key navigation.

## Refs and derived state

```ts
const id = useId();
const inputRef = useRef<HTMLInputElement | null>(null);
const selectionRef = useRef<[number, number] | null>(null);
```

- `id` — a stable, SSR-safe unique id from React, used to wire `<FormLabel htmlFor={id}>` to `<Input id={id}>` for accessibility.
- `inputRef` — holds the actual DOM `<input>` node. Raw DOM access is required because the component manipulates `selectionStart` / `selectionEnd` / `setSelectionRange` directly — none of that is exposed through React props.
- `selectionRef` — a "pending caret position" mailbox. It's a ref (not state) specifically because writing to it must **not** trigger a re-render; it's just a message passed from an event handler to the layout effect that runs after the render caused by `field.onChange`.

```ts
const value: string = field.value ?? '';
const current = TIME_MASK_PATTERN.test(value) ? value : TIME_MASK_TEMPLATE;
```

- `value` is the raw form value from react-hook-form, defaulting to `''` if `undefined`/`null`.
- `current` is the "safe to display and edit" version: if the form's actual value is already a complete, valid `HH:mm:ss.SSS` string, it's used as-is; otherwise (empty, partial, garbage, or a value the form was initialized with that doesn't match the mask) it falls back to the all-zeros template `00:00:00.000`. This guarantees every editing function downstream (`setCharAt(current, ...)`, index math, etc.) always operates on a fixed-length, fixed-format 12-character string — it never has to handle a ragged/partial string.

Note that `current` is not written back into `field.value` just by being computed — it's a derived working value. It only becomes the real form value when a handler calls `commit()` (i.e. `field.onChange`) with it.

## Caret/selection handling

Because the input's `value` is fully controlled (always `current`), the DOM node re-renders with whatever string the mask logic produced. Setting `.value` on an input resets the caret to the end (or wherever the browser defaults it) unless the selection is explicitly restored afterward — a plain click or keypress doesn't naturally leave the caret where you'd expect once the mask rewrites the string. `selectionRef` + the layout effect below solve that.

```ts
useLayoutEffect(() => {
  if (!selectionRef.current || !inputRef.current) return;
  const [start, end] = selectionRef.current;
  inputRef.current.setSelectionRange(start, end);
  selectionRef.current = null;
});
```

This effect has **no dependency array**, so it runs after _every_ render, not just once. Whenever `selectionRef.current` has a pending range queued up, this is what actually applies it to the DOM. The flow for a typical edit:

1. An event handler (e.g. typing a digit) computes the new masked string and the caret position it should end up at.
2. It calls `field.onChange(nextValue)` → triggers a re-render with the new `value` → the caret potentially jumps to the wrong spot as a side effect of the DOM value changing.
3. It also writes the desired `[start, end]` into `selectionRef.current`.
4. React re-renders, then — because `useLayoutEffect` runs synchronously after DOM mutations but before the browser paints — this effect fires, reads `selectionRef.current`, and calls `setSelectionRange(start, end)` to put the caret/highlight back where it belongs.
5. It nulls out `selectionRef.current` so the effect doesn't reapply a stale range on some unrelated future render (e.g. one triggered by `fieldState.error` changing).

`useLayoutEffect` (not `useEffect`) matters for timing: it runs before the browser paints the frame, so the user never sees a visible flicker of the caret in the wrong place before it's corrected — `useEffect` runs asynchronously after paint, which would show a jump.

```ts
const highlight = (index: number) => {
  const range: [number, number] =
    index >= TIME_MASK_TEMPLATE.length
      ? [TIME_MASK_TEMPLATE.length, TIME_MASK_TEMPLATE.length]
      : [index, index + 1];
  selectionRef.current = range;

  // Focus/click don't change the field value, so no re-render follows
  // to run the layout effect — apply the selection immediately too.
  const el = inputRef.current;
  if (el) {
    el.setSelectionRange(range[0], range[1]);
    setTimeout(() => el.setSelectionRange(range[0], range[1]), 0);
  }
};
```

`highlight` decides **where the caret/selection sits** after any operation. Instead of a blinking single-position caret, the component shows a highlighted single character — selecting `[index, index + 1]` visually highlights exactly the digit slot the user is "on," matching the standard UX of masked inputs (you can see which digit will be overwritten next).

- If `index` has walked past the last character (`>= 12`, i.e. `TIME_MASK_TEMPLATE.length`), there's no character left to highlight, so it collapses to a zero-width caret at the very end (`[12, 12]`) instead of `[12, 13]`, which would be out of bounds.
- Otherwise it highlights exactly one character: `[index, index + 1]`.

The range is then applied at three different moments, which looks redundant but each covers a distinct case:

1. `selectionRef.current = range` — queues it for the `useLayoutEffect` above, to be applied after the _next_ render. Relevant when `highlight` is called from `commit`, right after `field.onChange`, where a re-render is about to happen.
2. `el.setSelectionRange(range[0], range[1])` — applied immediately and synchronously, in case no re-render is coming at all. This matters for `handleFocus`/`handleClick`: clicking or focusing the input doesn't change `field.value`, so `field.onChange` is never called, so no re-render happens, so the layout effect would never fire. Without this immediate call, the highlight would never appear in the focus/click case.
3. `setTimeout(() => el.setSelectionRange(...), 0)` — a deferred re-application on the next event-loop tick. Defensive fix for browser behavior: some browsers/OSes reset the input's selection right after a `focus` or `click` event finishes processing (as part of native focus handling), which would silently undo the synchronous call in step 2. Queuing the same call for "right after everything else settles" wins that race.

So: step 1 covers "value changed, re-render coming"; steps 2–3 cover "no re-render coming," with step 3 as a safety net against the browser's own native selection behavior clobbering step 2.

```ts
const commit = (nextValue: string, caretIndex: number) => {
  field.onChange(nextValue);
  highlight(caretIndex);
};
```

`commit` is the single write path for any actual edit (as opposed to pure navigation like arrow keys, which call `highlight` directly). It bundles "update the form value" and "queue/apply the resulting caret position" into one call, so every edit handler just computes `(nextValue, caretIndex)` and calls this — it never has to remember to call `highlight` separately.

## Focus/click behavior

```ts
const handleFocus = () => {
  if (!value) return;
  highlight(nearestDigitIndex(inputRef.current?.selectionStart ?? 0));
};

const handleClick = () => {
  if (!value) return;
  highlight(nearestDigitIndex(inputRef.current?.selectionStart ?? 0));
};
```

Both are identical in logic (a click always also fires focus first, but the click handler additionally corrects the caret to wherever the mouse actually landed within the already-focused input — e.g. clicking directly on a `:` character).

- `if (!value) return;` guards against forcing a highlight when the field is genuinely empty — if `field.value` is falsy, focusing shouldn't push the `00:00:00.000` template into view/selection; native empty-input behavior is left alone.
- `inputRef.current?.selectionStart ?? 0` reads wherever the browser naturally placed the caret (via tab-focus, or via a click at a specific x/y).
- `nearestDigitIndex(...)` snaps that raw position forward to the next valid digit slot, since the browser might place the caret on a `:` or `.` position, which isn't editable.
- `highlight(...)` then visually selects that corrected digit slot. Since focus/click don't trigger `field.onChange`, only this direct call (with its immediate + deferred `setSelectionRange`) actually moves the caret — the layout effect alone wouldn't fire.

## Keyboard behavior (`handleKeyDown`)

```ts
const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
  if (disabled || e.ctrlKey || e.metaKey) return;

  const el = inputRef.current;
  const selStart = el?.selectionStart ?? 0;
  const selEnd = el?.selectionEnd ?? selStart;
  ...
```

Guard clause first: if the field is `disabled`, or the user is holding `Ctrl`/`Cmd` (likely a browser/OS shortcut — copy, undo, select-all, etc.), bail out and let the event proceed natively/untouched — modified keystrokes are not intercepted. Then it reads the current selection range fresh from the DOM (`selStart`/`selEnd`) before any edit — every branch below uses these to decide what to do.

**Digit keys**

```ts
if (/^\d$/.test(e.key)) {
  e.preventDefault();
  const index = nearestDigitIndex(selStart);
  const max = TIME_MASK_MAX_DIGIT[index];
  if (max !== undefined && Number(e.key) > max) return;
  commit(setCharAt(current, index, e.key), advanceDigitIndex(index));
  return;
}
```

`e.preventDefault()` stops the browser from inserting the character itself — since the input is controlled and mask-driven, native text insertion would break the fixed format. `nearestDigitIndex(selStart)` finds which digit slot the caret is logically on. `TIME_MASK_MAX_DIGIT[index]` checks whether this slot has a cap (only the tens-digit of minutes/seconds, indexes 3 and 6, capped at 5) — if the typed digit exceeds that cap (e.g. typing `7` for the minutes-tens digit, which would make minutes ≥ 70), the keystroke is silently rejected (`return` with no `commit` — nothing changes, not even the caret). Otherwise `setCharAt(current, index, e.key)` overwrites just that one character in the 12-char string, and `commit` writes it plus advances the caret to the next digit slot (`advanceDigitIndex`) — typing feels like auto-advancing through the mask, like a credit-card-expiry input.

**Backspace**

```ts
if (e.key === 'Backspace') {
  e.preventDefault();
  if (selEnd > selStart + 1) {
    let next = current;
    for (let i = selStart; i < selEnd; i++) {
      if (TIME_MASK_DIGIT_INDEXES.includes(i)) {
        next = setCharAt(next, i, '0');
      }
    }
    commit(next, nearestDigitIndex(selStart));
    return;
  }
  const index = retreatDigitIndex(nearestDigitIndex(selStart));
  commit(setCharAt(current, index, '0'), index);
  return;
}
```

Two cases:

- **A range spanning more than one character is selected** (`selEnd > selStart + 1`, e.g. the user shift-selected or drag-selected multiple slots): loop over every index in that range, and for each one that's a digit slot (skipping `:`/`.`), zero it out. This lets a user select, say, the whole `HH:mm` portion and backspace to reset just those slots to `00:00` without disturbing punctuation. Afterward the caret moves to `nearestDigitIndex(selStart)` — back to the start of what was selected.
- **Single caret position (or exactly one char selected)**: standard "backspace deletes the previous character" behavior, but mask-aware — it doesn't shift characters, it retreats to the previous digit slot (`retreatDigitIndex(nearestDigitIndex(selStart))`, skipping punctuation) and zeroes that one slot, moving the caret there.

**Delete**

```ts
if (e.key === 'Delete') {
  e.preventDefault();
  const index = nearestDigitIndex(selStart);
  commit(setCharAt(current, index, '0'), index);
  return;
}
```

Forward-delete: zeroes the digit at the _current_ caret position (not the previous one) and leaves the caret where it is — matches native `Delete` semantics of removing the character at/after the cursor rather than before it.

**ArrowLeft / ArrowRight**

```ts
if (e.key === 'ArrowLeft') {
  e.preventDefault();
  highlight(retreatDigitIndex(nearestDigitIndex(selStart)));
  return;
}

if (e.key === 'ArrowRight') {
  e.preventDefault();
  const nextIndex = advanceDigitIndex(nearestDigitIndex(selStart));
  highlight(
    nextIndex >= TIME_MASK_TEMPLATE.length
      ? TIME_MASK_DIGIT_INDEXES[TIME_MASK_DIGIT_INDEXES.length - 1]
      : nextIndex
  );
  return;
}
```

Pure navigation — no `commit`, since nothing about the value changes, only the highlighted slot. `ArrowLeft` retreats one digit slot. `ArrowRight` advances one digit slot, but with a clamp: `advanceDigitIndex` can return `TIME_MASK_TEMPLATE.length` (12) when already on the last digit slot (meaning "off the end"), and rather than letting `highlight` collapse that into a zero-width caret at position 12, this branch explicitly re-clamps back to the _last_ digit index so `ArrowRight` never moves the highlight past the final digit — it stays parked there instead of collapsing to an end-of-string caret. (Contrast this with `advanceDigitIndex` in the digit-typing branch, where letting the caret move to position 12 after the last digit is filled is fine, since there's nothing left to overwrite anyway.)

**Home / End**

```ts
if (e.key === 'Home') {
  e.preventDefault();
  highlight(TIME_MASK_DIGIT_INDEXES[0]);
  return;
}

if (e.key === 'End') {
  e.preventDefault();
  highlight(TIME_MASK_DIGIT_INDEXES[TIME_MASK_DIGIT_INDEXES.length - 1]);
  return;
}
```

Jump directly to the first (index `0`) or last (index `11`) digit slot, bypassing native Home/End (which would otherwise move to the absolute string start/end rather than "first/last editable digit" — though here they coincide since the mask starts and ends on digit slots).

**Fallback**

```ts
if (e.key.length === 1) {
  e.preventDefault();
}
```

Catches any other single printable character (letters, symbols, punctuation typed by hand) that fell through all the branches above and blocks it. `e.key.length === 1` is a cheap way to detect "a single visible character" as opposed to named keys like `'Shift'`, `'Tab'`, `'ArrowUp'` (those have `length > 1` and are left alone, allowed to behave natively — e.g. `Tab` still moves focus to the next field).

Note none of the branches above ever shift characters — every operation is a fixed-width overwrite (`setCharAt`), which is what keeps the punctuation positions stable.

## Paste (`handlePaste`)

```ts
const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
  e.preventDefault();
  if (disabled) return;

  const digits = e.clipboardData
    .getData('text')
    .replace(/\D/g, '')
    .slice(0, TIME_MASK_DIGIT_INDEXES.length);
  if (!digits) return;

  let next = TIME_MASK_TEMPLATE;
  digits.split('').forEach((digit, i) => {
    const index = TIME_MASK_DIGIT_INDEXES[i];
    const max = TIME_MASK_MAX_DIGIT[index];
    next = setCharAt(
      next,
      index,
      max !== undefined && Number(digit) > max ? String(max) : digit
    );
  });

  const caretIndex =
    digits.length >= TIME_MASK_DIGIT_INDEXES.length
      ? TIME_MASK_TEMPLATE.length
      : TIME_MASK_DIGIT_INDEXES[digits.length];
  commit(next, caretIndex);
};
```

`e.preventDefault()` blocks the browser's native paste-insertion (again, the input is controlled/masked). The pasted text is stripped of everything except digits (`replace(/\D/g, '')`), then truncated to at most 9 characters — the number of digit slots (`TIME_MASK_DIGIT_INDEXES.length`). If there are no digits at all, it aborts (`if (!digits) return`) — pasting non-numeric text does nothing.

Pasting is treated as "type these digits from scratch": the value is rebuilt **from a blank template** (`TIME_MASK_TEMPLATE`), not from the current value — paste always overwrites the entire field rather than inserting at the caret. `digits.split('').forEach((digit, i) => ...)` walks each pasted digit in order and writes it into the _i_-th digit slot (`TIME_MASK_DIGIT_INDEXES[i]`), applying the same per-slot max-digit rule as typing — but here, instead of rejecting an out-of-range digit outright, it **clamps** it to the max (`String(max)`); e.g. pasting `99:99:99.999` clamps the minutes/seconds tens digits down to `5`.

Finally the caret position is computed: if all 9 slots got filled (`digits.length >= 9`), it parks at the very end (`TIME_MASK_TEMPLATE.length`, i.e. 12); otherwise it lands right after the last digit actually pasted, at `TIME_MASK_DIGIT_INDEXES[digits.length]` (the slot index one past the last one filled), continuing the "type more digits from here" flow.

## Change fallback (`handleChange`)

```ts
const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
  const raw = e.target.value;
  let diffIndex = -1;

  if (raw.length === current.length) {
    for (let i = 0; i < current.length; i++) {
      if (current[i] !== raw[i]) {
        diffIndex = i;
        break;
      }
    }
  }

  if (
    diffIndex !== -1 &&
    TIME_MASK_DIGIT_INDEXES.includes(diffIndex) &&
    /^\d$/.test(raw[diffIndex])
  ) {
    const max = TIME_MASK_MAX_DIGIT[diffIndex];
    if (max === undefined || Number(raw[diffIndex]) <= max) {
      commit(
        setCharAt(current, diffIndex, raw[diffIndex]),
        advanceDigitIndex(diffIndex)
      );
      return;
    }
  }

  commit(current, nearestDigitIndex(inputRef.current?.selectionStart ?? 0));
};
```

Because `handleKeyDown` calls `preventDefault()` on virtually every key, `onChange` should rarely fire from real keyboard input — it exists as a safety net for input methods that don't go through discrete keydown events cleanly: IME composition, mobile virtual keyboards, browser autofill dropping in a whole value.

Since this handler can't rely on knowing _which_ key was pressed, it reverse-engineers the edit by diffing the browser's new raw value (`e.target.value`) against `current` (the last known-good masked string):

1. Only bother diffing if `raw` is the **same length** as `current` — a same-length change is the only shape this logic knows how to interpret as "one character overwritten in place." Anything that changed the length (multi-char input, partial deletion, etc.) skips the diff and `diffIndex` stays `-1`.
2. If same-length, scan char by char for the first (and, given the assumption, only meaningful) differing index.
3. If a diff was found, and that index is one of the editable digit slots, and the new character there is actually a digit: check the slot's max-digit constraint (same rule as everywhere else). If it passes, treat it exactly like a normal digit keystroke — overwrite that slot and advance the caret via `commit`.
4. **Any other case** — no valid single-char diff found, the diff landed on punctuation, the new char isn't a digit, or the digit exceeds its slot's max — falls through to the final `commit(current, nearestDigitIndex(...))`. This **discards whatever the browser actually put in the input** and re-commits the unchanged `current` value, just repositioning the caret to the nearest digit slot near wherever the browser's cursor ended up. Because the input is controlled, this effectively snaps the visible text back to the last valid masked string, silently rejecting the disallowed edit.

## Rendering

Wraps the raw `<Input>` in the shared `FormField` / `FormItem` / `FormControl` / `FormLabel` / `FormDescription` / `FormMessage` primitives, consistent with other form fields in `src/components/form/`. The displayed `value` is always `current` (the masked, possibly-fallback-to-template string) rather than the raw form value, so the input never shows a partial/invalid string. Error state toggles the input's ring/border color via `fieldState.error`. The forwarded `ref` (if given) is chained alongside the internal `inputRef` so both the component's own caret logic and any external ref consumer get the DOM node.
