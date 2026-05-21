# Security Audit Report - MovieHub CMS

**Audit Date:** 2026-05-21  
**Project:** MovieHub CMS (Next.js 16 App Router)  
**Scope:** Current repo state only; static review of auth/session, internal API routes, file/media flows, client security, config, Docker, and CI workflow  
**Methodology:** Local code inspection, parallel subagent review passes, and `yarn audit --groups dependencies`

---

## Executive Summary

| Severity  |  Count |
| --------- | -----: |
| Critical  |      2 |
| High      |      3 |
| Medium    |     10 |
| Low       |      0 |
| Info      |      0 |
| **Total** | **15** |

**Overall Risk:** Critical

The highest-risk issue is architectural: several internal routes trust client-supplied cookies and decoded JWT claims without server-side verification. That breaks the assumption that these routes are protected by cookie auth. The current code also exposes MQTT broker credentials to every browser, re-exposes bearer tokens to client JavaScript, leaves multipart upload endpoints under-protected, and has dependency advisories that need remediation.

---

## Findings

### CRIT-001: Internal Route Authentication and Authorization Trust Unverified Client-Supplied Cookies and JWT Claims

- **Severity:** Critical
- **Type:** Broken Authentication / Broken Access Control - CWE-287 / CWE-345 / CWE-347
- **Location:** `src/utils/jwt.util.ts:4-10`, `src/proxy.ts:7-30`, `src/utils/csrf.util.ts:4-12`, `src/app/api/file/delete/route.ts:20-39`, `src/app/api/file/upload/video/chunk/init/route.ts:10-25`, `src/app/api/file/upload/video/chunk/presign/route.ts:10-21`, `src/app/api/file/upload/video/chunk/complete/route.ts:9-20`, `src/app/api/file/upload/video/chunk/abort/route.ts:9-20`
- **OWASP:** A01:2021 Broken Access Control, A07:2021 Identification and Authentication Failures
- **Effort to Fix:** Extensive

**Evidence**

```ts
// src/utils/jwt.util.ts
export const decodeJwt = (token: string): JwtType | null => {
  return jwtDecode(token);
};
```

```ts
// src/app/api/file/delete/route.ts
const permissionCodes = decodeJwt(accessToken)?.authorities || [];
```

```ts
// src/utils/csrf.util.ts
return headerToken === cookieToken;
```

The file routes accept any cookie value the caller sends. `decodeJwt()` does not verify JWT signature, issuer, or audience. Multipart routes only require that an `access_token` cookie exist. CSRF protection is only a double-submit equality check, so a direct caller can self-supply both cookie and header values.

**Impact Analysis**

An attacker can call these internal routes without a real session by forging cookie/header values. For `/api/file/delete`, a forged JWT containing elevated `authorities` can satisfy the permission check. For multipart upload routes, any non-empty fake access token can unlock route access.

**Remediation**

- Verify access tokens server-side before trusting any claims.
- Reject unsigned, expired, or invalid JWTs before route logic runs.
- Centralize verified-session enforcement in a shared server helper or middleware.
- Bind CSRF validation to a verified session secret, not just header-cookie equality.

---

### CRIT-002: MQTT Broker Credentials Are Exposed to Every Browser and Baked Into Build Artifacts

- **Severity:** Critical
- **Type:** Sensitive Data Exposure - CWE-200 / CWE-522
- **Location:** `src/config.ts:12-14`, `src/lib/mqtt.ts:12-18`, `Dockerfile:25-39`, `.github/workflows/docker.yml:31-41`
- **OWASP:** A02:2021 Cryptographic Failures
- **Effort to Fix:** Moderate

**Evidence**

```ts
// src/config.ts
NEXT_PUBLIC_MQTT_BROKER: z.url(),
NEXT_PUBLIC_MQTT_USERNAME: z.string(),
NEXT_PUBLIC_MQTT_PASSWORD: z.string(),
```

```ts
// src/lib/mqtt.ts
client = mqtt.connect(envConfig.NEXT_PUBLIC_MQTT_BROKER as string, {
  username: envConfig.NEXT_PUBLIC_MQTT_USERNAME as string,
  password: envConfig.NEXT_PUBLIC_MQTT_PASSWORD as string
});
```

```dockerfile
ARG NEXT_PUBLIC_MQTT_USERNAME
ARG NEXT_PUBLIC_MQTT_PASSWORD
ENV NEXT_PUBLIC_MQTT_USERNAME=$NEXT_PUBLIC_MQTT_USERNAME
ENV NEXT_PUBLIC_MQTT_PASSWORD=$NEXT_PUBLIC_MQTT_PASSWORD
```

**Impact Analysis**

Any logged-in user can recover the broker credentials from the client bundle or runtime and connect outside the app. If broker ACLs are permissive, this enables unauthorized topic reads and possibly spoofed publishes.

**Remediation**

- Remove MQTT secrets from all `NEXT_PUBLIC_*` variables.
- Stop injecting MQTT credentials through Docker build args and CI build args.
- Replace them with short-lived per-user broker tokens or a server-side relay.
- Enforce strict topic ACLs on the broker.

---

### HIGH-001: Multipart Upload Routes Lack Server-Side Permission Enforcement

- **Severity:** High
- **Type:** Missing Authorization - CWE-862
- **Location:** `src/app/api/file/upload/video/chunk/init/route.ts:10-25`, `src/app/api/file/upload/video/chunk/presign/route.ts:10-21`, `src/app/api/file/upload/video/chunk/complete/route.ts:9-20`, `src/app/api/file/upload/video/chunk/abort/route.ts:9-20`, `src/constants/api-config.ts:401-424`
- **OWASP:** A01:2021 Broken Access Control
- **Effort to Fix:** Moderate

**Evidence**

The four chunk-upload routes only check CSRF and token presence. They never call `validatePermission(...)`, and the corresponding `apiConfig.file.uploadChunk*` entries have no `permissionCode`.

**Impact Analysis**

Even with a real low-privilege session, any authenticated CMS user can initialize uploads, generate presigned URLs, complete uploads, and abort uploads without holding `FILE_U_V` or an equivalent upload permission.

**Remediation**

- Enforce the same upload permission used by `apiConfig.file.uploadVideo`.
- Add `permissionCode` metadata for all four internal chunk routes.
- Fail closed when route-level permission metadata is missing.

---

### HIGH-002: Bearer Tokens Are Re-Exposed to Browser JavaScript and Stored in Zustand

- **Severity:** High
- **Type:** Sensitive Data in Client Memory - CWE-200 / CWE-316 / CWE-922
- **Location:** `src/app/api/auth/session/route.ts:25-33`, `src/app/api/auth/login/route.ts:84`, `src/app/api/auth/refresh-token/route.ts:89`, `src/app/(auth)/login/_components/login-form.tsx:55-61`, `src/components/providers/app-provider/app-provider.tsx:78-82`, `src/store/auth.store.ts:4-13`, `src/utils/http.util.ts:157-188`
- **OWASP:** A02:2021 Cryptographic Failures
- **Effort to Fix:** Moderate

**Evidence**

```ts
// src/app/api/auth/session/route.ts
data: {
  (accessToken, userKind, csrfToken);
}
```

```ts
// src/store/auth.store.ts
accessToken: null,
setAccessToken: (accessToken) => set({ accessToken }),
```

The code correctly stores auth cookies as `httpOnly`, but then returns the raw access token to browser code and stores it in client state for reuse.

**Impact Analysis**

Any XSS, malicious extension, or compromised first-party script can steal a reusable bearer token instead of being limited to cookie-riding.

**Remediation**

- Stop returning access tokens from `/api/auth/session`, `/api/auth/login`, and `/api/auth/refresh-token`.
- Keep bearer tokens server-side and proxy authenticated API work through server handlers where possible.
- If browser-visible tokens remain necessary, reduce lifetime and scope aggressively.

---

### HIGH-003: No Brute-Force or Abuse Throttling on Login and Refresh Endpoints

- **Severity:** High
- **Type:** Missing Rate Limiting - CWE-307
- **Location:** `src/app/api/auth/login/route.ts`, `src/app/api/auth/refresh-token/route.ts`
- **OWASP:** A07:2021 Identification and Authentication Failures
- **Effort to Fix:** Moderate

**Evidence**

The login and refresh handlers accept unbounded requests. There is no IP throttling, account throttling, backoff, lockout, or abuse accounting.

**Impact Analysis**

`/api/auth/login` is exposed to credential stuffing and brute-force attacks. `/api/auth/refresh-token` can be abused for refresh churn and session-stability attacks.

**Remediation**

- Add IP-based and account-based rate limiting.
- Apply stricter limits to login than to normal application routes.
- Consider lockout or step-up verification after repeated failures.

---

### MED-001: Multipart Upload Lifecycle Does Not Bind `uploadId` and `objectName` to the Initiating User

- **Severity:** Medium
- **Type:** Insecure Direct Object Reference - CWE-639
- **Location:** `src/app/api/file/upload/video/chunk/presign/route.ts:42-54`, `src/app/api/file/upload/video/chunk/complete/route.ts:27-39`, `src/app/api/file/upload/video/chunk/abort/route.ts:27-34`
- **OWASP:** A01:2021 Broken Access Control
- **Effort to Fix:** Moderate

**Evidence**

`objectName`, `uploadId`, `partNumber`, and `parts` are read directly from `req.json()` and passed into S3 multipart commands. There is no server-side record tying that upload state to the initiating principal.

**Impact Analysis**

If one user obtains another user's `uploadId` and `objectName`, they can mint additional presigned URLs, complete the upload with attacker-controlled parts, or abort it.

**Remediation**

- Persist multipart upload state server-side at init time.
- Bind `uploadId` and `objectName` to the verified user/session, allowed prefix, and expiration.
- Enforce that binding in presign, complete, and abort handlers.

---

### MED-002: Multipart Upload Routes Have Shape Validation But No Strong Server-Side Abuse Controls

- **Severity:** Medium
- **Type:** Improper Input Validation - CWE-20 / Uncontrolled Resource Consumption - CWE-770
- **Location:** `src/app/api/file/upload/video/chunk/_lib/validation.ts:60-113`, `src/app/api/file/upload/video/chunk/init/route.ts:32-41`, `src/app/api/file/upload/video/chunk/presign/route.ts:46-66`, `src/app/api/file/upload/video/chunk/complete/route.ts:30-49`
- **OWASP:** A04:2021 Insecure Design
- **Effort to Fix:** Moderate

**Evidence**

The current tree now has Zod validation for request body shape, MIME type allowlisting, object-name pattern, part number range, and sorted/unique complete parts. However, the server still does not persist the declared `fileSize`, expected part count, owner, expiry, or total uploaded bytes across the multipart lifecycle.

**Impact Analysis**

Attackers can declare an allowed upload, request many presigned parts up to the protocol maximum, upload more data than intended, and create storage/bandwidth cost exhaustion or long-lived incomplete uploads.

**Remediation**

- Keep the current request schemas, but add persisted multipart upload state.
- Enforce declared file size, expected part count, owner, expiration, and upload status on presign, complete, and abort.
- Cap concurrent uploads, part counts, and bytes per user.
- Expire or garbage-collect abandoned uploads.

---

### MED-003: File Delete Route Accepts Arbitrary Bucket Keys

- **Severity:** Medium
- **Type:** Insecure Direct Object Reference - CWE-639 / External Control of File Name or Path - CWE-73
- **Location:** `src/app/api/file/delete/route.ts:47-69`, `src/lib/s3.ts:36-38`
- **OWASP:** A01:2021 Broken Access Control
- **Effort to Fix:** Moderate

**Evidence**

```ts
let key = objectName;
const prefix = `/${BUCKET_NAME}/`;
if (key.startsWith(prefix)) {
  key = key.substring(prefix.length);
}
```

The route passes the resulting caller-controlled key directly to `DeleteObjectCommand` and does not restrict it to `UPLOAD_FOLDER` or `UPLOAD_PREFIX`.

**Impact Analysis**

Any request that clears the route's auth checks can delete arbitrary objects in the configured bucket, not just intended CMS upload objects.

**Remediation**

- Canonicalize keys and reject anything outside the intended upload prefix.
- Enforce deletion against server-tracked object metadata where possible.

---

### MED-004: Auth Mutation Routes Skip CSRF Validation

- **Severity:** Medium
- **Type:** Cross-Site Request Forgery - CWE-352
- **Location:** `src/app/api/auth/refresh-token/route.ts:21-92`, `src/app/api/auth/logout/route.ts:7-55`, compared with `src/utils/csrf.util.ts:4-21`
- **OWASP:** A01:2021 Broken Access Control
- **Effort to Fix:** Quick

**Evidence**

CSRF validation exists and is enforced on file mutation routes, but neither `POST /api/auth/refresh-token` nor `POST /api/auth/logout` calls `validateCsrfToken()`.

**Impact Analysis**

This permits forced logout and refresh-token churn from same-site attacker surfaces or future cookie-policy regressions.

**Remediation**

- Require CSRF validation on all cookie-authenticated state-changing routes.
- Apply the same CSRF policy to auth mutation routes as to file mutation routes.

---

### MED-005: CSP Still Permits Inline Script Execution in Production

- **Severity:** Medium
- **Type:** Improper Restriction of Rendered UI Layers - CWE-693
- **Location:** `next.config.ts:10-17`
- **OWASP:** A05:2021 Security Misconfiguration
- **Effort to Fix:** Moderate

**Evidence**

```ts
script-src 'self' 'unsafe-inline' ...
style-src 'self' 'unsafe-inline' ...
```

**Impact Analysis**

Any HTML or script injection bug elsewhere in the application has a larger blast radius because inline script execution is already allowed by policy.

**Remediation**

- Move to nonce- or hash-based CSP.
- Remove `unsafe-inline` from `script-src`.
- Minimize third-party script origins.

---

### MED-006: CI Deployment Trust Relies on Mutable Action Tags and Runtime `ssh-keyscan`

- **Severity:** Medium
- **Type:** Download of Code Without Integrity Check - CWE-494
- **Location:** `.github/workflows/docker.yml:13-25`, `.github/workflows/docker.yml:71-76`
- **OWASP:** A06:2021 Vulnerable and Outdated Components
- **Effort to Fix:** Quick

**Evidence**

```yml
uses: actions/checkout@v4
uses: docker/setup-buildx-action@v3
uses: docker/login-action@v3
uses: docker/build-push-action@v6
```

```yml
ssh-keyscan ${{ secrets.VPS_HOST }} >> ~/.ssh/known_hosts
```

**Impact Analysis**

An upstream action retag or a MITM on the SSH host-key discovery path could tamper with the deployment workflow and expose deployment secrets.

**Remediation**

- Pin third-party GitHub Actions to full commit SHAs.
- Preconfigure the VPS host key fingerprint instead of trusting runtime `ssh-keyscan`.

---

### MED-007: Dependency Audit Reports High and Moderate Advisories

- **Severity:** Medium
- **Type:** Vulnerable and Outdated Components - CWE-1104
- **Location:** `package.json`, `yarn.lock`
- **OWASP:** A06:2021 Vulnerable and Outdated Components
- **Effort to Fix:** Moderate

**Evidence**

`yarn audit --groups dependencies` reported 43 advisories: 18 high, 24 moderate, and 1 low. Notable paths include:

- `@aws-sdk/client-s3` transitive paths through `fast-xml-builder`
- `mqtt > ws`
- `next > postcss`
- `axios`

**Impact Analysis**

The impact depends on reachable code paths, but the audit currently flags vulnerable dependency versions in runtime packages used for HTTP, S3/MinIO, MQTT/WebSocket, and Next.js build/runtime support.

**Remediation**

- Update direct dependencies and regenerate `yarn.lock`.
- Prefer upgrading `@aws-sdk/*`, `mqtt`, `next`, and `axios` to versions whose transitive trees clear the advisories.
- Rerun `yarn audit --groups dependencies` after dependency updates.

---

### MED-008: Rich Text Sanitizer Allows Arbitrary `iframe` Embeds

- **Severity:** Medium
- **Type:** Stored HTML Injection / Unsafe Embedding - CWE-79 / CWE-1021
- **Location:** `src/components/form/rich-text-field.tsx:103-113`, `src/components/form/rich-text-field.tsx:208-217`
- **OWASP:** A03:2021 Injection
- **Effort to Fix:** Quick to Moderate

**Evidence**

```ts
DOMPurify.sanitize(content, {
  ADD_TAGS: ['iframe'],
  ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling']
});
```

The rich text field explicitly permits `iframe` in stored editor content.

**Impact Analysis**

If this CMS content is rendered in a public application with a looser CSP or different sanitizer, arbitrary embeds can enable phishing, tracking, clickjacking-style UI deception, or stored XSS if render-time controls drift.

**Remediation**

- Prefer disallowing `iframe` entirely.
- If embeds are required, allowlist trusted `src` origins and require `sandbox` and `referrerpolicy`.
- Enforce equivalent sanitization server-side and at every render surface.

---

### MED-009: MinIO Client Uses Root Credentials Instead of Least-Privilege Service Credentials

- **Severity:** Medium
- **Type:** Excessive Privilege - CWE-250
- **Location:** `src/lib/s3.ts:31-38`, `.github/workflows/docker.yml:94-96`
- **OWASP:** A05:2021 Security Misconfiguration
- **Effort to Fix:** Moderate

**Evidence**

```ts
credentials: {
  accessKeyId: process.env.MINIO_ROOT_USER as string,
  secretAccessKey: process.env.MINIO_ROOT_PASSWORD as string
}
```

The application uses MinIO root credentials for application object operations.

**Impact Analysis**

If the CMS runtime, upload routes, or deployment secrets are compromised, the attacker likely receives broad MinIO access instead of only the minimum bucket/prefix permissions needed for CMS media operations.

**Remediation**

- Replace root credentials with scoped MinIO service accounts.
- Restrict service credentials to the target bucket and upload prefixes.
- Use separate credentials for upload, read, delete, and lifecycle operations when practical.

---

### MED-010: Uploaded Video Content Is Not Validated After Storage

- **Severity:** Medium
- **Type:** Unrestricted File Upload - CWE-434
- **Location:** `src/app/api/file/upload/video/chunk/_lib/validation.ts:60-64`, `src/app/api/file/upload/video/chunk/init/route.ts:38-48`, `src/components/form/upload-video-field.tsx:66`
- **OWASP:** A05:2021 Security Misconfiguration
- **Effort to Fix:** Moderate

**Evidence**

The upload flow validates client-supplied `mimeType` and object-name shape, but no post-upload media validation, transcoding gate, or quarantine step is visible in this repo.

**Impact Analysis**

A client can label arbitrary binary content as an allowed video type and store it under a video extension. Depending on how the media host serves files, this can create malware distribution, player parser, or content policy risk.

**Remediation**

- Quarantine newly completed objects until server-side media validation succeeds.
- Validate container and codec with a trusted media tool such as `ffprobe`.
- Only publish or attach the media URL after validation/transcoding succeeds.

---

## Verified Current Hardening

- `src/app/api/auth/_lib/make-cookie-option.ts:4-9` sets `httpOnly`, `sameSite: 'lax'`, and `secure` outside development.
- `src/app/api/auth/session/route.ts:39-42` sets `Cache-Control: no-store` on the session bootstrap response.
- `src/components/form/rich-text-field.tsx:103-115` and `:208-217` sanitize TinyMCE content with DOMPurify.
- `next.config.ts:24-47` applies HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and CSP headers.
- `Dockerfile:42-52` runs the container as a non-root user.
- `src/app/api/file/upload/video/chunk/_lib/validation.ts:60-113` validates multipart request shape, allowed video MIME types, object-name format, upload ID shape, part range, duplicate parts, and sort order.

---

## Stale Claims Corrected From The Previous Audit

- The prior audit understated the most severe issue: the current code does not verify JWT authenticity before using claims for internal route access control.
- The prior audit referenced `src/app/api/file/upload/video/chunk/validation.ts`; the current validation module is `src/app/api/file/upload/video/chunk/_lib/validation.ts`.
- The underlying conclusion about multipart abuse controls remains true, but request shape validation has since been added.
- The prior audit's unresolved findings about token exposure, missing multipart permission checks, missing CSRF on logout/refresh, and MQTT credential exposure are still valid in current source.

---

## Limitations

- I did not read restricted files such as `.env`.
- I ran `yarn audit --groups dependencies` with approved network access, but did not perform manual exploitability analysis for every transitive advisory.
- I did not audit the downstream auth/API/media backends referenced by `NEXT_PUBLIC_AUTH_API_URL`, `NEXT_PUBLIC_API_URL`, and `NEXT_PUBLIC_API_MEDIA_URL`; this report covers the CMS repo only.
