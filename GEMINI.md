# MovieHub CMS - Developer Guide

This document serves as the primary instructional context for Gemini CLI when working on the MovieHub CMS project. It outlines the project's architecture, conventions, and operational procedures.

## 🚀 Project Overview

**MovieHub CMS** is a specialized administration console for managing a movie streaming platform, including content, accounts, and user reports. It is a high-performance, type-safe web application built with the latest React and Next.js ecosystem.

- **Main Technologies:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4.
- **State & Data:** TanStack Query 5 (Server State), Zustand 5 (Client State), Axios (HTTP).
- **Forms & Validation:** React Hook Form 7, Zod 4.
- **UI & Media:** Radix UI, Framer Motion, Vidstack (Video Player), TinyMCE.
- **Communication:** MQTT for real-time signaling, AWS SDK (S3/MinIO) for media uploads.

## 🏗 Architecture & Core Patterns

### 1. Config-Driven Design

The project uses a centralized configuration approach for APIs and Routes:

- **API Config (`src/constants/api-config.ts`):** Defines every endpoint, its method, headers, and required permission codes.
- **Route Config (`src/routes/route.ts`):** Defines application paths, authentication requirements, and mapping to permission codes.

### 2. Permission System

Access control is enforced at multiple levels using unique permission codes (e.g., `MOV_L` for Movie List, `ACC_C_AD` for Account Create Admin).

- **Route Level:** `PermissionGuard` intercepts navigation based on `route.ts`.
- **API Level:** Handled via backend enforcement and frontend conditional UI (`HasPermission` component).
- **Save-Page Logic:** Uses a `separate: true` flag in route config to distinguish between Create and Edit permissions on the same path.

### 3. Standardized CRUD Hooks

To minimize boilerplate, most pages use one of three base hooks:

- **`useListBase` (`src/hooks/use-list-base.tsx`):** Handles filtering, pagination, query-string syncing, and deletion for list pages.
- **`useInfiniteListBase` (`src/hooks/use-inifinite-list-base.tsx`):** Handles infinite scrolling and data mapping for large lists.
- **`useSaveBase` (`src/hooks/use-save-base.tsx`):** Manages form submission, create vs. edit detection, data fetching for edits, and automatic query invalidation.

### 4. Authentication Flow

- **JWT + Refresh Tokens:** Implemented in `src/utils/http.util.ts`.
- **401 Interceptor:** Features a dedup queue to handle multiple concurrent unauthorized requests during a token refresh.
- **Atomic Logout:** `clearState()` in the auth store resets all session data and redirects to login.

## 🛠 Development Workflow

### Commands

- **Dev Server:** `yarn dev` (runs on port 3001 with Turbopack).
- **Build:** `yarn build`.
- **Lint & Format:** `yarn lint` and `yarn format`.
- **Clean Start:** `yarn clean-dev`.

### Key Coding Conventions

- **Path Aliases:** Always use `@/` for internal imports.
- **Client Components:** Use `'use client'` strictly for interactive logic.
- **Strict Typing:** No `any`. Utilize Zod schemas in `src/schema-validations/` for all form and API data.
- **Animations:** Use `m` from `framer-motion` (with `LazyMotion` in layout) instead of `motion` to reduce bundle size.
- **Styling:** Use Tailwind CSS 4 with the `cn()` utility for conditional classes. Refer to `src/styles/grid.css` for standardized form layouts.
- **State Subscription:** Always use `useShallow` when selecting multiple fields from a Zustand store.
- **Radix UI Patterns:** When nesting interactive components (like `DropdownMenu` or `Popover`) inside containers that use `useClickOutside`, always set `modal={false}` on the Radix component. This prevents global pointer-event interception and ensures that clicks inside the parent container are correctly identified, preventing the parent from closing unexpectedly.

## 📁 Critical File Map

- `src/app/`: Next.js App Router structure.
- `src/components/ui/`: Radix UI based low-level components.
- `src/components/form/`: Shared form primitives (Input, Select, Switch, etc.).
- `src/queries/`: Custom hooks wrapping TanStack Query.
- `src/store/`: Zustand stores (`useAuthStore`, `useCommentStore`, `useReviewStore`, `useSidebarStore`, `useVideoLibrarySubtitleStore`).
- `src/config.ts`: Environment variable validation (Zod).
- `docs/security-scan.md`: Current static security review and remediation backlog.

## ⚠️ Important Constraints

- **Testing:** No automated test framework is currently configured. Manual verification is required.
- **Environment:** New environment variables must be added to `.env.example` and validated in `src/config.ts`.
- **API Changes:** When adding or modifying features, always update `api-config.ts` and `route.ts` first.
- **Security-Sensitive Changes:** Review `docs/security-scan.md` before changing auth/session routes, file APIs, token handling, MQTT config, rich text sanitization, CSP, deployment workflow, or dependency versions.
