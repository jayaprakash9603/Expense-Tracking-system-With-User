# Intentional hardcoded colors (theme refactor)

These values are **not** driven by MUI `palette` tokens on purpose.

| Area | Reason |
|------|--------|
| Auth branding (Expensio logo, Playfair typography, teal glows) | Fixed brand expression on login/register |
| `config/colorPalettes.js` accent presets | Source definitions for palette picker |
| `config/financeColorTokens.js` | Calendar heatmap income/spending (WCAG-tuned per mode) |
| Chart series in Recharts where not yet wired to `palette.custom.chart` | Data viz contrast; migrate incrementally |
| Icon CSS `filter` strings in `colorPalettes.iconFilter` | Raster/icon tinting technique |
| QR codes, logos, marketing images | Non-theme assets |
| Third-party embeds (Google OAuth button styling) | External brand guidelines |

All other UI should consume `theme.palette`, `sx` semantic strings (`text.primary`, `background.paper`, etc.), or `--color-*` variables injected from `buildAppTheme`.
