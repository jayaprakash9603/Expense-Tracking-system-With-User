# DataTable Templates

Use `key | value` rows for generic API/UI steps.

## Generic API Request Table

| key | value |
| --- | --- |
| path.<name> | path parameter value |
| query.<name> | query parameter value |
| header.<name> | request header value |
| <payloadField> | request JSON field value |

## Generic UI Form Table

| key | value |
| --- | --- |
| email | `${suite.auth.username}` |
| password | `${suite.auth.password}` |

## Dynamic Values

- `${ctx.<alias>}` from scenario aliases (`save api response ... as alias ...`)
- `${suite.<key>}` from `config/suite-data*.properties`
- `${random.uuid}`, `${random.number:6}`, `${random.email}`
- `${now}`, `${now+1d:yyyy-MM-dd}`, `${now-2h:yyyy-MM-dd'T'HH:mm}`
