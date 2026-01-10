import React, { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import { fetchCashflowExpenses } from "../../Redux/Expenses/expense.action";
import MonthlyCalendarView from "../../components/calendar/MonthlyCalendarView";
import { getFinanceCalendarColors } from "../../config/financeColorTokens";
import { useTheme } from "../../hooks/useTheme";
import { api } from "../../config/api";
import { getSpendingMomentumInsight } from "../../utils/spendingMomentum/spendingMomentum";

const CalendarView = () => {
  const dispatch = useDispatch();
  const { cashflowExpenses } = useSelector((state) => state.expenses);
  const navigate = useNavigate();
  const { friendId } = useParams();
  const [monthOffset, setMonthOffset] = React.useState(0);
  const { mode } = useTheme();
  const financeColors = getFinanceCalendarColors(mode);

  const [momentumExpenses, setMomentumExpenses] = React.useState([]);

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

  // Fetch last two weeks of expenses for Spending Momentum (always anchored to today).
  React.useEffect(() => {
    let cancelled = false;

    const fetchMomentum = async () => {
      try {
        const to = dayjs().format("YYYY-MM-DD");
        const from = dayjs().subtract(20, "day").format("YYYY-MM-DD");

        const { data } = await api.get("/api/expenses/fetch-expenses-by-date", {
          params: {
            from,
            to,
            targetId: friendId || undefined,
          },
        });

        if (!cancelled) {
          setMomentumExpenses(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        if (!cancelled) setMomentumExpenses([]);
      }
    };

    fetchMomentum();
    return () => {
      cancelled = true;
    };
  }, [friendId]);

  const momentumInsight = useMemo(() => {
    return getSpendingMomentumInsight({
      items: momentumExpenses,
      now: dayjs(),
    });
  }, [momentumExpenses]);

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
      momentumInsight={momentumInsight}
      onDayClick={handleDayClick}
      onMonthChange={handleMonthChange}
      onBack={handleBack}
      summaryConfig={{
        spendingLabel: "Spending",
        incomeLabel: "Income",
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

export default CalendarView;
