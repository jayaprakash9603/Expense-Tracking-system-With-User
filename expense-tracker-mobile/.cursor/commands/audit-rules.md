# Audit rules (expense-tracker-mobile)

Execute the **Audit Persona** orchestrator (`.cursor/rules/audit-persona.mdc`) to run a phased validation pipeline against every rule and architecture contract in this codebase.

## Execution Flow

1. **Read the persona** — load `.cursor/rules/audit-persona.mdc` and follow it as your operating protocol.
2. **Execute all phases in order** — Phase 0 through Phase 4 as defined in the persona. Never skip a phase unless the user passes `--phase <N>` or `--skip-skills`.
3. **Report as you go** — print the phase result after each phase completes before starting the next.
4. **End with the summary** — print the execution report template from the persona.

## Flags (parse from user suffixes)

| User suffix | Passed to |
|-------------|-----------|
| `--feature <name>` | All phases — scope to `src/features/<name>/` only |
| `--category <name>` | Phase 1 script (`node scripts/validate-rules.js --category <name>`) and Phase 2 skill selection |
| `--phase <N>` | Run only phase N (0-4) |
| `--fix` | After Phase 4, auto-apply all auto-fixable items |
| `--skip-skills` | Skip Phase 2 (automated checks only) |
| `--json` | Pass `--json` to scripts; output all results as JSON |

### Examples

- `/audit-rules` — full pipeline, all phases
- `/audit-rules --feature expenses` — audit only the expenses feature
- `/audit-rules --phase 1` — run only automated validation
- `/audit-rules --skip-skills` — phases 0, 1, 3, 4 (no deep skill analysis)
- `/audit-rules --fix` — full pipeline + auto-fix at the end

## Reference

- Persona: `.cursor/rules/audit-persona.mdc`
- Smart Validator skill: `.cursor/skills/smart-validator.md`
- Check catalog: `docs/validation/check-catalog.md`
- Architecture contracts: `docs/architecture/*.md`
