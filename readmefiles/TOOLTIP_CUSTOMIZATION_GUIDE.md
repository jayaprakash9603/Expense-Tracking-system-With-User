# 🎨 Spending Chart Tooltip Customization Guide

## Overview

The SpendingChartTooltip component is highly customizable and follows a modular design pattern. This guide covers all customization options and how to modify the tooltip appearance.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Configuration Options](#configuration-options)
3. [Style Presets](#style-presets)
4. [Custom Styling](#custom-styling)
5. [Advanced Examples](#advanced-examples)
6. [Theme Customization](#theme-customization)

---

## 🚀 Quick Start

### Basic Usage

```jsx
import { TOOLTIP_CONFIG } from "../../config/chartConfig";

<DailySpendingChart
  data={spendingData}
  timeframe="this_month"
  onTimeframeChange={setTimeframe}
  tooltipConfig={TOOLTIP_CONFIG}
  selectedType="loss"
  onTypeToggle={setType}
/>;
```

---

## ⚙️ Configuration Options

### Available Config Properties

```javascript
TOOLTIP_CONFIG = {
  // Display Options
  maxExpensesToShow: 5, // Number of transactions to show
  minWidth: 200, // Minimum tooltip width (px)
  maxWidth: 300, // Maximum tooltip width (px)

  // Visual Styling
  borderRadius: 12, // Corner roundness (px)
  borderWidth: 2, // Border thickness (px)

  // Padding/Spacing
  headerPadding: "10px 12px 8px 12px",
  bodyPadding: "10px 12px 12px 12px",
  itemGap: 6, // Gap between transaction items (px)

  // Typography
  dateFontSize: 9, // Date label size (px)
  labelFontSize: 8, // "Total Spending" label size (px)
  amountFontSize: 16, // Main amount size (px)
  transactionNameFontSize: 11, // Transaction name size (px)
  transactionAmountFontSize: 12, // Transaction amount size (px)
  categoryFontSize: 10, // Category text size (px)

  // Icon Sizes
  iconSize: {
    small: 11, // Date icon
    medium: 12, // Transaction icon
    large: 16, // Arrow icon
  },

  // Animation
  enableAnimation: true,
  animationDuration: 200,
};
```

---

## 🎭 Style Presets

### Pre-configured Design Options

#### 1. Compact (Default)

```jsx
import { TOOLTIP_STYLE_PRESETS } from "../../config/chartConfig";

<DailySpendingChart
  tooltipConfig={{ ...TOOLTIP_CONFIG, ...TOOLTIP_STYLE_PRESETS.compact }}
/>;
```

- **Use case**: Mobile devices, limited space
- **Features**: Smaller fonts, tighter spacing, minimal padding

#### 2. Comfortable

```jsx
<DailySpendingChart
  tooltipConfig={{ ...TOOLTIP_CONFIG, ...TOOLTIP_STYLE_PRESETS.comfortable }}
/>
```

- **Use case**: Desktop, balanced design
- **Features**: Larger fonts, comfortable spacing, medium padding

#### 3. Spacious

```jsx
<DailySpendingChart
  tooltipConfig={{ ...TOOLTIP_CONFIG, ...TOOLTIP_STYLE_PRESETS.spacious }}
/>
```

- **Use case**: Large screens, presentations
- **Features**: Extra large fonts, generous spacing, maximum padding

---

## 🎨 Custom Styling

### Example 1: Show More Transactions

```jsx
const customConfig = {
  ...TOOLTIP_CONFIG,
  maxExpensesToShow: 10, // Show up to 10 transactions
  maxWidth: 400, // Wider tooltip for more content
};

<DailySpendingChart tooltipConfig={customConfig} />;
```

### Example 2: Compact Mobile Tooltip

```jsx
const mobileConfig = {
  ...TOOLTIP_CONFIG,
  maxExpensesToShow: 3,
  minWidth: 180,
  maxWidth: 250,
  borderRadius: 10,
  dateFontSize: 8,
  amountFontSize: 14,
  headerPadding: "8px 10px 6px 10px",
  bodyPadding: "8px 10px 10px 10px",
};

<DailySpendingChart tooltipConfig={mobileConfig} />;
```

### Example 3: Large Dashboard Display

```jsx
const dashboardConfig = {
  ...TOOLTIP_CONFIG,
  maxExpensesToShow: 8,
  minWidth: 300,
  maxWidth: 450,
  borderRadius: 20,
  dateFontSize: 12,
  amountFontSize: 24,
  transactionNameFontSize: 14,
  transactionAmountFontSize: 16,
  headerPadding: "16px 20px 14px 20px",
  bodyPadding: "14px 20px 20px 20px",
};

<DailySpendingChart tooltipConfig={dashboardConfig} />;
```

### Example 4: Minimal Design

```jsx
const minimalConfig = {
  ...TOOLTIP_CONFIG,
  maxExpensesToShow: 3,
  borderRadius: 8,
  borderWidth: 1,
  itemGap: 4,
  dateFontSize: 8,
  amountFontSize: 14,
  headerPadding: "8px 10px 6px 10px",
  bodyPadding: "6px 10px 8px 10px",
};

<DailySpendingChart tooltipConfig={minimalConfig} />;
```

---

## 🌈 Theme Customization

### Modifying Colors

To change tooltip colors, update `chartConfig.js`:

```javascript
// In src/config/chartConfig.js

export const CHART_THEME = {
  loss: {
    color: "#ff5252", // Red for spending
    border: "#ff5252",
    divider: "#ff525233",
  },
  gain: {
    color: "#14b8a6", // Cyan for income
    border: "#14b8a6",
    divider: "#14b8a633",
  },
  // Add custom themes:
  custom: {
    color: "#9c27b0", // Purple
    border: "#9c27b0",
    divider: "#9c27b033",
  },
};
```

### Gradient Customization

The header gradient is dynamically generated based on type:

- **Loss**: Red gradient (`#ff4d4f` → `#cf1322`)
- **Gain**: Cyan gradient (`#00dac6` → `#00a896`)

To customize, modify `SpendingChartTooltip.jsx` lines 70-73.

---

## 📱 Responsive Design

### Auto-adjust based on screen size:

```jsx
import { useMediaQuery } from "@mui/material";

const MyComponent = () => {
  const isMobile = useMediaQuery("(max-width:600px)");

  const tooltipConfig = isMobile
    ? { ...TOOLTIP_CONFIG, ...TOOLTIP_STYLE_PRESETS.compact }
    : { ...TOOLTIP_CONFIG, ...TOOLTIP_STYLE_PRESETS.comfortable };

  return <DailySpendingChart tooltipConfig={tooltipConfig} {...otherProps} />;
};
```

---

## 🔧 Advanced Examples

### Dynamic Configuration Based on Data

```jsx
const getDynamicConfig = (dataLength) => {
  if (dataLength > 20) {
    return {
      ...TOOLTIP_CONFIG,
      maxExpensesToShow: 8,
      maxWidth: 400,
    };
  } else if (dataLength > 10) {
    return {
      ...TOOLTIP_CONFIG,
      maxExpensesToShow: 5,
      maxWidth: 300,
    };
  }
  return {
    ...TOOLTIP_CONFIG,
    maxExpensesToShow: 3,
    maxWidth: 250,
  };
};

<DailySpendingChart tooltipConfig={getDynamicConfig(data.length)} />;
```

### User Preference Settings

```jsx
const [userPreferences, setUserPreferences] = useState({
  tooltipSize: "comfortable",
  showTransactions: true,
  maxTransactions: 5,
});

const getTooltipConfig = () => {
  const preset = TOOLTIP_STYLE_PRESETS[userPreferences.tooltipSize];
  return {
    ...TOOLTIP_CONFIG,
    ...preset,
    maxExpensesToShow: userPreferences.maxTransactions,
  };
};

<DailySpendingChart tooltipConfig={getTooltipConfig()} />;
```

---

## 📊 Tooltip Cursor Customization

The tooltip cursor (vertical line on hover) can also be customized in `DailySpendingChart.jsx`:

```jsx
<Tooltip
  cursor={{
    stroke: theme.color, // Color of the line
    strokeWidth: 2, // Thickness
    strokeDasharray: "5 5", // Dash pattern
    opacity: 0.5, // Transparency
  }}
/>
```

### Cursor Style Examples:

#### Solid Line

```jsx
cursor={{
  stroke: theme.color,
  strokeWidth: 3,
  strokeDasharray: "0",
  opacity: 0.8
}}
```

#### Dotted Line

```jsx
cursor={{
  stroke: theme.color,
  strokeWidth: 2,
  strokeDasharray: "2 4",
  opacity: 0.6
}}
```

#### No Cursor

```jsx
cursor={false}
```

---

## 🎯 Best Practices

### ✅ Do's

- Use presets for consistency across your app
- Test on multiple screen sizes
- Keep `maxExpensesToShow` reasonable (3-10)
- Maintain good contrast ratios for accessibility
- Use responsive configurations

### ❌ Don'ts

- Don't make fonts too small (< 8px)
- Avoid extremely large tooltips (> 500px width)
- Don't show too many transactions (> 15)
- Avoid very tight padding (< 6px)
- Don't use overly bright colors

---

## 🐛 Troubleshooting

### Tooltip not showing?

- Check if `active` prop is being passed
- Verify `payload` has data
- Ensure tooltip is not hidden behind other elements (check z-index)

### Tooltip cut off at edges?

- Use `allowEscapeViewBox={{ x: false, y: true }}`
- Adjust `position` prop
- Reduce tooltip width

### Styling not applied?

- Ensure config is passed correctly to component
- Check for typos in property names
- Verify config object structure

---

## 📝 Quick Reference

### Common Configurations

| Scenario              | Config                                |
| --------------------- | ------------------------------------- |
| Mobile friendly       | `TOOLTIP_STYLE_PRESETS.compact`       |
| Desktop standard      | `TOOLTIP_STYLE_PRESETS.comfortable`   |
| Presentation mode     | `TOOLTIP_STYLE_PRESETS.spacious`      |
| Show all transactions | `{ maxExpensesToShow: 999 }`          |
| Minimal style         | `{ borderRadius: 8, borderWidth: 1 }` |

---

## 🔗 Related Files

- **Component**: `src/components/charts/SpendingChartTooltip.jsx`
- **Config**: `src/config/chartConfig.js`
- **Parent**: `src/pages/Dashboard/DailySpendingChart.jsx`
- **Theme Helper**: `src/utils/chartHelpers.js`

---

## 📞 Support

For questions or custom requirements, refer to the main component documentation or modify the configuration files directly.

**Happy customizing! 🎨✨**
