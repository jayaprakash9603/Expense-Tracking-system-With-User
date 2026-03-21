# Audit rules (expense-tracker-mobile)

Run the **smart-validator** engine (`scripts/validate-rules.js`) to perform an automated rules audit of this app.

## Steps

1. Run `node scripts/validate-rules.js` from the `expense-tracker-mobile` root. If the user appended flags, pass them through (see below).
2. Capture the full terminal output.
3. Present the results to the user as a structured **Rules Audit Report** — group by severity (Critical → Major → Minor → Info), include file:line for every violation, and highlight the compliance score.
4. After the report, list the top 3 recommended fixes ordered by impact.

## Flags (parse from user suffixes)

| User suffix | Script flag |
|-------------|-------------|
| `--feature <name>` | `--feature <name>` — scope checks to `src/features/<name>/` only |
| `--category <name>` | `--category <name>` — run only one category: `architecture`, `components`, `clean-code`, `responsive`, `settings-theming`, `feature-flags`, `i18n` |
| `--json` | `--json` — output raw JSON instead of the formatted report |

### Examples

- `/audit-rules` → `node scripts/validate-rules.js`
- `/audit-rules --feature expenses` → `node scripts/validate-rules.js --feature expenses`
- `/audit-rules --category architecture` → `node scripts/validate-rules.js --category architecture`

## Reference

See `.cursor/skills/smart-validator.md` for the check table and `docs/validation/check-catalog.md` for full check details.
