import React, { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import { fetchCashflowExpenses } from "../../Redux/Expenses/expense.action";
import MonthlyCalendarView from "../../components/calendar/MonthlyCalendarView";

const CalendarView = () => {
  const dispatch = useDispatch();
  const { cashflowExpenses } = useSelector((state) => state.expenses);
  const navigate = useNavigate();
  const { friendId } = useParams();
  const [monthOffset, setMonthOffset] = React.useState(0);

  // Fetch cashflow expenses for the selected month
  React.useEffect(() => {
    dispatch(
      fetchCashflowExpenses({
        range: "month",
        offset: monthOffset,
        flowType: null,
        targetId: friendId || undefined,
        groupBy: false,
      })
    );
  }, [dispatch, monthOffset, friendId]);

  // Group expenses by day and calculate spending/income
  const daysData = useMemo(() => {
    const map = {};
    if (!Array.isArray(cashflowExpenses)) return map;

    cashflowExpenses.forEach((item) => {
      const date = dayjs(item.date || item.expense?.date);
      const key = date.format("YYYY-MM-DD");
      if (!map[key]) map[key] = { spending: 0, income: 0 };

      const type = item.type || item.expense?.type;
      const amt = item.amount ?? item.expense?.amount ?? 0;

      if (type === "loss") map[key].spending += amt;
      if (type === "gain") map[key].income += amt;
    });

    return map;
  }, [cashflowExpenses]);

  // Handle day click
  const handleDayClick = (dateStr) => {
    if (friendId && friendId !== "undefined") {
      navigate(`/day-view/${dateStr}/friend/${friendId}`);
    } else {
      navigate(`/day-view/${dateStr}`);
    }
  };

  // Handle month change
  const handleMonthChange = (newDate, newOffset) => {
    setMonthOffset(newOffset);
  };

  // Handle back button
  const handleBack = () => {
    if (friendId && friendId !== "undefined") {
      navigate(`/friends/expenses/${friendId}`);
    } else {
      navigate("/expenses");
    }
  };

  return (
    <MonthlyCalendarView
      title="Calendar View"
      data={daysData}
      onDayClick={handleDayClick}
      onMonthChange={handleMonthChange}
      onBack={handleBack}
      summaryConfig={{
        spendingLabel: "Spending",
        incomeLabel: "Income",
        spendingKey: "spending",
        incomeKey: "income",
        spendingColor: "#cf667a",
        incomeColor: "#437746",
        spendingIconColor: "#e2a4af",
        incomeIconColor: "#84ba86",
        spendingTextColor: "#e6a2af",
        incomeTextColor: "#83b985",
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

export default CalendarView;
