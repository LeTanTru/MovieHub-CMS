# Security Audit Report — MovieHub CMS

**Audit Date:** 2026-05-17  
**Last Updated:** 2026-05-17 (Post-fix review)  
**Project:** MovieHub CMS (Next.js 16 App Router)  
**Scope:** Full codebase scan — authentication, API routes, client-side code, configuration, infrastructure  
**Methodology:** Static analysis, data flow tracing, control flow analysis, OWASP Top 10 / API Security Top 10 mapping

---

## Executive Summary

| Severity  | Count  | Resolved | Remaining |
| --------- | ------ | -------- | --------- |
| Critical  | 2      | 1        | 1         |
| High      | 6      | 0        | 6         |
| Medium    | 9      | 1        | 8         |
| Low       | 8      | 8        | 0         |
| Info      | 3      | 3        | 0         |
| **Total** | **28** | **13**   | **15**    |

**Risk Score: HIGH** — One critical and three lower-severity findings resolved. Multiple high-severity findings remain.

### Top Priority Fixes

1. ~~Fix inverted `secure` cookie flag~~ ✅ **RESOLVED**
2. Remove MQTT credentials from client-side bundle and Docker build
3. Add server-side permission enforcement (client-side-only auth is bypassable)
4. Add CSRF protection to all state-changing endpoints
5. Add rate limiting to authentication endpoints

---

## Resolved Findings

### ✅ CRIT-001: Inverted Secure Cookie Flag — RESOLVED

**Status:** Fixed in `src/app/api/auth/login/route.ts` and `src/app/api/auth/refresh-token/route.ts`

**Fix Applied:** Changed `secure: envConfig.NEXT_PUBLIC_NODE_ENV !== 'production'` to `secure: envConfig.NEXT_PUBLIC_NODE_ENV !== 'development'`

**Verification:** Cookies now set with `secure: true` in all environments except local development. This ensures tokens are only transmitted over HTTPS in staging/production.

### ✅ SEC-006: Open Redirect via Unvalidated `PATH_NO_LOGIN` — RESOLVED

**Status:** Fixed in `src/components/permission-guard/permission-guard.tsx`

**Fix Applied:** Added `isSafeInternalPath()` validation function that:

- Rejects non-string values
- Requires paths to start with `/`
- Blocks protocol-relative URLs (`//`)
- Blocks `javascript:`, `data:`, `vbscript:` URI schemes

**Verification:** Post-login redirect now validates `PATH_NO_LOGIN` against safe internal path criteria before navigation.

### ✅ SEC-009: Auth Retry Queue Logged to Console — RESOLVED

**Status:** Fixed in `src/utils/http.util.ts`

**Fix Applied:** Gated `logger.info(failedQueue)` behind `process.env.NODE_ENV === 'development'` check

**Verification:** Queue logging only occurs in development mode, not in production builds.

### ✅ Debug Console Log Removed — RESOLVED

**Status:** Fixed in `src/app/video-library/[id]/subtitle/_components/video-library-subtitle-list.tsx`

**Fix Applied:** Removed `console.log('🚀 ~ VideoLibrarySubtitleList ~ subtitleList:', subtitleList)`

### ✅ LOW-007: Deprecated `X-XSS-Protection` Header — RESOLVED

**Status:** Fixed in `next.config.ts`

**Fix Applied:** Removed deprecated `X-XSS-Protection: 1; mode=block` header. Modern browsers ignore this; rely on Content-Security-Policy instead.

### ✅ INFO-001: No `Permissions-Policy` Header — RESOLVED

**Status:** Fixed in `next.config.ts`

**Fix Applied:** Added `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()` header.

### ✅ INFO-002: Incomplete `.gitignore` for Environment Files — RESOLVED

**Status:** Fixed in `.gitignore`

**Fix Applied:** Added `.env*.local`, `.env*.production`, `.env*.test` patterns.

### ✅ INFO-003: Node.js Base Image Not Pinned — RESOLVED

**Status:** Fixed in `Dockerfile`

**Fix Applied:** Pinned from `node:20-alpine` to `node:20.11-alpine` across all stages.

### ✅ LOW-001: Missing `rel="noopener noreferrer"` on External Links — RESOLVED

**Status:** Fixed in `src/app/contact/page.tsx`

**Fix Applied:** Added `rel='noopener noreferrer'` to all 5 external social media links (Telegram, Discord, Facebook, Instagram, X).

### ✅ LOW-002: Presigned URL Expiration Too Long — RESOLVED

**Status:** Fixed in `src/app/api/file/upload/video/chunk/presign/route.ts`

**Fix Applied:** Reduced `expiresIn` from `3600` (1 hour) to `300` (5 minutes).

### ✅ LOW-003: `window.location.href` Redirect Pattern — RESOLVED

**Status:** Fixed in `src/utils/http.util.ts`

**Fix Applied:** Added validation that `route.login.path` is a string starting with `/` before assigning to `window.location.href`.

### ✅ LOW-004: Module-Scoped Mutable State for Token Refresh — RESOLVED

**Status:** Fixed in `src/utils/http.util.ts`

**Fix Applied:** Moved `isRefreshing` and `failedQueue` declarations after `isClient` guard. The module-level state is only used in client context; server-side code paths use `getCookie` instead of the store.

### ✅ LOW-005: Path Parameter Injection in Route Regex — RESOLVED

**Status:** Fixed in `src/components/permission-guard/permission-guard.tsx`

**Fix Applied:** Added regex metacharacter escaping (`[.*+?^${}()|[\]\\]`) before converting route paths to regex patterns.

### ✅ LOW-006: DELETE Exported as POST Alias — RESOLVED

**Status:** Fixed in `src/app/api/file/delete/route.ts`

**Fix Applied:** Removed `export { DELETE as POST }`. The endpoint is only accessible via DELETE method, matching the `apiConfig.file.deleteObject` configuration.

---

## Critical Findings

### CRIT-002: MQTT Credentials Exposed in Client-Side Bundle & Docker Build

| Field             | Value                                                              |
| ----------------- | ------------------------------------------------------------------ |
| **Severity**      | Critical                                                           |
| **Type**          | Sensitive Data Exposure — CWE-200 / CWE-312                        |
| **Location**      | `src/config.ts:13-14`, `src/lib/mqtt.ts:12-14`, `Dockerfile:18-40` |
| **OWASP**         | A02:2021 — Cryptographic Failures                                  |
| **Effort to Fix** | Moderate                                                           |
| **Status**        | Partially Fixed — `NEXT_PUBLIC_URL` removed from config.ts         |

**Evidence:**

```ts
// config.ts — NEXT_PUBLIC_ prefix means bundled into client JS
NEXT_PUBLIC_MQTT_USERNAME: z.string(),
NEXT_PUBLIC_MQTT_PASSWORD: z.string(),

// mqtt.ts — credentials used in client-side connection
client = mqtt.connect(envConfig.NEXT_PUBLIC_MQTT_BROKER, {
  username: envConfig.NEXT_PUBLIC_MQTT_USERNAME,
  password: envConfig.NEXT_PUBLIC_MQTT_PASSWORD,
});
```

```dockerfile
# Dockerfile — baked into build artifact
ARG NEXT_PUBLIC_MQTT_PASSWORD
ENV NEXT_PUBLIC_MQTT_PASSWORD=$NEXT_PUBLIC_MQTT_PASSWORD
```

**Impact:** MQTT broker credentials are visible to anyone inspecting the browser JavaScript source or extracting them from the Docker image. An attacker can connect directly to the MQTT broker, subscribe to/publish on any topic, intercept notifications, or send malicious commands.

**Remediation:**

- Remove `NEXT_PUBLIC_MQTT_*` variables; use server-only env vars
- Move MQTT connection to a server-side API route or WebSocket proxy
- Use short-lived, scoped tokens instead of static credentials
- Implement topic-level ACLs on the MQTT broker
- Remove MQTT args from Dockerfile

---

## High Findings

### HIGH-001: No CSRF Protection on State-Changing API Routes

| Field             | Value                                                                           |
| ----------------- | ------------------------------------------------------------------------------- |
| **Severity**      | High                                                                            |
| **Type**          | Cross-Site Request Forgery — CWE-352                                            |
| **Location**      | All API routes (login, logout, refresh-token, file/delete, chunk upload routes) |
| **OWASP**         | A01:2021 — Broken Access Control                                                |
| **Effort to Fix** | Moderate                                                                        |

**Evidence:** All `POST`, `DELETE`, `PUT` handlers accept requests without CSRF token verification. Cookies use `sameSite: 'lax'` which only protects against cross-site top-level navigations.

**Impact:** An attacker can craft a malicious page that triggers state-changing operations (logout, file deletion, video upload) using the victim's authenticated session cookies.

**Remediation:**

- Implement CSRF tokens (Double Submit Cookie or Synchronizer Token Pattern)
- Or change `sameSite` to `'strict'` for sensitive cookies
- Add CSRF middleware to all state-changing API routes

---

### HIGH-002: Missing Server-Side Permission Enforcement

| Field             | Value                                                                  |
| ----------------- | ---------------------------------------------------------------------- |
| **Severity**      | High                                                                   |
| **Type**          | Broken Access Control / Privilege Escalation — CWE-285 / CWE-602       |
| **Location**      | `src/components/permission-guard/permission-guard.tsx`, all API routes |
| **OWASP**         | A01:2021 — Broken Access Control                                       |
| **Effort to Fix** | Extensive                                                              |
| **Status**        | Partially Fixed — Auth token checks added to file upload/delete routes |

**Evidence:** Permission checks are performed exclusively in the client-side `PermissionGuard` React component. API route handlers now verify token presence (added in recent changes), but still do not validate permissions:

```ts
// file/delete/route.ts — now checks token exists, but no permission validation
const accessToken = await getCookie(storageKeys.ACCESS_TOKEN);
if (!accessToken) {
  return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
}
// No permission check — any authenticated user can delete ANY S3 object
```

**Recent Improvements:**

- ✅ Auth token checks added to: `delete`, `init`, `presign`, `complete`, `abort` routes
- ✅ Zod validation schemas added for all chunk upload operations (`validation.ts`)
- ✅ Path traversal prevention in S3 key validation
- ✅ MIME type allowlist enforced for video uploads

**Impact:** Any authenticated user can bypass all route-level permissions by directly calling API endpoints. The entire permission system is cosmetic without server-side enforcement.

**Remediation:**

- Implement server-side middleware (`middleware.ts`) that validates permissions on protected routes
- Add permission checks in each API route handler by decoding JWT and checking `authorities` claim
- Enforce `permissionCode` mappings from `src/constants/api-config.ts` server-side

---

### HIGH-003: No Rate Limiting on Authentication Endpoints

| Field             | Value                                                                        |
| ----------------- | ---------------------------------------------------------------------------- |
| **Severity**      | High                                                                         |
| **Type**          | Missing Rate Limiting — CWE-307                                              |
| **Location**      | `src/app/api/auth/login/route.ts`, `src/app/api/auth/refresh-token/route.ts` |
| **OWASP**         | A07:2021 — Identification and Authentication Failures                        |
| **Effort to Fix** | Moderate                                                                     |

**Evidence:** Login and refresh-token endpoints have no rate limiting, brute-force protection, or account lockout mechanisms.

**Impact:** Unlimited credential stuffing, brute-force attacks, and refresh token rotation abuse.

**Remediation:**

- Implement rate limiting (`@upstash/ratelimit` or Redis-based sliding window)
- IP-based throttling (e.g., 5 attempts per minute per IP)
- Account lockout after N failed attempts
- CAPTCHA after repeated failures

---

### HIGH-004: Access Token Stored in Client-Side Zustand Store

| Field             | Value                                                                                |
| ----------------- | ------------------------------------------------------------------------------------ |
| **Severity**      | High                                                                                 |
| **Type**          | Sensitive Data in Client Memory — CWE-316                                            |
| **Location**      | `src/store/auth.store.ts:7,11`, `src/app/(auth)/login/_components/login-form.tsx:60` |
| **OWASP**         | A04:2021 — Insecure Design                                                           |
| **Effort to Fix** | Moderate                                                                             |

**Evidence:**

```ts
// auth.store.ts
accessToken: null,
setAccessToken: (accessToken: string | null) => set({ accessToken }),
```

**Impact:** JWT access token stored in client-side JavaScript store. Any XSS vulnerability can read the token directly from memory via `useAuthStore.getState().accessToken`. Combined with cookie storage, this doubles the attack surface.

**Remediation:** Remove access token from Zustand store. Rely solely on httpOnly cookies for auth.

---

### HIGH-005: Credentials in Basic Auth Header via `btoa()`

| Field             | Value                                                                              |
| ----------------- | ---------------------------------------------------------------------------------- |
| **Severity**      | High                                                                               |
| **Type**          | Improper Credential Handling — CWE-256                                             |
| **Location**      | `src/app/api/auth/login/route.ts:39`, `src/app/api/auth/refresh-token/route.ts:35` |
| **OWASP**         | A02:2021 — Cryptographic Failures                                                  |
| **Effort to Fix** | Quick                                                                              |

**Evidence:**

```ts
Authorization: `Basic ${btoa(`${process.env.APP_USERNAME}:${process.env.APP_PASSWORD}`)}`;
```

**Impact:** `btoa()` provides no cryptographic protection — it's trivially reversible encoding. If credentials are exposed through error logging, stack traces, or SSR leaks, they are immediately usable.

**Remediation:**

- Ensure `APP_USERNAME`/`APP_PASSWORD` are never logged
- Consider using private_key_jwt for OAuth2 client authentication
- Add rate limiting on login endpoint

---

### HIGH-006: `@typescript-eslint/no-explicit-any` and `react/jsx-no-target-blank` Rules Disabled

| Field             | Value                                |
| ----------------- | ------------------------------------ |
| **Severity**      | High                                 |
| **Type**          | Security Misconfiguration — CWE-693  |
| **Location**      | `eslint.config.mjs:65,67`            |
| **OWASP**         | A05:2021 — Security Misconfiguration |
| **Effort to Fix** | Quick                                |

**Evidence:**

```js
'@typescript-eslint/no-explicit-any': 'off',
'react/jsx-no-target-blank': 'off',
```

**Impact:** `any` type bypasses all TypeScript type checking, allowing type confusion bugs and injection vectors. Disabled `jsx-no-target-blank` allows reverse tabnabbing vulnerabilities.

**Remediation:**

```js
'@typescript-eslint/no-explicit-any': 'warn',
'react/jsx-no-target-blank': 'error',
```

---

## Medium Findings

### MED-001: Missing Content-Security-Policy Header

| Field             | Value                                                       |
| ----------------- | ----------------------------------------------------------- |
| **Severity**      | Medium                                                      |
| **Type**          | Missing Security Headers — CWE-693                          |
| **Location**      | `next.config.ts:9-33`                                       |
| **OWASP**         | A05:2021 — Security Misconfiguration                        |
| **Effort to Fix** | Quick                                                       |
| **Status**        | Partially Fixed — Security headers added, CSP still missing |

**Evidence:** Security headers now configured in `next.config.ts`:

- ✅ `X-Content-Type-Options: nosniff`
- ✅ `X-Frame-Options: DENY`
- ✅ `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- ✅ `Referrer-Policy: strict-origin-when-cross-origin`
- ❌ **Missing:** `Content-Security-Policy`

**Impact:** No defense-in-depth against XSS attacks. Given TinyMCE rich text editor allows HTML input, CSP would provide a critical safety net.

**Remediation:**

```ts
{
  key: 'Content-Security-Policy',
  value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tiny.cloud; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' https: wss:; frame-ancestors 'none';"
}
```

---

### MED-002: Stored XSS via TinyMCE Rich Text Editor

| Field             | Value                                            |
| ----------------- | ------------------------------------------------ |
| **Severity**      | Medium                                           |
| **Type**          | Stored Cross-Site Scripting — CWE-79             |
| **Location**      | `src/components/form/rich-text-field.tsx:99-195` |
| **OWASP**         | A03:2021 — Injection                             |
| **Effort to Fix** | Moderate                                         |

**Evidence:** TinyMCE configured with `code`, `template`, `link`, `media`, `codesample` plugins. `paste_as_text: false` allows pasting raw HTML. No server-side sanitization of editor output.

**Impact:** Privileged users could inject malicious JavaScript via the rich text editor. If rendered without sanitization, it executes in other users' sessions.

**Remediation:**

- Enable TinyMCE's `valid_elements` and `extended_valid_elements` to restrict allowed tags/attributes
- Sanitize stored HTML server-side using DOMPurify before rendering
- Disable `code` plugin if raw HTML editing is not required

---

### MED-003: S3 Delete Endpoint — No Ownership Verification (IDOR)

| Field             | Value                                      |
| ----------------- | ------------------------------------------ |
| **Severity**      | Medium                                     |
| **Type**          | Insecure Direct Object Reference — CWE-639 |
| **Location**      | `src/app/api/file/delete/route.ts:20-40`   |
| **OWASP**         | A01:2021 — Broken Access Control           |
| **Effort to Fix** | Moderate                                   |

**Evidence:**

```ts
const { objectName } = await req.json();
// Only checks accessToken exists, no ownership validation
await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
```

**Impact:** Any authenticated user can delete any S3 object by providing its key, including other users' files or system objects.

**Remediation:**

- Maintain ownership mapping in database; verify before deletion
- Restrict deletable objects to those created by the requesting user
- Implement soft-delete with retention period
- Add audit logging for all delete operations

---

### MED-004: Presigned URL Endpoint — Overly Permissive

| Field             | Value                                                        |
| ----------------- | ------------------------------------------------------------ |
| **Severity**      | Medium                                                       |
| **Type**          | Overly Permissive Upload — CWE-434                           |
| **Location**      | `src/app/api/file/upload/video/chunk/presign/route.ts:48-55` |
| **OWASP**         | A01:2021 — Broken Access Control                             |
| **Effort to Fix** | Moderate                                                     |

**Evidence:**

```ts
const command = new UploadPartCommand({ Bucket: BUCKET_NAME, Key: objectName, ... });
const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
```

**Impact:** Any authenticated user can request presigned URLs for arbitrary S3 keys. 1-hour expiry is generous for multipart upload parts.

**Remediation:**

- Enforce `objectName` starts with user's prefix
- Reduce presigned URL expiry to 5-15 minutes
- Validate `uploadId` was initiated by the requesting user
- Add rate limiting to presign endpoint

---

### MED-005: MQTT Message Trust — Unvalidated Message Processing

| Field             | Value                                                                                           |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| **Severity**      | Medium                                                                                          |
| **Type**          | Improper Input Validation — CWE-20                                                              |
| **Location**      | `src/hooks/use-mqtt.ts:17-34`, `src/components/providers/mqtt-provider/mqtt-provider.tsx:68-81` |
| **OWASP**         | A03:2021 — Injection                                                                            |
| **Effort to Fix** | Moderate                                                                                        |

**Evidence:**

```ts
const parsedData: { cmd: string; data: T } = JSON.parse(message.toString());
if (parsedData.cmd === cmd) {
  callbackRef.current(parsedData.data);
}
```

**Impact:** MQTT messages parsed as JSON with no schema validation. If broker is compromised, attacker can publish malicious payloads triggering arbitrary callback behavior and UI manipulation.

**Remediation:**

- Validate incoming MQTT messages against Zod schemas before processing
- Sanitize data before logging or displaying in notifications
- Implement message signing/verification

---

### MED-006: Refresh Token Rotation Without Old Token Invalidation

| Field             | Value                                                                           |
| ----------------- | ------------------------------------------------------------------------------- |
| **Severity**      | Medium                                                                          |
| **Type**          | Broken Authentication — CWE-287                                                 |
| **Location**      | `src/app/api/auth/refresh-token/route.ts:26-39`, `src/utils/http.util.ts:45-61` |
| **OWASP**         | A07:2021 — Identification and Authentication Failures                           |
| **Effort to Fix** | Moderate                                                                        |

**Evidence:** New refresh token is set, but old one is not explicitly invalidated server-side. If the auth server doesn't implement token family detection, stolen refresh tokens remain valid after rotation.

**Impact:** A stolen refresh token can be used concurrently with the legitimate user, defeating the purpose of rotation.

**Remediation:** Ensure auth server implements proper refresh token rotation with family detection — revoke entire token family if old token is reused.

---

### MED-007: Excessive Data Exposure in Session Endpoint

| Field             | Value                                    |
| ----------------- | ---------------------------------------- |
| **Severity**      | Medium                                   |
| **Type**          | Excessive Data Exposure — CWE-213        |
| **Location**      | `src/app/api/auth/session/route.ts:7-19` |
| **OWASP**         | A02:2021 — Cryptographic Failures        |
| **Effort to Fix** | Quick                                    |

**Evidence:**

```ts
return NextResponse.json({
  result: true,
  data: { accessToken, userKind } // Full access token in response body
});
```

**Impact:** Access token returned in JSON response body, accessible to any client-side JavaScript including third-party scripts. Provides additional exfiltration vector beyond cookie theft.

**Remediation:** Return only session validity boolean or minimal user metadata. Access token should remain in httpOnly cookies only.

---

### MED-008: Error Response Leakage — Validation Details in Production

| Field             | Value                                     |
| ----------------- | ----------------------------------------- |
| **Severity**      | Medium                                    |
| **Type**          | Information Exposure — CWE-209            |
| **Location**      | Chunk upload init/presign/complete routes |
| **OWASP**         | A05:2021 — Security Misconfiguration      |
| **Effort to Fix** | Quick                                     |

**Evidence:**

```ts
return NextResponse.json(
  {
    error: 'Invalid parameters',
    details: z.treeifyError(parsed.error) // Detailed validation tree exposed
  },
  { status: 400 }
);
```

**Impact:** Attackers can use validation error details to map internal data structures, field names, and validation rules.

**Remediation:** Return generic error messages in production. Log detailed errors server-side only. Conditionally include `details` based on `NODE_ENV`.

---

### MED-009: Client Type Stored in localStorage

| Field             | Value                                                             |
| ----------------- | ----------------------------------------------------------------- |
| **Severity**      | Medium                                                            |
| **Type**          | Insecure Data Storage — CWE-922                                   |
| **Location**      | `src/utils/http.util.ts:162-163`, `src/utils/storage.util.ts:3-6` |
| **OWASP**         | A04:2021 — Insecure Design                                        |
| **Effort to Fix** | Quick                                                             |

**Evidence:**

```ts
clientType =
  getData(storageKeys.X_CLIENT_TYPE) || envConfig.NEXT_PUBLIC_CLIENT_TYPE;
```

`getData()` reads from `localStorage`.

**Impact:** XSS could modify client type to trigger different server-side behavior.

**Remediation:** Use server-configured default as authoritative value. Do not allow client-side override.

---

## Low Findings

All low findings have been resolved. See [Resolved Findings](#resolved-findings) section.

---

## Info Findings

All info findings have been resolved. See [Resolved Findings](#resolved-findings) section.

## OWASP Top 10 Mapping

| OWASP Category                                        | Findings                                                                                                      |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| A01:2021 — Broken Access Control                      | HIGH-001, HIGH-002, MED-003, MED-004, ~~LOW-001~~ ✅, ~~LOW-003~~ ✅                                          |
| A02:2021 — Cryptographic Failures                     | ~~CRIT-001~~ ✅, CRIT-002, HIGH-005, MED-007                                                                  |
| A03:2021 — Injection                                  | MED-002, MED-005, ~~LOW-005~~ ✅                                                                              |
| A04:2021 — Insecure Design                            | HIGH-004, MED-009, ~~LOW-004~~ ✅                                                                             |
| A05:2021 — Security Misconfiguration                  | HIGH-006, MED-001, MED-008, ~~LOW-006~~ ✅, ~~LOW-007~~ ✅, ~~INFO-001~~ ✅, ~~INFO-002~~ ✅, ~~INFO-003~~ ✅ |
| A07:2021 — Identification and Authentication Failures | HIGH-003, MED-006                                                                                             |

## OWASP API Security Top 10 Mapping

| OWASP API Category                                          | Findings                    |
| ----------------------------------------------------------- | --------------------------- |
| API1:2023 — Broken Object Level Authorization               | MED-003, MED-004            |
| API2:2023 — Broken Authentication                           | HIGH-003, HIGH-005, MED-006 |
| API3:2023 — Broken Object Property Level Authorization      | HIGH-002                    |
| API4:2023 — Unrestricted Resource Consumption               | HIGH-003                    |
| API6:2023 — Unrestricted Access to Sensitive Business Flows | HIGH-002                    |
| API8:2023 — Security Misconfiguration                       | MED-001, MED-008, LOW-007   |
| API9:2023 — Improper Inventory Management                   | INFO-002                    |

---

## Remediation Roadmap

### Phase 1: Critical (Immediate — within 24 hours)

- [x] Fix inverted `secure` cookie flag (CRIT-001) ✅
- [ ] Remove MQTT credentials from client bundle (CRIT-002)

### Phase 2: High (Within 1 week)

- [ ] Add CSRF protection to all state-changing endpoints (HIGH-001)
- [ ] Implement server-side permission enforcement (HIGH-002)
  - Note: Auth token checks added to file routes; permission-level checks still needed
- [ ] Add rate limiting to auth endpoints (HIGH-003)
- [ ] Remove access token from Zustand store (HIGH-004)
- [ ] Enable ESLint security rules (HIGH-006)

### Phase 3: Medium (Within 2 weeks)

- [ ] Add Content-Security-Policy header (MED-001)
  - Note: Other security headers already added
- [ ] Sanitize TinyMCE output (MED-002)
- [ ] Add S3 ownership verification (MED-003)
- [ ] Restrict presigned URL permissions (MED-004)
- [ ] Validate MQTT messages (MED-005)
- [ ] Implement refresh token family detection (MED-006)
- [ ] Remove access token from session response (MED-007)
- [ ] Sanitize error responses (MED-008)
  - Note: `z.treeifyError()` details still exposed in chunk upload routes
- [ ] Remove localStorage client type override (MED-009)

### Phase 4: Low/Info (Within 1 month)

- [x] Add `rel="noopener noreferrer"` to external links (LOW-001) ✅
- [x] Reduce presigned URL expiration (LOW-002) ✅
- [x] Validate all redirect targets (LOW-003) ✅
- [x] Refactor token refresh state management (LOW-004) ✅
- [x] Escape regex metacharacters in route matching (LOW-005) ✅
- [x] Remove DELETE-as-POST alias (LOW-006) ✅
- [x] Remove deprecated XSS header (LOW-007) ✅
- [x] Add Permissions-Policy header (INFO-001) ✅
- [x] Update `.gitignore` (INFO-002) ✅
- [x] Pin Docker base image (INFO-003) ✅

### Completed Security Improvements

- [x] Fix inverted `secure` cookie flag (CRIT-001)
- [x] Remove `NEXT_PUBLIC_URL` from config (documentation/code alignment)
- [x] Add auth token checks to all S3 file routes (delete, init, presign, complete, abort)
- [x] Add Zod validation schemas for chunk upload operations
- [x] Implement path traversal prevention in S3 key validation
- [x] Enforce MIME type allowlist for video uploads
- [x] Add security headers (X-Content-Type-Options, X-Frame-Options, HSTS, Referrer-Policy, Permissions-Policy)
- [x] Fix open redirect via `isSafeInternalPath()` validation
- [x] Gate auth queue logging behind dev-only check
- [x] Remove debug console.log from subtitle list
- [x] Remove deprecated `X-XSS-Protection` header (LOW-007)
- [x] Update `.gitignore` for environment files (INFO-002)
- [x] Pin Node.js base image to `20.11-alpine` (INFO-003)
- [x] Add `rel="noopener noreferrer"` to external links (LOW-001)
- [x] Reduce presigned URL expiration to 5 minutes (LOW-002)
- [x] Validate redirect target before `window.location.href` (LOW-003)
- [x] Reorder module state after `isClient` guard (LOW-004)
- [x] Escape regex metacharacters in route matching (LOW-005)
- [x] Remove DELETE-as-POST alias (LOW-006)
