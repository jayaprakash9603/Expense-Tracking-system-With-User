# Security configuration

## JWT signing secret

- Set `JWT_SECRET` to a random value of **at least 32 characters** in every deployed environment.
- Do not use the default placeholder string from sample configs.
- **user-service** validates this automatically when Spring profile is `prod`, `production`, or `staging`, or when `SECURITY_REQUIRE_STRONG_JWT=true`.
- For **monolithic** local runs (`spring.profiles.active=monolithic`), validation is off by default so developers can start the app without env vars. For production monolith deployments, set `SECURITY_REQUIRE_STRONG_JWT=true` and a strong `JWT_SECRET`.

## CORS

- Configure allowed browser origins with the environment variable **`ALLOWED_ORIGIN_PATTERNS`** (comma-separated patterns). Example:

  `http://localhost:*,https://localhost:*,https://your-app.example.com`

- **user-service** defaults include localhost ports and historical Netlify deploy hosts; override per environment.
- **Monolith** (`MonolithicWebConfig`, profile `monolithic`) uses the same property name via Spring `Environment` if wired, or defaults documented in that class—align origins with your web app and mobile WebView origin if applicable.

## Service-to-service calls (user-service)

- Optional header **`X-Service-Token`** must match **`USER_SERVICE_INTERNAL_TOKEN`** for `GET` `/api/user/all`, `/api/user/email`, and `/api/user/by-email` when the token is configured.
- Endpoints remain protected by Spring Security; admin JWTs can also call `/api/user/all` where authorized.

## Database and mail passwords

- Override **`SPRING_DATASOURCE_PASSWORD`**, **`MAIL_PASSWORD`**, and related variables in production. Defaults in `application.yml` are for local development only.

## Content Security Policy (CSP)

- SPAs built with Vite often need `'unsafe-inline'` for styles and (in dev) relaxed `script-src` for HMR.
- For production, prefer setting **CSP at the reverse proxy** (nginx, CloudFront, etc.) rather than a single meta tag, and tune `connect-src` to your API base URL(s).

## Dependency and secret scanning

- GitHub Actions workflow **`.github/workflows/security.yml`** runs dependency review, gitleaks, and `npm audit` / `bun audit` on the JavaScript clients.

## Rate limiting (authentication)

- **user-service** applies a per-IP rolling window limit on `POST` `/auth/signin`, `/auth/signup`, and `/auth/check-email` when not running with profile `test`. Configure with **`AUTH_RATE_LIMIT_PER_MINUTE`** (default `40`).
