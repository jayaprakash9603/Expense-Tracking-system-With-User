# `src/shared`

Cross-feature UI, forms, theme, and static data used by multiple routes.

## Layout

| Path | Purpose |
|------|---------|
| [`ui/feedback/`](ui/feedback/) | Toasts and non-blocking notices (`ToastNotification`) |
| [`ui/overlays/`](ui/overlays/) | Blocking dialogs (`Modal`) |
| [`ui/pickers/`](ui/pickers/) | Emoji selection (`EmojiPicker`) |
| [`ui/display/`](ui/display/) | Small presentational widgets (`UserAvatar`) |
| [`form/hooks/`](form/hooks/) | `useFormPage`, `useFormState`, `useToast` |
| [`form/components/`](form/components/) | Form shell, rows, fields, submit |
| [`form/fields/`](form/fields/) | Themed MUI field wrappers |
| [`entity-form/components/`](entity-form/components/) | Category / payment-method style entity editor |
| [`entity-form/index.js`](entity-form/index.js) | Barrel exports for pickers and layout |
| [`theme/`](theme/) | `createAppTheme`, palette wiring |
| [`layout/`](layout/) | App shell entry points (e.g. `HomeShell`) |
| [`constants/emoji/`](constants/emoji/) | Emoji category map for pickers |
| [`constants/avatar/`](constants/avatar/) | Avatar emoji categories |

## Imports

Use paths relative to `src`, for example:

- `../shared/ui/feedback/ToastNotification`
- `../shared/form/hooks/useFormPage`
- `../shared/constants/avatar/avatarCategories`

Prefer these structured paths over legacy `shared/components/*` locations (removed).
