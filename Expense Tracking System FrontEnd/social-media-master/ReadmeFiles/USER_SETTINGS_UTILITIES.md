# User Settings Access - Utility Hook & Helper Class

## Overview

Centralized utilities for accessing and working with user settings across all components.

---

## 📦 Created Files

### 1. **`useUserSettings` Hook**

**Location:** `src/hooks/useUserSettings.js`

Custom React hook for accessing user settings in functional components.

### 2. **`UserSettingsHelper` Class**

**Location:** `src/utils/UserSettingsHelper.js`

Static utility class for formatting, validation, and conversion of settings data.

---

## 🎯 useUserSettings Hook

### Basic Usage

```javascript
import useUserSettings from "../hooks/useUserSettings";

function MyComponent() {
  const settings = useUserSettings();

  return (
    <div>
      <p>Language: {settings.language}</p>
      <p>Currency: {settings.currency}</p>
      <p>Theme: {settings.themeMode}</p>
    </div>
  );
}
```

### Available Properties

#### Direct Settings Access

```javascript
const settings = useUserSettings();

// Theme
settings.themeMode; // "dark" | "light"

// Notifications
settings.emailNotifications; // boolean
settings.budgetAlerts; // boolean
settings.weeklyReports; // boolean
settings.pushNotifications; // boolean
settings.friendRequestNotifications; // boolean

// Preferences
settings.language; // "en" | "es" | "fr" | "de" | "hi"
settings.currency; // "USD" | "EUR" | "GBP" | "INR" | "JPY"
settings.dateFormat; // "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD"

// Security
settings.profileVisibility; // "public" | "private"
settings.twoFactorEnabled; // boolean
```

#### Utility Properties

```javascript
settings.isLoading; // boolean - Loading state
settings.hasError; // boolean - Error state
settings.errorMessage; // string | null - Error message
settings.isLoaded; // boolean - Settings loaded successfully
```

#### Grouped Settings

```javascript
// Notifications group
settings.notifications.email; // emailNotifications
settings.notifications.budget; // budgetAlerts
settings.notifications.weekly; // weeklyReports
settings.notifications.push; // pushNotifications
settings.notifications.friendRequests; // friendRequestNotifications

// Preferences group
settings.preferences.language; // language
settings.preferences.currency; // currency
settings.preferences.dateFormat; // dateFormat
settings.preferences.theme; // themeMode

// Security group
settings.security.profileVisibility; // profileVisibility
settings.security.twoFactorEnabled; // twoFactorEnabled
```

#### Helper Methods

```javascript
// Get currency with symbol
const { code, symbol } = settings.getCurrency();
// Returns: { code: "USD", symbol: "$" }

// Get language name
const langName = settings.getLanguageName();
// Returns: "English"

// Theme helpers
const isDark = settings.isDarkMode(); // boolean
const isLight = settings.isLightMode(); // boolean

// Check if any notifications enabled
const hasNotifs = settings.hasNotificationsEnabled(); // boolean

// Get date format example
const example = settings.getDateFormatExample();
// Returns: "12/31/2024"
```

### Complete Example

```javascript
import useUserSettings from "../hooks/useUserSettings";

function ExpenseList() {
  const settings = useUserSettings();

  // Show loading state
  if (settings.isLoading) {
    return <Loader />;
  }

  // Show error state
  if (settings.hasError) {
    return <ErrorMessage message={settings.errorMessage} />;
  }

  // Use currency symbol
  const { symbol } = settings.getCurrency();

  return (
    <div className={settings.isDarkMode() ? "dark" : "light"}>
      <h2>Expenses in {symbol}</h2>

      {/* Use date format preference */}
      <p>Format: {settings.dateFormat}</p>

      {/* Show notification badge if enabled */}
      {settings.notifications.budget && <BudgetAlertBadge />}

      {/* List items with currency */}
      <ul>
        <li>Groceries: {symbol}123.45</li>
        <li>Transport: {symbol}45.00</li>
      </ul>
    </div>
  );
}
```

---

## 🛠️ UserSettingsHelper Class

### Basic Usage

```javascript
import UserSettingsHelper from "../utils/UserSettingsHelper";

// Format currency
const formatted = UserSettingsHelper.formatCurrency(1234.56, "USD");
// Returns: "$1,234.56"

// Get currency symbol
const symbol = UserSettingsHelper.getCurrencySymbol("EUR");
// Returns: "€"

// Format date
const date = UserSettingsHelper.formatDate(new Date(), "DD/MM/YYYY");
// Returns: "31/12/2024"
```

### Static Methods

#### Currency Operations

```javascript
// Get symbol
UserSettingsHelper.getCurrencySymbol("USD");
// Returns: "$"

// Get name
UserSettingsHelper.getCurrencyName("EUR");
// Returns: "Euro"

// Format amount
UserSettingsHelper.formatCurrency(1234.56, "GBP");
// Returns: "£1,234.56"

// Get all currencies
UserSettingsHelper.getAllCurrencies();
// Returns: [{ code: "USD", symbol: "$", name: "US Dollar" }, ...]
```

#### Language Operations

```javascript
// Get language name
UserSettingsHelper.getLanguageName("es");
// Returns: "Spanish"

// Get native name
UserSettingsHelper.getLanguageNativeName("es");
// Returns: "Español"

// Get all languages
UserSettingsHelper.getAllLanguages();
// Returns: [{ code: "en", name: "English", nativeName: "English" }, ...]
```

#### Date Operations

```javascript
// Format date
UserSettingsHelper.formatDate(new Date(), "MM/DD/YYYY");
// Returns: "12/31/2024"

// Get format example
UserSettingsHelper.getDateFormatExample("DD/MM/YYYY");
// Returns: "31/12/2024"

// Get all formats
UserSettingsHelper.getAllDateFormats();
// Returns: [{ format: "MM/DD/YYYY", example: "12/31/2024" }, ...]
```

#### Settings Operations

```javascript
// Validate settings
const validation = UserSettingsHelper.validateSettings({
  themeMode: "dark",
  currency: "USD",
  language: "en",
});
// Returns: { valid: true, errors: [] }

// Merge with defaults
const merged = UserSettingsHelper.mergeWithDefaults({ themeMode: "light" });
// Returns: { themeMode: "light", emailNotifications: true, ... }

// Check notifications enabled
UserSettingsHelper.hasNotificationsEnabled(settings);
// Returns: boolean

// Get notification summary
UserSettingsHelper.getNotificationSummary(settings);
// Returns: { total: 5, enabled: 3, details: {...} }

// Convert to API format
const apiData = UserSettingsHelper.toApiFormat(settings);
// Returns: API-ready settings object

// Compare settings
const changes = UserSettingsHelper.getChangedFields(oldSettings, newSettings);
// Returns: { themeMode: { old: "dark", new: "light" } }
```

### Configuration Objects

```javascript
// Currency config
UserSettingsHelper.CURRENCY_CONFIG;
// { USD: { symbol: "$", name: "US Dollar", code: "USD" }, ... }

// Language config
UserSettingsHelper.LANGUAGE_CONFIG;
// { en: { name: "English", nativeName: "English", code: "en" }, ... }

// Date format config
UserSettingsHelper.DATE_FORMAT_CONFIG;
// { "MM/DD/YYYY": { example: "12/31/2024", format: "MM/DD/YYYY" }, ... }

// Default settings
UserSettingsHelper.DEFAULT_SETTINGS;
// { themeMode: "dark", emailNotifications: true, ... }
```

---

## 📋 Usage Examples

### Example 1: Display Currency in Component

```javascript
import useUserSettings from "../hooks/useUserSettings";
import UserSettingsHelper from "../utils/UserSettingsHelper";

function ExpenseCard({ amount }) {
  const settings = useUserSettings();

  // Get formatted currency
  const formatted = UserSettingsHelper.formatCurrency(
    amount,
    settings.currency
  );

  return <div className="expense-amount">{formatted}</div>;
}
```

### Example 2: Format Dates

```javascript
import useUserSettings from "../hooks/useUserSettings";
import UserSettingsHelper from "../utils/UserSettingsHelper";

function TransactionList({ transactions }) {
  const settings = useUserSettings();

  return (
    <ul>
      {transactions.map((tx) => (
        <li key={tx.id}>
          {UserSettingsHelper.formatDate(tx.date, settings.dateFormat)}- {UserSettingsHelper.formatCurrency(tx.amount, settings.currency)}
        </li>
      ))}
    </ul>
  );
}
```

### Example 3: Conditional Rendering Based on Settings

```javascript
import useUserSettings from "../hooks/useUserSettings";

function NotificationCenter() {
  const settings = useUserSettings();

  if (!settings.hasNotificationsEnabled()) {
    return <p>Notifications are disabled</p>;
  }

  return (
    <div>
      {settings.notifications.email && <EmailNotifications />}
      {settings.notifications.push && <PushNotifications />}
      {settings.notifications.budget && <BudgetAlerts />}
    </div>
  );
}
```

### Example 4: Settings Validation

```javascript
import UserSettingsHelper from "../utils/UserSettingsHelper";

function SettingsForm({ values, onSubmit }) {
  const handleSubmit = () => {
    const validation = UserSettingsHelper.validateSettings(values);

    if (!validation.valid) {
      alert(validation.errors.join("\n"));
      return;
    }

    onSubmit(values);
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
}
```

### Example 5: Theme-Aware Component

```javascript
import useUserSettings from "../hooks/useUserSettings";

function ThemedCard({ children }) {
  const settings = useUserSettings();

  const cardStyle = {
    backgroundColor: settings.isDarkMode() ? "#1b1b1b" : "#ffffff",
    color: settings.isDarkMode() ? "#ffffff" : "#000000",
  };

  return <div style={cardStyle}>{children}</div>;
}
```

### Example 6: Language Display

```javascript
import useUserSettings from "../hooks/useUserSettings";
import UserSettingsHelper from "../utils/UserSettingsHelper";

function LanguageSelector() {
  const settings = useUserSettings();
  const languages = UserSettingsHelper.getAllLanguages();

  return (
    <select value={settings.language}>
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name} ({lang.nativeName})
        </option>
      ))}
    </select>
  );
}
```

---

## 🔄 Integration with Existing Components

### Update HeaderBar

```javascript
import useUserSettings from "../../hooks/useUserSettings";

const HeaderBar = () => {
  const settings = useUserSettings();

  // Use theme from settings
  const isDark = settings.isDarkMode();

  // Rest of component...
};
```

### Update Settings Page

```javascript
import useUserSettings from "../../hooks/useUserSettings";
import UserSettingsHelper from "../../utils/UserSettingsHelper";

const Settings = () => {
  const settings = useUserSettings();

  // Pre-populate form with current settings
  const [formData, setFormData] = useState(settings);

  // Validate before saving
  const handleSave = () => {
    const validation = UserSettingsHelper.validateSettings(formData);
    if (validation.valid) {
      dispatch(updateUserSettings(formData));
    }
  };

  // Rest of component...
};
```

### Update Any Component Needing Currency

```javascript
import useUserSettings from "../hooks/useUserSettings";
import UserSettingsHelper from "../utils/UserSettingsHelper";

const BudgetCard = ({ budget }) => {
  const settings = useUserSettings();

  return (
    <div>
      <h3>{budget.name}</h3>
      <p>
        Limit:{" "}
        {UserSettingsHelper.formatCurrency(budget.limit, settings.currency)}
      </p>
      <p>
        Spent:{" "}
        {UserSettingsHelper.formatCurrency(budget.spent, settings.currency)}
      </p>
    </div>
  );
};
```

---

## ✅ Benefits

### For Developers

1. **Single Source of Truth** - All settings accessed through one hook
2. **Type Safety** - Clear property names and return types
3. **Default Values** - Never deal with undefined settings
4. **Helper Methods** - Common operations built-in
5. **Validation** - Built-in validation for settings
6. **Formatting** - Currency, date, language formatting ready

### For Users

1. **Consistency** - All components respect user preferences
2. **Personalization** - Theme, language, currency reflected everywhere
3. **Better UX** - Settings applied across entire app
4. **Performance** - Centralized access, no redundant queries

---

## 🧪 Testing

### Test Hook

```javascript
import { renderHook } from "@testing-library/react-hooks";
import useUserSettings from "../hooks/useUserSettings";

test("should return default settings", () => {
  const { result } = renderHook(() => useUserSettings());

  expect(result.current.themeMode).toBe("dark");
  expect(result.current.currency).toBe("USD");
  expect(result.current.language).toBe("en");
});
```

### Test Helper Class

```javascript
import UserSettingsHelper from "../utils/UserSettingsHelper";

test("should format currency correctly", () => {
  const formatted = UserSettingsHelper.formatCurrency(1234.56, "USD");
  expect(formatted).toBe("$1,234.56");
});

test("should validate settings", () => {
  const validation = UserSettingsHelper.validateSettings({
    themeMode: "invalid",
  });
  expect(validation.valid).toBe(false);
  expect(validation.errors.length).toBeGreaterThan(0);
});
```

---

## 📚 Summary

### Files Created

1. ✅ `src/hooks/useUserSettings.js` - React hook for components
2. ✅ `src/utils/UserSettingsHelper.js` - Utility class for operations

### Key Features

- 🎯 **Centralized Access** - One place for all settings
- 🔧 **Helper Methods** - Currency, date, language formatting
- ✅ **Validation** - Built-in settings validation
- 🎨 **Grouped Properties** - Logical grouping of settings
- 📊 **Default Values** - Safe fallbacks for all properties
- 🚀 **Easy Integration** - Simple to use in any component

### Usage Summary

```javascript
// In any component - Use the Hook
import useUserSettings from "../hooks/useUserSettings";
const settings = useUserSettings();

// For utility operations - Use the Helper Class
import UserSettingsHelper from "../utils/UserSettingsHelper";
const formatted = UserSettingsHelper.formatCurrency(amount, currency);
```

Now you can access user settings consistently across all components! 🎉
