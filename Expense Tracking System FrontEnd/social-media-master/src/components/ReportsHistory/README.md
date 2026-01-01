# Reports History Components

## Overview
A modern, reusable component system for displaying reports history with card-based UI. Built with React, Material-UI, and following DRY principles and senior UI/UX design standards.

## Architecture

```
src/components/ReportsHistory/
├── ReportsHistoryContainer.jsx   # Main container with search, pagination
├── ReportsHistoryHeader.jsx      # Header with search bar and actions
├── ReportHistoryCard.jsx         # Individual report card
├── EmptyReportsState.jsx         # Empty state component
└── index.js                      # Export file
```

## Components

### 1. ReportsHistoryContainer (Main Component)
**Purpose**: Orchestrates all sub-components and manages state

**Features**:
- ✅ Grid layout (responsive: 1 col mobile, 2 col tablet, 3 col desktop)
- ✅ Search functionality (filters by name, type, description, date)
- ✅ Pagination (customizable items per page)
- ✅ Loading states with spinner
- ✅ Empty state handling
- ✅ Smooth animations and transitions

**Props**:
```javascript
{
  reports: Array,          // Array of report objects
  loading: Boolean,        // Loading state
  onView: Function,        // View report handler
  onDownload: Function,    // Download report handler
  onDelete: Function,      // Delete report handler
  onRefresh: Function,     // Refresh handler
  itemsPerPage: Number     // Items per page (default: 6)
}
```

**Usage**:
```javascript
import { ReportsHistoryContainer } from "../../components/ReportsHistory";

<ReportsHistoryContainer
  reports={reportsData}
  loading={false}
  onView={(report) => console.log("View:", report)}
  onDownload={(report) => console.log("Download:", report)}
  onDelete={(report) => console.log("Delete:", report)}
  onRefresh={() => console.log("Refresh")}
  itemsPerPage={6}
/>
```

### 2. ReportsHistoryHeader
**Purpose**: Displays title, search, and action buttons

**Features**:
- ✅ Search bar with icon
- ✅ Filter and sort buttons
- ✅ Refresh button with rotation animation
- ✅ Total count chip
- ✅ Responsive layout

**Props**:
```javascript
{
  totalCount: Number,         // Total reports count
  searchQuery: String,        // Current search query
  onSearchChange: Function,   // Search change handler
  onFilter: Function,         // Filter click handler
  onSort: Function,           // Sort click handler
  onRefresh: Function         // Refresh handler
}
```

### 3. ReportHistoryCard
**Purpose**: Individual report card with actions

**Features**:
- ✅ Modern card design with hover effects
- ✅ Color-coded report types (Financial, Audit, Compliance, etc.)
- ✅ Status chip
- ✅ Date formatting with icons
- ✅ Action buttons (View, Download, Delete)
- ✅ Tooltips on hover
- ✅ Smooth animations

**Props**:
```javascript
{
  report: {
    id: String|Number,        // Required
    reportName: String,       // Required
    date: String,             // Date string
    createdAt: String,        // Creation date
    reportType: String,       // Type: Financial, Audit, etc.
    status: String,           // Status: Completed, Pending, etc.
    description: String       // Report description
  },
  onView: Function,           // View handler
  onDownload: Function,       // Download handler
  onDelete: Function          // Delete handler
}
```

### 4. EmptyReportsState
**Purpose**: Displayed when no reports exist

**Features**:
- ✅ Centered empty state
- ✅ Animated icon with pulse effect
- ✅ Helpful guidance text
- ✅ Theme-aware styling

**Props**: None (stateless component)

## Design System

### Color Coding by Report Type
```javascript
Financial    → #4ade80 (Green)
Compliance   → #fb923c (Orange)
Operational  → #60a5fa (Blue)
Security     → #f87171 (Red)
Audit        → colors.primary_accent (Cyan)
```

### Spacing & Layout
- Card padding: `24px` (3 * 8px MUI spacing)
- Grid spacing: `24px` (3 * 8px)
- Border radius: `12px` (rounded-3)
- Hover lift: `4px translateY`
- Shadow on hover: `0 12px 24px rgba(accent, 0.2)`

### Typography
- Title: `24px`, weight `700`
- Card title: `16px`, weight `600`
- Body text: `13-14px`, weight `400-500`
- Captions: `11px`, weight `500`, uppercase

### Animations
- Fade in: `400ms ease`
- Card hover: `300ms cubic-bezier(0.4, 0, 0.2, 1)`
- Staggered fade-in: `400ms` with `100ms` delay per item
- Pulse (empty state): `2s infinite`

## Usage Example

```javascript
import React, { useState, useEffect } from "react";
import { ReportsHistoryContainer } from "../../components/ReportsHistory";
import { api } from "../../config/api";

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/reports/history");
      setReports(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (report) => {
    // Navigate to report details
    navigate(`/reports/${report.id}`);
  };

  const handleDownload = async (report) => {
    try {
      const response = await api.get(`/api/reports/${report.id}/download`, {
        responseType: 'blob'
      });
      // Trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${report.reportName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading report:", error);
    }
  };

  const handleDelete = async (report) => {
    if (window.confirm(`Delete "${report.reportName}"?`)) {
      try {
        await api.delete(`/api/reports/${report.id}`);
        setReports(reports.filter(r => r.id !== report.id));
        alert("Report deleted successfully!");
      } catch (error) {
        console.error("Error deleting report:", error);
      }
    }
  };

  return (
    <ReportsHistoryContainer
      reports={reports}
      loading={loading}
      onView={handleView}
      onDownload={handleDownload}
      onDelete={handleDelete}
      onRefresh={fetchReports}
      itemsPerPage={6}
    />
  );
};

export default Reports;
```

## Data Structure

### Expected Report Object
```javascript
{
  id: 1,                                  // Unique identifier
  reportName: "Financial Audit Q1 2025",  // Display name
  date: "2025-03-20",                     // Date string (YYYY-MM-DD)
  createdAt: "2025-03-20",                // Creation timestamp
  reportType: "Financial",                // Type for color coding
  status: "Completed",                    // Status label
  description: "Detailed description..."   // Optional description
}
```

## Theme Integration

All components use the `useTheme()` hook for consistent theming:

```javascript
const { colors } = useTheme();

// Available colors:
colors.primary_bg        // Main background
colors.secondary_bg      // Card/section background
colors.primary_text      // Primary text
colors.secondary_text    // Muted text
colors.border_color      // Borders
colors.primary_accent    // Accent color (cyan)
colors.hover_bg          // Hover background
```

## Responsive Breakpoints

```javascript
Grid Layout:
- xs (mobile):    1 column
- sm (tablet):    2 columns
- lg (desktop):   3 columns

Header Stack:
- xs: Column layout
- sm: Row layout
```

## Performance Optimizations

1. **useMemo** for filtered and paginated data
2. **Staggered animations** for visual performance
3. **Lazy rendering** via pagination (only 6 cards per page)
4. **Optimized re-renders** with proper prop dependencies

## Accessibility

- ✅ ARIA labels on buttons
- ✅ Tooltip descriptions
- ✅ Keyboard navigation support
- ✅ Focus visible states
- ✅ Semantic HTML structure

## Best Practices

1. **DRY Principle**: Each component has a single responsibility
2. **Prop Validation**: PropTypes for all components
3. **Theme Awareness**: All colors from theme system
4. **Responsive Design**: Mobile-first approach
5. **Error Handling**: Graceful degradation for missing data
6. **Documentation**: Comprehensive JSDoc comments

## Future Enhancements

- [ ] Filter by report type
- [ ] Sort by date, name, type
- [ ] Bulk actions (delete multiple)
- [ ] Export to CSV/Excel
- [ ] Advanced search filters
- [ ] Report preview modal
- [ ] Drag-and-drop reordering
- [ ] Infinite scroll option

## Dependencies

```json
{
  "@mui/material": "^5.x",
  "@mui/icons-material": "^5.x",
  "dayjs": "^1.11.x",
  "prop-types": "^15.x",
  "react": "^18.x"
}
```

## License

Internal project - Expense Tracking System
