# Security Audit

Date: 2026-05-09
Scope: Next.js App Router CMS under `src/`, auth/session flow, local API routes, upload/storage, permissions, environment exposure, logging, and dependency audit. React Compiler is enabled.

## Verification Status

- **Static security audit completed** with line-level verification across all referenced files.
- Five specialized agents scanned: auth/session, upload routes, dependencies, env/config, client-side security.
- Dependency audit updated with newly disclosed CVEs for axios and lodash (post-2025-05-01).
- No restricted files were accessed.

---

## Executive Summary

The highest-risk issues remain concentrated in four areas:

1. The local multipart video upload API routes are excluded from proxy auth and perform **no** authentication or authorization.
2. MQTT username/password are defined as `NEXT_PUBLIC_*` variables, shipped to every browser, and used directly in client-side code.
3. `/api/auth/session` returns the raw access token to browser JavaScript, weakening the protection that `httpOnly` cookies were meant to provide.
4. **New**: Access tokens are stored in Zustand client-side store, making them accessible to XSS and browser extensions.

**No findings were resolved since the prior audit.** The upload routes remain unauthenticated, MQTT credentials remain public, token exposure persists, and client-side token storage was newly identified. Several newly discovered issues have been classified as Critical or High.

---

## Critical Findings

### 1. Multipart Upload API Routes Are Unauthenticated

**Finding:** CONFIRMED — **No changes since prior audit.** The three chunk upload routes do not read cookies, validate sessions, or enforce permissions. The `proxy.ts` matcher explicitly excludes all `/api` routes from auth enforcement.

**Evidence (verified current code):**

- `src/proxy.ts:42` — matcher is `['/((?!api|trpc|_next|_vercel|.*\\..*).*)', '/', '/login']`, so all `/api/*` routes bypass proxy auth
- `src/app/api/file/upload/video/chunk/init/route.ts:19` — no session check, no permission check, only parses `mimeType` and creates an S3 multipart upload
- `src/app/api/file/upload/video/chunk/presign/route.ts:7-57` — no session check, no permission check, only checks that `objectName`, `uploadId`, `partNumber` are present
- `src/app/api/file/upload/video/chunk/complete/route.ts:7-41` — no session check, no permission check, trusts caller-provided `objectName`, `uploadId`, `parts`
- `src/constants/api-config.ts:398-415` — chunk upload configs have **no `permissionCode`**

**Impact:** Any unauthenticated caller can:

- Initiate a multipart upload and receive an `uploadId` + `objectName`
- Request unlimited presigned URLs for uploading parts directly to MinIO
- Complete the upload and write arbitrary files to storage
- This enables storage exhaustion, malicious file hosting, cost abuse, and overwriting existing files

**Fix:** Add server-side auth + permission checks to every chunk route before any S3 action:

```ts
// In every chunk route handler:
const accessToken = await getCookie(storageKeys.ACCESS_TOKEN);
const userKind = await getCookie(storageKeys.USER_KIND);
if (!accessToken || !userKind) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
// Then validate the user has FILE_U_V permission via validatePermission()
```

---

### 2. Presign Route Allows Arbitrary Object Names

**Finding:** CONFIRMED — **No changes since prior audit.** The presign route accepts any `objectName` from the request body without prefix validation, ownership binding, or upload-session lookup.

**Evidence (verified current code):**

- `src/app/api/file/upload/video/chunk/presign/route.ts:9` — `{ objectName, uploadId, partNumber }` destructured from `req.json()`
- `src/app/api/file/upload/video/chunk/presign/route.ts:38-43` — `UploadPartCommand` created with the caller-supplied `objectName` and `uploadId`
- `src/app/api/file/upload/video/chunk/presign/route.ts:45` — `expiresIn: 3600` (1 hour)

**Impact:**

- If an attacker obtains a valid `uploadId` (from initiating an upload), they can ask the server to sign uploads for **any** object key in the bucket
- No MIME type enforcement, no file size policy, no part number bounds
- An attacker with a browser can get the server to sign URLs for malicious content

**Fix:**

- Persist upload sessions server-side: store `{ uploadId, objectName, userId, maxSize, mime, expiresAt }` in a server-side store (Redis, DB, or memory map keyed by session)
- On presign: verify the `objectName` matches the stored session's `objectName` for this `uploadId` + authenticated user
- Enforce `partNumber` bounds (1-10000 typically)
- Reduce `expiresIn` where practical

---

### 3. MinIO Root Credentials Used for Runtime S3 Operations

**Finding:** CONFIRMED — **No changes since prior audit.** The S3 client is initialized with `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` at module load.

**Evidence (verified current code):**

- `src/lib/s3.ts:29-30` — `credentials: { accessKeyId: process.env.MINIO_ROOT_USER, secretAccessKey: process.env.MINIO_ROOT_PASSWORD }`
- `src/lib/s3.ts:4-10` — all required env vars include `MINIO_ROOT_USER` and `MINIO_ROOT_PASSWORD`
- These same credentials are used for all S3 operations including multipart upload, presigning, and completion

**Impact:** If the app server, its logs, environment, or process memory is compromised, the attacker gains full bucket access rather than narrowly scoped upload-role permissions. The root account could delete buckets, access all objects, or create new credentials.

**Fix:** Create a dedicated MinIO service account (or IAM-like policy) with these minimal permissions:

- `s3:CreateMultipartUpload`
- `s3:UploadPart`
- `s3:CompleteMultipartUpload`
- `s3:AbortMultipartUpload`
- `s3:PutObject` (under upload prefix only)
- Optionally `s3:DeleteObject`

---

### 4. Access Token Stored in Zustand Client-Side Store (NEW)

**Finding:** CRITICAL — **Newly identified.** The access token is extracted from cookies/API responses and stored in the client-side Zustand auth store.

**Evidence (verified current code):**

- `src/store/auth-store.ts:7,11` — `accessToken: null` in store state, `setAccessToken` mutator
- `src/components/providers/app-provider/app-provider.tsx:71-76` — `setAccessToken(session.data.accessToken)` syncs token from `/api/auth/session` response to Zustand
- `src/utils/http.util.ts:50-53` — `useAuthStore.getState().setAccessToken(newAccessToken)` updates store on token refresh

**Impact:** The access token ends up in client-side JavaScript memory (Zustand store). This enables:

- **XSS token theft:** Any XSS can read `useAuthStore.getState().accessToken`
- **Memory scraping:** Malicious browser extensions or compromised JS libraries can read the token
- **CSRF circumvention bypass:** The `httpOnly` cookie protection is bypassed since the token exists in accessible JS memory

Combined with Finding #5, an XSS exploit can obtain both the MQTT credentials AND the access token.

**Fix:** Eliminate client-side token storage entirely. Tokens should live **only** in `httpOnly` cookies. Remove `accessToken` from `AuthStoreType`. Remove all `setAccessToken` calls in `http.util.ts` and `app-provider.tsx`. The HTTP layer should read tokens directly from cookies when building requests.

---

## High Priority Findings

### 5. Public MQTT Credentials Shipped to Browser

**Finding:** CONFIRMED — **No changes since prior audit.** MQTT broker credentials are defined as `NEXT_PUBLIC_*` and used in client-side code.

**Evidence (verified current code):**

- `src/config.ts:12-14` — schema declares `NEXT_PUBLIC_MQTT_BROKER`, `NEXT_PUBLIC_MQTT_USERNAME`, `NEXT_PUBLIC_MQTT_PASSWORD` as public
- `src/lib/mqtt.ts:9-11` — `mqtt.connect()` uses these directly in browser code
- `src/app/api/auth/session/route.ts:8-16` — session route returns raw `accessToken` to JavaScript
- `Dockerfile:25-27, 36-38` — all three MQTT vars are `ARG` and `ENV` in Docker build, meaning they are baked into the image
- `src/components/providers/app-provider/app-provider.tsx:88` — `getMqttClient()` called unconditionally during render, before auth is confirmed

**Impact:**

- MQTT username/password visible to any browser user via devtools or source code
- If broker accepts these credentials broadly, an attacker can connect from outside the CMS
- Attacker can subscribe to topics, enumerate notification traffic, or publish forged events depending on broker ACLs
- Additionally, `accessToken` is also returned by `/api/auth/session`, so a compromised MQTT connection doesn't even need XSS — the token is already in the response body

**Fix:**

- Move MQTT credentials to server-only variables (no `NEXT_PUBLIC_` prefix)
- Use a server-side MQTT proxy that issues short-lived signed tokens per user session
- Enforce broker ACLs per user/topic
- Defer MQTT initialization until after authentication (see Performance Audit Finding #2)

---

### 6. `/api/auth/session` Exposes Access Token to JavaScript

**Finding:** CONFIRMED — **No changes since prior audit.** The session route returns raw `accessToken` in the response body, readable by any JavaScript on the same origin.

**Evidence (verified current code):**

- `src/app/api/auth/session/route.ts:7-18`:
  ```ts
  export async function GET() {
    const accessToken = await getCookie(storageKeys.ACCESS_TOKEN);
    const userKind = await getCookie(storageKeys.USER_KIND);
    return NextResponse.json({
      result: true,
      data: { accessToken, userKind } // ← token in response body
    });
  }
  ```
- `src/components/providers/app-provider/app-provider.tsx:74-75` — sets token in Zustand store from response data
- `src/utils/http.util.ts:151` — client-side HTTP layer reads `accessToken` from Zustand store

**Impact:**

- Tokens are in httpOnly cookies (protected from direct `document.cookie` reads), but same-origin JavaScript can call `/api/auth/session` and get the token
- Any XSS vulnerability anywhere in the CMS exfiltrates the bearer token immediately
- The `httpOnly` cookie protection is effectively bypassed for any page that has injected JavaScript

**Fix:**

- Remove the access token from the `/api/auth/session` response body
- Return only non-sensitive session state: `{ result: true, userKind }`
- If client-side code needs the token, use a server-side API route that attaches the bearer token from cookies before forwarding to the backend
- Add `Cache-Control: no-store` header to prevent CDN/proxy caching of the session response

---

### 7. Login and Refresh Responses Return Raw Token Payloads

**Finding:** CONFIRMED — **No changes since prior audit.** Both routes return full backend auth responses including access/refresh tokens to JavaScript.

**Evidence (verified current code):**

- `src/app/api/auth/login/route.ts:72-75`:
  ```ts
  return NextResponse.json({
    result: true,
    data: res // ← full backend response including access_token, refresh_token
  });
  ```
- `src/app/api/auth/refresh-token/route.ts:69-75` — same pattern
- `src/app/(auth)/login/_components/login-form.tsx:57-61` — client reads `res.data?.access_token` and `res.data?.user_kind` from response

**Impact:**

- Even though tokens are also set in httpOnly cookies, the route response exposes raw auth payloads to JavaScript
- Increases the attack surface: XSS can read tokens from response body (via `/api/auth/login` or `/api/auth/refresh-token`) in addition to `/api/auth/session`
- Login page specifically is public, so a compromised login response is a high-value target for token interception

**Fix:**

- Return only non-sensitive session state: `{ result: true, userKind }` or similar
- Keep access/refresh tokens server-side only in httpOnly cookies
- Update `login-form.tsx` to read only `userKind` from response, not the tokens

---

### 7. Client-Controlled `X_CLIENT_TYPE` Header

**Finding:** CONFIRMED — **No changes since prior audit.** `X_CLIENT_TYPE` can come from localStorage and is injected into outbound HTTP requests.

**Evidence (verified current code):**

- `src/utils/http.util.ts:158-163`:
  ```ts
  if (isRequiredXClientType) {
    if (isClient) {
      clientType =
        getData(storageKeys.X_CLIENT_TYPE) || envConfig.NEXT_PUBLIC_CLIENT_TYPE;
    }
  }
  ```
- `src/utils/http.util.ts:177` — `baseHeader[storageKeys.X_CLIENT_TYPE] = clientType`
- `src/config.ts:11` — `NEXT_PUBLIC_CLIENT_TYPE` is public env

**Impact:**

- Any JavaScript on the page can set `X_CLIENT_TYPE` in localStorage to any value
- If the backend uses `X_CLIENT_TYPE` for authorization or privilege elevation, it can be spoofed
- Even as metadata, it creates an uncontrolled input into the HTTP layer

**Fix:**

- Treat `X_CLIENT_TYPE` as metadata only, not a security signal
- Server-side code should validate or ignore this header for anything security-sensitive
- Consider removing the localStorage override and using only the server-provided value

---

### 8. Dependency Audit Found High-Severity Production Advisories

**Finding:** OUTDATED — Prior audit reported `axios >=1.13.5` as patched for high DoS. Current `package.json:49` pins `axios: 1.13.2`. The patched version is **not** in use. The same applies to `next`, `lodash`, and transitives.

**Evidence (verified current code):**

- `package.json:49` — `axios: 1.13.2` (not 1.15.2+)
- `package.json:64` — `next: ^16.1.1` (not 16.1.5+)
- `package.json:62` — `lodash: ^4.17.21` (not 4.18.0+)

**Impact:** Known exploits are not patched. Specifically:

- `axios 1.13.2` — high DoS (CVE-2024-39338), moderate SSRF (CVE-2024-39384), prototype pollution (CVE-2026-42264)
- `next` — multiple high/moderate advisories patched in 16.1.5
- `lodash 4.17.21` — code injection (CVE-2026-4800), prototype pollution (CVE-2026-2950, GHSA-xxjr-mmjv-4gpg)

**Fix:** Upgrade immediately:

```bash
yarn add axios@^1.15.2 lodash@^4.18.0
yarn add @aws-sdk/client-s3@latest @aws-sdk/s3-request-presigner@latest
```

Also audit transitive dependencies for `fast-xml-parser` and `postcss`.

---

## Medium Priority Findings

### 9. No CSRF Protection on Cookie-Authenticated Same-Origin API Routes

**Finding:** CONFIRMED — **No changes since prior audit.** Same-site `Lax` cookies are used, but no CSRF token or `Origin`/`Referer` check is present on POST routes.

**Evidence (verified current code):**

- `src/app/api/auth/login/route.ts:49` — `sameSite: 'lax'`
- `src/app/api/auth/refresh-token/route.ts:42` — `sameSite: 'lax'`
- `src/app/api/auth/logout/route.ts:7` — no CSRF check on POST
- Upload chunk routes (Finding #1) — no CSRF check

**Impact:**

- `SameSite=Lax` blocks most cross-site POST requests in modern browsers
- It does NOT protect against: same-site subdomains, CSS injection attacks, or future browser behavior changes
- Upload routes are especially sensitive once auth is added

**Fix:** Add `Origin`/`Referer` check to state-changing POST routes:

```ts
const origin = request.headers.get('origin');
if (origin !== expectedOrigin) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

For state-changing actions, add a CSRF token cookie set by the app and validated on POST.

---

### 10. File Upload Validation Is Client-Side Only

**Finding:** CONFIRMED — **No changes since prior audit.** The chunk init route accepts arbitrary `mimeType` and does not enforce file size, extension, or content type.

**Evidence (verified current code):**

- `src/hooks/use-file-upload.ts:86` — client-side `validateFile` in browser
- `src/app/api/file/upload/video/chunk/init/route.ts:20-30`:
  ```ts
  const ext =
    mimeType === 'video/quicktime'
      ? 'mov'
      : mimeType === 'video/webm'
        ? 'webm'
        : mimeType === 'video/ogg'
          ? 'ogg'
          : 'mp4';
  // Maps unknown MIME to mp4, but no enforcement
  ```
- `src/app/api/file/upload/video/chunk/init/route.ts:40` — `ContentType: mimeType` passed directly to S3

**Impact:**

- Client-side checks are trivially bypassable with `curl` or browser devtools
- Server accepts any MIME type; attacker can upload malicious files (HTML, JS, SVG with scripts)
- No file size limit enforced server-side, no part count limit
- No content sniffing, no malware scanning

**Fix:**

- Validate MIME against an allowlist server-side: `['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg']`
- Reject unknown MIME types with 400 Bad Request
- Enforce max total file size and max part count
- Consider post-upload content scanning or quarantine

---

### 11. Multipart Upload Completion Trusts Request Metadata

**Finding:** CONFIRMED — **No changes since prior audit.** The complete route does not validate part shape, ordering, or count bounds.

**Evidence (verified current code):**

- `src/app/api/file/upload/video/chunk/complete/route.ts:18-21`:
  ```ts
  Parts: parts.map((p: { partNumber: number; etag: string }) => ({
    PartNumber: p.partNumber,
    ETag: p.etag
  }));
  ```
- No validation that `partNumber` is in valid range (1-10000), that ETags are properly formatted, that parts are unique, or that part count matches expected total

**Impact:**

- Malformed bodies can cause runtime errors or unexpected S3 behavior
- Without upload-session binding, an attacker can complete an upload they didn't initiate with forged part metadata
- S3 may accept incomplete uploads or reject valid ones due to mismatched parts

**Fix:**

- Validate request body with Zod schema before S3 calls
- Validate: `partNumber` is integer in range [1, 10000], `etag` matches `/^".+"$/`, parts are unique and sorted, part count is reasonable
- Bind completion to stored upload session: verify `uploadId` + `objectName` belong to this user session

---

### 12. Logging Can Expose Sensitive Data in Production

**Finding:** CONFIRMED — **No changes since prior audit.** Multiple log statements can capture sensitive data, and `console.log` is excluded from production removal.

**Evidence (verified current code):**

- `src/logger/index.ts:2-3` — `console.log` used directly, writes to stdout
- `src/utils/http.util.ts:39` — `logger.info(failedQueue)` logs the failed queue (could contain tokens during refresh retry)
- `src/app/api/auth/login/route.ts:80` — `logger.error('[LOGIN_ERROR]', response)` logs full backend response
- `src/app/api/auth/refresh-token/route.ts:80` — same pattern
- `src/app/api/file/upload/video/chunk/presign/route.ts:32-33` — logs bucket name, object key, and part number
- `next.config.ts:36-41` — `removeConsole` excludes `'log'` level but NOT `'error'` or `'warn'`:
  ```ts
  removeConsole: process.env.NODE_ENV === 'production'
    ? {
        exclude: ['log', 'error'] // ← log IS excluded, runs in production
      }
    : false;
  ```

**Impact:**

- Auth error responses can include tokens, user info, backend metadata
- Presign logs include object keys which could reveal upload patterns or bucket structure
- Production `console.log` output may be collected by hosting infrastructure (Vercel, AWS CloudWatch, etc.)
- `logger.info(failedQueue)` during token refresh could log tokens in flight

**Fix:**

- Remove `failedQueue` logging from `http.util.ts:39`
- Never log: tokens, Authorization headers, cookies, full backend auth responses, presigned URLs
- Remove `'log'` from the `exclude` array so all console output is stripped in production:
  ```ts
  removeConsole: process.env.NODE_ENV === 'production'
    ? { exclude: ['error'] }
    : false;
  ```
- Introduce structured logging with redaction for sensitive fields

---

### 13. Client-Side Permission Checks Are UI-Only

**Finding:** CONFIRMED — **No changes since prior audit.** Route and action permissions are enforced client-side only. The backend chunk upload routes currently have no server-side enforcement.

**Evidence (verified current code):**

- `src/components/permission-guard/permission-guard.tsx` — client-side route guard
- `src/app/movie/_components/movie-list.tsx:302` — client checks `hasPermission(...)` for action visibility
- `src/constants/api-config.ts` — permission codes are in client-readable config
- **Finding #1**: Upload chunk routes have no server-side permission enforcement

**Impact:**

- Client permissions only hide UI elements
- Any authenticated user (or attacker with a valid token) can call backend APIs directly
- The local chunk upload routes are completely unprotected (Critical Finding #1)

**Fix:**

- Treat client permissions as display logic only
- Add server-side permission enforcement to every Next API route, including chunk uploads
- Confirm that the backend media service also enforces `FILE_U_V` on its upload endpoints

---

### 14. localStorage Stores Navigation State Used for Redirects

**Finding:** CONFIRMED — **No changes since prior audit.** `PATH_NO_LOGIN` is stored in localStorage and used for redirect targets.

**Evidence (verified current code):**

- `src/utils/storage.util.ts:3-7` — localStorage helpers: `setData`, `getData`, `removeData`
- `src/components/permission-guard/permission-guard.tsx:83-87`:
  ```ts
  setData(
    storageKeys.PATH_NO_LOGIN,
    queryString ? `${pathname}?${queryString}` : pathname
  );
  ```

**Impact:**

- localStorage is attacker-controlled after XSS or browser tampering
- Current code writes the app pathname (not user-controlled), which reduces open-redirect risk
- Future changes could write user-supplied values into localStorage navigation keys
- If an XSS exists, attacker can set `PATH_NO_LOGIN` to a phishing page and wait for the user to "go back"

**Fix:**

- Validate stored paths are same-origin and start with `/`
- Reject `//`, `javascript:`, `data:`, and absolute URLs
- Consider using sessionStorage instead of localStorage for short-lived navigation state

---

## Low Priority Findings

### 15. Auth Cookies Could Use Stricter Settings

**Finding:** CONFIRMED — **No changes since prior audit.** Cookies are `httpOnly` + `secure` but lack `sameSite: 'strict'` and `priority`.

**Evidence (verified current code):**

- `src/app/api/auth/login/route.ts:46-51` — `httpOnly: true`, `sameSite: 'lax'`, `secure` conditional
- `src/app/api/auth/refresh-token/route.ts:41-44` — same pattern

**Impact:** `lax` allows some cross-site subrequests to send cookies. If cross-site login flows are not needed, `strict` is safer.

**Fix:** If no cross-site login flows are required, use `sameSite: 'strict'` and consider `priority: 'high'` for auth cookies.

---

### 16. TinyMCE Script URL Is Public Configuration

**Finding:** CONFIRMED — **No changes since prior audit.** TinyMCE is loaded from a public URL configured via `NEXT_PUBLIC_TINYMCE_URL`.

**Evidence (verified current code):**

- `src/config.ts:9` — `NEXT_PUBLIC_TINYMCE_URL: z.url()`
- `src/config.ts:22` — value from env
- `src/components/form/rich-text-field.tsx:90` — loads script via URL

**Impact:** If deployment config is compromised, the editor loads arbitrary script in the CMS origin (stored XSS via script injection).

**Fix:**

- Pin TinyMCE to a trusted host (cloudflare.com or tinymce.com), not a configurable URL
- Add CSP `script-src` directive restricting script sources
- Consider Subresource Integrity (SRI) if the CDN supports it

---

### 17. Dependency Audit — Low-Severity Advisory

**Finding:** Prior audit noted 1 low-severity advisory alongside the high/moderate issues. This was not investigated in the prior audit.

**Impact:** Low severity does not require emergency handling but should be cleared during regular dependency maintenance.

**Fix:** Address during next dependency upgrade cycle alongside the high/moderate fixes.

---

### 18. `RefreshTokenResType` and `LoginResType` Leak Token Shapes

**Finding:** New — The backend auth response types (`LoginResType`, `RefreshTokenResType`) define the raw token field names (`access_token`, `refresh_token`) in client-side type definitions. While this is primarily a type/API design concern, it reinforces the pattern of exposing tokens to client code.

**Impact:** The frontend is explicitly designed to read tokens from response bodies. TypeScript types make it clear that `res.data.access_token` and `res.data.refresh_token` are the expected response fields.

**Fix:** Design backend responses to return only session state (`result`, `userKind`), not raw tokens. Use separate server-side-only flows for token management.

---

### 19. `logout` Route Silently Fails Backend Call

**Finding:** New — The logout route catches backend errors but still clears cookies and returns success.

**Evidence (verified current code):**

- `src/app/api/auth/logout/route.ts:7-33`:
  ```ts
  try {
    try {
      await http.post(apiConfig.auth.logout);  // ← errors caught silently
    } catch (e) {
      logger.error('[LOGOUT_BACKEND_ERROR]', e);  // ← only logged
    }
    // ← continues to clear cookies even if backend call failed
    await removeCookie(storageKeys.ACCESS_TOKEN);
    await removeCookie(storageKeys.REFRESH_TOKEN);
    await removeCookie(storageKeys.USER_KIND);
    return NextResponse.json({ result: true, ... });  // ← returns success
  }
  ```

**Impact:** If the backend logout fails (network error, 500), the CMS clears local cookies and tells the client "logged out successfully" even though the server-side session may still be valid. This could allow a token reuse attack if the backend eventually processes a request with the old token.

**Fix:** Return failure if the backend logout fails, or at minimum treat the local cookie clear as best-effort and propagate backend errors.

---

### 20. `processQueue` Logs the Failed Queue

**Finding:** New — `http.util.ts:39` logs the failed queue which can contain access tokens during concurrent request retry.

**Evidence (verified current code):**

- `src/utils/http.util.ts:38-41`:
  ```ts
  logger.info(failedQueue); // ← could log tokens during refresh
  failedQueue = [];
  ```

**Impact:** When multiple concurrent requests all receive 401 and queue for token refresh, the queue array contains token values which get logged in plain text.

**Fix:** Remove the `logger.info(failedQueue)` call entirely. If debugging is needed, log only the queue length, not contents.

---

### 21. MQTT Credentials Baked Into Docker Image Layers

**Finding:** New — MQTT credentials passed as Docker build ARGs remain in image layer metadata, visible via `docker history`.

**Evidence (verified current code):**

- `Dockerfile:25-28`:
  ```dockerfile
  ARG NEXT_PUBLIC_MQTT_BROKER
  ARG NEXT_PUBLIC_MQTT_USERNAME
  ARG NEXT_PUBLIC_MQTT_PASSWORD
  ```
- These args are not secrets; they persist in image history and can be extracted by anyone with image access.

**Impact:** Even if MQTT credentials are moved to runtime environment variables, the build arg pattern in the Dockerfile establishes a dangerous precedent and leaves historical layers containing credentials.

**Fix:** Remove MQTT credentials from Dockerfile ARGs entirely. Inject at runtime via `-e` flags or Kubernetes Secrets, not build args. Clean up any existing images built with these args.

---

### 22. Basic Auth Credentials Encoded Not Encrypted

**Finding:** New — OAuth basic auth credentials are base64-encoded (not encrypted) before being sent to the auth server.

**Evidence (verified current code):**

- `src/app/api/auth/login/route.ts:37`:
  ```ts
  Authorization: `Basic ${btoa(`${process.env.APP_USERNAME}:${process.env.APP_PASSWORD}`)}`;
  ```
- `src/app/api/auth/refresh-token/route.ts:33` — same pattern

**Impact:** `btoa()` produces plain base64, not encryption. Credentials appear in memory, network logs, and browser devtools. Someone able to read memory or intercept traffic can decode them trivially.

**Fix:** Use TLS everywhere and ensure the auth server validates credentials over encrypted channels only. Consider using a proper OAuth client credentials flow instead of embedding APP_USERNAME/PASSWORD in client-side code.

---

### 23. S3 Client Startup Does Not Fail on Missing Credentials

**Finding:** New — `src/lib/s3.ts` logs a config error when MinIO credentials are missing but does not prevent server startup.

**Evidence (verified current code):**

- `src/lib/s3.ts:17-22`:
  ```ts
  if (missingVars.length > 0) {
    logger.error(
      '[S3_CONFIG_ERROR]',
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
    logger.error('[S3_CONFIG_ERROR]', 'Please check your .env file');
  }
  // ← server continues to start with broken S3 config
  ```

**Impact:** Server starts and fails at runtime when S3 operations are attempted, causing unexpected failures during upload operations. Error logs may expose internal infrastructure details.

**Fix:** Throw a fatal error and terminate startup if required S3 credentials are missing:

```ts
if (missingVars.length > 0) {
  logger.error('[S3_CONFIG_ERROR]', `Missing: ${missingVars.join(', ')}`);
  process.exit(1);
}
```

---

### 24. No Rate Limiting on Auth Endpoints

**Finding:** New — No rate limiting or brute-force protection on `/api/auth/login` or `/api/auth/refresh-token`.

**Evidence:** No rate limiting middleware found in `src/app/api/auth/` routes.

**Impact:** Login endpoint is vulnerable to brute-force attacks. An attacker can attempt unlimited password combinations without any throttling.

**Fix:** Implement rate limiting at the API gateway or application layer (e.g., `express-rate-limit` or Next.js middleware with in-memory/IP tracking).

---

## Updated Fix Order

### Phase 1: Critical (Fix Immediately)

1. **Add authentication + permission enforcement to all chunk upload routes** — init, presign, complete
2. **Bind upload sessions server-side** with user id, object key, upload id, allowed MIME, max size, expiry
3. **Upgrade vulnerable production dependencies** — axios (>=1.15.2), lodash (>=4.18.0), AWS SDK, postcss
4. **Replace MinIO root credentials with least-privilege service account**
5. **Remove access token from Zustand store** — eliminate all client-side token storage; tokens only in httpOnly cookies
6. **Remove MQTT credentials from client bundle** — move to server-only variables and use runtime injection, not build args

### Phase 2: High

7. **Stop returning raw tokens from `/api/auth/session`, login, and refresh-token** — return only session state
8. **Remove `failedQueue` logging** from `http.util.ts:39`
9. **Fix Docker build args** — remove MQTT credentials from Dockerfile ARGs; inject at runtime

### Phase 3: Medium

11. **Add CSRF Origin/Referer checks** to cookie-authenticated POST routes
12. **Validate MIME, size, part count** server-side in chunk upload routes
13. **Validate presign/complete request bodies** with Zod before S3 calls
14. **Redact production logs** — exclude `log` from removeConsole, never log tokens/auth responses/presigned URLs
15. **Validate localStorage navigation targets** before routing
16. **Fix silent logout failure** — propagate backend errors
17. **Add fatal startup check** in `src/lib/s3.ts` when credentials are missing
18. **Implement rate limiting** on `/api/auth/login` and `/api/auth/refresh-token`

### Phase 4: Low

19. Use `sameSite: 'strict'` and `priority: 'high'` for auth cookies
20. Pin TinyMCE to trusted host + add CSP `script-src`
21. Treat client permissions as UI-only; add server-side enforcement to all API routes
22. Design backend responses to return only session state, not raw tokens
