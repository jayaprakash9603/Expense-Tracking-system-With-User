# DateIndicator Component

A flexible and reusable component for displaying date indicators with badges, animations, and corner accents in calendar views.

## Features

- ✨ Animated pulsing effects
- 🎨 Customizable colors and text
- 📍 Flexible positioning (4 corners)
- 🎯 Toggle-able elements (badge, animation, corner accent)
- 🔄 Extensible for future indicator types

## Usage

### Basic Usage

```jsx
import DateIndicator from "../../components/DateIndicator";

// Today indicator at top-left
<DateIndicator
  type="today"
  position="top-left"
/>

// Salary indicator at top-right
<DateIndicator
  type="salary"
  position="top-right"
/>
```

### Advanced Usage

```jsx
// Custom positioning
<DateIndicator
  type="today"
  position="bottom-right"
  showAnimation={true}
  showCornerAccent={true}
  showBadge={true}
/>

// Custom colors and text
<DateIndicator
  type="today"
  position="top-left"
  customBadgeText="PRESENT"
  customColors={{
    primary: "#ff6b6b",
    secondary: "#ee5a6f",
    accent: "rgba(255, 107, 107, 0.3)",
  }}
/>

// Minimal indicator (only badge, no animations)
<DateIndicator
  type="salary"
  position="top-right"
  showAnimation={false}
  showCornerAccent={false}
  showBadge={true}
/>
```

## Props

| Prop               | Type      | Default      | Description                                                              |
| ------------------ | --------- | ------------ | ------------------------------------------------------------------------ |
| `type`             | `string`  | `"today"`    | Type of indicator: `"today"` or `"salary"`                               |
| `position`         | `string`  | `"top-left"` | Position: `"top-left"`, `"top-right"`, `"bottom-left"`, `"bottom-right"` |
| `showAnimation`    | `boolean` | `true`       | Show pulsing animation effect                                            |
| `showCornerAccent` | `boolean` | `true`       | Show triangular corner accent                                            |
| `showBadge`        | `boolean` | `true`       | Show text badge                                                          |
| `customBadgeText`  | `string`  | `null`       | Custom text for badge (overrides default)                                |
| `customColors`     | `object`  | `null`       | Custom color scheme (see below)                                          |

### Custom Colors Object

```js
{
  primary: "#00dac6",      // Main gradient color
  secondary: "#00a89b",    // Secondary gradient color
  accent: "rgba(0, 218, 198, 0.3)", // Animation color
  text: "TODAY",           // Default badge text
  icon: "₹"               // Optional icon (for salary type)
}
```

## Position Options

The component supports 4 corner positions:

```
┌─────────────────────┐
│ top-left   top-right│
│                     │
│                     │
│                     │
│bottom-left  bottom- │
│             right   │
└─────────────────────┘
```

## Examples

### Example 1: Change Position

```jsx
// Move today indicator to bottom-left
<DateIndicator type="today" position="bottom-left" />
```

### Example 2: Minimal Style

```jsx
// Only show badge, no animations or accents
<DateIndicator
  type="salary"
  position="top-right"
  showAnimation={false}
  showCornerAccent={false}
/>
```

### Example 3: Custom Birthday Indicator

```jsx
// Create a custom birthday indicator
<DateIndicator
  type="today"
  position="top-right"
  customBadgeText="🎂 BDAY"
  customColors={{
    primary: "#ff69b4",
    secondary: "#ff1493",
    accent: "rgba(255, 105, 180, 0.3)",
  }}
/>
```

### Example 4: Holiday Indicator

```jsx
// Create a holiday indicator
<DateIndicator
  type="today"
  position="bottom-right"
  customBadgeText="🎄 HOLIDAY"
  customColors={{
    primary: "#dc2626",
    secondary: "#991b1b",
    accent: "rgba(220, 38, 38, 0.3)",
  }}
/>
```

## Integration Example

```jsx
// In your calendar component
{
  days.map((day) => {
    const isToday = checkIfToday(day);
    const isSalary = checkIfSalaryDay(day);
    const isBirthday = checkIfBirthday(day);

    return (
      <Box key={day} sx={{ position: "relative" }}>
        {/* Today indicator */}
        {isToday && <DateIndicator type="today" position="top-left" />}

        {/* Salary indicator */}
        {isSalary && <DateIndicator type="salary" position="top-right" />}

        {/* Birthday indicator */}
        {isBirthday && (
          <DateIndicator
            type="today"
            position="bottom-left"
            customBadgeText="🎂"
            customColors={{
              primary: "#ff69b4",
              secondary: "#ff1493",
              accent: "rgba(255, 105, 180, 0.3)",
            }}
          />
        )}

        <Typography>{day}</Typography>
      </Box>
    );
  });
}
```

## Future Extensions

To add new indicator types:

1. Add a new color scheme in the `colorSchemes` object
2. Use the component with `type="your-new-type"`
3. Or use `customColors` and `customBadgeText` props

```jsx
// Future: Meeting indicator
<DateIndicator
  type="today"
  position="bottom-right"
  customBadgeText="MEETING"
  customColors={{
    primary: "#f59e0b",
    secondary: "#d97706",
    accent: "rgba(245, 158, 11, 0.3)",
  }}
/>
```

## Notes

- The component uses Material-UI's `Box` and `Typography` components
- Animations are CSS-based with no external dependencies
- Z-index layering: Animation (10), Badge (11), Corner Accent (9)
- All positions are absolute relative to the parent container
- Parent container should have `position: "relative"`
