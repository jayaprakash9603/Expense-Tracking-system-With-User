import React, { useEffect, useRef, useState } from "react";
import { Box, Skeleton } from "@mui/material";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { useDispatch, useSelector } from "react-redux";
import {
  getExpenseHistory,
  getExpensesAction,
} from "../../Redux/Expenses/expense.action";
import { ThemeProvider } from "@mui/material/styles";
import { FilterList as FilterListIcon } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import theme from "./theme"; // Import the global theme
import ToastNotification from "./ToastNotification";

const HistoryTable = () => {
  const dispatch = useDispatch();
  const { history, loading } = useSelector((state) => state.expenses || {});
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10); // Default to 10 rows
  const [selectedIds, setSelectedIds] = useState([]);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const apiRef = useRef(null);

  useEffect(() => {
    dispatch(getExpenseHistory());
    dispatch(getExpensesAction());
  }, [dispatch]);
  const handleSelectionChange = (newSelection) => {
    if (!apiRef.current) {
      setSelectedIds(newSelection);
      return;
    }

    // Get pagination info
    const paginationInfo = apiRef.current.state.pagination;
    const page = paginationInfo.page;
    const pageSize = paginationInfo.pageSize;

    // Get all rows
    const allRows = apiRef.current.getRowModels();
    const allRowIds = Array.from(allRows.keys());

    // Compute visible row IDs based on pagination
    const start = page * pageSize;
    const end = start + pageSize;
    const visibleRowIds = allRowIds.slice(start, end);

    const isSelectAll =
      visibleRowIds.every((id) => newSelection.includes(id)) &&
      newSelection.length >= visibleRowIds.length;

    if (isSelectAll) {
      setSelectedIds(visibleRowIds);
    } else {
      setSelectedIds(newSelection);
    }
  };

  const handleToastClose = () => {
    setToastOpen(false);
    setToastMessage("");
  };

  const rows = Array.isArray(history)
    ? history.map((item) => ({
        id: item.id,
        expenseId: item.expenseId,
        actionType: item.actionType,
        details: item.details,
        timestamp: new Date(item.timestamp).toLocaleString(),
      }))
    : [];

  const columns = [
    {
      field: "id",
      headerName: "ID",
      flex: 1,
      minWidth: 80,
      maxWidth: 120,
    },
    {
      field: "expenseId",
      headerName: "Expense ID",
      flex: 1,
      minWidth: 100,
      maxWidth: 150,
    },
    {
      field: "actionType",
      headerName: "Action Type",
      flex: 1,
      minWidth: 100,
      maxWidth: 160,
    },
    {
      field: "details",
      headerName: "Details",
      flex: 1,
      minWidth: 450,
      maxWidth: 550,
    },
    {
      field: "timestamp",
      headerName: "Timestamp",
      flex: 1,
      minWidth: 120,
      maxWidth: 200,
    },
  ];

  // Match ExpensesTable's table height
  const tableHeight = 700; // Match ExpensesTable's 700px

  const CustomToolbar = () => (
    <GridToolbarContainer sx={{ display: "flex", gap: 1, p: 1 }}>
      <GridToolbarQuickFilter
        sx={{
          "& .MuiInputBase-root": {
            backgroundColor: "#1b1b1b",
            color: "#ffffff",
            borderRadius: "8px",
          },
          "& .MuiInputBase-input::placeholder": {
            color: "#666666",
          },
        }}
      />
      <IconButton sx={{ color: "#00dac6" }}>
        <FilterListIcon />
      </IconButton>
    </GridToolbarContainer>
  );

  return (
    <>
      <ThemeProvider theme={theme}>
        <ToastNotification
          open={toastOpen}
          message={toastMessage}
          onClose={handleToastClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        />
        <Box
          sx={{
            height: tableHeight,
            width: "100%",
            backgroundColor: "#0b0b0b",
          }}
        >
          {loading ? (
            <Box sx={{ height: tableHeight, overflow: "hidden" }}>
              {[...Array(15)].map((_, index) => (
                <Skeleton
                  key={index}
                  sx={{
                    height: "43.5px",
                    width: "100%",
                    mb: index < 14 ? "3px" : 0,
                    borderRadius: "4px",
                    backgroundColor: "#0b0b0b",
                  }}
                />
              ))}
            </Box>
          ) : (
            <DataGrid
              rows={rows}
              columns={columns}
              getRowId={(row) => row.id}
              paginationMode="client"
              pageSizeOptions={[10, 15, 20]}
              paginationModel={{ page: pageIndex, pageSize }}
              onPaginationModelChange={(model) => {
                setPageIndex(model.page);
                setPageSize(model.pageSize);
                setSelectedIds([]);
              }}
              checkboxSelection
              disableRowSelectionOnClick
              rowSelectionModel={selectedIds}
              onRowSelectionModelChange={handleSelectionChange}
              apiRef={apiRef}
              rowHeight={53}
              headerHeight={52}
              slots={{ toolbar: CustomToolbar }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                  quickFilterProps: { debounceMs: 500 },
                },
              }}
            />
          )}
        </Box>
      </ThemeProvider>
    </>
  );
};

export default HistoryTable;
