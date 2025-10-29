import React, { useMemo, useState } from "react";
import dayjs from "dayjs";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "../../hooks/useTheme";

/**
 * FlowExpenseTable
 * Generic DataGrid table for displaying expenses of a selected entity.
 * Handles internal sorting and basic formatting.
 */
const FlowExpenseTable = ({
  title = "Expenses",
  expenses = [],
  isMobile,
  isTablet,
  onClose,
}) => {
  const { colors } = useTheme();
  const [sort, setSort] = useState({ field: "date", direction: "desc" });

  const rows = useMemo(
    () =>
      Array.isArray(expenses)
        ? expenses
            .filter((e) => e != null)
            .map((expense, index) => {
              const details = expense.details || expense;
              return {
                id: expense.id || `expense-${index}`,
                name:
                  details.expenseName ||
                  expense.expenseName ||
                  "Unnamed Expense",
                date: expense.date || details.date || "No date",
                amount: details.amount || expense.amount || 0,
                type: details.type || expense.type || "loss",
              };
            })
        : [],
    [expenses]
  );

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const { field, direction } = sort;
      const mult = direction === "asc" ? 1 : -1;
      if (field === "date") {
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return mult * (dateA - dateB);
      } else if (field === "amount") {
        return mult * (a.amount - b.amount);
      } else if (field === "name") {
        return mult * a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [rows, sort]);

  const toggleSort = (field) => {
    setSort((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const columns = [
    {
      field: "name",
      headerName: "Name",
      flex: 2,
      renderCell: (params) => (
        <div
          style={{
            color: colors.primary_text,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={params.value}
        >
          {params.value}
        </div>
      ),
      sortable: false,
    },
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      renderCell: (params) => (
        <div style={{ color: colors.primary_text }}>
          {typeof params.value === "string"
            ? dayjs(params.value).format("DD/MM/YYYY")
            : "No date"}
        </div>
      ),
      sortable: false,
    },
    {
      field: "amount",
      headerName: "Amount",
      flex: 1,
      renderCell: (params) => {
        const isIncome =
          params.row.type === "gain" || params.row.type === "income";
        return (
          <div
            style={{
              color: isIncome ? "#06D6A0" : "#FF6B6B",
              fontWeight: "bold",
            }}
          >
            ₹{Number(params.value)}
          </div>
        );
      },
      sortable: false,
    },
    {
      field: "type",
      headerName: "Type",
      flex: 1,
      renderCell: (params) => {
        const isIncome = params.value === "gain" || params.value === "income";
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-bold ${
              isIncome ? "bg-[#06D6A0] text-black" : "bg-[#FF6B6B] text-white"
            }`}
          >
            {isIncome ? "Income" : "Expense"}
          </span>
        );
      },
      sortable: false,
    },
  ];

  const tableHeight = isMobile ? 200 : isTablet ? 250 : 320;

  return (
    <div
      className="w-full rounded-lg p-4 mb-4"
      style={{
        background: colors.primary_bg,
        minWidth: 0,
        maxWidth: "100%",
        boxSizing: "border-box",
        position: "relative",
        maxHeight: `calc(100% - ${isMobile ? 200 : 240}px)`,
        overflow: "hidden",
      }}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 style={{ color: colors.primary_text, fontWeight: "bold" }}>
          {title}
        </h3>
        <IconButton onClick={onClose} sx={{ color: "#ff5252" }}>
          <CloseIcon />
        </IconButton>
      </div>
      <div style={{ height: tableHeight, width: "100%" }}>
        <DataGrid
          rows={sortedRows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
          autoHeight={false}
          hideFooterSelectedRowCount
          disableExtendRowFullWidth={true}
          rowHeight={40}
          disableColumnMenu
          initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
          sx={{
            bgcolor: colors.primary_bg,
            color: colors.primary_text,
            border: `1px solid ${colors.border_color}`,
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: colors.hover_bg,
              color: colors.primary_text,
            },
            "& .MuiDataGrid-row": {
              maxHeight: "40px !important",
              minHeight: "40px !important",
              borderBottom: "none",
            },
            "& .MuiDataGrid-cell": {
              padding: "4px 8px",
              display: "flex",
              alignItems: "center",
              color: colors.primary_text,
            },
            "& .MuiDataGrid-row:hover": { bgcolor: colors.hover_bg },
            "& .MuiDataGrid-footerContainer": {
              bgcolor: colors.primary_bg,
              color: colors.primary_text,
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
