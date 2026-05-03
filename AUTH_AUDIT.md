# Authentication Audit Report

This document outlines the strengths, vulnerabilities, and architectural observations regarding the authentication flow in the MovieHub CMS project. It covers the lifecycle from login to token refresh and session hydration, focusing on the interaction between Next.js server-side features and client-side single-page application (SPA) state.

## 🌟 Strengths & Working Mechanisms

The current implementation successfully manages the core requirements of a robust authentication system:

1.  **Interceptor Queueing (`src/utils/http.util.ts`)**: The Axios interceptor correctly implements a deduping queue (`failedQueue`). If multiple concurrent API calls fail with a `401 Unauthorized` error, the application pauses them, executes a single refresh token request, and then resolves all queued requests with the newly acquired token. This effectively prevents race conditions and redundant network calls.
2.  **Unified HTTP Layer**: The HTTP utility abstracts the differences between Server-Side Rendering (SSR) and Client-Side rendering. It seamlessly retrieves the token from the Zustand store (`useAuthStore`) when executing in the browser (`isClient`), and securely reads from the `httpOnly` cookie via `getCookie()` during SSR.
3.  **Graceful Degradation**: The interceptor robustly handles terminal authentication failures. If the refresh token itself is expired or invalid, it triggers the `/api/auth/logout` endpoint, clears the local state, and securely redirects the user to the login page.
4.  **Persistent Sessions**: Cookies are correctly configured with `maxAge` attributes (24 hours for access tokens, 7 days for refresh tokens), ensuring users remain authenticated across browser sessions and restarts.

## ⚠️ Vulnerabilities & Architectural Flaws

Despite being functional, the architecture compromises its own security mechanisms by mixing SSR cookie handling with client-side state management.

### 1. The `httpOnly` Security Bypass (High Severity)

**Observation:** Tokens are stored in `httpOnly` cookies specifically to protect them from Cross-Site Scripting (XSS) attacks by preventing JavaScript access. However, the application provides an endpoint (`/api/auth/session`) that reads these cookies server-side and returns the raw `accessToken` directly to the frontend for storage in Zustand.
**Impact:** This completely nullifies the security benefit of `httpOnly` cookies. If an attacker successfully executes malicious JavaScript on the site, they cannot read the cookie directly, but they can simply execute `fetch('/api/auth/session')` to extract and exfiltrate the token.

### 2. Multi-Tab Desynchronization (Medium Severity)

**Observation:** The `accessToken` is cached in the client-side Zustand store (`useAuthStore`). This creates a distributed state problem across multiple browser tabs.
**Impact:** If a user has two tabs open:

1.  Tab A's token expires, receives a 401, successfully refreshes the token, and updates its local Zustand store.
2.  Tab B retains the _old_ token in its isolated Zustand store.
3.  If Tab B subsequently makes a request, it will receive a 401 and attempt to refresh using the _old_ refresh token.
    If the backend implements "Refresh Token Rotation" (where a refresh token is invalidated after a single use), Tab B's attempt will fail, causing an abrupt and confusing logout across all tabs.

### 3. Suboptimal CSRF Protection on Auth Routes (Low-Medium Severity)

**Observation:** The Next.js API routes (`/api/auth/refresh-token` and `/api/auth/logout`) rely entirely on cookies for session identification.
**Impact:** While the `sameSite: 'lax'` configuration provides baseline protection against cross-site POST requests in modern browsers, it is not the strictest available setting. If the CMS does not require cross-origin linking or iframe embedding, this leaves a minimal but unnecessary surface area for Cross-Site Request Forgery (CSRF).

### 4. Initial Load Waterfall (Performance Impact)

**Observation:** Because the application relies on the `/api/auth/session` endpoint to hydrate the client-side state, a network waterfall occurs on the initial page load or hard refresh.
**Impact:** The React application mounts, detects an empty Zustand store, pauses to fetch the session from the Next.js server, waits for the response, and _only then_ begins fetching user data. This delays the Time to Interactive (TTI) and degrades perceived performance.

## 🛠️ Recommendations for Remediation

To achieve optimal security and performance, the application should transition to a true **Backend-For-Frontend (BFF) Pattern**:

1.  **Eliminate Client-Side Tokens:** Remove the `accessToken` from the Zustand store. Delete the `/api/auth/session` endpoint entirely. The frontend JavaScript should never handle the raw token.
2.  **Proxy API Requests:** Instead of the client directly querying the external `AppConstants.apiUrl`, all frontend requests should be routed through Next.js API routes (e.g., `/api/movies`).
3.  **Server-Side Token Attachment:** When the Next.js API route receives a request from the frontend, it should read the `httpOnly` cookie server-side, append the `Authorization: Bearer <token>` header, and proxy the request to the external backend.
4.  **Strengthen Cookie Attributes:** Update the cookie configuration in `/api/auth/login` and `/api/auth/refresh-token` to use `sameSite: 'strict'` to maximize CSRF protection, assuming cross-origin access is not required for the CMS.

**Conclusion:** The current authentication flow is fully functional and adequate for an internal CMS where the risk of XSS is relatively low. However, to align with enterprise security standards and Next.js best practices, the architectural decoupling of tokens from client-side state is highly recommended.
