# Security configuration

## User service

| Variable | Purpose |
|----------|---------|
| `JWT_SECRET` | HMAC key for JWT signing (min 256 bits). **Required** when profile `prod` or `production` is active. |
| `USER_SERVICE_INTERNAL_TOKEN` | Shared secret sent as header `X-Service-Token` for trusted service calls to `GET /api/user/all`, `GET /api/user/email`, and `GET /api/user/by-email`. Set the **same** value on USER-SERVICE and on microservices that call these endpoints via Feign. |
| `ALLOWED_ORIGIN_PATTERNS` | Comma-separated CORS `allowedOriginPatterns` (defaults include `localhost` and Netlify hosts). |
| `AUTH_RATE_LIMIT_PER_MINUTE` | Max POST requests per client IP per rolling minute to `/auth/signin`, `/auth/signup`, `/auth/check-email` (default `40`). |

## Expense service

- Mail and DB credentials must be supplied via environment variables (`MAIL_*`, `SPRING_DATASOURCE_*`). Do not commit real passwords.
- Multipart uploads are capped (see `spring.servlet.multipart` in `application.yml`). Excel parsers enforce maximum row counts in code.

## SPAs (web and mobile)

- Serve production builds behind a reverse proxy that sets **Content-Security-Policy**, **HSTS**, and **X-Content-Type-Options**. Avoid inline scripts where possible so CSP can use strict `script-src`.

## CI

- GitHub Actions workflow `.github/workflows/security.yml` runs dependency review (where available), Gitleaks secret scanning (`continue-on-error` until history is clean), and `npm audit` / `bun audit` on the frontends.
