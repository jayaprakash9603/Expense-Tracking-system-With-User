import React, { useEffect, useState } from "react";
import { Box, Skeleton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useDispatch, useSelector } from "react-redux";
import {
  getExpenseHistory,
  getExpensesAction,
} from "../../Redux/Expenses/expense.action";
import ToastNotification from "./ToastNotification";

const HistoryTable = () => {
  const dispatch = useDispatch();
  const { history, loading } = useSelector((state) => state.expenses || {});
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    dispatch(getExpenseHistory());
  }, [dispatch]);

  const handleToastClose = () => {
    setToastOpen(false);
    setToastMessage("");
  };

  // Map API data to rows
  const rows = Array.isArray(history)
    ? history.map((item) => ({
        id: item.id,
        expenseId: item.expenseId,
        actionType: item.actionType,
        details: item.details,
        timestamp: new Date(item.timestamp).toLocaleString(),
      }))
    : [];

  // Columns for audit data
  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "expenseId", headerName: "Expense ID", flex: 0.8 },
    { field: "actionType", headerName: "Action Type", flex: 1 },
    { field: "details", headerName: "Details", flex: 3 },
    { field: "timestamp", headerName: "Timestamp", flex: 1.5 },
  ];

  return (
    <Box
      sx={{ height: 700, width: "100%", bgcolor: "#121212", padding: "10px" }}
    >
      <ToastNotification
        open={toastOpen}
        message={toastMessage}
        onClose={handleToastClose}
      />

      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Skeleton
            variant="rectangular"
            height={40}
            sx={{ bgcolor: "#2c2c2c", borderRadius: 1 }}
          />
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={45}
              sx={{ bgcolor: "#1f1f1f", borderRadius: 1 }}
            />
          ))}
        </Box>
      ) : (
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={pageSize}
          onPageSizeChange={(newSize) => setPageSize(newSize)}
          rowsPerPageOptions={[10, 20, 50, 100]}
          checkboxSelection
          disableSelectionOnClick
          onSelectionModelChange={(newSelection) =>
            setSelectedIds(newSelection)
          }
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#0b0b0b",
              color: "#00dac6",
              fontWeight: "bold",
            },
            "& .MuiDataGrid-cell": {
              backgroundColor: "#1b1b1b",
              color: "#fff",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#28282a",
            },
            "& .MuiCheckbox-root svg": {
              fill: "#666666",
            },
            "& .Mui-checked .MuiSvgIcon-root": {
              color: "#00dac6",
            },
            "& .MuiDataGrid-footerContainer": {
              backgroundColor: "#1b1b1b",
              color: "#00dac6",
            },
            "& .MuiDataGrid-footerContainer .MuiTypography-root": {
              color: "#00dac6",
            },
            "& .MuiDataGrid-footerContainer .MuiPaginationItem-root": {
              color: "#00dac6",
            },
            "& .MuiPaginationItem-root, .MuiDataGrid-sortIcon, .MuiIconButton-root":
              {
                color: "#00dac6",
              },
            "& .MuiPaginationItem-root:hover, .MuiIconButton-root:hover": {
              backgroundColor: "rgba(0, 218, 198, 0.1)",
            },
          }}
        />
      )}
    </Box>
  );
};

export default HistoryTable;
