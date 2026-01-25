import React, { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import { fetchBillsForCalendar } from "../../Redux/Bill/bill.action";
import MonthlyCalendarView from "../../components/calendar/MonthlyCalendarView";
import usePreserveNavigationState from "../../hooks/usePreserveNavigationState";
import { getFinanceCalendarColors } from "../../config/financeColorTokens";
import { useTheme } from "../../hooks/useTheme";

const BillCalendarView = () => {
  const dispatch = useDispatch();
  const { billsCalendarData } = useSelector((state) => state.bill);
  const { friendId } = useParams();
  const [monthOffset, setMonthOffset] = React.useState(0);
  const { navigateWithState } = usePreserveNavigationState();
  const { mode } = useTheme();
  const financeColors = getFinanceCalendarColors(mode);

  // Fetch bills for the selected month
  React.useEffect(() => {
    dispatch(fetchBillsForCalendar("month", monthOffset, friendId || ""));
  }, [dispatch, monthOffset, friendId]);

  // Group bills by day and calculate spending/income
  const daysData = useMemo(() => {
    const map = {};
    if (!Array.isArray(billsCalendarData)) return map;

    billsCalendarData.forEach((bill) => {
      const date = dayjs(bill.date);
      const key = date.format("YYYY-MM-DD");
      if (!map[key]) map[key] = { spending: 0, income: 0 };

      const type = bill.type;
      const amount = bill.amount || 0;

      if (type === "loss") {
        map[key].spending += amount;
      } else if (type === "gain") {
        map[key].income += amount;
      }
    });
    return map;
  }, [billsCalendarData]);

  // Handle day click
  const handleDayClick = (dateStr) => {
    if (friendId && friendId !== "undefined") {
      navigateWithState(`/bill-day-view/${dateStr}/friend/${friendId}`);
    } else {
      navigateWithState(`/bill-day-view/${dateStr}`);
    }
  };

  // Handle month change
  const handleMonthChange = (newDate, newOffset) => {
    setMonthOffset(newOffset);
  };

  // Handle back button
  const handleBack = () => {
    if (friendId && friendId !== "undefined") {
      navigateWithState(`/bill/${friendId}`);
    } else {
      navigateWithState("/bill");
    }
  };

  return (
    <MonthlyCalendarView
      title="Bills Calendar View"
      data={daysData}
      onDayClick={handleDayClick}
      onMonthChange={handleMonthChange}
      onBack={handleBack}
      showHeatmapModeToggle={true}
      summaryConfig={{
        spendingLabel: "Bill Spending",
        incomeLabel: "Bill Income",
        spendingKey: "spending",
        incomeKey: "income",
        spendingColor: financeColors.spending.base,
        incomeColor: financeColors.income.base,
        spendingIconColor: financeColors.spending.icon,
        incomeIconColor: financeColors.income.icon,
        spendingTextColor: financeColors.spending.text,
        incomeTextColor: financeColors.income.text,
      }}
      initialDate={dayjs()}
      initialOffset={0}
      showSalaryIndicator={true}
      showTodayIndicator={true}
      showJumpToToday={true}
      showBackButton={true}
    />
  );
};

export default BillCalendarView;
