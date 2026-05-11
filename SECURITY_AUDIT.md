# 🔐 MovieHub CMS — Security Audit Report

**Date:** 2026-05-09  
**Scope:** Full static analysis of `src/` — API routes, HTTP layer, auth flow, file upload, session, storage, config  
**Framework:** Next.js 16 (App Router) · TypeScript · Zod · Axios · MQTT · MinIO/S3

---

## Summary

| ID      | Severity      | Title                                                                                |
| ------- | ------------- | ------------------------------------------------------------------------------------ |
| SEC-001 | 🔴 **High**   | MQTT credentials exposed in client bundle (`NEXT_PUBLIC_*`)                          |
| SEC-002 | 🔴 **High**   | File upload API routes have no authentication check                                  |
| SEC-003 | 🟠 **Medium** | HTTP request timeout disabled — DoS / resource exhaustion risk                       |
| SEC-004 | 🟠 **Medium** | `secure` cookie flag disabled in non-production (`access_token`, `refresh_token`)    |
| SEC-005 | 🟠 **Medium** | Backend error response proxied verbatim to browser — information leakage             |
| SEC-006 | 🟠 **Medium** | Open redirect via unvalidated `PATH_NO_LOGIN` in localStorage                        |
| SEC-007 | 🟡 **Low**    | No HTTP security headers (CSP, HSTS, X-Frame-Options, etc.) in `next.config.ts`      |
| SEC-008 | 🟡 **Low**    | `NEXT_PUBLIC_URL` still validated in `config.ts` despite being documented as removed |
| SEC-009 | 🟡 **Low**    | `logger.info(failedQueue)` may log pending auth requests in development              |

---

## Findings

---

### SEC-001 — MQTT Credentials Exposed in Client Bundle

**Severity:** 🔴 High  
**CWE:** CWE-312 (Cleartext Storage of Sensitive Information)  
**OWASP:** A02:2021 – Cryptographic Failures

**Location:** `src/config.ts:13-14`, `src/lib/mqtt.ts:10-11`

**Evidence:**

```ts
// src/config.ts
NEXT_PUBLIC_MQTT_USERNAME: z.string(),
NEXT_PUBLIC_MQTT_PASSWORD: z.string(),

// src/lib/mqtt.ts
username: envConfig.NEXT_PUBLIC_MQTT_USERNAME as string,
password: envConfig.NEXT_PUBLIC_MQTT_PASSWORD as string,
```

**Impact:**  
`NEXT_PUBLIC_*` variables are inlined into the JavaScript bundle at build time and are visible to any user who opens DevTools or downloads the app bundle. An attacker can extract the MQTT username/password and connect to the broker, subscribe to all topics, or publish rogue messages to every connected CMS user.

**Remediation:**  
Move MQTT connection to a server-side only proxy (Next.js API Route or Server Action). The browser should receive a scoped, short-lived token or connect through a WebSocket proxy that holds the real credentials server-side.

```ts
// Option: issue a short-lived MQTT token per authenticated session from /api/mqtt/token
// Browser connects using that token, not the root password.
```

**Effort to Fix:** Moderate

---

### SEC-002 — File Upload API Routes Have No Authentication

**Severity:** 🔴 High  
**CWE:** CWE-306 (Missing Authentication for Critical Function)  
**OWASP:** A01:2021 – Broken Access Control

**Location:**

- `src/app/api/file/upload/video/chunk/init/route.ts:19`
- `src/app/api/file/upload/video/chunk/presign/route.ts:8`
- `src/app/api/file/upload/video/chunk/complete/route.ts:7`

**Evidence:**

```ts
// All three handlers begin with just:
export async function POST(req: NextRequest) {
  const { mimeType } = await req.json();   // no token check
  // ... directly creates S3 multipart upload
```

**Impact:**  
Any unauthenticated caller can:

1. `/api/file/upload/video/chunk/init` — initiate arbitrary multipart uploads to your MinIO bucket
2. `/api/file/upload/video/chunk/presign` — obtain presigned S3 URLs (1-hour TTL) for any key they name
3. `/api/file/upload/video/chunk/complete` — finalise uploads, writing arbitrary data to the bucket

This constitutes **unrestricted file upload to cloud storage** and can be used to store malware, exhaust storage quota, or bypass content policies.

**Remediation:**

```ts
// Add at the top of each route handler:
import { getCookie } from '@/utils';
import { storageKeys } from '@/constants';
import { HttpStatusCode } from 'axios';

export async function POST(req: NextRequest) {
  const token = await getCookie(storageKeys.ACCESS_TOKEN);
  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: HttpStatusCode.Unauthorized }
    );
  }
  // ... existing logic
}
```

Also add MIME-type allowlist validation in the `init` route — currently any `mimeType` value is accepted and forwarded directly to `ContentType`.

**Effort to Fix:** Quick

---

### SEC-003 — HTTP Request Timeout Disabled

**Severity:** 🟠 Medium  
**CWE:** CWE-400 (Uncontrolled Resource Consumption)  
**OWASP:** A05:2021 – Security Misconfiguration

**Location:** `src/utils/http.util.ts:19,190`

**Evidence:**

```ts
// const TIME_OUT = 10000;   ← commented out
// timeout: TIME_OUT,         ← commented out
```

**Impact:**  
Without a timeout, any hanging upstream API call (network blip, backend hang) holds the Axios connection open indefinitely. In the `refreshToken` flow specifically, a hung call blocks the entire `failedQueue` — all concurrent requests that queued behind the refresh will never resolve, effectively locking out the user permanently until they hard-refresh. Under adversarial or degraded-network conditions this can become a denial-of-service.

**Remediation:**

```ts
const TIME_OUT = 10_000; // 10 s

const axiosConfig: AxiosRequestConfig = {
  url: baseUrl,
  method,
  headers: baseHeader,
  params,
  timeout: TIME_OUT,
  ...options
};
```

**Effort to Fix:** Quick

---

### SEC-004 — `secure` Cookie Flag Disabled Outside Production

**Severity:** 🟠 Medium  
**CWE:** CWE-614 (Sensitive Cookie Without 'Secure' Attribute)  
**OWASP:** A02:2021 – Cryptographic Failures

**Location:** `src/app/api/auth/login/route.ts:50`, `src/app/api/auth/refresh-token/route.ts:43`

**Evidence:**

```ts
secure: envConfig.NEXT_PUBLIC_NODE_ENV === 'production',
```

**Impact:**  
In development and staging environments (`NEXT_PUBLIC_NODE_ENV !== 'production'`) the `access_token` and `refresh_token` cookies are transmitted over plain HTTP. If the staging/UAT environment is accessible over the internet, tokens can be intercepted in transit (network sniffing, ISP logging, MITM proxy).

**Remediation:**  
Keep `secure: true` for any environment exposed to a non-loopback network. Provide an opt-in escape for local development only:

```ts
// Allow override via a separate flag; default to secure everywhere
secure:
  envConfig.NEXT_PUBLIC_NODE_ENV === 'production' ||
  process.env.FORCE_SECURE_COOKIES === 'true',
```

Add `FORCE_SECURE_COOKIES=true` to staging `.env`.

**Effort to Fix:** Quick

---

### SEC-005 — Backend Error Response Proxied Verbatim to Browser

**Severity:** 🟠 Medium  
**CWE:** CWE-209 (Information Exposure Through an Error Message)  
**OWASP:** A09:2021 – Security Logging and Monitoring Failures

**Location:** `src/app/api/auth/login/route.ts:83-89`, `src/app/api/auth/refresh-token/route.ts:83-89`

**Evidence:**

```ts
return NextResponse.json(
  {
    result: false,
    ...response // ← entire upstream payload forwarded to browser
  },
  { status: error.response?.status }
);
```

**Impact:**  
If the upstream OAuth server returns stack traces, internal service names, database identifiers, or field-level validation details, all of that is forwarded to the browser verbatim. This leaks internal topology, field names, or implementation details that are useful for targeted attacks.

**Remediation:**

```ts
// Whitelist only the fields you intend to expose:
return NextResponse.json(
  {
    result: false,
    message: response?.message ?? 'Authentication failed',
    code: response?.code
  },
  { status: error.response?.status }
);
```

**Effort to Fix:** Quick

---

### SEC-006 — Open Redirect via Unvalidated `PATH_NO_LOGIN`

**Severity:** 🟠 Medium  
**CWE:** CWE-601 (URL Redirection to Untrusted Site)  
**OWASP:** A03:2021 – Injection

**Location:** `src/components/permission-guard/permission-guard.tsx:93-97`

**Evidence:**

```ts
const pathNoLogin = getData(storageKeys.PATH_NO_LOGIN); // reads from localStorage
let targetPath =
  (pathNoLogin && pathNoLogin !== route.home.path
    ? pathNoLogin // ← used directly as redirect target without validation
    : firstActiveRoute) || route.profile.savePage.path;

navigate.replace(targetPath);
```

**Impact:**  
`PATH_NO_LOGIN` is written to `localStorage` from the URL `pathname` before login. If an attacker can write to localStorage (via a companion XSS gadget or browser devtools on a shared machine) they can redirect the user to an external phishing site immediately after login.

**Remediation:**

```ts
const pathNoLogin = getData(storageKeys.PATH_NO_LOGIN);

// Only redirect to same-origin internal paths
const isSafeInternal = (path: string) =>
  typeof path === 'string' && path.startsWith('/') && !path.startsWith('//');

let targetPath =
  (pathNoLogin && isSafeInternal(pathNoLogin) && pathNoLogin !== route.home.path
    ? pathNoLogin
    : firstActiveRoute) || route.profile.savePage.path;
```

**Effort to Fix:** Quick

---

### SEC-007 — No HTTP Security Headers Configured

**Severity:** 🟡 Low  
**CWE:** CWE-693 (Protection Mechanism Failure)  
**OWASP:** A05:2021 – Security Misconfiguration

**Location:** `next.config.ts` (no `headers()` export present)

**Impact:**  
Without security headers the application lacks defence against:

- **Clickjacking** — no `X-Frame-Options` / `frame-ancestors` CSP directive
- **MIME sniffing** — no `X-Content-Type-Options: nosniff`
- **Protocol downgrade** — no `Strict-Transport-Security`
- **Content injection** — no `Content-Security-Policy`
- **Referrer leakage** — no `Referrer-Policy`

**Remediation:**

```ts
// next.config.ts
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  }
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  }
  // ... rest of existing config
};
```

**Effort to Fix:** Quick

---

### SEC-008 — `NEXT_PUBLIC_URL` Still Active Despite Being Documented as Removed

**Severity:** 🟡 Low  
**CWE:** CWE-561 (Dead Code) / Configuration Drift

**Location:** `src/config.ts:15,29`, ~40 page files using `envConfig.NEXT_PUBLIC_URL`

**Evidence:**

```ts
// src/config.ts — still present and validated
NEXT_PUBLIC_URL: z.url();
NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL;
```

AGENTS.md states `NEXT_PUBLIC_URL` _"has been removed from `src/config.ts`"_, yet the variable is actively validated in `config.ts` and used in 40+ page files for `metadataBase`.

**Impact:**  
The documentation/code mismatch means developers following AGENTS.md may omit `NEXT_PUBLIC_URL` from `.env`, causing a startup crash. It also adds confusion about the actual required env vars for new deployments and CI pipelines.

**Remediation:**  
Option A — Update AGENTS.md/GEMINI.md to list `NEXT_PUBLIC_URL` as an active, required env var.  
Option B — Remove all `metadataBase: new URL(envConfig.NEXT_PUBLIC_URL)` usages (replace with `NEXT_PUBLIC_AUTH_API_URL` or a new properly named variable) and delete it from `config.ts`.

**Effort to Fix:** Moderate (Option B requires updating ~40 files)

---

### SEC-009 — Auth Retry Queue Logged to Console

**Severity:** 🟡 Low  
**CWE:** CWE-532 (Information Exposure Through Log Files)

**Location:** `src/utils/http.util.ts:39`

**Evidence:**

```ts
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => { ... });
  logger.info(failedQueue);   // ← logs the entire pending-request queue
  failedQueue = [];
};
```

`next.config.ts` removes `console` calls in production **except** `log` and `error` — so this `logger.info` (wrapping `console.log`) **survives the production build**.

**Impact:**  
Anyone with browser DevTools open can observe the internal queue of pending auth retry handlers, revealing the timing and volume of concurrent requests during token refresh.

**Remediation:**

```ts
// Gate behind a dev-only flag before clearing the queue:
if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production') {
  logger.info('[processQueue]', failedQueue.length, 'queued requests');
}
failedQueue = [];
```

**Effort to Fix:** Quick

---

## Risk Matrix

```
CRITICAL ─── (none found)
HIGH     ─── SEC-001  MQTT credentials exposed in client bundle
             SEC-002  Unauthenticated file upload API routes
MEDIUM   ─── SEC-003  No HTTP request timeout
             SEC-004  Non-secure cookies outside production
             SEC-005  Backend error response forwarded verbatim
             SEC-006  Open redirect via unvalidated localStorage value
LOW      ─── SEC-007  Missing HTTP security headers
             SEC-008  Dead/mismatched env var in config vs. docs
             SEC-009  Auth retry queue logged in production build
```

## Recommended Fix Order

| Priority | ID                                                        | Est. Effort |
| -------- | --------------------------------------------------------- | ----------- |
| 1        | SEC-002 — Auth-guard the 3 file upload routes             | ~10 min     |
| 2        | SEC-006 — Validate `PATH_NO_LOGIN` is a same-origin path  | ~5 min      |
| 3        | SEC-007 — Add security headers to `next.config.ts`        | ~5 min      |
| 4        | SEC-003 — Uncomment and enable the request timeout        | ~2 min      |
| 5        | SEC-005 — Whitelist error fields in auth API routes       | ~10 min     |
| 6        | SEC-009 — Gate `logger.info(failedQueue)` behind dev flag | ~2 min      |
| 7        | SEC-004 — Add `FORCE_SECURE_COOKIES` for staging          | ~5 min      |
| 8        | SEC-001 — Move MQTT connection server-side                | ~2–4 h      |
| 9        | SEC-008 — Reconcile `NEXT_PUBLIC_URL` across docs & code  | ~1 h        |
