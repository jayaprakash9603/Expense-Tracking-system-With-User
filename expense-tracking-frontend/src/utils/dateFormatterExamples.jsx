/**
 * Date Formatter Usage Examples
 *
 * This file demonstrates practical examples of using the date formatter utility
 * in various React components throughout the application.
 */

import React from "react";
import {
  formatDate,
  formatDateTime,
  formatRelativeDate,
  getMonthName,
  getDayName,
  parseDate,
  isValidDateFormat,
} from "../utils/dateFormatter";
import useUserSettings from "../hooks/useUserSettings";

// ============================================================================
// EXAMPLE 1: Basic Date Formatting in a Table
// ============================================================================

export const BillsTableExample = ({ bills }) => {
  const settings = useUserSettings();

  return (
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        {bills.map((bill) => (
          <tr key={bill.id}>
            <td>{formatDate(bill.date, settings.dateFormat)}</td>
            <td>{bill.description}</td>
            <td>{bill.amount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// ============================================================================
// EXAMPLE 2: Date with Time
// ============================================================================

export const ActivityLogExample = ({ activities }) => {
  const settings = useUserSettings();

  return (
    <div className="activity-log">
      {activities.map((activity) => (
        <div key={activity.id} className="activity-item">
          <span className="activity-description">{activity.description}</span>
          <span className="activity-timestamp">
            {formatDateTime(
              activity.timestamp,
              settings.dateFormat,
              settings.timeFormat || "12h"
            )}
          </span>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// EXAMPLE 3: Relative Dates (Today, Yesterday, etc.)
// ============================================================================

export const NotificationsExample = ({ notifications }) => {
  const settings = useUserSettings();

  return (
    <div className="notifications">
      {notifications.map((notification) => (
        <div key={notification.id} className="notification-card">
          <p>{notification.message}</p>
          <small className="notification-time">
            {formatRelativeDate(notification.date, settings.dateFormat)}
          </small>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// EXAMPLE 4: Month and Day Names (Localized)
// ============================================================================

export const CalendarHeaderExample = () => {
  const settings = useUserSettings();
  const currentMonth = new Date().getMonth();

  return (
    <div className="calendar-header">
      <h2>{getMonthName(currentMonth, settings.language, "long")}</h2>
      <div className="weekday-labels">
        {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
          <div key={dayIndex} className="weekday-label">
            {getDayName(dayIndex, settings.language, "short")}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// EXAMPLE 5: Chart Tooltip with Formatted Dates
// ============================================================================

export const CustomChartTooltipExample = ({ active, payload }) => {
  const settings = useUserSettings();

  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="custom-tooltip">
      <p className="tooltip-date">
        {formatDate(data.date, settings.dateFormat)}
      </p>
      <p className="tooltip-value">
        Amount: {settings.getCurrency().symbol}
        {data.amount}
      </p>
    </div>
  );
};

// ============================================================================
// EXAMPLE 6: Date Input with Parsing
// ============================================================================

export const DateInputExample = ({ value, onChange, label }) => {
  const settings = useUserSettings();
  const [error, setError] = React.useState("");

  const handleChange = (e) => {
    const inputValue = e.target.value;

    // Validate format
    if (!isValidDateFormat(inputValue, settings.dateFormat)) {
      setError(`Please use format: ${settings.dateFormat}`);
      return;
    }

    // Parse to Date object
    const parsedDate = parseDate(inputValue, settings.dateFormat);
    if (parsedDate) {
      setError("");
      onChange(parsedDate);
    } else {
      setError("Invalid date");
    }
  };

  return (
    <div className="date-input-wrapper">
      <label>{label}</label>
      <input
        type="text"
        value={value ? formatDate(value, settings.dateFormat) : ""}
        onChange={handleChange}
        placeholder={settings.getDateFormatExample()}
        className={error ? "error" : ""}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

// ============================================================================
// EXAMPLE 7: Date Range Display
// ============================================================================

export const DateRangeDisplayExample = ({ startDate, endDate }) => {
  const settings = useUserSettings();

  return (
    <div className="date-range">
      <span className="date-range-label">Period:</span>
      <span className="date-range-value">
        {formatDate(startDate, settings.dateFormat)}
        {" to "}
        {formatDate(endDate, settings.dateFormat)}
      </span>
    </div>
  );
};

// ============================================================================
// EXAMPLE 8: Passing Format to Child Component
// ============================================================================

export const ParentComponentExample = () => {
  const settings = useUserSettings();
  const bills = []; // Your data here

  return (
    <div>
      <h1>Bills Report</h1>
      <BillsListChild
        bills={bills}
        dateFormat={settings.dateFormat}
        currencySymbol={settings.getCurrency().symbol}
      />
    </div>
  );
};

const BillsListChild = ({ bills, dateFormat, currencySymbol }) => {
  return (
    <ul>
      {bills.map((bill) => (
        <li key={bill.id}>
          <span>{formatDate(bill.date, dateFormat)}</span>
          <span>{bill.description}</span>
          <span>
            {currencySymbol}
            {bill.amount}
          </span>
        </li>
      ))}
    </ul>
  );
};

// ============================================================================
// EXAMPLE 9: Summary Card with Multiple Date Formats
// ============================================================================

export const SummaryCardExample = ({ bill }) => {
  const settings = useUserSettings();

  return (
    <div className="bill-summary-card">
      <h3>{bill.name}</h3>

      {/* Full formatted date */}
      <p className="bill-date">
        Date: {formatDate(bill.date, settings.dateFormat)}
      </p>

      {/* Relative date */}
      <p className="bill-relative-date">
        {formatRelativeDate(bill.date, settings.dateFormat)}
      </p>

      {/* With time */}
      <p className="bill-created">
        Created: {formatDateTime(bill.createdAt, settings.dateFormat, "12h")}
      </p>

      <p className="bill-amount">
        {settings.getCurrency().symbol}
        {bill.amount}
      </p>
    </div>
  );
};

// ============================================================================
// EXAMPLE 10: Filter by Date Range
// ============================================================================

export const DateRangeFilterExample = () => {
  const settings = useUserSettings();
  const [startDate, setStartDate] = React.useState(null);
  const [endDate, setEndDate] = React.useState(null);

  const handleFilter = () => {
    if (startDate && endDate) {
      console.log("Filtering from", startDate, "to", endDate);
      // Apply filter logic here
    }
  };

  return (
    <div className="date-range-filter">
      <DateInputExample
        value={startDate}
        onChange={setStartDate}
        label="Start Date"
      />
      <DateInputExample
        value={endDate}
        onChange={setEndDate}
        label="End Date"
      />
      <button onClick={handleFilter}>Apply Filter</button>
    </div>
  );
};

// ============================================================================
// EXAMPLE 11: Month Selector
// ============================================================================

export const MonthSelectorExample = ({ selectedMonth, onMonthChange }) => {
  const settings = useUserSettings();

  return (
    <select
      value={selectedMonth}
      onChange={(e) => onMonthChange(parseInt(e.target.value))}
    >
      {Array.from({ length: 12 }, (_, i) => (
        <option key={i} value={i}>
          {getMonthName(i, settings.language, "long")}
        </option>
      ))}
    </select>
  );
};

// ============================================================================
// EXAMPLE 12: Expense Timeline
// ============================================================================

export const ExpenseTimelineExample = ({ expenses }) => {
  const settings = useUserSettings();

  // Group expenses by date
  const groupedExpenses = expenses.reduce((acc, expense) => {
    const dateKey = formatDate(expense.date, settings.dateFormat);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(expense);
    return acc;
  }, {});

  return (
    <div className="expense-timeline">
      {Object.entries(groupedExpenses).map(([date, dateExpenses]) => (
        <div key={date} className="timeline-day">
          <h3 className="timeline-date">
            {formatRelativeDate(dateExpenses[0].date, settings.dateFormat)}
          </h3>
          <div className="timeline-expenses">
            {dateExpenses.map((expense) => (
              <div key={expense.id} className="timeline-expense">
                <span>{expense.description}</span>
                <span>
                  {settings.getCurrency().symbol}
                  {expense.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// EXAMPLE 13: Export Data with Formatted Dates
// ============================================================================

export const ExportToCSVExample = ({ data }) => {
  const settings = useUserSettings();

  const handleExport = () => {
    const csvData = data.map((row) => ({
      date: formatDate(row.date, settings.dateFormat),
      description: row.description,
      amount: row.amount,
      category: row.category,
    }));

    // Convert to CSV and download
    const csv = [
      ["Date", "Description", "Amount", "Category"],
      ...csvData.map((row) => [
        row.date,
        row.description,
        row.amount,
        row.category,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses_${formatDate(new Date(), "YYYY-MM-DD")}.csv`;
    a.click();
  };

  return <button onClick={handleExport}>Export to CSV</button>;
};

// ============================================================================
// BEST PRACTICES SUMMARY
// ============================================================================

/**
 * BEST PRACTICES:
 *
 * 1. Always import formatDate from utils/dateFormatter
 * 2. Always use settings.dateFormat from useUserSettings hook
 * 3. Pass dateFormat as prop to child components
 * 4. Use formatRelativeDate for recent dates in activity feeds
 * 5. Use formatDateTime when you need both date and time
 * 6. Use parseDate for validating user input
 * 7. Use getMonthName and getDayName for localized calendar displays
 * 8. Handle null/undefined dates gracefully
 * 9. Show format example in date input placeholders
 * 10. Use isValidDateFormat before parsing user input
 */

export default {
  BillsTableExample,
  ActivityLogExample,
  NotificationsExample,
  CalendarHeaderExample,
  CustomChartTooltipExample,
  DateInputExample,
  DateRangeDisplayExample,
  ParentComponentExample,
  SummaryCardExample,
  DateRangeFilterExample,
  MonthSelectorExample,
  ExpenseTimelineExample,
  ExportToCSVExample,
};
