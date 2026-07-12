# Check Catalog — Smart Validator

Complete reference for all 14 automated checks run by `scripts/validate-rules.js`.
Each entry includes the detection pattern, severity rationale, and extension guidance.

---

## Category: `architecture`

### Check 1 — Feature Folder Contract

**Source rule:** `architecture.mdc` — "Feature folder contract"
**What it checks:** Every directory under `src/features/*/` must contain `pages/`, `components/`, and `hooks/` subdirectories.
**Detection:** Directory existence check.
**Severity:** Major — missing subdirectories indicate incomplete feature structure.
**Naming:** Also flags non-kebab-case feature folder names (Minor).

### Check 2 — Import Boundary Validation

**Source rule:** `BOUNDARIES.md` — "Forbidden Imports"
**What it checks:** Layer dependency direction. Reproduces and extends `scripts/validate-architecture.js`.
**Detection:** Regex on `from "@/<layer>/"` imports, cross-referenced against the forbidden map:
- `domain` must not import: features, app, layouts
- `infrastructure` must not import: features, app, layouts, redux
- `shared` must not import: features, domain, app, layouts, redux
- `components` must not import: features, domain, redux

**Severity:** Critical — boundary violations break layered architecture.
**Exemptions:** Reads `TEMP_EXEMPTIONS` from `scripts/validate-architecture.js` and skips those files.

### Check 3 — Cross-Feature Deep Imports

**Source rule:** `BOUNDARIES.md` — "Import Path Rules"
**What it checks:** When feature A imports from feature B, it should go through a barrel (`index.js`), not deep internal paths like `@/features/B/components/SomeInternal`.
**Detection:** Regex `from "@/features/<other>/<deep-path>"` where the import contains 2+ path segments after the feature name.
**Severity:** Major — deep cross-feature coupling makes refactoring dangerous.
**Self-imports excluded:** A feature importing its own internals is fine.

### Check 4 — Undocumented Top-Level src/ Directories

**Source rule:** `architecture.mdc` — "New top-level src/ directories"
**What it checks:** Known set: app, assets, components, config, domain, features, i18n, infrastructure, layouts, lib, redux, shared, styles. Extra: test (accepted). Anything else flagged.
**Severity:** Minor — undocumented roots may indicate architectural drift.

### Check 5 — Deep Relative Imports

**Source rule:** `architecture.mdc` — "Imports"
**What it checks:** Import paths with 3+ levels of `../` traversal.
**Detection:** Regex `from ["']\.\./\.\./\.\.`
**Severity:** Minor — prefer `@/` alias for readability.

---

## Category: `components`

### Check 6 — Raw HTML Elements in Features

**Source rule:** `components.mdc` — "shadcn-first"
**What it checks:** Raw `<button>`, `<select>`, and `type="date"` inputs in `src/features/**/*.jsx`.
**Detection:** Regex `<button[\s>]`, `<select[\s>]`, `type=["']date["']`.
**Severity:** Major — bypasses design system consistency.
**Note:** Allowed in `src/components/ui/` (shadcn primitives layer).

### Check 7 — Hard-coded Hex Colors

**Source rule:** `components.mdc` — "Theme"
**What it checks:** CSS `color`, `fill`, `stroke`, `background` properties with inline `#hex` values in feature files.
**Detection:** Regex `(color|fill|stroke|background)\s*[:=]\s*["']#[0-9a-fA-F]{3,8}["']`.
**Severity:** Minor — chart config maps that use CSS variables are acceptable.
**Exemptions:** Google brand SVG colors (#4285F4, #34A853, #FBBC05, #EA4335) are auto-excluded.

### Check 8 — Component Size Limits

**Source rule:** `components.mdc` — "Size and composition"
**What it checks:** File line counts. Pages target ~120 lines, presentational components target ~80 lines.
**Detection:** Line count. Files over 1.5x the limit get Major; over 1.0x get Minor.
**Severity:** Minor or Major depending on how far over.

---

## Category: `clean-code`

### Check 9 — console.log / debugger

**Source rule:** Global coding standards
**What it checks:** `console.log` and `debugger` statements anywhere in `src/`.
**Detection:** Regex `\bconsole\.log\b`, `\bdebugger\b`.
**Severity:** Major — must be removed before committing.
**Also checks:** `// TODO`, `// FIXME`, `// HACK` comments (Minor).

### Check 10 — Hard-coded URLs

**Source rule:** Global coding standards — "no hard-coded URLs/ports/secrets"
**What it checks:** String literals matching `https?://` in source files.
**Detection:** Regex `["'](https?://[^"']+)["']`.
**Severity:** Minor.
**Exemptions:** `http://www.w3.org` (XML namespace), localhost URLs in config/ directory.

---

## Category: `responsive`

### Check 11 — window.innerWidth in Render

**Source rule:** `responsive.mdc` — "Avoid window.innerWidth"
**What it checks:** Direct `window.innerWidth` access in `.jsx` files.
**Detection:** Regex `window\.innerWidth`.
**Severity:** Major — doesn't react to resize events, causes SSR issues.
**Fix:** Use `useIsMobile()`, `useMediaQuery()`, or `useLayout()` hooks.

---

## Category: `settings-theming`

### Check 12 — Money Formatting

**Source rule:** `settings-and-theming.mdc` — "Masking"
**What it checks:** `.toFixed()` calls in JSX component files under `src/features/`.
**Detection:** Regex `\.toFixed\(\s*\d+\s*\)` in `.jsx` files.
**Severity:** Major — bypasses `useMoneyFormatter` which handles masking and currency.
**Note:** `.toFixed()` in utility/transform files (.js) is acceptable for data processing.

---

## Category: `feature-flags`

### Check 13 — Feature Matrix Structure

**Source rule:** `feature-flags.mdc`
**What it checks:** `src/config/runtime/feature-matrix.yaml` must contain `defaults:`, `profiles:`, `profiles.live:`, and `profiles.demo:`.
**Detection:** String presence check in YAML content.
**Severity:** Major — missing profiles break runtime configuration.

---

## Category: `i18n`

### Check 14 — Hard-coded String Literals

**Source rule:** `i18n.mdc` — "no user-visible English"
**What it checks:** JSX attribute values (`label`, `placeholder`, `title`, `aria-label`) containing capitalized English text in files that already use `useLanguage`.
**Detection:** Regex `(label|placeholder|title|aria-label)=["']([A-Z][a-zA-Z ]{3,})["']` in files importing `useLanguage`.
**Severity:** Minor — heuristic may have false positives.
**Triage:** Lines containing `{t(` are auto-excluded.

---

## Extending the Catalog

To add a new check:

1. Define the check function in `scripts/validate-rules.js`
2. Add an entry to the `checks` array in `main()` with the appropriate category
3. Document it in this file following the template above
4. Test with `--category <your-category>` to isolate

### Template for a new check

```js
function checkMyRule() {
  const files = walkFiles(SRC, [".jsx"]);
  for (const filePath of files) {
    const source = readSafe(filePath);
    if (!source) continue;
    const regex = /my-pattern/g;
    let m;
    while ((m = regex.exec(source))) {
      addViolation(SEVERITY.MINOR, "my-category", "source-rule.mdc — rule-name",
        filePath, lineNumber(source, m.index),
        "Description of what was found",
        "How to fix it");
    }
  }
}
```

Then register `{ category: "my-category", fn: checkMyRule }` in the checks array.
