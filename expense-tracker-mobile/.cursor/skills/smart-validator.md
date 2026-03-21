# Smart Validator

Intelligent rule-aware validation engine for this codebase. Auto-discovers `.cursor/rules/*.mdc` and `docs/architecture/*.md`, then runs 14 automated checks covering architecture boundaries, feature folder contracts, component conventions, i18n compliance, responsive patterns, clean code, and more.

## Quick Start

```bash
npm run validate:rules                         # full validation
npm run validate:rules -- --json               # JSON output
npm run validate:rules -- --feature expenses   # scope to one feature
npm run validate:rules -- --category architecture  # scope to one category
```

## The 14 Checks

| # | Category | Check | Severity |
|---|----------|-------|----------|
| 1 | architecture | Feature folder contract (pages/, components/, hooks/) | Major |
| 2 | architecture | Import boundary validation (BOUNDARIES.md forbidden imports) | Critical |
| 3 | architecture | Cross-feature deep imports (prefer barrels) | Major |
| 4 | architecture | Undocumented top-level src/ directories | Minor |
| 5 | architecture | Deep relative imports (../../..) | Minor |
| 6 | components | Raw HTML elements in features | Major |
| 7 | components | Hard-coded hex colors in feature code | Minor |
| 8 | components | Component size limits (80 presentational / 120 page) | Minor-Major |
| 9 | clean-code | console.log / debugger statements | Major |
| 10 | clean-code | Hard-coded URLs in source | Minor |
| 11 | responsive | window.innerWidth in render path | Major |
| 12 | settings-theming | .toFixed() for money in JSX (bypasses masking) | Major |
| 13 | feature-flags | feature-matrix.yaml structure validation | Major |
| 14 | i18n | Hard-coded string literals in i18n-aware components | Minor |

## Scoring

```
score = 100 - (20 x Critical + 10 x Major + 3 x Minor + 1 x Info)
```

Exit code 1 when Critical violations exist (CI-friendly).

## Files

- `scripts/validate-rules.js` — the validation engine
- `docs/validation/check-catalog.md` — full check catalog with patterns and extension guide

## Extending

See `docs/validation/check-catalog.md` for how to add new checks.
