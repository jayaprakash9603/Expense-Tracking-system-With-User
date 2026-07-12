# Five-Day Account Deletion Saga

Reliable, cross-service account deletion with a five-day grace period. Users
and admins can request a deletion; the system blocks normal access, waits five
days, then purges owned data and anonymizes audit / shared-chat retention.

## Lifecycle

```
ACTIVE ── request ──▶ DELETION_PENDING ── grace elapsed ──▶ PURGING ── all succeeded ──▶ DELETED
                          │                                    │
                          └── cancel (< 5d) ──▶ ACTIVE          └── retry exhausted ──▶ FAILED ── admin retry ──▶ PURGING
```

- `AccountStatus` on the `users` row tracks the current state.
- `deletion_saga` / `deletion_step` / `deletion_outbox` tables persist the
  saga, its per-service purge steps, and the transactional outbox.

## Public API (user-service)

| Method | Path | Purpose |
|---|---|---|
| `POST`   | `/api/user/me/deletion-request`                 | Self-service: request deletion (idempotent). |
| `GET`    | `/api/user/me/deletion-request`                 | Self-service: current status + countdown. |
| `DELETE` | `/api/user/me/deletion-request`                 | Self-service: cancel while `REQUESTED`. |
| `POST`   | `/api/admin/users/{id}/deletion-request`        | Admin: request deletion for another user. |
| `GET`    | `/api/admin/users/{id}/deletion-request`        | Admin: status with error details. |
| `DELETE` | `/api/admin/users/{id}/deletion-request`        | Admin: cancel a pending deletion. |
| `POST`   | `/api/admin/users/{id}/deletion-request/retry`  | Admin: retry a FAILED saga. |
| `POST`   | `/api/admin/users/{id}/deletion-request/bulk`   | Admin: schedule deletion for a list of IDs. |
| `POST`   | `/api/internal/users/{id}/purge`                | Service-to-service purge callback (requires `X-Service-Token`). |

Legacy `DELETE /api/user/{id}` and `DELETE /api/admin/users/{id}` now schedule
a five-day deletion instead of hard-deleting; existing clients continue to work.

## Access blocking

`DeletionAccessBlockFilter` short-circuits any normal API call by an account
whose status is `DELETION_PENDING` / `PURGING` / `FAILED` / `DELETED`, allowing
only:
- `POST/GET/DELETE /api/user/me/deletion-request`
- `/api/admin/**`, `/api/internal/**`, `/auth/**`

## Orchestration

- `AccountDeletionService` — request, cancel, `beginPurge`, `handleResult`, and
  `adminRetry`. Every state mutation writes a `deletion_outbox` row in the same
  transaction that mutates the saga.
- `DeletionScheduler` — fixed-delay tick that claims `REQUESTED` sagas past
  their `scheduled_purge_at` (pessimistic-locked to survive multiple pods) and
  retries stalled steps in `PURGING` sagas.
- `OutboxPublisher` — flushes outbox entries to Kafka topics via
  `KafkaTemplate`. Falls back to durable-only mode when no broker is
  configured (monolithic profile).
- `PurgeResultListener` — Kafka consumer for `user.deletion.purge.results`.

## Topics (in `AccountDeletionTopics`)

- `user.deletion.purge.commands`
- `user.deletion.purge.results`
- `user.deletion.purge.dlq`
- `user.deletion.lifecycle`

## Adding a new participant service

Every user-data-owning service needs one file:

```java
@Component
@ConditionalOnProperty(prefix = "spring.kafka", name = "bootstrap-servers")
public class MyServicePurgeHandler extends AbstractPurgeHandler {

    private final MyRepository repo;

    public MyServicePurgeHandler(KafkaTemplate<String,Object> kafka,
                                 ObjectMapper mapper,
                                 MyRepository repo) {
        super("my-service", kafka, mapper);
        this.repo = repo;
    }

    @KafkaListener(topics = AccountDeletionTopics.PURGE_COMMANDS,
            groupId = "${account-deletion.consumer-group:my-service-deletion}")
    public void onCommand(String rawPayload) { handle(rawPayload); }

    @Override
    @Transactional
    protected void purge(PurgeUserCommand cmd) {
        repo.deleteByUserId(cmd.getUserId());
        // ...delete owned children, anonymize retained rows, etc.
    }
}
```

Reference: `ExpensePurgeHandler` in the Expense service. The handler must
be **idempotent** — repeated deliveries with the same
`idempotencyKey` must be safe, and missing rows are a successful outcome.

Configure the participants list in `application.yaml`:

```yaml
account-deletion:
  saga-enabled: true          # master feature flag
  grace-period: P5D           # ISO-8601 duration
  scheduler-interval: PT1M
  max-attempts: 5
  retry-base-delay: PT2M
  retry-max-delay: PT6H
  participants:
    - user-service
    - expense-service
    - budget-service
    - bill-service
    - event-service
    - category-service
    - payment-method-service
    - friendship-service
    - notification-service
    - search-service
    - story-service
    - chat-service
    - audit-service
```

### Anonymization vs. deletion

- **Audit service** should anonymize `username`, `email`, `ip_address`,
  `user_agent`, `session_id`, and any payload PII while retaining the audit
  identifier, action, and correlation ID for integrity.
- **Chat service** should delete the deleted user's private cache/presence
  keys, but conversations retained for the other participant should have the
  deleted user's display name/avatar replaced with a "Deleted user" placeholder
  and their references stripped.
- **User service** finalization already anonymizes the identity row in
  `AccountDeletionService.finalizeSaga`.

## Rollout checklist

1. Deploy user-service with `account-deletion.saga-enabled=false`; run
   `V3__account_deletion_saga.sql` on every environment.
2. Deploy each participant with its purge handler and topic subscription.
3. Enable the feature flag in staging, run end-to-end tests:
   - Self request → cancel restores access.
   - Self request → 5d elapses → all steps succeed → user anonymized.
   - Admin bulk → mixed successes/failures → FAILED saga → admin retry.
4. Enable in production behind the feature flag; observe `deletion_outbox`
   depth and step failure counters.
5. Once stable, decommission the legacy synchronous `deleteUser` code path
   inside `UserServiceImplementation`.

## Metrics & observability

Structured logs are emitted at every state transition (`Account deletion
requested/cancelled/completed`). Recommended Micrometer counters/gauges
(add via a `MeterBinder` in a follow-up):

- `deletion.saga.state.count{state}`
- `deletion.step.retries{service}`
- `deletion.outbox.depth`
- `deletion.dlq.count`

## Security

- `/api/internal/**` is guarded by the `X-Service-Token` header enforced by
  `InternalServiceAuthFilter`, which grants `ROLE_SERVICE`.
- End-user JWTs cannot reach `/api/internal/**` — `SecurityFilterChain` also
  requires `ROLE_SERVICE` there.
- Active sessions/tokens for a deletion-pending user should be revoked by
  bumping the JWT epoch; the access-block filter provides a belt-and-braces
  guarantee even for tokens issued before the request.

## Verification

- Unit tests: `AccountDeletionServiceTest` covers request idempotency, cancel
  cutoff, success finalization + PII anonymization, and retry exhaustion + DLQ
  routing. Extend with integration tests per participant using a Testcontainers
  Kafka broker.
- End-to-end: run the self + admin flows against a staging cluster with the
  monolithic in-memory event router, then again against the microservice
  Kafka topology.
