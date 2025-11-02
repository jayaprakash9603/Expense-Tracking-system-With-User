# Date Formatter Migration Guide

## Summary

A centralized date formatting utility (`src/utils/dateFormatter.js`) has been created to handle all date formatting across the application. This utility:

- ✅ **Supports all current date formats** from user settings
- ✅ **Future-proof**: Automatically handles new date formats without code changes
- ✅ **Token-based system**: Uses configurable tokens (YYYY, MM, DD, etc.)
- ✅ **Comprehensive API**: Includes formatting, parsing, validation, and relative dates

## What Was Created

### 1. Core Utility File
**Location**: `src/utils/dateFormatter.js`

**Functions Available**:
- `formatDate(dateString, format)` - Main formatting function
- `formatDateTime(dateString, dateFormat, timeFormat)` - Date with time
- `parseDate(dateString, format)` - Parse formatted strings back to Date
- `formatRelativeDate(dateString, format)` - "Today", "Yesterday", etc.
- `getMonthName(monthIndex, locale, format)` - Localized month names
- `getDayName(dayIndex, locale, format)` - Localized day names
- `isValidDateFormat(dateString, format)` - Validate date strings
- `getDateSeparator(format)` - Extract separator from format
- `getFormatExample(format)` - Get format example

### 2. Documentation
**Location**: `src/utils/DATE_FORMATTER_README.md`

Complete documentation with:
- API reference for all functions
- Usage examples
- Best practices
- Migration guide
- Testing examples

## Files Already Updated

### ✅ BillReport.jsx
**Location**: `src/pages/Landingpage/BillReport.jsx`

**Changes Made**:
- Removed inline `formatDate` function (lines 31-48)
- Imported utility: `import { formatDate } from "../../utils/dateFormatter"`
- Now uses centralized utility with user settings

**Before**:
```javascript
const formatDate = (dateString, format = "DD/MM/YYYY") => {
  const date = new Date(dateString);
  // ... hardcoded logic
};
```

**After**:
```javascript
import { formatDate } from "../../utils/dateFormatter";
// Uses centralized utility with full support
```

## Files That Should Be Updated

Based on code analysis, the following files have inline date formatting that should use the utility:

### 1. BillAccordian.jsx
**Location**: `src/pages/Landingpage/Bills/BillAccordian.jsx`
**Line**: ~82-89

**Current Code**:
```javascript
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
```

**Recommended Update**:
```javascript
import { formatDate } from "../../../utils/dateFormatter";
import useUserSettings from "../../../hooks/useUserSettings";

// In component:
const settings = useUserSettings();

// Replace usage:
formatDate(bill.date, settings.dateFormat)
```

---

### 2. BillSummary.jsx
**Location**: `src/pages/Landingpage/Bills/BillSummary.jsx`
**Line**: ~19

**Current Code**:
```javascript
const formatMonth = (date) => {
  // Custom month formatting
};
```

**Recommended Update**:
```javascript
import { getMonthName } from "../../../utils/dateFormatter";
import useUserSettings from "../../../hooks/useUserSettings";

const settings = useUserSettings();
const monthName = getMonthName(monthIndex, settings.language);
```

---

### 3. Files Already Using Settings Date Format

These files already use `settings.dateFormat` but pass it to other components (good practice):

- ✅ `NewExpense.jsx` - Line 30, 454, 848
- ✅ `EditExpense.jsx` - Line 39, 429
- ✅ `CreateBill.jsx` - Line 41, 651, 939
- ✅ `DayUnifiedView.jsx` - Line 60, 512
- ✅ `PreviousExpenseIndicator.jsx` - Line 33, 284

These files are already following best practices by using the date format from settings. Consider importing the utility for consistency:

```javascript
import { formatDate } from "../../utils/dateFormatter";
// Instead of passing format string, use the utility directly
```

## Migration Instructions

### For Each File with Inline Date Formatting:

1. **Add Import**:
```javascript
import { formatDate } from "../../utils/dateFormatter"; // Adjust path as needed
import useUserSettings from "../../hooks/useUserSettings";
```

2. **Get Settings** (if not already present):
```javascript
const settings = useUserSettings();
```

3. **Remove Inline Function**:
Delete the local `formatDate` or similar function.

4. **Update Usage**:
```javascript
// Old:
<td>{formatDate(bill.date)}</td>

// New:
<td>{formatDate(bill.date, settings.dateFormat)}</td>
```

### For Components Receiving Format as Prop:

If a component already receives `dateFormat` as a prop, update to use the utility:

```javascript
// Component signature remains the same:
const MyComponent = ({ data, dateFormat = "DD/MM/YYYY" }) => {
  // Import utility at top of file
  import { formatDate } from "../../utils/dateFormatter";
  
  return (
    <div>
      {formatDate(data.date, dateFormat)}
    </div>
  );
};
```

## Benefits of Migration

### 1. **Consistency**
All date formatting uses the same logic across the application.

### 2. **Future-Proof**
New date formats added to settings automatically work everywhere.

### 3. **Maintainability**
One place to update date formatting logic.

### 4. **Type Safety**
Centralized validation and error handling.

### 5. **Feature-Rich**
Access to additional features like relative dates, parsing, validation.

## Adding New Date Formats

When adding new formats in the future:

### Step 1: Update Settings Config
**File**: `src/pages/Landingpage/Settings/constants/settingsConfig.js`

```javascript
export const DATE_FORMAT_OPTIONS = [
  { value: "MM/DD/YYYY", label: "📅 MM/DD/YYYY (US)" },
  { value: "DD/MM/YYYY", label: "📅 DD/MM/YYYY (UK/EU)" },
  { value: "YYYY-MM-DD", label: "📅 YYYY-MM-DD (ISO)" },
  // Add new format:
  { value: "DD.MM.YYYY", label: "📅 DD.MM.YYYY (German)" },
  { value: "DD-MMM-YYYY", label: "📅 DD-MMM-YYYY (31-Dec-2024)" },
];
```

### Step 2: Update Backend (if needed)
Update database constraints or validation rules.

### Step 3: That's It!
The utility automatically handles any format pattern. No code changes needed in components.

## Testing Checklist

After migration, verify:

- [ ] Dates display correctly in user's chosen format
- [ ] Date format changes in settings reflect immediately
- [ ] All date formats work (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)
- [ ] Invalid dates are handled gracefully
- [ ] Relative dates work ("Today", "Yesterday")
- [ ] Date parsing works for input validation
- [ ] Charts and tables show formatted dates
- [ ] Export/PDF functions use formatted dates

## Priority Files for Migration

### High Priority (User-Facing):
1. ✅ **BillReport.jsx** - COMPLETED
2. **BillAccordian.jsx** - Shows bill details
3. **BillSummary.jsx** - Summary views

### Medium Priority (Internal):
4. Any analytics/reporting components
5. Chart tooltip components
6. Export/download functionality

### Low Priority (Already Using Settings):
- Files already passing `dateFormat` from settings
- Components that receive format as prop

## Examples of Good Usage

### Example 1: Simple Table Cell
```javascript
import { formatDate } from "../../utils/dateFormatter";
import useUserSettings from "../../hooks/useUserSettings";

const BillsTable = ({ bills }) => {
  const settings = useUserSettings();
  
  return (
    <table>
      {bills.map(bill => (
        <tr key={bill.id}>
          <td>{formatDate(bill.date, settings.dateFormat)}</td>
        </tr>
      ))}
    </table>
  );
};
```

### Example 2: Chart Tooltip
```javascript
import { formatDate } from "../../utils/dateFormatter";
import useUserSettings from "../../hooks/useUserSettings";

const ChartComponent = () => {
  const settings = useUserSettings();
  
  const customTooltip = ({ active, payload }) => {
    if (active && payload) {
      return (
        <div>
          <p>Date: {formatDate(payload[0].payload.date, settings.dateFormat)}</p>
        </div>
      );
    }
  };
  
  return <ResponsiveContainer>...</ResponsiveContainer>;
};
```

### Example 3: Relative Dates in Activity Feed
```javascript
import { formatRelativeDate } from "../../utils/dateFormatter";
import useUserSettings from "../../hooks/useUserSettings";

const ActivityItem = ({ activity }) => {
  const settings = useUserSettings();
  
  return (
    <div>
      <span>{activity.description}</span>
      <span className="timestamp">
        {formatRelativeDate(activity.date, settings.dateFormat)}
      </span>
    </div>
  );
};
```

## Questions & Support

### Q: Do I need to update my component if it already uses dateFormat from settings?
**A**: If your component already receives `dateFormat` as a prop and formats correctly, you can optionally migrate to use the utility for consistency, but it's not urgent.

### Q: What if I need a custom date format not in settings?
**A**: The utility supports any format pattern. You can pass a custom format string directly:
```javascript
formatDate(date, "DD-MMM-YYYY") // Works even if not in settings
```

### Q: How do I handle timezone issues?
**A**: The utility works with JavaScript Date objects. Handle timezone conversion before passing to the utility:
```javascript
const localDate = new Date(utcDateString);
formatDate(localDate, settings.dateFormat);
```

### Q: Can I use this for date inputs/pickers?
**A**: Yes! Use `parseDate()` to convert user input back to Date objects:
```javascript
const userInput = "31/12/2024";
const dateObj = parseDate(userInput, settings.dateFormat);
```

---

## Status Summary

| File | Status | Priority | Notes |
|------|--------|----------|-------|
| BillReport.jsx | ✅ Completed | High | Migrated to utility |
| BillAccordian.jsx | ⏳ Pending | High | Has inline formatDate |
| BillSummary.jsx | ⏳ Pending | High | Has formatMonth function |
| NewExpense.jsx | ✅ Good | Medium | Already uses settings |
| EditExpense.jsx | ✅ Good | Medium | Already uses settings |
| CreateBill.jsx | ✅ Good | Medium | Already uses settings |
| DayUnifiedView.jsx | ✅ Good | Medium | Already uses settings |

---

**Next Steps**: 
1. Update BillAccordian.jsx to use the utility
2. Update BillSummary.jsx to use getMonthName()
3. Test all date displays with different formats
4. Update any other components as needed

---

*Migration Guide Created: December 2024*
*Utility Version: 1.0.0*
