# Generic Dual-Engine UI Steps

These Cucumber steps work with both **Selenium** and **Playwright**. Engine selection is controlled by `AUTOMATION_ENGINE` (see `UiEngineFactory`).

## Step catalogue (42 steps)

### Navigation (6)

| Step | Example |
|------|---------|
| `When I navigate to URL {string} for scenario ID {string}` | `When I navigate to URL "/login" for scenario ID "S1"` |
| `When I navigate to URL {string} with page title {string} for scenario ID {string}` | Title checked after navigation |
| `When I reload page for scenario ID {string}` | |
| `When I navigate back for scenario ID {string}` | |
| `When I navigate forward for scenario ID {string}` | |
| `When I wait for page to be fully loaded for scenario ID {string}` | document.readyState + network idle |

### Interaction (6)

| Step | Example |
|------|---------|
| `When I click button {string} for scenario ID {string}` | `When I click button "Login" for scenario ID "S1"` |
| `When I click link {string} for scenario ID {string}` | Sidebar nav, anchors |
| `When I click element with selector {string} for scenario ID {string}` | `#amount`, `input[name='email']` |
| `When I click element with selector {string} in frame {string} for scenario ID {string}` | iframe-scoped click |
| `When I double-click element with selector {string} for scenario ID {string}` | |
| `When I press key {string} on element {string} for scenario ID {string}` | `TAB`, `ENTER`, `ESC` |

### Forms (16)

| Step | Notes |
|------|-------|
| `When I fill text field {string} with value {string} for scenario ID {string}` | Semantic label or registry key |
| `When I fill text field with name {string} with value {string} for scenario ID {string}` | `input[name=...]` |
| `When I fill text field with selector {string} with value {string} for scenario ID {string}` | Raw selector |
| `When I fill textarea {string} with value {string} for scenario ID {string}` | |
| `When I select option {string} from dropdown {string} for scenario ID {string}` | MUI Select / Autocomplete |
| `When I select option {string} from select box with name {string} for scenario ID {string}` | Native `<select>` or named field |
| `When I select radio button {string} with value {string} for scenario ID {string}` | `name` + `value` |
| `When I check checkbox {string} for scenario ID {string}` | |
| `When I check checkbox {string} for scenario ID {string} under iFrame {string}` | |
| `When I uncheck checkbox {string} for scenario ID {string}` | |
| `When I uncheck checkbox {string} for scenario ID {string} under iFrame {string}` | |
| `When I populate form fields for scenario ID {string}:` | DataTable of key/value pairs |
| `When I select date {string} in calendar with icon {string} for scenario ID {string}` | MUI DatePicker or native date |
| `When I select date {string} in calendar with icon {string} in frame {string} for scenario ID {string}` | |
| `When I select today in calendar with icon {string} for scenario ID {string}` | |
| `When I clear calendar selection with icon {string} for scenario ID {string}` | |

### Assertions (14)

| Step | Notes |
|------|-------|
| `Then I verify page title contains {string} for scenario ID {string}` | |
| `Then I verify page title is exactly {string} for scenario ID {string}` | |
| `Then I verify page URL contains {string} for scenario ID {string}` | |
| `Then I verify page URL is exactly {string} for scenario ID {string}` | |
| `Then I verify element {string} is visible for scenario ID {string}` | |
| `Then I verify element {string} is visible for scenario ID {string} under iFrame {string}` | |
| `Then I verify element {string} is visible in frame {string} for scenario ID {string}` | Alias of under iFrame |
| `Then I verify element {string} is visible within {double} milliseconds for scenario ID {string}` | Timed wait |
| `Then I verify element {string} exists for scenario ID {string}` | DOM presence |
| `Then I verify element {string} has exact text {string} for scenario ID {string}` | |
| `Then I verify element {string} has exact text {string} for scenario ID {string} under iFrame {string}` | |
| `Then I verify element {string} contains text {string} for scenario ID {string}` | |
| `Then I verify element {string} contains text {string} for scenario ID {string} under iFrame {string}` | |
| `Then I verify text {string} is present in element {string} for scenario ID {string}` | |

## Locator resolution

Each `{string}` argument for elements/buttons/fields is resolved as:

1. **Raw selector** if it looks like CSS/XPath (`#id`, `.class`, `[attr]`, `//xpath`, `css=`, `xpath=`, etc.)
2. **Semantic label** otherwise — tries `UiActionRegistry` keys first, then role-specific fallbacks:
   - **Buttons**: `data-testid`, button text, `aria-label`, `title`, `role=button`
   - **Links**: anchor text, `href`, `#nav-item-*`, `data-shortcut`
   - **Fields**: `input[name]`, `#id`, placeholder, label association
   - **Text**: visible text XPath

Frontend-specific locators are seeded from `expense-tracking-frontend` (MUI 6, Formik `name` attributes, `#nav-item-*` sidebar ids).

## Architecture

```
Feature → Generic*Steps → BddWorld.genericUiActions()
       → GenericLocatorResolver + UiActionRegistry
       → UiEngine (Selenium | Playwright)
```

Implementation classes:

- Steps: `automation-bdd/.../steps/ui/generic/`
- Actions: `automation-ui-flows/.../service/GenericUiActions.java`
- Core: `automation-core/.../ui/`

## Running

```bash
# Selenium
mvn -pl Automation-Framework/automation-bdd test -DAUTOMATION_ENGINE=selenium -Dcucumber.filter.tags="@generic"

# Playwright
mvn -pl Automation-Framework/automation-bdd test -DAUTOMATION_ENGINE=playwright -Dcucumber.filter.tags="@generic"
```

Template feature: `test-suites/.../templates/generic-steps-template.feature`
