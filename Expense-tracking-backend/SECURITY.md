# Security configuration

## Shared internal service authentication

All endpoints whose path contains an `/internal/` segment require a shared service token, even when called directly against a microservice port (not only through the gateway).

| Variable | Purpose |
|----------|---------|
| `SERVICE_INTERNAL_TOKEN` | Preferred shared secret sent as header `X-Service-Token` on every internal service-to-service call. Set the **same** value on every microservice. |
| `USER_SERVICE_INTERNAL_TOKEN` | Legacy alias still supported for backward compatibility. If both are set, `SERVICE_INTERNAL_TOKEN` wins via Spring property resolution. |

The gateway additionally blocks external requests to any `/internal/` path (`gateway.internal-block.enabled=true`).

Feign clients and the Search-Service WebClient add `X-Service-Token` automatically for internal paths via `common-library`.

## User service

| Variable | Purpose |
|----------|---------|
| `JWT_SECRET` | HMAC key for JWT signing (min 256 bits). **Required** when profile `prod` or `production` is active. |
| `ALLOWED_ORIGIN_PATTERNS` | Comma-separated CORS `allowedOriginPatterns` (defaults include `localhost` and Netlify hosts). |
| `AUTH_RATE_LIMIT_PER_MINUTE` | Max POST requests per client IP per rolling minute to `/auth/signin`, `/auth/signup`, `/auth/check-email` (default `40`). |

Internal user lookups live at `/api/internal/users/**` and require `X-Service-Token` plus `ROLE_SERVICE`.

## Expense service

- Mail and DB credentials must be supplied via environment variables (`MAIL_*`, `SPRING_DATASOURCE_*`). Do not commit real passwords.
- Multipart uploads are capped (see `spring.servlet.multipart` in `application.yml`). Excel parsers enforce maximum row counts in code.

## SPAs (web and mobile)

- Serve production builds behind a reverse proxy that sets **Content-Security-Policy**, **HSTS**, and **X-Content-Type-Options**. Avoid inline scripts where possible so CSP can use strict `script-src`.

## CI

- GitHub Actions workflow `.github/workflows/security.yml` runs dependency review (where available), Gitleaks secret scanning (`continue-on-error` until history is clean), and `npm audit` / `bun audit` on the frontends.
