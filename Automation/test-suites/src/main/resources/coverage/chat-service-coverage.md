# chat-service Endpoint Coverage Matrix

Legend: H = happy path, V = validation negative, A = auth/authz negative, N = other negative, S = schema assertion

| Endpoint key | Feature | H | V | A | N | S |
| --- | --- | --- | --- | --- | --- | --- |
| `chats.send-direct` | `chat/chat_positive.feature` | Y | - | Y | Y | Y |
| `chats.send-group` | `chat/chat_positive.feature` | Y | - | Y | Y | Y |
| `chats.list` | `chat/chat_positive.feature` | Y | - | Y | Y | Y |
| `chats.between` | `chat/chat_positive.feature` | Y | - | Y | Y | Y |
| `chats.mark-read` | `chat/chat_positive.feature` | Y | - | Y | Y | Y |
| `chats.unread-count` | `chat/chat_positive.feature` | Y | - | Y | Y | Y |
| `chats.conversations` | `chat/chat_positive.feature` | Y | - | Y | Y | Y |
| `presence.user` | `chat/chat_positive.feature` | Y | - | Y | Y | Y |
| `presence.friends` | `chat/chat_positive.feature` | Y | - | Y | Y | Y |
| `presence.batch` | `chat/chat_positive.feature` | Y | - | Y | Y | Y |
| `presence.heartbeat` | `chat/chat_positive.feature` | Y | - | Y | Y | Y |
| `presence.online` | `chat/chat_positive.feature` | Y | - | Y | Y | Y |

**Total endpoints cataloged: 12**


## Smoke execution (monolith :8080, 2026-07-27)

| Result | Notes |
| --- | --- |
| 2/2 PASS | Feature gated: list/presence endpoints return 404 (expected probe) |

## Known backend defects (out of test-authoring scope)

| Endpoint | Observed | Impact |
| --- | --- | --- |
| GET /api/config/features | **500** | Platform feature-flag config unavailable |
