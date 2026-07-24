import React, { useMemo } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "../../hooks/useTheme";
import useUserSettings from "../../hooks/useUserSettings";
import { useTranslation } from "../../hooks/useTranslation";
import { formatNumberFull } from "../../utils/formatting/numberFormatters";
import DashboardDataTable, {
  buildFlowExpenseColumns,
} from "./DashboardDataTable";

const FlowExpenseTable = ({
  title,
  expenses = [],
  isMobile,
  isTablet,
  onClose,
}) => {
  const { colors, mode } = useTheme();
  const { t } = useTranslation();
  const settings = useUserSettings();

  const currencySymbol = settings.getCurrency().symbol;
  const dateFormat = settings.dateFormat || "DD/MM/YYYY";
  const isDark = mode === "dark";

  const rows = useMemo(
    () =>
      Array.isArray(expenses)
        ? expenses
            .filter((expense) => expense != null)
            .map((expense, index) => {
              const details = expense.expense || expense.details || expense;
              const typeRaw = (
                details.type ||
                expense.type ||
                details.flowType ||
                "loss"
              )
                ?.toString()
                .toLowerCase();
              const isIncome = typeRaw === "gain" || typeRaw === "income";

              return {
                id: expense.id || details.id || `expense-${index}`,
                name:
                  details.expenseName ||
                  expense.expenseName ||
                  t("flows.expensesTable.unnamedExpense"),
                date: expense.date || details.date || "",
                amount:
                  details.amount ?? details.netAmount ?? expense.amount ?? 0,
                type: typeRaw,
                isIncome,
              };
            })
        : [],
    [expenses, t]
  );

  const totals = useMemo(() => {
    const count = rows.length;
    const sum = rows.reduce((acc, row) => acc + (Number(row.amount) || 0), 0);
    return { count, sum };
  }, [rows]);

  const columns = useMemo(
    () =>
      buildFlowExpenseColumns({
        t,
        currencySymbol,
        dateFormat,
      }),
    [t, currencySymbol, dateFormat]
  );

  const tableMaxHeight = isMobile ? 280 : isTablet ? 320 : 360;

  return (
    <div
      className="w-full rounded-lg p-4 mb-4"
      style={{
        background: colors.primary_bg,
        border: `1px solid ${colors.border_color}`,
        boxShadow: isDark
          ? "0 10px 30px rgba(0,0,0,0.40)"
          : "0 10px 30px rgba(17,24,39,0.08)",
        minWidth: 0,
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
          mb: 1.5,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant={isMobile ? "subtitle1" : "h6"}
            sx={{
              color: colors.primary_text,
              fontWeight: 800,
              lineHeight: 1.2,
              mb: 0.5,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={title ?? t("flows.expensesTable.title")}
          >
            {title ?? t("flows.expensesTable.title")}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: colors.secondary_text, fontWeight: 600 }}
          >
            {t("flows.expensesTable.summary", {
              count: totals.count,
              total: `${currencySymbol}${formatNumberFull(totals.sum)}`,
            })}
          </Typography>
        </Box>

        <IconButton
          onClick={onClose}
          aria-label={t("common.close")}
          sx={{
            color: colors.primary_text,
            border: `1px solid ${colors.border_color}`,
            borderRadius: "10px",
            width: 36,
            height: 36,
            "&:hover": {
              backgroundColor: colors.hover_bg,
              borderColor: colors.primary_accent,
            },
          }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <DashboardDataTable
        columns={columns}
        data={rows}
        getRowId={(row) => String(row.id)}
        defaultPageSize={5}
        pageSizeOptions={[5, 10, 20]}
        defaultSorting={[{ id: "date", desc: true }]}
        emptyTitle={t("flows.expensesTable.empty")}
        emptySubtitle={t("flows.expensesTable.emptyHint")}
        maxHeight={tableMaxHeight}
        footerSelectionLabel={`${totals.count} entr${totals.count === 1 ? "y" : "ies"} • Total ${currencySymbol}${formatNumberFull(totals.sum)}`}
      />
    </div>
  );
};

export default FlowExpenseTable;
