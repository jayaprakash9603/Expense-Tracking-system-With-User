# Date Formatter Utility - Documentation

## Overview

The `dateFormatter.js` utility provides a comprehensive set of functions for formatting, parsing, and manipulating dates according to user preferences. It supports dynamic format patterns from the settings configuration, making it future-proof for additional date formats.

## Location

```
src/utils/dateFormatter.js
```

## Features

- ✅ **Flexible Format Patterns**: Supports any date format pattern (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD, etc.)
- ✅ **Future-Proof**: Automatically handles new formats added to settings without code changes
- ✅ **Token-Based System**: Uses configurable tokens (YYYY, MM, DD, etc.) for dynamic formatting
- ✅ **Date Parsing**: Convert formatted date strings back to Date objects
- ✅ **Relative Dates**: Display dates as "Today", "Yesterday", "2 days ago", etc.
- ✅ **Localization Support**: Get localized month and day names
- ✅ **Validation**: Validate date strings against format patterns
- ✅ **Time Formatting**: Support for both 12-hour and 24-hour time formats

## Supported Format Tokens

| Token | Description | Example |
|-------|-------------|---------|
| YYYY | 4-digit year | 2024 |
| YY | 2-digit year | 24 |
| MM | 2-digit month (zero-padded) | 01, 12 |
| M | Month without zero-padding | 1, 12 |
| DD | 2-digit day (zero-padded) | 01, 31 |
| D | Day without zero-padding | 1, 31 |

## Current Supported Formats

As defined in `settingsConfig.js`:

- **MM/DD/YYYY** - US Format (12/31/2024)
- **DD/MM/YYYY** - UK/EU Format (31/12/2024)
- **YYYY-MM-DD** - ISO Format (2024-12-31)

## API Reference

### `formatDate(dateString, format)`

Format a date according to a specified pattern.

**Parameters:**
- `dateString` (string|Date): The date to format (ISO string or Date object)
- `format` (string): The format pattern (default: "DD/MM/YYYY")

**Returns:** `string` - Formatted date string

**Examples:**

```javascript
import { formatDate } from "../../utils/dateFormatter";

// Basic formatting
formatDate("2024-12-31", "DD/MM/YYYY");  // "31/12/2024"
formatDate("2024-12-31", "MM/DD/YYYY");  // "12/31/2024"
formatDate("2024-12-31", "YYYY-MM-DD");  // "2024-12-31"

// With Date object
formatDate(new Date(), "DD/MM/YYYY");    // Current date formatted

// Using settings
import useUserSettings from "../../hooks/useUserSettings";

const settings = useUserSettings();
const formattedDate = formatDate(bill.date, settings.dateFormat);
```

---

### `formatDateTime(dateString, dateFormat, timeFormat)`

Format a date with time according to specified patterns.

**Parameters:**
- `dateString` (string|Date): The date to format
- `dateFormat` (string): The date format pattern (default: "DD/MM/YYYY")
- `timeFormat` (string): "12h" or "24h" (default: "12h")

**Returns:** `string` - Formatted date and time string

**Examples:**

```javascript
import { formatDateTime } from "../../utils/dateFormatter";

formatDateTime("2024-12-31T15:30:00", "DD/MM/YYYY", "12h");  
// "31/12/2024 3:30 PM"

formatDateTime("2024-12-31T15:30:00", "MM/DD/YYYY", "24h");  
// "12/31/2024 15:30"

// Using settings
const settings = useUserSettings();
formatDateTime(
  bill.date, 
  settings.dateFormat, 
  settings.timeFormat
);
```

---

### `parseDate(dateString, format)`

Parse a formatted date string back to a Date object.

**Parameters:**
- `dateString` (string): The formatted date string
- `format` (string): The format pattern used (default: "DD/MM/YYYY")

**Returns:** `Date|null` - Date object or null if parsing fails

**Examples:**

```javascript
import { parseDate } from "../../utils/dateFormatter";

parseDate("31/12/2024", "DD/MM/YYYY");  // Date object for Dec 31, 2024
parseDate("12/31/2024", "MM/DD/YYYY");  // Date object for Dec 31, 2024
parseDate("2024-12-31", "YYYY-MM-DD");  // Date object for Dec 31, 2024

// Invalid date returns null
parseDate("invalid", "DD/MM/YYYY");     // null
```

---

### `formatRelativeDate(dateString, format)`

Format a date with relative terms when recent.

**Parameters:**
- `dateString` (string|Date): The date to format
- `format` (string): The format pattern for non-relative dates (default: "DD/MM/YYYY")

**Returns:** `string` - Formatted date with relative terms

**Examples:**

```javascript
import { formatRelativeDate } from "../../utils/dateFormatter";

formatRelativeDate(new Date(), "DD/MM/YYYY");           // "Today"
formatRelativeDate(yesterdayDate, "DD/MM/YYYY");        // "Yesterday"
formatRelativeDate(tomorrowDate, "DD/MM/YYYY");         // "Tomorrow"
formatRelativeDate(twoDaysAgo, "DD/MM/YYYY");          // "2 days ago"
formatRelativeDate(oldDate, "DD/MM/YYYY");             // "15/03/2024"
```

---

### `getMonthName(monthIndex, locale, format)`

Get a localized month name.

**Parameters:**
- `monthIndex` (number): Month index (0-11)
- `locale` (string): Locale code (default: "en")
- `format` (string): "long" or "short" (default: "long")

**Returns:** `string` - Month name

**Examples:**

```javascript
import { getMonthName } from "../../utils/dateFormatter";

getMonthName(0, "en", "long");   // "January"
getMonthName(0, "en", "short");  // "Jan"
getMonthName(11, "es", "long");  // "Diciembre"
```

---

### `getDayName(dayIndex, locale, format)`

Get a localized day name.

**Parameters:**
- `dayIndex` (number): Day index (0-6, Sunday=0)
- `locale` (string): Locale code (default: "en")
- `format` (string): "long" or "short" (default: "long")

**Returns:** `string` - Day name

**Examples:**

```javascript
import { getDayName } from "../../utils/dateFormatter";

getDayName(0, "en", "long");   // "Sunday"
getDayName(0, "en", "short");  // "Sun"
getDayName(1, "es", "long");   // "Lunes"
```

---

### `isValidDateFormat(dateString, format)`

Validate if a date string matches a given format.

**Parameters:**
- `dateString` (string): The date string to validate
- `format` (string): The expected format pattern (default: "DD/MM/YYYY")

**Returns:** `boolean` - True if valid, false otherwise

**Examples:**

```javascript
import { isValidDateFormat } from "../../utils/dateFormatter";

isValidDateFormat("31/12/2024", "DD/MM/YYYY");  // true
isValidDateFormat("12/31/2024", "DD/MM/YYYY");  // false
isValidDateFormat("2024-12-31", "YYYY-MM-DD");  // true
```

---

### `getDateSeparator(format)`

Extract the separator character from a format string.

**Parameters:**
- `format` (string): The format pattern (default: "DD/MM/YYYY")

**Returns:** `string` - The separator character

**Examples:**

```javascript
import { getDateSeparator } from "../../utils/dateFormatter";

getDateSeparator("DD/MM/YYYY");  // "/"
getDateSeparator("YYYY-MM-DD");  // "-"
getDateSeparator("DD.MM.YYYY");  // "."
```

---

### `getFormatExample(format)`

Get an example date in the given format.

**Parameters:**
- `format` (string): The format pattern (default: "DD/MM/YYYY")

**Returns:** `string` - Example date string

**Examples:**

```javascript
import { getFormatExample } from "../../utils/dateFormatter";

getFormatExample("DD/MM/YYYY");  // "31/12/2024"
getFormatExample("MM/DD/YYYY");  // "12/31/2024"
getFormatExample("YYYY-MM-DD");  // "2024-12-31"
```

---

## Usage in Components

### Example 1: Bill Report with User Settings

```javascript
import React from "react";
import { formatDate } from "../../utils/dateFormatter";
import useUserSettings from "../../hooks/useUserSettings";

const BillReport = () => {
  const settings = useUserSettings();
  const bills = [...]; // Your bills data

  return (
    <table>
      <tbody>
        {bills.map((bill) => (
          <tr key={bill.id}>
            <td>{formatDate(bill.date, settings.dateFormat)}</td>
            <td>{bill.name}</td>
            <td>{bill.amount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

---

### Example 2: Passing Format to Child Components

```javascript
import React from "react";
import { formatDate } from "../../utils/dateFormatter";
import useUserSettings from "../../hooks/useUserSettings";

const BillsTable = ({ bills, dateFormat = "DD/MM/YYYY" }) => (
  <table>
    <tbody>
      {bills.map((bill) => (
        <tr key={bill.id}>
          <td>{formatDate(bill.date, dateFormat)}</td>
          {/* Other columns */}
        </tr>
      ))}
    </tbody>
  </table>
);

const ParentComponent = () => {
  const settings = useUserSettings();
  const bills = [...];

  return (
    <BillsTable 
      bills={bills} 
      dateFormat={settings.dateFormat} 
    />
  );
};
```

---

### Example 3: Relative Dates in Activity Feed

```javascript
import React from "react";
import { formatRelativeDate } from "../../utils/dateFormatter";
import useUserSettings from "../../hooks/useUserSettings";

const ActivityFeed = ({ activities }) => {
  const settings = useUserSettings();

  return (
    <div>
      {activities.map((activity) => (
        <div key={activity.id}>
          <span>{activity.description}</span>
          <span className="timestamp">
            {formatRelativeDate(activity.date, settings.dateFormat)}
          </span>
        </div>
      ))}
    </div>
  );
};
```

---

### Example 4: Date Picker Integration

```javascript
import React, { useState } from "react";
import { formatDate, parseDate } from "../../utils/dateFormatter";
import useUserSettings from "../../hooks/useUserSettings";

const DateInput = ({ value, onChange }) => {
  const settings = useUserSettings();
  
  const handleChange = (e) => {
    const inputValue = e.target.value;
    const parsedDate = parseDate(inputValue, settings.dateFormat);
    if (parsedDate) {
      onChange(parsedDate);
    }
  };

  return (
    <input
      type="text"
      value={formatDate(value, settings.dateFormat)}
      onChange={handleChange}
      placeholder={settings.getDateFormatExample()}
    />
  );
};
```

---

## Adding New Date Formats

To add a new date format to the system:

1. **Update Settings Configuration** (`settingsConfig.js`):

```javascript
export const DATE_FORMAT_OPTIONS = [
  { value: "MM/DD/YYYY", label: "📅 MM/DD/YYYY (US)" },
  { value: "DD/MM/YYYY", label: "📅 DD/MM/YYYY (UK/EU)" },
  { value: "YYYY-MM-DD", label: "📅 YYYY-MM-DD (ISO)" },
  // Add new format here
  { value: "DD.MM.YYYY", label: "📅 DD.MM.YYYY (German)" },
  { value: "YYYY/MM/DD", label: "📅 YYYY/MM/DD (Japanese)" },
];
```

2. **Update Backend Validation** (if applicable):

Update the database constraint in your migration file to include the new format.

3. **Use the Utility** - No changes needed! The utility automatically handles any format pattern.

```javascript
// New formats work automatically
formatDate("2024-12-31", "DD.MM.YYYY");  // "31.12.2024"
formatDate("2024-12-31", "YYYY/MM/DD");  // "2024/12/31"
```

---

## Best Practices

### ✅ DO:

- **Always use the utility** for date formatting instead of hardcoding formats
- **Pass dateFormat from settings** to child components as props
- **Use relative dates** for recent activities (Today, Yesterday, etc.)
- **Validate dates** before processing user input
- **Handle null/invalid dates** gracefully

### ❌ DON'T:

- **Avoid hardcoding** date formats like `toLocaleDateString()`
- **Don't assume** the format - always get it from settings
- **Don't duplicate** date formatting logic across components
- **Don't forget** to handle timezone differences if needed

---

## Testing

```javascript
// Example test cases
import { formatDate, parseDate, isValidDateFormat } from "./dateFormatter";

describe("dateFormatter", () => {
  test("formats date in DD/MM/YYYY format", () => {
    expect(formatDate("2024-12-31", "DD/MM/YYYY")).toBe("31/12/2024");
  });

  test("formats date in MM/DD/YYYY format", () => {
    expect(formatDate("2024-12-31", "MM/DD/YYYY")).toBe("12/31/2024");
  });

  test("formats date in YYYY-MM-DD format", () => {
    expect(formatDate("2024-12-31", "YYYY-MM-DD")).toBe("2024-12-31");
  });

  test("parses formatted date correctly", () => {
    const date = parseDate("31/12/2024", "DD/MM/YYYY");
    expect(date.getFullYear()).toBe(2024);
    expect(date.getMonth()).toBe(11); // December is month 11
    expect(date.getDate()).toBe(31);
  });

  test("validates date format", () => {
    expect(isValidDateFormat("31/12/2024", "DD/MM/YYYY")).toBe(true);
    expect(isValidDateFormat("12/31/2024", "DD/MM/YYYY")).toBe(false);
  });
});
```

---

## Migration Guide

### Replacing Existing Date Formatting

**Before:**

```javascript
const formattedDate = new Date(bill.date).toLocaleDateString();
```

**After:**

```javascript
import { formatDate } from "../../utils/dateFormatter";
import useUserSettings from "../../hooks/useUserSettings";

const settings = useUserSettings();
const formattedDate = formatDate(bill.date, settings.dateFormat);
```

---

**Before (with inline function):**

```javascript
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};
```

**After:**

```javascript
import { formatDate } from "../../utils/dateFormatter";
// Use the utility directly with settings.dateFormat
```

---

## Related Files

- **Utility**: `src/utils/dateFormatter.js`
- **Hook**: `src/hooks/useUserSettings.js`
- **Configuration**: `src/pages/Landingpage/Settings/constants/settingsConfig.js`
- **Documentation**: `src/utils/DATE_FORMATTER_README.md`

---

## Support

For issues or questions about date formatting, please refer to:
1. This documentation
2. The inline JSDoc comments in `dateFormatter.js`
3. The user settings documentation in `useUserSettings.js`

---

## Changelog

### Version 1.0.0 (Current)
- Initial release with support for DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
- Token-based formatting system
- Date parsing and validation
- Relative date formatting
- Localization support
- DateTime formatting with 12h/24h time support

---

*Last Updated: December 2024*
