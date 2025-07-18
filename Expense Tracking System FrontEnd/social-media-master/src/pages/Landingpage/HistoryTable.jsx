import React, { useEffect, useRef, useState } from "react";
import { Box, Skeleton, useMediaQuery } from "@mui/material";
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
import { ThemeProvider, useTheme } from "@mui/material/styles";
import { FilterList as FilterListIcon } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import theme from "./theme";
import ToastNotification from "./ToastNotification";

const HistoryTable = ({ friendId }) => {
  const dispatch = useDispatch();
  const { history, loading } = useSelector((state) => state.expenses || {});
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const apiRef = useRef(null);

  const muiTheme = useTheme();
  const isSmallScreen = useMediaQuery(muiTheme.breakpoints.down("sm"));

  useEffect(() => {
    dispatch(getExpenseHistory(friendId));
    dispatch(getExpensesAction(friendId));
  }, [dispatch]);

  const handleSelectionChange = (newSelection) => {
    if (!apiRef.current) {
      setSelectedIds(newSelection);
      return;
    }

    const paginationInfo = apiRef.current.state.pagination;
    const page = paginationInfo.page;
    const pageSize = paginationInfo.pageSize;

    const allRows = apiRef.current.getRowModels();
    const allRowIds = Array.from(allRows.keys());

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
        timestamp: isSmallScreen
          ? new Date(item.timestamp).toLocaleDateString()
          : new Date(item.timestamp).toLocaleString(),
      }))
    : [];

  const allColumns = [
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
      minWidth: isSmallScreen ? 250 : 450,
      maxWidth: isSmallScreen ? 200 : 550,
    },
    {
      field: "timestamp",
      headerName: isSmallScreen ? "Time" : "Timestamp",
      flex: 1,
      minWidth: isSmallScreen ? 50 : 120,
      maxWidth: isSmallScreen ? 90 : 200,
    },
  ];

  const smallScreenColumns = allColumns.filter((col) =>
    ["details", "timestamp"].includes(col.field)
  );

  const columns = isSmallScreen ? smallScreenColumns : allColumns;

  const CustomToolbar = () => (
    <GridToolbarContainer
      sx={{
        display: "flex",
        gap: 1,
        p: 1,
        flexDirection: isSmallScreen ? "row" : "row",
      }}
    >
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

  const tableHeight = 700;
  const rowHeight = isSmallScreen ? 42 : 53;
  const headerHeight = isSmallScreen ? 45 : 52;

  return (
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
                  height: rowHeight,
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
            rowHeight={isSmallScreen ? 53 : 53}
            headerHeight={isSmallScreen ? 45 : 40}
            disableRowSelectionOnClick
            rowSelectionModel={selectedIds}
            onRowSelectionModelChange={handleSelectionChange}
            apiRef={apiRef}
            slots={{ toolbar: CustomToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            sx={{
              "& .MuiDataGrid-cell": {
                fontSize: isSmallScreen ? "0.75rem" : "0.875rem",
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                fontSize: isSmallScreen ? "0.8rem" : "0.9rem",
              },
            }}
          />
        )}
      </Box>
    </ThemeProvider>
  );
};

export default HistoryTable;
