# React Effects Guide: `useEffect` vs `useLayoutEffect` vs `useIsomorphicLayoutEffect`

This document clarifies the differences between the various effect hooks in React and explains when to use each within the MovieHub codebase, particularly in the context of our Next.js Server-Side Rendering (SSR) environment.

---

## 1. `useEffect`

`useEffect` is the standard and most commonly used hook for executing side effects in React.

- **How it works:** It runs **asynchronously** _after_ React has rendered the component and the browser has painted the screen.
- **Performance:** Because it runs after paint, it does not block the browser from updating the screen. This makes your app feel faster and more responsive.
- **When to use it (95% of the time):**
  - Data fetching (API calls)
  - Setting up subscriptions or event listeners (e.g., WebSocket connections)
  - Analytics tracking
  - Timers (`setTimeout`, `setInterval`)
  - Any operation that does not need to visually block the user's screen.

**Example:**

```tsx
useEffect(() => {
  const fetchMovie = async () => {
    const data = await getMovie();
    setMovie(data);
  };
  fetchMovie();
}, []);
```

---

## 2. `useLayoutEffect`

`useLayoutEffect` works identically to `useEffect`, but with one major difference: timing.

- **How it works:** It runs **synchronously** _immediately after_ React has calculated all DOM mutations, but _before_ the browser has a chance to paint those changes to the screen.
- **Performance:** It blocks the browser's paint process. If you put slow code inside `useLayoutEffect`, the user will see a frozen screen until the code finishes.
- **When to use it:**
  - **DOM Measurements:** Reading `getBoundingClientRect()`, `offsetWidth`, `scrollHeight`, etc.
  - **DOM Mutations based on state:** Adjusting scroll positions (`window.scrollTo`) or directly mutating DOM node styles before the user sees them.
  - **Syncing Global State (Zustand):** Injecting props/server-data into a global client-side store before child components render, preventing a 1-frame "empty data" flash.

**The SSR Problem:**
If you use `useLayoutEffect` in a Next.js App Router (or any SSR environment), you will see this warning in your console:

> _"Warning: useLayoutEffect does nothing on the server..."_

This happens because the server has no DOM to measure or manipulate. To avoid this warning, we use `useIsomorphicLayoutEffect`.

---

## 3. `useIsomorphicLayoutEffect`

`useIsomorphicLayoutEffect` is a custom hook we created to solve the Next.js SSR warning problem.

- **How it works:** It checks if the code is running on the client (browser) or the server (Node.js).
  - If on the **client** (`typeof window !== 'undefined'`), it resolves to `useLayoutEffect` so we get the synchronous, pre-paint execution.
  - If on the **server**, it gracefully degrades to `useEffect` (which safely does nothing during server render), suppressing the warning.
- **When to use it:** **Always use this instead of `useLayoutEffect`.** Never import `useLayoutEffect` directly from React in this codebase.

**How to import:**

```tsx
import { useIsomorphicLayoutEffect } from '@/hooks';
```

---

## Real Codebase Examples

Here are common scenarios where we replaced `useEffect` with `useIsomorphicLayoutEffect` in MovieHub to prevent visual flickering:

### A. Measuring DOM Elements (Tabs Indicator)

In `movie-tabs.tsx`, we need to measure the active tab's width to position the glowing underline indicator. If we used `useEffect`, the indicator would render at width 0, then flash into position _after_ the paint.

```tsx
// Correct
useIsomorphicLayoutEffect(() => {
  const activeTab = tabRefs.current[activeKey];
  if (activeTab) {
    const tabRect = activeTab.getBoundingClientRect();
    setIndicatorStyle({
      left: tabRect.left - containerRect.left,
      width: activeTab.offsetWidth
    });
  }
}, [activeKey]);
```

### B. Syncing Data to Zustand Before Paint

In `watch-series.tsx`, we extract the `season` from the URL parameters and need to set it in our global `useMovieStore`. If we used `useEffect`, child components relying on `selectedSeason` would render once with `undefined` (or the previous state), then instantly re-render with the correct data, causing layout shift.

```tsx
// Correct
useIsomorphicLayoutEffect(() => {
  if (searchParams.season) {
    setSelectedSeason(searchParams.season);
  } else if (latestSeason) {
    setSelectedSeason(latestSeason);
  }
}, [searchParams.season, latestSeason, setSelectedSeason]);
```

### C. Reading/Setting Scroll Position

In `header.tsx`, we make the header sticky based on `window.scrollY`. Using `useEffect` would cause the header to render transparently, then flash to a solid background after paint if the user loaded the page midway down.

```tsx
// Correct
useIsomorphicLayoutEffect(() => {
  const handleOnScroll = () => {
    setIsFixed(window.scrollY > 0);
  };
  handleOnScroll(); // Calculate immediately before paint
  window.addEventListener('scroll', handleOnScroll);
  return () => window.removeEventListener('scroll', handleOnScroll);
}, []);
```
