import React, { useMemo } from "react";
import dayjs from "dayjs";
import { Box, Chip, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "../../hooks/useTheme";
import useUserSettings from "../../hooks/useUserSettings";
import { useTranslation } from "../../hooks/useTranslation";
import { formatNumberFull } from "../../utils/numberFormatters";

/**
 * FlowExpenseTable
 * Generic DataGrid table for displaying expenses of a selected entity.
 * Handles internal sorting and basic formatting.
 */
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
            .filter((e) => e != null)
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
                date:
                  expense.date ||
                  details.date ||
                  t("flows.expensesTable.noDate"),
                amount:
                  details.amount ?? details.netAmount ?? expense.amount ?? 0,
                type: typeRaw,
                isIncome,
              };
            })
        : [],
    [expenses, t],
  );

  const totals = useMemo(() => {
    const count = rows.length;
    const sum = rows.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
    return { count, sum };
  }, [rows]);

  const NoRowsOverlay = () => (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.5,
        color: colors.secondary_text,
        px: 2,
        textAlign: "center",
      }}
    >
      <Typography sx={{ fontWeight: 900, color: colors.primary_text }}>
        {t("flows.expensesTable.empty")}
      </Typography>
      <Typography variant="body2" sx={{ color: colors.secondary_text }}>
        {t("flows.expensesTable.emptyHint")}
      </Typography>
    </Box>
  );

  const columns = useMemo(
    () => [
      {
        field: "name",
        headerName: t("cashflow.tableHeaders.name"),
        flex: 2,
        minWidth: 200,
        sortable: true,
        renderCell: (params) => (
          <Box
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              color: colors.primary_text,
              fontWeight: 600,
              width: "100%",
            }}
            title={params.value}
          >
            {params.value}
          </Box>
        ),
      },
      {
        field: "date",
        headerName: t("cashflow.tableHeaders.date"),
        flex: 1,
        minWidth: 130,
        sortable: true,
        valueGetter: (value) => value,
        sortComparator: (v1, v2) => {
          const d1 = dayjs(v1);
          const d2 = dayjs(v2);
          const t1 = d1.isValid() ? d1.valueOf() : 0;
          const t2 = d2.isValid() ? d2.valueOf() : 0;
          return t1 - t2;
        },
        renderCell: (params) => (
          <Box sx={{ color: colors.secondary_text, fontWeight: 500 }}>
            {dayjs(params.value).isValid()
              ? dayjs(params.value).format(dateFormat)
              : t("flows.expensesTable.noDate")}
          </Box>
        ),
      },
      {
        field: "amount",
        headerName: t("cashflow.tableHeaders.amount"),
        type: "number",
        flex: 1,
        minWidth: 130,
        sortable: true,
        headerAlign: "right",
        align: "right",
        renderCell: (params) => {
          const amountColor = params.row.isIncome ? "#06D6A0" : "#FF6B6B";
          return (
            <Box
              sx={{
                color: amountColor,
                fontWeight: 800,
                width: "100%",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              {currencySymbol}
              {formatNumberFull(params.value)}
            </Box>
          );
        },
      },
      {
        field: "type",
        headerName: t("cashflow.tableHeaders.type"),
        flex: 0.8,
        minWidth: 120,
        sortable: true,
        renderCell: (params) => {
          const isIncome = params.row.isIncome;
          return (
            <Chip
              size="small"
              label={
                isIncome
                  ? t("flows.expensesTable.type.income")
                  : t("flows.expensesTable.type.expense")
              }
              sx={{
                fontWeight: 800,
                borderRadius: "10px",
                height: 26,
                backgroundColor: isIncome
                  ? isDark
                    ? "rgba(6, 214, 160, 0.18)"
                    : "rgba(6, 214, 160, 0.16)"
                  : isDark
                    ? "rgba(255, 107, 107, 0.20)"
                    : "rgba(255, 107, 107, 0.16)",
                color: isIncome ? "#06D6A0" : "#FF6B6B",
                border: `1px solid ${
                  isIncome
                    ? "rgba(6, 214, 160, 0.35)"
                    : "rgba(255, 107, 107, 0.35)"
                }`,
              }}
            />
          );
        },
      },
    ],
    [
      colors.primary_text,
      colors.secondary_text,
      currencySymbol,
      dateFormat,
      isDark,
      t,
    ],
  );

  const tableHeight = isMobile ? 200 : isTablet ? 250 : 320;

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
        position: "relative",
        maxHeight: `calc(100% - ${isMobile ? 200 : 240}px)`,
        overflow: "hidden",
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
              fontWeight: 900,
              lineHeight: 1.1,
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
            backgroundColor: isDark
              ? "rgba(255,255,255,0.06)"
              : "rgba(17,24,39,0.05)",
            "&:hover": {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.10)"
                : "rgba(17,24,39,0.08)",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <div style={{ height: tableHeight, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          disableSelectionOnClick
          disableRowSelectionOnClick
          autoHeight={false}
          hideFooterSelectedRowCount
          disableExtendRowFullWidth={true}
          rowHeight={44}
          disableColumnMenu
          getRowClassName={(params) =>
            params.indexRelativeToCurrentPage % 2 === 0
              ? "flowExpenseTable--even"
              : "flowExpenseTable--odd"
          }
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
            sorting: { sortModel: [{ field: "date", sort: "desc" }] },
          }}
          pageSizeOptions={[5, 10, 20]}
          slots={{
            noRowsOverlay: NoRowsOverlay,
          }}
          sx={{
            bgcolor: colors.primary_bg,
            color: colors.primary_text,
            border: "none",
            borderRadius: "12px",
            overflow: "hidden",
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: isDark ? "#161616" : "#fafafa",
              color: colors.primary_text,
              borderBottom: `1px solid ${colors.border_color}`,
              minHeight: "44px !important",
              maxHeight: "44px !important",
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: 900,
              fontSize: "0.85rem",
              letterSpacing: "0.02em",
            },
            "& .MuiDataGrid-columnSeparator": {
              color: colors.border_color,
              opacity: 0.8,
            },
            "& .MuiDataGrid-row": {
              borderBottom: `1px solid ${colors.border_light}`,
            },
            "& .MuiDataGrid-cell": {
              px: 1.25,
              display: "flex",
              alignItems: "center",
              color: colors.primary_text,
              borderBottom: "none",
            },
            "& .flowExpenseTable--even": {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.00)"
                : "rgba(17,24,39,0.02)",
            },
            "& .flowExpenseTable--odd": {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.02)"
                : "rgba(17,24,39,0.00)",
            },
            "& .MuiDataGrid-row:hover": { bgcolor: colors.hover_bg },
            "& .MuiDataGrid-footerContainer": {
              bgcolor: colors.primary_bg,
              borderTop: `1px solid ${colors.border_color}`,
              color: colors.primary_text,
              minHeight: "44px",
            },
            "& .MuiTablePagination-root": { color: colors.primary_text },
            "& .MuiSvgIcon-root": { color: colors.primary_text },
            height: isMobile ? 200 : isTablet ? 250 : 315,
          }}
        />
      </div>
    </div>
  );
};

export default FlowExpenseTable;
