# Jump to Today Feature Implementation

## Overview

Implemented a flexible "Jump to Today" button that allows users to quickly navigate back to the current date/month across all calendar and day view components. The button is now positioned at the top-right corner with enhanced flexibility and configurability.

## Components Created

### 1. **JumpToTodayButton.jsx** (Enhanced Reusable Component)

**Location:** `src/components/JumpToTodayButton.jsx`

**Features:**

- ✅ Fully flexible and configurable from parent components
- ✅ Positioned at top-right corner (default: 16px from top, 70px from right)
- ✅ Visibility control (show/hide based on conditions)
- ✅ Multiple positioning modes (absolute, fixed, relative)
- ✅ Custom position override capability
- ✅ Custom styling support
- ✅ Adjustable z-index
- ✅ Material-UI TodayIcon with responsive sizing
- ✅ Smooth hover animations
- ✅ Disabled state when viewing today
- ✅ Tooltip with proper positioning (left side, 8px offset)

**Props:**

| Prop             | Type     | Default                  | Description                                      |
| ---------------- | -------- | ------------------------ | ------------------------------------------------ |
| `onClick`        | function | required                 | Callback when button clicked                     |
| `isToday`        | boolean  | `false`                  | Disables button if viewing today                 |
| `visible`        | boolean  | `true`                   | Show/hide the button                             |
| `position`       | string   | `'absolute'`             | CSS position: 'absolute', 'fixed', or 'relative' |
| `customPosition` | object   | `{ top: 16, right: 70 }` | Custom positioning values                        |
| `tooltipText`    | string   | auto                     | Custom tooltip text                              |
| `customStyles`   | object   | `{}`                     | Additional custom MUI styles                     |
| `zIndex`         | number   | `20`                     | Z-index for layering                             |

**Styling:**

- **Position**: Top-right (16px from top, 70px from right edge)
- **Size**: 48x48 pixels (optimized for visibility)
- **Active Color**: Cyan (#00dac6)
- **Disabled Color**: Dark gray (#2a2a2a)
- **Icon Size**: 24px
- **Shadow**: Subtle elevation (boxShadow: 1-3)
- **Hover**: 5% scale increase with color transition

## Updated Components

### 2. **CalendarView.jsx**

**Changes:**

- ✅ Button positioned at top-right (absolute positioning)
- ✅ Position: `{ top: 16, right: 70 }`
- ✅ Z-index: 20 (above content, below modals)
- ✅ Visibility: Always visible (`visible={true}`)
- ✅ Integrated with month navigation logic

**Usage:**

```jsx
<JumpToTodayButton
  onClick={handleJumpToToday}
  isToday={isViewingCurrentMonth}
  visible={true}
  position="absolute"
  customPosition={{ top: 16, right: 70 }}
  tooltipText={
    isViewingCurrentMonth
      ? "Already viewing current month"
      : "Jump to current month"
  }
  zIndex={20}
/>
```

### 3. **BillCalendarView.jsx**

**Changes:**

- ✅ Identical positioning and configuration as CalendarView
- ✅ Top-right corner placement
- ✅ Works with bill calendar navigation

### 4. **DayUnifiedView.jsx** (Generic Day View Component)

**Changes:**

- ✅ Button positioned at top-right corner
- ✅ Consistent positioning across all day views
- ✅ Works for both expense and bill day views

**Usage:**

```jsx
<JumpToTodayButton
  onClick={handleJumpToToday}
  isToday={isViewingToday}
  visible={true}
  position="absolute"
  customPosition={{ top: 16, right: 70 }}
  tooltipText={isViewingToday ? "Already viewing today" : "Jump to today"}
  zIndex={20}
/>
```

### 5. **DayTransactionsView.jsx** & **DayBillsView.jsx**

**Status:** ✅ Automatically inherit functionality from DayUnifiedView

- No direct changes needed
- Button appears at top-right in both views

## Flexibility Features

### 1. **Visibility Control**

```jsx
// Show only when needed
<JumpToTodayButton
  visible={shouldShowButton}
  // ... other props
/>

// Hide in certain conditions
<JumpToTodayButton
  visible={!isViewingToday && !isSpecialCondition}
  // ... other props
/>
```

### 2. **Custom Positioning**

```jsx
// Top-left corner
<JumpToTodayButton
  customPosition={{ top: 16, left: 70 }}
/>

// Bottom-right corner
<JumpToTodayButton
  customPosition={{ bottom: 30, right: 30 }}
/>

// Centered at top
<JumpToTodayButton
  customPosition={{ top: 16, left: '50%', transform: 'translateX(-50%)' }}
/>
```

### 3. **Position Modes**

```jsx
// Absolute (default) - relative to parent container
<JumpToTodayButton position="absolute" />

// Fixed - relative to viewport
<JumpToTodayButton position="fixed" />

// Relative - in document flow
<JumpToTodayButton position="relative" />
```

### 4. **Custom Styling**

```jsx
<JumpToTodayButton
  customStyles={{
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    width: 56,
    height: 56,
    borderRadius: "50%",
  }}
/>
```

### 5. **Z-Index Management**

```jsx
// Behind modals
<JumpToTodayButton zIndex={10} />

// Above most content
<JumpToTodayButton zIndex={20} />

// Above everything
<JumpToTodayButton zIndex={9999} />
```

## Technical Implementation

### State Management

```javascript
// Calendar Views
const isViewingCurrentMonth = useMemo(() => {
  return selectedDate.isSame(dayjs(), "month");
}, [selectedDate]);

const handleJumpToToday = () => {
  const today = dayjs();
  setSelectedDate(today);
  setMonthOffset(0);
};

// Day Views
const isViewingToday = useMemo(() => {
  return currentDay.isSame(dayjs(), "day");
}, [currentDay]);

const handleJumpToToday = () => {
  goToDay(dayjs());
};
```

### Tooltip Configuration

- **Placement**: Left side of button
- **Arrow**: Enabled
- **Offset**: 8px from button edge
- **Auto-hide**: Disabled state shows appropriate message

## User Experience Improvements

### 1. **Top-Right Positioning**

- ✅ Consistent placement across all views
- ✅ Doesn't interfere with main content
- ✅ Easy to locate and access
- ✅ Properly spaced from edge (70px from right to avoid overlap with back button)

### 2. **Visual States**

- **Active State:**

  - Cyan background (#00dac6)
  - White icon
  - Hover: Slight scale (1.05x) + darker cyan
  - Cursor: pointer

- **Disabled State:**
  - Gray background (#2a2a2a)
  - Gray icon (#666)
  - No hover effect
  - Cursor: not-allowed
  - Tooltip explains current state

### 3. **Responsive Design**

- Optimized size (48x48px) for both desktop and mobile
- Proper touch target size
- Tooltip adapts to viewport

### 4. **Accessibility**

- ARIA label: "Jump to today"
- Keyboard accessible (Material-UI IconButton)
- Tooltip for screen readers
- Disabled state properly communicated
- Sufficient color contrast

## Advanced Usage Examples

### Example 1: Conditional Visibility

```jsx
<JumpToTodayButton
  onClick={handleJumpToToday}
  isToday={isViewingToday}
  visible={userHasPermission && !isLoading}
  position="absolute"
  customPosition={{ top: 16, right: 70 }}
/>
```

### Example 2: Different Position for Mobile

```jsx
<JumpToTodayButton
  onClick={handleJumpToToday}
  isToday={isViewingToday}
  position="absolute"
  customPosition={
    isSmallScreen ? { bottom: 20, right: 20 } : { top: 16, right: 70 }
  }
/>
```

### Example 3: Custom Theme Integration

```jsx
<JumpToTodayButton
  onClick={handleJumpToToday}
  isToday={isViewingToday}
  customStyles={{
    background: isToday ? theme.palette.grey[800] : theme.palette.primary.main,
    "&:hover": {
      background: theme.palette.primary.dark,
    },
  }}
/>
```

### Example 4: Hide When Not Needed

```jsx
<JumpToTodayButton
  onClick={handleJumpToToday}
  isToday={isViewingToday}
  visible={Math.abs(daysDiff) > 7} // Only show if more than 7 days away
/>
```

## Benefits

1. ✅ **Enhanced Flexibility**: Easily configurable from parent components
2. ✅ **Consistent Positioning**: Top-right corner across all views
3. ✅ **Better Visibility**: Prominent placement, easy to find
4. ✅ **Conditional Display**: Show/hide based on business logic
5. ✅ **Custom Styling**: Full styling control from parent
6. ✅ **Improved UX**: Proper tooltip positioning and hover feedback
7. ✅ **Maintainability**: Single source of truth for button behavior
8. ✅ **Reusability**: Works across multiple view types
9. ✅ **Accessibility**: Proper ARIA labels and keyboard support
10. ✅ **Performance**: Memoized state checks prevent unnecessary re-renders

## Files Modified

1. ✅ `src/components/JumpToTodayButton.jsx` (ENHANCED)
2. ✅ `src/pages/Landingpage/CalendarView.jsx`
3. ✅ `src/pages/Landingpage/BillCalendarView.jsx`
4. ✅ `src/components/DayUnifiedView/DayUnifiedView.jsx`
5. ✅ `src/pages/Landingpage/DayTransactionsView.jsx` (via DayUnifiedView)
6. ✅ `src/pages/Landingpage/DayBillsView.jsx` (via DayUnifiedView)

## Migration Guide

If you need to update existing usage:

```jsx
// OLD (bottom-right, fixed)
<JumpToTodayButton
  onClick={handleJumpToToday}
  isToday={isViewingToday}
  position="fixed"
/>

// NEW (top-right, absolute, more flexible)
<JumpToTodayButton
  onClick={handleJumpToToday}
  isToday={isViewingToday}
  visible={true}
  position="absolute"
  customPosition={{ top: 16, right: 70 }}
  zIndex={20}
/>
```

## Testing Checklist

- [x] Button appears at top-right in all views
- [x] Tooltip displays correctly on hover (left side)
- [x] Button functionality works (navigates to today)
- [x] Disabled state when viewing current date/month
- [x] Hover animations smooth and responsive
- [x] No overlap with other UI elements
- [x] Works on desktop and mobile screens
- [x] Visibility prop controls display
- [x] Custom positioning works correctly
- [x] Z-index properly layers button
- [x] Accessibility features functional
- [x] Works with friend views (friendId present)
