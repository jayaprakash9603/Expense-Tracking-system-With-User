# DailySpendingChart - Usage Examples

## Overview
The `DailySpendingChart` is a highly modular and configurable component for visualizing daily spending patterns. It's designed to be easily extended and customized.

---

## Basic Examples

### 1. Standard Usage (Default Configuration)
```jsx
import DailySpendingChart from './DailySpendingChart';

function MyDashboard() {
  const [timeframe, setTimeframe] = useState('this_month');
  const [type, setType] = useState('loss');

  return (
    <DailySpendingChart
      data={spendingData}
      timeframe={timeframe}
      onTimeframeChange={setTimeframe}
      selectedType={type}
      onTypeToggle={setType}
    />
  );
}
```

### 2. Hide Type Toggle (No Loss/Gain Buttons)
```jsx
<DailySpendingChart
  data={spendingData}
  timeframe={timeframe}
  onTimeframeChange={setTimeframe}
  typeOptions={[]}  // Empty array hides the type toggle
/>
```

### 3. Custom Timeframe Options
```jsx
const customTimeframes = [
  { value: "today", label: "Today" },
  { value: "this_week", label: "This Week" },
  { value: "this_month", label: "This Month" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "last_30_days", label: "Last 30 Days" },
  { value: "this_year", label: "This Year" },
];

<DailySpendingChart
  data={spendingData}
  timeframe={timeframe}
  onTimeframeChange={setTimeframe}
  timeframeOptions={customTimeframes}
  selectedType={type}
  onTypeToggle={setType}
/>
```

### 4. Custom Type Options
```jsx
const customTypes = [
  { value: "loss", label: "Expenses", color: "#ff5252" },
  { value: "gain", label: "Income", color: "#14b8a6" },
  { value: "all", label: "All", color: "#888" },
];

<DailySpendingChart
  data={spendingData}
  timeframe={timeframe}
  onTimeframeChange={setTimeframe}
  selectedType={type}
  onTypeToggle={setType}
  typeOptions={customTypes}
/>
```

### 5. Custom Title and Icon
```jsx
<DailySpendingChart
  data={spendingData}
  title="My Spending Analytics"
  icon="💰 "
  timeframe={timeframe}
  onTimeframeChange={setTimeframe}
  selectedType={type}
  onTypeToggle={setType}
/>
```

### 6. Custom Height
```jsx
<DailySpendingChart
  data={spendingData}
  height={400}  // Custom height in pixels
  timeframe={timeframe}
  onTimeframeChange={setTimeframe}
  selectedType={type}
  onTypeToggle={setType}
/>
```

### 7. Custom Tooltip Configuration
```jsx
<DailySpendingChart
  data={spendingData}
  timeframe={timeframe}
  onTimeframeChange={setTimeframe}
  tooltipConfig={{
    maxExpensesToShow: 10,  // Show up to 10 expenses instead of 5
    minWidth: 250,
    maxWidth: 400,
  }}
  selectedType={type}
  onTypeToggle={setType}
/>
```

---

## Advanced Usage with Hook

### Fetch All Data Without Type Filter
```jsx
import useDailySpendingData from '../hooks/useDailySpendingData';

function MyComponent() {
  // Don't send type in API request, filter only in UI
  const { data, loading, timeframe, type, setTimeframe, setType } = 
    useDailySpendingData({
      initialTimeframe: 'this_month',
      initialType: 'loss',
      includeTypeInRequest: false,  // Don't send type to API
    });

  return (
    <DailySpendingChart
      data={data}
      timeframe={timeframe}
      onTimeframeChange={setTimeframe}
      selectedType={type}
      onTypeToggle={setType}
    />
  );
}
```

### With Target ID (Friend/Group Filter)
```jsx
const { data, loading } = useDailySpendingData({
  initialTimeframe: 'this_month',
  initialType: 'loss',
  targetId: friendId,  // Filter by specific user/friend
});
```

---

## Extending the Component

### A. Add New Timeframe Option

1. **Update the default options** in `DailySpendingChart.jsx`:
```javascript
const DEFAULT_TIMEFRAME_OPTIONS = [
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "last_3_months", label: "Last 3 Months" },
  { value: "this_year", label: "This Year" },  // NEW
];
```

2. **Update the hook** `useDailySpendingData.js` to handle new timeframe:
```javascript
const buildDateRange = useCallback(() => {
  // ... existing code ...
  
  else if (timeframe === "this_year") {
    // First day of current year to today
    startDate = new Date(now.getFullYear(), 0, 1);
    endDate = now;
  }
  
  // ... rest of code ...
}, [timeframe]);
```

### B. Add New Type Option

1. **Add to type options**:
```javascript
const DEFAULT_TYPE_OPTIONS = [
  { value: "loss", label: "Loss", color: "#ff5252" },
  { value: "gain", label: "Gain", color: "#14b8a6" },
  { value: "pending", label: "Pending", color: "#FFA500" },  // NEW
];
```

2. **Add theme colors**:
```javascript
const CHART_THEME = {
  loss: { color: "#ff5252", border: "#ff5252", divider: "#ff525233" },
  gain: { color: "#14b8a6", border: "#14b8a6", divider: "#14b8a633" },
  pending: { color: "#FFA500", border: "#FFA500", divider: "#FFA50033" },  // NEW
};
```

### C. Customize Tooltip

Modify `TOOLTIP_CONFIG`:
```javascript
const TOOLTIP_CONFIG = {
  maxExpensesToShow: 10,  // Show more expenses
  minWidth: 250,
  maxWidth: 400,
};
```

---

## Component Props Reference

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `data` | Array | Yes | - | Chart data array with daily spending |
| `timeframe` | String | Yes | - | Selected timeframe value |
| `onTimeframeChange` | Function | No | - | Callback when timeframe changes |
| `timeframeOptions` | Array | No | DEFAULT_TIMEFRAME_OPTIONS | Custom timeframe dropdown options |
| `selectedType` | String | Yes | - | Selected type (loss/gain) |
| `onTypeToggle` | Function | No | - | Callback when type changes |
| `typeOptions` | Array | No | DEFAULT_TYPE_OPTIONS | Custom type options (empty array hides toggle) |
| `title` | String | No | "📊 Daily Spending Pattern" | Chart title |
| `icon` | String | No | - | Optional icon to show before title |
| `height` | Number | No | Responsive (220-300) | Chart height in pixels |
| `tooltipConfig` | Object | No | TOOLTIP_CONFIG | Tooltip configuration object |

---

## Hook Props Reference

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `initialTimeframe` | String | No | "this_month" | Initial timeframe value |
| `initialType` | String | No | "loss" | Initial type value |
| `targetId` | String/Number | No | null | Filter by specific target (user/friend) |
| `includeTypeInRequest` | Boolean | No | true | Whether to send type parameter to API |
| `refreshTrigger` | Any | No | - | Value to trigger data refetch |

---

## Common Patterns

### Read-Only Chart (No Controls)
```jsx
<DailySpendingChart
  data={spendingData}
  timeframe="this_month"
  selectedType="loss"
  // No onTimeframeChange or onTypeToggle = no controls shown
/>
```

### Only Timeframe Selector (No Type Toggle)
```jsx
<DailySpendingChart
  data={spendingData}
  timeframe={timeframe}
  onTimeframeChange={setTimeframe}
  typeOptions={[]}  // Hide type toggle
/>
```

### Dynamic Configuration
```jsx
const showTypeToggle = user.preferences.showTypeFilter;

<DailySpendingChart
  data={spendingData}
  timeframe={timeframe}
  onTimeframeChange={setTimeframe}
  selectedType={type}
  onTypeToggle={showTypeToggle ? setType : undefined}
  typeOptions={showTypeToggle ? undefined : []}
/>
```
