# Expense Tracking Backend

This backend supports two deployment modes: **microservices** (separate services behind an API Gateway) and **monolithic** (single application). The same codebase is used for both; choose the mode via Maven profiles and run configuration.

## Build

| Mode | Command | What gets built |
|------|---------|-----------------|
| **Microservices** | `mvn clean install -P microservices` | common-library, all domain services, Eureka, Gateway (no monolithic-service) |
| **Monolithic** | `mvn clean install -P monolithic` | common-library, all domain services, monolithic-service (no Eureka, no Gateway) |
| **All** | `mvn clean install` | Everything (all modules) |

---

## Microservices mode

### Overview

- **API Gateway** (port 8080) routes requests to backend services by path.
- **Eureka** provides service discovery; each service registers and the Gateway can resolve service instances (or you set service URLs explicitly).
- Each domain service runs in its own JVM with its own database (or shared DB with separate schemas, per your current setup).

### Run order

1. **Infrastructure**: MySQL (e.g. port 5000), Redis (6379), Zookeeper, Kafka (9092). Use the provided `docker-compose.yml` for these.
2. **Eureka Server**: Start first so services can register (default port 8761).
3. **Gateway**: Start on port 8080. Route → service URL mapping is in `Gateway/src/main/resources/application.yaml`.
4. **Domain services**: Start each service with the correct `server.port` and, if not using Eureka, set `*_SERVICE_URL` / `*.service.url` so the Gateway and inter-service Feign calls reach the right host:port.

### Gateway route → service (default ports)

| Path pattern | Env var | Default URL |
|--------------|---------|-------------|
| `/auth/**`, `/api/user/**`, `/api/admin/**`, `/api/roles/**`, `/api/permissions/**` | `USER_SERVICE_URL` | http://localhost:6001 |
| `/api/expenses/**`, `/api/settings/**`, `/daily-summary/**`, `/api/investment/**`, `/api/bulk/**` | `EXPENSE_TRACKING_SERVICE_URL` | http://localhost:6000 |
| `/api/budgets/**` | `BUDGET_SERVICE_URL` | http://localhost:6005 |
| `/api/categories/**` | `CATEGORY_SERVICE_URL` | http://localhost:6008 |
| `/api/bills/**` | `BILL_SERVICE_URL` | http://localhost:6007 |
| `/api/payment-methods/**` | `PAYMENT_SERVICE_URL` | http://localhost:6006 |
| `/api/friendships/**`, `/api/groups/**`, `/api/activities/**`, `/api/shares/**` | `FRIENDSHIP_SERVICE_URL` | http://localhost:6009 |
| `/api/notifications/**`, `/api/notification-preferences/**` | `NOTIFICATION_SERVICE_URL` | http://localhost:6003 |
| `/api/chats/**` | `CHAT_SERVICE_URL` | http://localhost:7001 |
| `/api/admin/audit-logs/**`, `/api/admin/reports/**`, `/api/audit-logs/**` | `AUDIT_SERVICE_URL` | http://localhost:6004 |
| `/api/analytics/**` | `ANALYTICS_SERVICE_URL` | http://localhost:7004 |
| `/api/search/**`, `/api/shortcuts/**` | `SEARCH_SERVICE_URL` | http://localhost:7005 |
| `/api/stories/**`, `/api/admin/stories/**`, `/ws-stories/**` | `STORY_SERVICE_URL` | http://localhost:6010 |
| `/api/events/**` | `EVENT_SERVICE_URL` | http://localhost:7002 |

### Frontend

Point the frontend at the Gateway:

```bash
REACT_APP_API_BASE_URL=http://localhost:8080
```

### Database (microservices)

Each service typically has its own database or schema (see each service’s `application.yml`). Create the databases/schemas as required before starting the services.

---

## Monolithic mode

### Overview

- A single Spring Boot application (**MonolithicApplication**) runs all domain logic.
- One process, one database (`expense_tracker_monolith`).
- No Eureka; no Gateway. Feign clients are configured to call `http://localhost:${server.port}` (self).
- Optional: Kafka, Redis, and mail as in microservices mode.

### Build and run

1. **Build** (from repo root):

   ```bash
   cd expense-tracking-backend
   mvn clean install -P monolithic
   ```

2. **Infrastructure**: Start MySQL (e.g. port 5000). Optionally start Kafka and Redis if you use those features.

3. **Run the monolith** (from `expense-tracking-backend/monolithic-service`):

   ```bash
   mvn spring-boot:run -Dspring.profiles.active=monolithic
   ```

   Default port is **8080**. Override with `SERVER_PORT` or `server.port` if needed.

### Frontend

Use the same base URL as in microservices (monolith listens on 8080):

```bash
REACT_APP_API_BASE_URL=http://localhost:8080
```

### Database (monolith)

- **Database name**: `expense_tracker_monolith`
- **URL** (default): `jdbc:mysql://localhost:5000/expense_tracker_monolith?createDatabaseIfNotExist=true&...`
- The application uses `createDatabaseIfNotExist=true`; JPA/Hibernate can create or update the schema (`ddl-auto: update` in monolith config).

### Env vars (monolith)

Key overrides (optional):

- `SPRING_DATASOURCE_URL`, `DB_USERNAME`, `DB_PASSWORD` – database
- `SERVER_PORT` – app port (default 8080)
- `KAFKA_BOOTSTRAP_SERVERS`, `REDIS_HOST`, `REDIS_PORT` – if using Kafka/Redis
- `JWT_SECRET`, `GOOGLE_OAUTH_CLIENT_ID`, mail settings – as in microservices

### Security (monolith and microservices)

- **JWT**: Auth uses `JWT_SECRET_KEY` (user-service) and/or `jwt.secret` (common-library). Set `JWT_SECRET_KEY` in the environment when running the monolith or user-service (e.g. `export JWT_SECRET_KEY=your-secret-min-32-chars`). Do not use the default dev secret in production.
- **CORS**: Allowed origins include `http://localhost:*`, `https://localhost:*`, and your frontend origin (e.g. `https://jayaprakash.netlify.app`). Configure in user-service `ApplicationConfiguration` or Gateway as needed.
- **Kafka**: In monolith, consumer trusted packages are restricted to `com.jaya.*`. Use the same Kafka topic names in both modes so events flow correctly.

All inter-service URLs are set in `monolithic-service/src/main/resources/application.yml` to point to the same process; override only if you need to (e.g. external Task service).

---

## Docker

- **Microservices**: Use the existing `docker-compose.yml` in this directory to run infrastructure (MySQL, Redis, Kafka, Zookeeper), Eureka, Gateway, and all domain services. See the compose file and env for service URLs and ports.
- **Monolith**: From the `expense-tracking-backend` directory run:
  ```bash
  docker compose -f docker-compose.monolith.yml up -d
  ```
  This starts MySQL (5000), Redis (6379), Kafka (9092), Zookeeper, and the monolithic application on **port 8080**. The monolith image is built with `-P monolithic` via `monolithic-service/Dockerfile`. Set the frontend to `REACT_APP_API_BASE_URL=http://localhost:8080`.

---

## Summary

| Aspect | Microservices | Monolith |
|--------|---------------|----------|
| Build | `mvn clean install -P microservices` | `mvn clean install -P monolithic` |
| Entry | Gateway (8080) + Eureka + each service | MonolithicApplication (8080) |
| Database | Per-service DBs/schemas | Single DB `expense_tracker_monolith` |
| Frontend base URL | `http://localhost:8080` (Gateway) | `http://localhost:8080` (monolith) |

---

## Build, run, and verify

### Build (monolith)

From `expense-tracking-backend`:

```bash
mvn clean install -P monolithic -DskipTests
```

### Run monolith locally

1. Start MySQL (e.g. port 5000). Optionally start Kafka and Redis.
2. From `expense-tracking-backend/monolithic-service` run:

   ```bash
   mvn spring-boot:run "-Dspring.profiles.active=monolithic"
   ```
   On Windows PowerShell use the quotes so the `-D` is passed to Maven. Set `JWT_SECRET_KEY` in the environment when using auth (e.g. `$env:JWT_SECRET_KEY="your-secret-min-32-chars"` in PowerShell).

3. App runs at **http://localhost:8080**.

### Verify endpoints (monolith)

All paths use the same base (e.g. `http://localhost:8080`):

| Area | Method | Path | Notes |
|------|--------|------|--------|
| Health | GET | `/actuator/health` | No auth |
| OpenAPI | GET | `/api-docs`, `/swagger-ui.html` | No auth |
| Auth | POST | `/auth/login` | Body: `{"email":"...","password":"..."}` |
| User | GET | `/api/user/profile` | Requires `Authorization: Bearer <token>` |
| Expenses | GET | `/api/expenses/summary-expenses` | Requires auth |
| Budgets | GET | `/api/budgets` | Requires auth |
| Categories | GET | `/api/categories` | Requires auth |
| Bills | GET | `/api/bills` | Requires auth |
| Payment methods | GET | `/api/payment-methods` | Requires auth |
| Notifications | GET | `/api/notifications` | Requires auth |

In **microservices** mode, use the same paths via the Gateway at `http://localhost:8080`.
