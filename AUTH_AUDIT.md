# Authentication Audit Report

This document outlines the strengths, vulnerabilities, and architectural observations regarding the authentication flow in the MovieHub CMS project. It covers the lifecycle from login to token refresh and session hydration, focusing on the interaction between Next.js server-side features and client-side single-page application (SPA) state.

## Strengths & Working Mechanisms

The current implementation successfully manages the core requirements of a functional authentication system:

1. **Interceptor Queueing (`src/utils/http.util.ts`)**: The Axios interceptor implements an in-tab deduping queue (`failedQueue`). If multiple concurrent API calls in the same browser tab fail with `401 Unauthorized`, the application pauses them, executes a single refresh token request, and resolves the queued requests with the newly acquired access token.
2. **Unified HTTP Layer**: The HTTP utility abstracts the difference between client-side and server-side execution. In the browser it retrieves the access token from Zustand (`useAuthStore`), while server-side requests read the token from the `httpOnly` cookie via `getCookie()`.
3. **Graceful Degradation**: The interceptor handles terminal authentication failures. If refresh fails with an invalid refresh token response, it calls `/api/auth/logout`, clears local auth state, and redirects the user to the login page.
4. **Persistent Sessions**: Cookies are configured with `maxAge` attributes: 24 hours for access tokens and user kind, and 7 days for refresh tokens.
5. **Server Route Protection**: `src/proxy.ts` performs coarse route-level protection using auth cookies, redirects unauthenticated users to `/login`, and clears incomplete auth cookie state.

## Vulnerabilities & Architectural Flaws

The current architecture mixes `httpOnly` cookie storage with client-side token handling. As a result, the application receives some of the operational benefits of cookies, but it does not receive the full XSS protection normally expected from an `httpOnly` token strategy.

### 1. Raw Token Exposure to Client JavaScript (High Severity)

**Observation:** Tokens are stored in `httpOnly` cookies, but multiple API routes also return raw token values to the frontend:

- `/api/auth/login` returns the backend login response, including `access_token` and likely `refresh_token`.
- `/api/auth/refresh-token` returns the backend refresh response, including the new `access_token` and likely the rotated `refresh_token`.
- `/api/auth/session` reads the `httpOnly` access-token cookie server-side and returns `accessToken` directly to the frontend.

The frontend then stores the access token in Zustand (`useAuthStore`) and uses it for direct API requests and authenticated media playback.

**Impact:** This largely nullifies the protection expected from `httpOnly` cookies. If an attacker successfully executes malicious JavaScript on the CMS origin, they do not need to read cookies directly. They can call the auth endpoints or inspect the client store/runtime state to obtain bearer tokens.

**Evidence in code:**

- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/refresh-token/route.ts`
- `src/app/api/auth/session/route.ts`
- `src/store/auth.store.ts`
- `src/utils/http.util.ts`

### 2. Cross-Tab Refresh Coordination Gap (Medium Severity)

**Observation:** The access token is cached in each tab's isolated Zustand store. The refresh queue in `src/utils/http.util.ts` is also module-local, so it only dedupes refresh attempts inside the same tab.

**Impact:** If multiple tabs encounter expired access tokens at the same time, each tab can independently call `/api/auth/refresh-token`. The refresh token itself is cookie-based and shared across tabs, so a later tab may receive the updated cookie if the first refresh has already completed. However, simultaneous refresh attempts can still race. If the backend enforces refresh-token rotation and invalidates a refresh token after first use, one tab can succeed while another receives an invalid-refresh response and triggers logout handling.

This is more precise than saying each tab keeps an old refresh token in Zustand: the refresh token is not stored in Zustand, but cross-tab refresh coordination is still missing.

### 3. Suboptimal CSRF Protection on Auth Routes (Low-Medium Severity)

**Observation:** The Next.js API routes `/api/auth/refresh-token` and `/api/auth/logout` rely on cookies for session identification, and auth cookies use `sameSite: 'lax'`.

**Impact:** `sameSite: 'lax'` provides useful baseline protection in modern browsers, but it is not the strictest available setting. If the CMS does not require cross-site POST flows, iframe embedding, or cross-origin auth interactions, `sameSite: 'strict'` would reduce CSRF surface area.

### 4. Initial Load Waterfall (Performance Impact)

**Observation:** The client hydrates auth state through `/api/auth/session`. `AppProvider` waits for the session query, stores `accessToken` and `userKind` in Zustand, and only then enables the profile query.

**Impact:** A hard refresh creates an avoidable waterfall:

1. React mounts.
2. The client calls `/api/auth/session`.
3. Zustand is hydrated with the token and user kind.
4. The profile request starts.

This delays readiness and perceived performance.

### 5. Authenticated Media Playback Depends on Client Tokens (Migration Constraint)

**Observation:** The video player injects `Authorization: Bearer <token>` into HLS requests from the browser.

**Impact:** A full Backend-for-Frontend migration cannot simply remove client-side tokens without replacing this media access path. The project would need one of these alternatives:

- a media proxy route that attaches auth server-side,
- short-lived signed media URLs,
- cookie-authenticated media endpoints,
- or a separate token strategy scoped only to media playback.

**Evidence in code:**

- `src/components/video-player/video-player.tsx`
- `src/app/video-library/_components/video-play-modal.tsx`
- `src/app/movie/[id]/movie-item/_components/video-play-modal.tsx`

## Recommendations for Remediation

To align the application with stronger security boundaries, transition toward a true Backend-for-Frontend (BFF) pattern:

1. **Stop Returning Raw Tokens to the Browser**
   - Update `/api/auth/login` and `/api/auth/refresh-token` so they set cookies but return only non-sensitive session metadata.
   - Delete or change `/api/auth/session` so it does not return `accessToken`.

2. **Remove Access Tokens from Zustand**
   - Store only non-sensitive auth state client-side, such as `userKind`, profile, and permission metadata.
   - Avoid using Zustand as a bearer-token cache.

3. **Proxy Protected API Requests Through Next.js**
   - Route frontend API calls through Next.js API handlers.
   - In those handlers, read `httpOnly` cookies server-side and attach `Authorization: Bearer <token>` when calling the backend.

4. **Handle Refresh Server-Side**
   - Keep refresh-token rotation entirely inside Next.js API routes.
   - Return sanitized responses to the browser after refreshing.
   - Consider a cross-tab coordination mechanism during the transition, such as `BroadcastChannel`, if client-side refresh remains in place temporarily.

5. **Plan a Media Auth Replacement**
   - Before removing client tokens, replace HLS bearer-token injection with a proxy, signed URL, or cookie-compatible media authorization design.

6. **Strengthen Cookie Attributes Where Compatible**
   - Use `sameSite: 'strict'` for auth cookies if the CMS does not require cross-site auth flows.
   - Keep `secure: true` in production.
   - Consider explicit cookie expiration behavior for logout and failed-session cleanup.

## Conclusion

The current authentication flow is functional and has useful operational safeguards, especially in-tab refresh deduping and cookie-backed persistence. However, it does not preserve the main security benefit of `httpOnly` cookies because raw tokens are still returned to and stored in browser JavaScript. The highest-priority remediation is to stop exposing tokens from auth API routes and move protected backend calls behind server-side Next.js proxy routes. Media playback needs a dedicated migration path before client-side tokens can be removed completely.
