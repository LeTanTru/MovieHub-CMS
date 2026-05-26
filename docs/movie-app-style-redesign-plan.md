# MovieHub CMS Style Redesign Plan

## Objective

Redesign the MovieHub CMS visual system so the product feels more cinematic, more intentional, and fully usable in both light and dark mode without maintaining two separate UIs.

## Current UI Constraints

- Theme infrastructure already exists through `next-themes`, but the UI is still largely optimized for light mode.
- Global styles mix semantic tokens (`--background`, `--card`) with legacy one-off tokens (`--color-page-wrapper`, `--color-main-color`, `--color-base-table`).
- Key shell components still rely on hardcoded neutral colors and white overlays:
  - Navbar shadow and surface styling
  - Page wrapper and list wrapper backgrounds
  - Table header, row hover, sticky column, and loading overlays
  - Statistics cards and chart containers
- The dark mode toggle exists but is commented out in the navbar, which suggests theme switching is not part of the current primary UX.

## Design Direction

Use a cinematic editorial direction instead of a generic admin dashboard style.

- Tone: premium studio console, not enterprise back office
- Visual anchors: layered surfaces, restrained glow, poster-inspired contrast, stronger typography hierarchy
- Color behavior:
  - Light mode should feel like a polished production workspace with warm-neutral surfaces and vivid accent color
  - Dark mode should feel like a screening room control panel, with deep surfaces and controlled highlights
- Motion: subtle state transitions, panel reveals, hover elevation, and theme-change continuity without excessive animation

## Redesign Principles

1. Build from semantic tokens, not page-specific colors.
2. Keep light and dark mode visually equivalent, not one primary theme plus one fallback theme.
3. Reserve the accent color for actions, focus states, and high-value metadata.
4. Use elevation, border contrast, and spacing to create hierarchy before adding more color.
5. Preserve existing layout patterns and interaction flows so the redesign is mostly visual and structural, not behavioral.

## Workstreams

### 1. Theme Foundation

- Replace legacy global color tokens with a clearer semantic layer:
  - `surface`
  - `surface-muted`
  - `surface-elevated`
  - `surface-overlay`
  - `accent`
  - `accent-foreground`
  - `border-subtle`
  - `border-strong`
  - `content-primary`
  - `content-secondary`
  - `content-tertiary`
  - `success`
  - `warning`
  - `danger`
- Keep both themes in `src/app/globals.css` and make every custom token resolve from light/dark semantic values.
- Remove direct dependency on hardcoded `white`, `gray-*`, and `zinc-*` in app-shell components where theme parity matters.
- Define consistent radii, shadow, and blur tokens for cards, dialogs, tables, and popovers.

### 2. App Shell

Focus files:

- `src/components/navbar/navbar.tsx`
- `src/components/layout/sidebar.tsx`
- `src/components/layout/page-wrapper.tsx`
- `src/components/sidebar/*`
- `src/components/footer/*`

Plan:

- Rework the top navbar into a cleaner command surface with stronger visual separation from content.
- Re-enable and visually integrate the dark mode toggle into the primary header actions.
- Update the sidebar to feel like a stable navigation rail in both themes:
  - clearer active state
  - better collapsed icon treatment
  - consistent hover and focus styling
- Give page headers a stronger title, breadcrumb, and action structure instead of relying on background blocks alone.

### 3. Shared Surfaces and Components

Focus files:

- `src/components/ui/*`
- `src/components/table/*`
- `src/components/modal/*`
- `src/components/loading/*`
- `src/components/form/*`

Plan:

- Standardize card, dialog, dropdown, popover, and form-field surfaces across themes.
- Refactor tables away from light-only assumptions:
  - header background
  - sticky column surfaces
  - row hover states
  - empty states
  - loading overlays
- Redesign skeletons and loading indicators so they read correctly on dark surfaces.
- Normalize focus rings and interactive states across buttons, toggles, inputs, and menu items.

### 4. High-Value Screens

Prioritize screens that define perceived product quality:

1. Dashboard / statistics
2. Movie list
3. Movie form
4. Video library
5. Authentication screens

Plan:

- Statistics:
  - introduce a more editorial metrics layout
  - improve chart container contrast in both themes
  - replace raw white panels and pale gray backgrounds with tokenized surfaces
- Movie list:
  - improve poster + metadata composition
  - strengthen row density and scanability
  - make actions feel embedded instead of floating icon buttons
- Movie form:
  - group fields into clearer sections
  - use stronger hierarchy for media, metadata, and publishing controls
- Video library:
  - align player-adjacent controls and asset management views with the cinematic theme
- Login:
  - establish the redesign aesthetic immediately so the rest of the CMS feels cohesive

### 5. Data Visualization

Focus files:

- `src/app/statistics/overview/_components/overview.tsx`
- `src/app/statistics/movie-distribution/_components/*`
- `src/app/statistics/top-movies/_components/*`

Plan:

- Define chart palettes for light and dark mode separately, but from the same semantic system.
- Ensure axes, tooltips, gridlines, and legends meet contrast requirements in both themes.
- Use fewer raw saturated colors; reserve stronger tones for emphasis and selected states.

## Rollout Phases

### Phase 1. Token Audit and Theme Contract

- Inventory all custom color tokens and hardcoded neutral colors.
- Map each one to a semantic replacement.
- Establish dark/light acceptance rules before component refactors begin.

### Phase 2. Shell and Navigation

- Navbar
- Sidebar
- Page wrapper
- Footer
- Breadcrumbs
- Theme toggle

This phase should make the app immediately feel redesigned even before inner pages are updated.

### Phase 3. Shared Component Library

- Buttons
- Inputs
- Cards
- Tables
- Modals
- Dropdowns
- Tabs
- Skeletons
- Pagination

This phase reduces one-off styling and makes later screen work faster.

### Phase 4. Screen-by-Screen Redesign

- Statistics
- Movie management
- Video library
- Supporting CRUD pages

### Phase 5. Polish and Consistency Pass

- Motion tuning
- Empty states
- Hover and focus parity
- Responsive cleanup
- Dark/light screenshot review

## Dark and Light Mode Requirements

The redesign is not complete unless every major surface works in both themes with no visual regressions.

- Every page must be manually checked in light and dark mode.
- No loading overlay may assume a white background.
- No table sticky cell may visually detach from its row in dark mode.
- Accent contrast must remain readable on both dark and light surfaces.
- Charts must keep readable labels, tooltip text, and gridlines in both themes.
- Theme switching should feel native and immediate from the navbar toggle.

## Acceptance Criteria

- Core shell is visually cohesive across login, dashboard, lists, forms, and media screens.
- No critical component uses hardcoded light-only color assumptions.
- Light mode and dark mode both look intentionally designed, not inverted.
- Shared tokens are the primary source of styling decisions.
- Tables, cards, modals, and forms maintain contrast and hierarchy on desktop and mobile widths.

## Recommended Execution Order

1. Audit `globals.css` tokens and hardcoded colors in app-shell components.
2. Define the semantic token set for both themes.
3. Refactor navbar, sidebar, page wrapper, and footer.
4. Re-enable and style the dark mode toggle as a first-class control.
5. Refactor shared surfaces: cards, tables, forms, modals, loading states.
6. Redesign statistics and movie list as reference screens.
7. Roll the system through remaining CRUD pages.
8. Perform a final dark/light parity pass with screenshots.

## Notes for Implementation

- Prefer updating shared components before page-level overrides.
- Avoid introducing new page-specific tokens unless they represent a reusable domain concept.
- Keep using existing layout and data hooks; this redesign should mostly change styling, hierarchy, and component composition.
- If a component cannot support both themes cleanly with current structure, refactor the component rather than adding more conditional classes around it.
