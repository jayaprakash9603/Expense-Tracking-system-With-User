import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import { fetchCashflowExpenses } from "../../Redux/Expenses/expense.action";
import MonthlyCalendarView from "../../components/calendar/MonthlyCalendarView";
import { getFinanceCalendarColors } from "../../config/financeColorTokens";
import { useTheme } from "../../hooks/useTheme";
import { getPaymentMethodIcon } from "../../utils/iconMapping";

const PaymentMethodCalendarView = () => {
  const dispatch = useDispatch();
  const { cashflowExpenses } = useSelector((state) => state.expenses);
  const navigate = useNavigate();
  const { friendId } = useParams();
  const [monthOffset, setMonthOffset] = React.useState(0);
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
      })
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

      const paymentMethodName =
        expense?.paymentMethodName ||
        expense?.paymentMethod?.name ||
        expense?.paymentMethod ||
        item?.paymentMethodName ||
        item?.paymentMethod?.name ||
        item?.paymentMethod ||
        "Unknown";

      const paymentMethodIconKey =
        expense?.paymentMethodIcon ||
        expense?.paymentMethod?.icon ||
        item?.paymentMethodIcon ||
        item?.paymentMethod?.icon ||
        paymentMethodName;

      const paymentMethodColor =
        expense?.paymentMethodColor ||
        expense?.paymentMethod?.color ||
        item?.paymentMethodColor ||
        item?.paymentMethod?.color ||
        "#14b8a6";

      const matchKey = paymentMethodIconKey || paymentMethodName;
      const existingIdx = map[key].icons.findIndex(
        (x) => (x?.key || x?.label) === matchKey
      );

      if (existingIdx === -1) {
        map[key].icons.push({
          key: paymentMethodIconKey,
          label: paymentMethodName,
          color: paymentMethodColor,
        });
      } else if (!map[key].icons[existingIdx]?.color && paymentMethodColor) {
        map[key].icons[existingIdx] = {
          ...map[key].icons[existingIdx],
          color: paymentMethodColor,
        };
      }
    });

    return map;
  }, [cashflowExpenses]);

  const handleDayClick = (dateStr) => {
    if (friendId && friendId !== "undefined") {
      navigate(`/day-view/${dateStr}/friend/${friendId}`);
    } else {
      navigate(`/day-view/${dateStr}`);
    }
  };

  const handleMonthChange = (newDate, newOffset) => {
    setMonthOffset(newOffset);
  };

  const handleBack = () => {
    if (friendId && friendId !== "undefined") {
      navigate(`/payment-method/${friendId}`);
    } else {
      navigate("/payment-method");
    }
  };

  return (
    <MonthlyCalendarView
      title="Payment Method Calendar"
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
        renderIcon: (iconKey, props) => getPaymentMethodIcon(iconKey, props),
      }}
      initialDate={dayjs()}
      initialOffset={0}
      showSalaryIndicator={true}
      showTodayIndicator={true}
      showJumpToToday={true}
      showBackButton={true}
      showHeatmap={false}
      showSummaryCards={false}
    />
  );
};

export default PaymentMethodCalendarView;
