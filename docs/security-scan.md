# Security Scan

Date: 2026-06-17

Scope: static review of the CMS repository, focused on Next.js API routes, auth/session handling, file upload/delete paths, token storage, public environment variables, rich text handling, security headers, deployment workflow, and dependency audit.

Restricted files were not read: `.env`, `credentials.json`, and `supersecrets.txt`. A local `.env` file exists, but it is ignored by `.gitignore` and `.dockerignore`.

## Executive Summary

Highest priority issues:

1. Internal file API routes authorize S3 actions by decoding JWT payloads without verifying signatures.
2. Login and refresh responses return `refresh_token` to browser JavaScript even though refresh tokens are also stored in `HttpOnly` cookies.
3. MQTT username/password are configured as `NEXT_PUBLIC_*`, bundled into client JavaScript, and used for direct browser MQTT connections.
4. Production dependencies have audit findings, including vulnerable `axios`, `tinymce`, `dompurify`, `form-data`, `lodash`, and `ws` versions.

## Findings

### Critical: Internal file API routes trust unsigned JWT payloads

Evidence:

- `src/proxy.ts:48` excludes `/api` routes from the proxy matcher.
- `src/utils/jwt.util.ts:3-7` uses `jwtDecode(token)`, which decodes claims but does not verify the JWT signature.
- `src/app/api/file/delete/route.ts:16-36` reads `access_token` from cookies, decodes `authorities`, and authorizes with `validatePermission`.
- `src/app/api/file/upload/video/chunk/init/route.ts:22-42`, `presign-batch/route.ts:33-54`, `complete/route.ts:20-40`, and `abort/route.ts:20-40` use the same pattern.
- `src/utils/csrf.util.ts:4-12` only checks that `X-CSRF-Token` equals the `csrf_token` cookie. A direct HTTP client can forge both values.

Impact:

An attacker can call the internal file API directly with a forged `access_token` cookie containing arbitrary `authorities`, plus a matching forged CSRF cookie/header, and pass authorization checks. That can grant access to multipart upload, presign, complete, abort, or delete operations against configured S3/MinIO storage.

Recommended fix:

- Do not authorize API routes with `jwtDecode`.
- Verify access token signatures server-side using the auth server's JWKS/public key, or call an auth/introspection endpoint before trusting claims.
- Centralize internal API auth in one helper that verifies token validity, expiration, issuer, audience/client, and permissions.
- Keep CSRF validation, but do not treat CSRF as authentication.

### High: Refresh tokens are exposed to browser JavaScript

Evidence:

- `src/types/auth.type.ts:6-17` defines `LoginResType.refresh_token`.
- `src/app/api/auth/login/route.ts:47-71` stores access/refresh tokens in `HttpOnly` cookies, then `src/app/api/auth/login/route.ts:74` returns the full backend response to the browser.
- `src/types/auth.type.ts:42-53` defines `RefreshTokenResType.refresh_token`.
- `src/app/api/auth/_lib/refresh-session.ts:78-80` returns `{ ...response, csrfToken }`, preserving `refresh_token`.
- `src/app/api/auth/refresh-token/route.ts:18-20` returns `session.response` to the browser.

Impact:

The `HttpOnly` refresh-token protection is largely defeated because the same refresh token is also delivered to JavaScript. Any XSS or malicious browser extension can steal long-lived refresh tokens and continue refreshing sessions.

Recommended fix:

- Return only the fields the client needs: short-lived `access_token`, `user_kind`, and `csrfToken`.
- Never include `refresh_token` in JSON responses.
- Prefer a BFF pattern where the browser never receives access or refresh tokens; the Next server proxies API calls using `HttpOnly` cookies.

### High: Public MQTT credentials are bundled into the client

Evidence:

- `src/config.ts:12-14` validates `NEXT_PUBLIC_MQTT_BROKER`, `NEXT_PUBLIC_MQTT_USERNAME`, and `NEXT_PUBLIC_MQTT_PASSWORD`.
- `src/lib/mqtt.ts:12-15` uses those public values in browser-side `mqtt.connect(...)`.
- `Dockerfile:25-40` accepts and embeds `NEXT_PUBLIC_MQTT_PASSWORD`.
- `.github/workflows/docker.yml:32-42` passes `NEXT_PUBLIC_MQTT_PASSWORD` as a Docker build arg.

Impact:

Anyone with access to the built JavaScript can recover MQTT credentials. If the broker allows publish or broad subscribe permissions, attackers can spoof notifications, trigger cache invalidations, observe account topics, or abuse broker resources.

Recommended fix:

- Treat MQTT credentials as public unless proven otherwise.
- Use broker ACLs that restrict the browser credential to only the minimum subscribe permissions.
- Prefer per-session, short-lived MQTT credentials minted by the backend.
- Avoid `NEXT_PUBLIC_*` for credentials that should remain secret.

### High: S3 delete endpoint can delete arbitrary bucket keys

Evidence:

- `src/app/api/file/delete/route.ts:44-63` accepts `objectName`, optionally strips `/${BUCKET_NAME}/`, and passes the remaining value directly to `DeleteObjectCommand`.
- Unlike multipart upload validation, delete does not use the constrained `objectNameSchema` from `src/app/api/file/upload/video/chunk/_lib/validation.ts:41-45`.

Impact:

Any caller that passes the current permission check can delete any key in the configured bucket, not just CMS-managed upload prefixes. Combined with the unsigned-JWT issue above, this becomes critical.

Recommended fix:

- Validate delete keys with an allowlist schema.
- Restrict deletion to configured CMS prefixes unless broader deletion is explicitly required.
- Track file ownership/resource association and verify the caller can delete the referenced object.

### High: Dependency audit contains production-relevant vulnerabilities

Command:

```bash
yarn audit --level moderate
```

Result:

- 125 vulnerabilities found.
- Severity summary: 7 low, 57 moderate, 61 high, 0 critical.

Production-relevant installed versions observed with `yarn list`:

- `axios@1.13.2`; audit reports multiple high/moderate advisories patched in `>=1.16.0` or related versions.
- `tinymce@8.3.1`; audit reports high XSS advisories patched in `>=8.5.1`.
- `dompurify@3.4.5`; audit reports moderate sanitizer bypass advisories patched in `>=3.4.7`.
- `form-data@4.0.4`; audit reports high CRLF injection patched in `>=4.0.6`.
- `lodash@4.17.21`; audit reports prototype-pollution/code-injection advisories with patched versions listed by audit.
- `ws@8.20.0` and `ws@7.5.10`; audit reports moderate/high advisories patched in `>=8.20.1` and `>=7.5.11`.
- `follow-redirects@1.15.11`; audit reports auth-header redirect leakage patched in `>=1.16.0`.

Recommended fix:

- Upgrade direct runtime dependencies first: `axios`, `tinymce`, `dompurify`, `form-data`, `mqtt/ws`, and `lodash`.
- Run `yarn audit --json --level moderate` after upgrades and confirm remaining findings are dev-only or not exploitable.
- Be careful with `axios` major/minor behavior changes because it is the central HTTP layer.

### Medium: Multipart upload operations are not bound to a user/session

Evidence:

- `src/app/api/file/upload/video/chunk/init/route.ts:58-70` returns only `uploadId` and generated `objectName`.
- `src/app/api/file/upload/video/chunk/presign-batch/route.ts:76-96`, `complete/route.ts:53-67`, and `abort/route.ts:53-61` trust caller-supplied `objectName` and `uploadId` after schema validation.

Impact:

If an authorized user learns another upload's `objectName` and `uploadId`, they can request part URLs, complete, or abort that upload. The generated object names are random enough to reduce guessing, but there is no server-side ownership binding.

Recommended fix:

- Store multipart upload sessions server-side with owner/user id, objectName, uploadId, file size, part count, and expiry.
- Require subsequent presign/complete/abort requests to match the authenticated owner and session record.

### Medium: Presign batch endpoint can generate up to 10,000 URLs per request

Evidence:

- `src/app/api/file/upload/video/chunk/presign-batch/route.ts:23-30` allows `partNumbers` up to `10_000`.
- `src/app/api/file/upload/video/chunk/presign-batch/route.ts:82-96` generates all signed URLs in parallel with `Promise.all`.

Impact:

An authorized or forged-authorized caller can consume significant CPU/network resources in one request. URLs remain valid for one hour.

Recommended fix:

- Limit batch size to the actual expected part count from a stored upload session.
- Cap per-request batch size to a much smaller value and paginate URL generation.
- Add rate limiting per user/session/IP.

### Medium: Rich text sanitization allows iframes and inline styles

Evidence:

- `src/components/form/rich-text-field.tsx:105-113` and `src/components/form/rich-text-field.tsx:209-217` call `DOMPurify.sanitize` with `ADD_TAGS: ['iframe']`.
- `src/components/form/rich-text-field.tsx:149-151` allows `span[style]`, `div[style]`, and `iframe[src|width|height|allow|allowfullscreen|title]`.
- `tinymce` and `dompurify` both have audit findings in the current installed versions.

Impact:

The sanitizer blocks many direct XSS payloads, but allowed iframes and inline styles expand the attack surface for stored content, clickjacking-like embeds, tracking, phishing, and sanitizer bypass exposure. If public-facing clients render the same CMS content less strictly, this risk increases.

Recommended fix:

- Upgrade `tinymce` and `dompurify`.
- Add an explicit allowlist for iframe origins, for example YouTube/Vimeo only.
- Consider stripping inline styles or allowing a small CSS property allowlist.
- Sanitize again at render boundaries, not only at form input time.

### Medium: CSP is present but broad

Evidence:

- `next.config.ts:10-18` sets CSP.
- `script-src` includes `'unsafe-inline'` in production.
- `connect-src` allows all `https:` and `wss:`.
- CSP lacks `object-src 'none'`, `base-uri 'self'`, and `form-action 'self'`.

Impact:

The CSP is helpful, but broad script/connect allowances reduce its value as an XSS containment layer. `unsafe-inline` is especially important because the app stores rich text and uses third-party editor/media features.

Recommended fix:

- Remove production `'unsafe-inline'` where possible using nonces or hashes.
- Scope `connect-src` to configured API, media, MQTT, and TinyMCE hosts.
- Add `object-src 'none'`, `base-uri 'self'`, and `form-action 'self'`.
- Consider `upgrade-insecure-requests` for production.

### Medium: Auth routes lack consistent CSRF/rate-limit controls

Evidence:

- `src/app/api/auth/logout/route.ts:8` accepts POST without a `NextRequest` and does not call `validateCsrfToken`.
- `src/app/api/auth/refresh-token/route.ts:7` also accepts POST without CSRF validation.
- `src/app/api/auth/login/route.ts:18-36` has no local rate limiting or lockout logic.

Impact:

`SameSite=Lax` cookies reduce classic cross-site POST CSRF, but same-origin XSS, unusual browser behavior, or deployment/domain changes can still expose these routes. Login can be abused for brute-force attempts unless the upstream auth service rate-limits.

Recommended fix:

- Add CSRF validation to logout and refresh, or document why cookie settings and backend controls are sufficient.
- Add rate limiting to login, refresh, and presign endpoints at the edge or server.
- Always clear local cookies on logout request completion, even if backend logout fails, unless there is a strong reason not to.

### Medium: GitHub deploy trusts live SSH host key

Evidence:

- `.github/workflows/docker.yml:76` uses `ssh-keyscan ${{ secrets.VPS_HOST }} >> ~/.ssh/known_hosts`.

Impact:

The deploy job trusts whatever host key is returned at runtime. If DNS/network is compromised during deployment, the workflow could trust an attacker's SSH host key.

Recommended fix:

- Store the expected SSH host key or fingerprint in GitHub Secrets.
- Verify the scanned key against the pinned value before SSH.

### Low: Private server env vars are not validated by `src/config.ts`

Evidence:

- `src/config.ts:4-15` validates only `NEXT_PUBLIC_*` values.
- `src/app/api/auth/_lib/auth.ts:1-2` uses `APP_USERNAME` and `APP_PASSWORD`.
- `src/lib/s3.ts:4-29` manually checks S3 env vars and logs missing names, but does not fail fast.

Impact:

Misconfiguration can cause requests using `undefined:undefined` basic credentials or partially configured S3 clients. This is mostly an availability and deployment-safety issue, but bad auth failures can complicate incident response.

Recommended fix:

- Add a server-only env schema for `APP_USERNAME`, `APP_PASSWORD`, grant types, and MinIO settings.
- Fail fast on missing server secrets in production.

## Positive Controls Observed

- Auth cookies are set `HttpOnly`, `Secure` outside development, and `SameSite=Lax` in `src/app/api/auth/_lib/make-cookie-option.ts:6-12`.
- CSRF validation is implemented and used by internal file upload/delete routes.
- Multipart upload object names are constrained by regex in `src/app/api/file/upload/video/chunk/_lib/validation.ts:30-45`.
- `.gitignore` excludes `.env`, and `.dockerignore` excludes `.env*`.
- Security headers include `X-Content-Type-Options`, `X-Frame-Options`, HSTS, `Referrer-Policy`, `Permissions-Policy`, and CSP in `next.config.ts:24-52`.
- Login redirect paths are constrained to internal paths by `src/utils/url.util.ts:66-90` and `src/components/permission-guard/permission-guard.tsx:88-101`.

## Recommended Remediation Order

1. Fix internal file API authentication by verifying JWT signatures or introspecting tokens server-side.
2. Stop returning refresh tokens from login and refresh responses.
3. Restrict S3 delete keys and bind multipart uploads to authenticated upload sessions.
4. Remove public MQTT password usage or replace it with short-lived, restricted credentials.
5. Upgrade vulnerable runtime dependencies and rerun `yarn audit --level moderate`.
6. Harden rich text sanitizer policy and CSP together.
7. Add rate limiting and consistent CSRF handling to auth and upload endpoints.
8. Pin SSH host key verification in the deployment workflow.
