# Budget Component - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

---

## 📋 Prerequisites

Before using the new Budget component, ensure you have:

- ✅ React 18+
- ✅ Material-UI (@mui/material) v5+
- ✅ MUI DataGrid (@mui/x-data-grid) v6+
- ✅ Redux configured
- ✅ React Router v6+
- ✅ Theme system setup (useTheme hook)
- ✅ User settings configured

---

## 🎯 Quick Overview

The Budget component provides:

- **Card & Table Views** for flexible data presentation
- **Real-time Statistics** showing budget health
- **Smart Filtering** by search, date, and status
- **Full Theme Support** (dark/light modes)
- **Complete CRUD** operations with permissions

---

## 🔧 Installation (Already Integrated)

The component is already in your project at:

```
src/pages/Landingpage/Budget.jsx
```

No installation needed! It's ready to use. 🎉

---

## 🎨 Basic Usage

### 1. **Navigate to Budget Page**

In your app, go to:

```
/budget                    (Your budgets)
/budget/friend/:friendId   (Friend's budgets)
```

### 2. **View Your Budgets**

The page loads automatically with:

- Statistics cards at the top
- Tabs for filtering (All/Active/Expired)
- Your budgets in card view (default)

### 3. **Switch Views**

Click the view toggle button (top right) to switch between:

- 📱 **Card View**: Visual cards with progress bars
- 📊 **Table View**: Dense data grid

### 4. **Create a Budget**

1. Click **"New Budget"** button
2. Fill in the form:
   - Name (e.g., "Groceries")
   - Amount (e.g., 500)
   - Start Date
   - End Date
   - Description (optional)
3. Submit → Budget appears in your list

### 5. **Search & Filter**

```
┌─────────────────────────────────────┐
│ 🔍 Search...  │ 📅 Date  │ Sort ▼  │
└─────────────────────────────────────┘
```

- **Search Bar**: Type to filter by name/description
- **Date Filter**: Select date to see active budgets
- **Sort Dropdown**: Choose sort field
- **Sort Order**: Click arrow to toggle asc/desc

### 6. **View Budget Details**

Each budget card shows:

- **Name & Status**: Green (Active), Orange (Warning), Red (Critical)
- **Description**: What the budget is for
- **Progress Bar**: Visual spending indicator
- **Amounts**: Budget, Spent, Remaining
- **Dates**: When the budget is active

### 7. **Take Actions**

Click the **⋮** menu on any budget:

- **📊 View Report**: See detailed expense breakdown
- **✏️ Edit Budget**: Modify budget details
- **🗑️ Delete Budget**: Remove budget (with confirmation)

---

## 🎨 Theme Switching

The component automatically adapts to your theme:

### Toggle Theme

1. Click theme icon in header
2. Component colors update instantly
3. All elements (cards, buttons, text) adapt

### Dark Mode Colors

- Background: Dark gray (#1b1b1b)
- Cards: Darker gray (#121212)
- Text: White
- Accent: Teal (#14b8a6)

### Light Mode Colors

- Background: White
- Cards: Light gray (#f5f5f5)
- Text: Dark gray
- Accent: Teal (#14b8a6)

---

## 📊 Understanding Status Indicators

Budgets show different colors based on health:

| Status      | Color  | Meaning       | Remaining |
| ----------- | ------ | ------------- | --------- |
| 🟢 Active   | Green  | Healthy       | > 30%     |
| 🟠 Warning  | Orange | Be careful    | 10-30%    |
| 🔴 Critical | Red    | Almost gone   | < 10%     |
| ⚫ Expired  | Gray   | Past end date | N/A       |

---

## 🎯 Common Tasks

### Task 1: Find a Specific Budget

```
1. Use search bar at top
2. Type budget name
3. Results filter instantly
```

### Task 2: See Only Active Budgets

```
1. Click "Active" tab
2. View currently running budgets
3. Switch back to "All" anytime
```

### Task 3: Check Budget Performance

```
1. Look at progress bar color:
   - Teal: Good (< 70%)
   - Orange: Warning (70-90%)
   - Red: Critical (> 90%)
2. Check remaining amount
3. Click "View Report" for details
```

### Task 4: Edit a Budget

```
1. Click ⋮ menu on budget card
2. Select "Edit Budget"
3. Modify values
4. Save changes
```

### Task 5: Delete Multiple Budgets

```
1. Switch to Table View
2. Check boxes for budgets
3. Use bulk actions (future feature)
```

---

## 📱 Mobile Usage

On mobile devices:

### Layout Changes

- Single column cards
- Compact header
- Simplified filters
- Touch-friendly buttons

### Best Practices

- Use search instead of scrolling
- Swipe on cards (future feature)
- Use tabs to filter quickly
- Portrait mode recommended

---

## 🔐 Permission Levels

### Full Access (Your Budgets)

✅ Create budgets  
✅ Edit budgets  
✅ Delete budgets  
✅ View reports

### Read-Only (Friend View)

❌ Cannot create  
❌ Cannot edit  
❌ Cannot delete  
✅ View reports

### Write Access (Friend with Permission)

✅ All operations on friend's budgets  
✅ Same as full access

---

## 🎓 Pro Tips

### Tip 1: Use Date Filter for Planning

```
Select future date → See upcoming budgets
Select past date → Review old budgets
```

### Tip 2: Sort by Remaining

```
Sort by: Remaining
Order: Ascending
Result: Budgets running low appear first
```

### Tip 3: Monitor Critical Budgets

```
1. Click "Active" tab
2. Look for red status chips
3. These need attention!
```

### Tip 4: Quick Report Access

```
Click "View Report" on card
→ Skip the menu!
```

### Tip 5: Use Search Operators

```
Search: "food"     → Finds "food", "Food Store"
Search: "nov"      → Finds November budgets
Search: "transport" → Finds related budgets
```

---

## 🐛 Troubleshooting

### Issue: Budgets Not Loading

**Solution:**

1. Check internet connection
2. Refresh page
3. Check console for errors
4. Verify you're logged in

### Issue: Can't Create Budget

**Solution:**

1. Ensure you have write access
2. Check if button is visible
3. Verify all required fields
4. Check date validity

### Issue: Search Not Working

**Solution:**

1. Clear search box
2. Try different keywords
3. Check for typos
4. Use partial matches

### Issue: Theme Not Switching

**Solution:**

1. Toggle theme in header
2. Check settings page
3. Clear browser cache
4. Reload page

### Issue: Cards Not Displaying

**Solution:**

1. Switch to table view
2. Check if budgets exist
3. Remove filters
4. Select "All" tab

---

## 📚 Keyboard Shortcuts (Future Feature)

| Key      | Action         |
| -------- | -------------- |
| `Ctrl+N` | New Budget     |
| `Ctrl+F` | Focus Search   |
| `Ctrl+T` | Toggle View    |
| `Escape` | Close Modal    |
| `Enter`  | Confirm Action |

---

## 🎯 User Scenarios

### Scenario 1: Monthly Budget Review

```
1. Navigate to Budget page
2. Click "All" tab
3. Sort by "Date"
4. Review each budget status
5. Click "View Report" for details
6. Adjust next month's budgets
```

### Scenario 2: Overspending Alert

```
1. See red status chip on card
2. Click "View Report"
3. Review expenses
4. Identify problem areas
5. Click "Edit" to adjust budget
```

### Scenario 3: Planning New Budget

```
1. Check statistics cards
2. See total spent/remaining
3. Click "New Budget"
4. Set realistic amount
5. Choose appropriate dates
6. Add helpful description
```

### Scenario 4: Friend Budget View

```
1. Navigate to friend's budget
2. View read-only if no permission
3. Click report icons
4. Review their spending patterns
5. Return to your budgets
```

---

## 🎨 Customization (For Developers)

### Change Card Layout

```javascript
// In Budget.jsx
<Grid item xs={12} sm={6} md={4}>  // Current
<Grid item xs={12} sm={6} md={6}>  // 2 columns max
```

### Adjust Statistics

```javascript
// Add new stat card
<Grid item xs={12} sm={6} md={3}>
  <Card>
    <CardContent>
      <Typography variant="h4">{customStat}</Typography>
    </CardContent>
  </Card>
</Grid>
```

### Modify Colors

```javascript
// In themeConfig.js
primary_accent: "#14b8a6",  // Change this
// Component updates automatically
```

---

## 📈 Best Practices

### For Users

1. **Regular Reviews**: Check budgets weekly
2. **Descriptive Names**: Use clear budget names
3. **Realistic Amounts**: Set achievable goals
4. **Monitor Status**: Watch for warning/critical
5. **View Reports**: Analyze spending patterns

### For Developers

1. **Use Theme Hook**: Always use `useTheme()`
2. **Memoize Calculations**: Use `useMemo` for performance
3. **Handle Errors**: Graceful error states
4. **Test Responsive**: Check all breakpoints
5. **Follow Patterns**: Match existing code style

---

## 🔄 What's Next?

### Coming Soon

- 📊 Budget analytics charts
- 📱 Budget templates
- 🔔 Push notifications
- 📤 Export to CSV/PDF
- 🔄 Recurring budgets
- 👥 Budget sharing
- 📈 Spending trends
- 🎯 Goal tracking

---

## 🆘 Need Help?

### Quick Links

- **Full Documentation**: `BUDGET_COMPONENT_REDESIGN.md`
- **Visual Comparison**: `BUDGET_VISUAL_COMPARISON.md`
- **Backend API**: `BudgetController.java`
- **Theme Config**: `src/config/themeConfig.js`

### Contact

- Check console for errors
- Review browser network tab
- Check Redux DevTools
- Verify API responses

---

## ✅ Quick Checklist

Before reporting issues, verify:

- [ ] I'm logged in
- [ ] I have the latest code
- [ ] Theme is properly configured
- [ ] Redux is working
- [ ] Backend is running
- [ ] JWT token is valid
- [ ] I have necessary permissions
- [ ] Browser is up to date
- [ ] Console shows no errors
- [ ] Network requests succeed

---

## 🎉 You're Ready!

Congratulations! You now know how to:

- ✅ Navigate the Budget component
- ✅ Create and manage budgets
- ✅ Use filters and search
- ✅ Switch between views
- ✅ Understand status indicators
- ✅ Take actions on budgets
- ✅ Work with themes
- ✅ Troubleshoot issues

**Happy budgeting! 💰📊🎯**

---

**Last Updated**: November 2, 2025  
**Version**: 2.0  
**Quick Start**: 5 minutes to mastery!
