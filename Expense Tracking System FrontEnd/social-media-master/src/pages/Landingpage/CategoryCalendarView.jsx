import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import { fetchCashflowExpenses } from "../../Redux/Expenses/expense.action";
import MonthlyCalendarView from "../../components/calendar/MonthlyCalendarView";
import { getFinanceCalendarColors } from "../../config/financeColorTokens";
import { useTheme } from "../../hooks/useTheme";
import { getCategoryIcon } from "../../utils/iconMapping";
import CalendarDayDetailsSidebar from "../../components/calendar/CalendarDayDetailsSidebar";

const CategoryCalendarView = () => {
  const dispatch = useDispatch();
  const { cashflowExpenses } = useSelector((state) => state.expenses);
  const navigate = useNavigate();
  const { friendId } = useParams();
  const [monthOffset, setMonthOffset] = React.useState(0);
  const [selectedDateStr, setSelectedDateStr] = React.useState(null);
  const { mode } = useTheme();
  const financeColors = getFinanceCalendarColors(mode);

  React.useEffect(() => {
    dispatch(
      fetchCashflowExpenses({
        range: "month",
        offset: monthOffset,
        flowType: null,
        targetId: friendId || undefined,
        groupBy: false,
      }),
    );
  }, [dispatch, monthOffset, friendId]);

  const daysData = useMemo(() => {
    const map = {};
    if (!Array.isArray(cashflowExpenses)) return map;

    cashflowExpenses.forEach((item) => {
      const expense = item?.expense || item;
      const date = dayjs(expense?.date || item?.date);
      const key = date.format("YYYY-MM-DD");
      if (!map[key]) map[key] = { spending: 0, income: 0, icons: [] };

      const categoryName =
        expense?.categoryName ||
        expense?.category?.name ||
        expense?.category ||
        item?.categoryName ||
        item?.category?.name ||
        item?.category ||
        "Uncategorized";

      const categoryIconKey =
        expense?.categoryIcon ||
        expense?.category?.icon ||
        item?.categoryIcon ||
        item?.category?.icon ||
        categoryName;

      const categoryColor =
        expense?.categoryColor ||
        expense?.category?.color ||
        item?.categoryColor ||
        item?.category?.color ||
        "#14b8a6";

      const matchKey = categoryIconKey || categoryName;
      const existingIdx = map[key].icons.findIndex(
        (x) => (x?.key || x?.label) === matchKey,
      );

      if (existingIdx === -1) {
        map[key].icons.push({
          key: categoryIconKey,
          label: categoryName,
          color: categoryColor,
        });
      } else if (!map[key].icons[existingIdx]?.color && categoryColor) {
        map[key].icons[existingIdx] = {
          ...map[key].icons[existingIdx],
          color: categoryColor,
        };
      }
    });

    return map;
  }, [cashflowExpenses]);

  const monthDate = useMemo(
    () => dayjs().add(monthOffset, "month"),
    [monthOffset],
  );

  const handleDayClick = (dateStr) => {
    setSelectedDateStr(dateStr);
  };

  const handleMonthChange = (newDate, newOffset) => {
    setMonthOffset(newOffset);
    setSelectedDateStr(null);
  };

  const handleNavigateToDate = (nextDateStr) => {
    if (!nextDateStr) return;
    const next = dayjs(nextDateStr);
    if (next.isValid()) {
      const diff = next
        .startOf("month")
        .diff(dayjs().startOf("month"), "month");
      if (diff !== monthOffset) {
        setMonthOffset(diff);
      }
    }
    setSelectedDateStr(nextDateStr);
  };

  const handleBack = () => {
    if (friendId && friendId !== "undefined") {
      navigate(`/category-flow/${friendId}`);
    } else {
      navigate("/category-flow");
    }
  };

  const selectedDayItems = useMemo(() => {
    if (!selectedDateStr || !Array.isArray(cashflowExpenses)) return [];
    return cashflowExpenses.filter((it) => {
      const exp = it?.expense || it;
      const d = dayjs(exp?.date || it?.date);
      return d.isValid() && d.format("YYYY-MM-DD") === selectedDateStr;
    });
  }, [cashflowExpenses, selectedDateStr]);

  const availableDates = useMemo(() => {
    if (!Array.isArray(cashflowExpenses)) return [];
    const dates = cashflowExpenses
      .map((it) => {
        const exp = it?.expense || it;
        const d = dayjs(exp?.date || it?.date);
        return d.isValid() ? d.format("YYYY-MM-DD") : null;
      })
      .filter(Boolean);
    return Array.from(new Set(dates)).sort();
  }, [cashflowExpenses]);

  return (
    <MonthlyCalendarView
      title="Category Calendar"
      data={daysData}
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
      dayCellConfig={{
        iconsKey: "icons",
        maxIcons: 4,
        renderIcon: (iconKey, props) => getCategoryIcon(iconKey, props),
      }}
      initialDate={dayjs()}
      initialOffset={0}
      controlledDate={monthDate}
      controlledOffset={monthOffset}
      showSalaryIndicator={true}
      showTodayIndicator={true}
      showJumpToToday={true}
      showBackButton={true}
      showHeatmap={false}
      showSummaryCards={false}
      rightPanelOpen={Boolean(selectedDateStr)}
      rightPanelWidth={350}
      rightPanelGap={10}
      rightPanel={
        <CalendarDayDetailsSidebar
          dateStr={selectedDateStr}
          items={selectedDayItems}
          availableDates={availableDates}
          headerTitle="Category Calendar"
          onClose={() => setSelectedDateStr(null)}
          onNavigateDate={handleNavigateToDate}
          onItemClick={(expenseLike) => {
            const expenseId =
              expenseLike?.id ||
              expenseLike?.expenseId ||
              expenseLike?.expense?.id ||
              expenseLike?.expense?.expenseId;
            if (!expenseId) return;

            if (friendId && friendId !== "undefined") {
              navigate(`/expenses/edit/${expenseId}/friend/${friendId}`);
            } else {
              navigate(`/expenses/edit/${expenseId}`);
            }
          }}
          renderLeadingIcon={(raw, ctx) =>
            getCategoryIcon(ctx?.category?.iconKey || ctx?.category?.name, {
              sx: { color: ctx?.category?.color || "#14b8a6", fontSize: 18 },
            })
          }
        />
      }
    />
  );
};

export default CategoryCalendarView;
