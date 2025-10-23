import React, { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import { fetchBillsForCalendar } from "../../Redux/Bill/bill.action";
import MonthlyCalendarView from "../../components/calendar/MonthlyCalendarView";

const BillCalendarView = () => {
  const dispatch = useDispatch();
  const { billsCalendarData } = useSelector((state) => state.bill);
  const navigate = useNavigate();
  const { friendId } = useParams();
  const [monthOffset, setMonthOffset] = React.useState(0);

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
      navigate(`/bill-day-view/${dateStr}/friend/${friendId}`);
    } else {
      navigate(`/bill-day-view/${dateStr}`);
    }
  };

  // Handle month change
  const handleMonthChange = (newDate, newOffset) => {
    setMonthOffset(newOffset);
  };

  // Handle back button
  const handleBack = () => {
    if (friendId && friendId !== "undefined") {
      navigate(`/bill/${friendId}`);
    } else {
      navigate("/bill");
    }
  };

  return (
    <MonthlyCalendarView
      title="Bills Calendar View"
      data={daysData}
      onDayClick={handleDayClick}
      onMonthChange={handleMonthChange}
      onBack={handleBack}
      summaryConfig={{
        spendingLabel: "Bill Spending",
        incomeLabel: "Bill Income",
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

export default BillCalendarView;
