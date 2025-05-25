import React, { useEffect, useState, useRef } from "react";
import { Box, Skeleton, IconButton, useMediaQuery } from "@mui/material";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteExpenseAction,
  getExpenseAction,
  getExpensesAction,
} from "../../Redux/Expenses/expense.action";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { Menu, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import ToastNotification from "./ToastNotification";
import Modal from "./Modal";

const ExpensesTable = ({ expenses: propExpenses }) => {
  const dispatch = useDispatch();
  const { expenses: reduxExpenses, loading } = useSelector(
    (state) => state.expenses || {}
  );
  const [selectedIds, setSelectedIds] = useState([]);
  const navigate = useNavigate();
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [expenseData, setExpenseData] = useState({});
  const apiRef = useRef(null);
  const isSmallScreen = useMediaQuery("(max-width:640px)");

  const expenses = propExpenses || reduxExpenses;

  useEffect(() => {
    if (!propExpenses) {
      dispatch(getExpensesAction());
    }
  }, [dispatch, propExpenses]);

  const handleToastClose = () => {
    setToastOpen(false);
    setToastMessage("");
  };

  const rows = Array.isArray(expenses)
    ? expenses
        .filter((item) => item && typeof item === "object" && item.id != null)
        .map((item, index) => ({
          id: item.id ?? `temp-${index}-${Date.now()}`,
          date: item.date || "",
          ...item.expense,
          expenseId: item.id ?? `temp-${index}-${Date.now()}`,
        }))
    : [];

  const handleSelectionChange = (newSelection) => {
    if (!apiRef.current) {
      setSelectedIds(newSelection);
      return;
    }

    const visibleRowIds = apiRef.current.getSortedRows().map((row) => row.id);
    const isSelectAll =
      visibleRowIds.every((id) => newSelection.includes(id)) &&
      newSelection.length >= visibleRowIds.length;

    setSelectedIds(isSelectAll ? visibleRowIds : newSelection);
  };

  const ActionMenu = ({ expenseId }) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
      event.stopPropagation();
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => setAnchorEl(null);

    const handleEdit = () => {
      navigate(`/expenses/edit/${expenseId}`);
      dispatch(getExpenseAction(expenseId));
      handleClose();
    };

    const handleDelete = () => {
      const expense = rows.find((row) => row.expenseId === expenseId);
      if (expense) {
        setExpenseData({ ...expense });
        setExpenseToDelete(expenseId);
        setIsDeleteModalOpen(true);
      }
      handleClose();
    };

    return (
      <>
        <IconButton onClick={handleClick} size="small">
          <MoreVertIcon fontSize="small" />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleEdit} sx={{ color: "green" }}>
            <EditIcon sx={{ color: "green", mr: 1 }} /> Edit
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: "red" }}>
            <DeleteIcon sx={{ color: "red", mr: 1 }} /> Delete
          </MenuItem>
        </Menu>
      </>
    );
  };

  const handleConfirmDelete = () => {
    if (expenseToDelete) {
      dispatch(deleteExpenseAction(expenseToDelete))
        .then(() => {
          dispatch(getExpensesAction());
          setToastMessage("Expense deleted successfully.");
          setToastOpen(true);
        })
        .catch(() => {
          setToastMessage("Error deleting expense. Please try again.");
          setToastOpen(true);
        })
        .finally(() => {
          setIsDeleteModalOpen(false);
          setExpenseToDelete(null);
          setExpenseData({});
        });
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setExpenseToDelete(null);
    setExpenseData({});
  };

  const headerNames = {
    expenseName: "Expense Name",
    amount: "Amount",
    type: "Type",
    paymentMethod: "Payment Method",
    netAmount: "Net Amount",
    comments: "Comments",
    creditDue: "Credit Due",
    date: "Date",
  };

  const columns = [
    !isSmallScreen && {
      field: "date",
      headerName: "Date",
      flex: 1,
      minWidth: 80,
    },
    {
      field: "expenseName",
      headerName: "Name",
      flex: 1,
      minWidth: 80,
    },
    {
      field: "amount",
      headerName: "Amount",
      type: "number",
      flex: 1,
      minWidth: 80,
      renderCell: (params) => {
        const type = params.row.type;
        const amount = params.value;
        const isLoss = type === "loss";

        if (!isSmallScreen) {
          return <span>{amount}</span>; // No color styling on large screens
        }

        const Icon = isLoss ? ArrowDownwardIcon : ArrowUpwardIcon;
        const iconColor = isLoss ? "red" : "green";
        const amountColor = isLoss ? "red" : "green";

        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Icon sx={{ fontSize: "1rem", color: iconColor }} />
            <span style={{ color: amountColor }}>{amount}</span>
          </Box>
        );
      },
    },
    !isSmallScreen && {
      field: "type",
      headerName: "Type",
      flex: 1,
      minWidth: 80,
    },
    !isSmallScreen && {
      field: "paymentMethod",
      headerName: "Payment",
      flex: 1,
      minWidth: 80,
    },
    !isSmallScreen && {
      field: "netAmount",
      headerName: "Net Amount",
      type: "number",
      flex: 1,
      minWidth: 80,
    },
    !isSmallScreen && {
      field: "comments",
      headerName: "Comments",
      flex: 1,
      minWidth: 120,
    },
    !isSmallScreen && {
      field: "creditDue",
      headerName: "Credit Due",
      type: "number",
      flex: 1,
      minWidth: 80,
    },
    {
      field: "actions",
      headerName: "",
      width: 50,
      sortable: false,
      filterable: false,
      renderCell: (params) => <ActionMenu expenseId={params.row.expenseId} />,
    },
  ].filter(Boolean);

  const CustomToolbar = () => (
    <GridToolbarContainer sx={{ display: "flex", gap: 1, p: 1 }}>
      <GridToolbarQuickFilter
        sx={{
          fontSize: isSmallScreen ? "0.75rem" : "0.875rem",
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
        <FilterListIcon fontSize={isSmallScreen ? "small" : "medium"} />
      </IconButton>
    </GridToolbarContainer>
  );

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
          height: 700,
          width: "100%",
          fontSize: isSmallScreen ? "0.75rem" : "0.875rem",
        }}
      >
        {loading ? (
          <Box sx={{ height: 700, overflow: "hidden" }}>
            {[...Array(15)].map((_, index) => (
              <Skeleton
                key={index}
                sx={{
                  height: "43.5px",
                  width: "100%",
                  mb: index < 14 ? "3px" : 0,
                  borderRadius: "4px",
                }}
              />
            ))}
          </Box>
        ) : (
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row.id}
            initialState={{
              pagination: { paginationModel: { page: 0, pageSize: 10 } },
            }}
            pageSizeOptions={[10, 15, 20]}
            checkboxSelection
            disableRowSelectionOnClick
            onRowSelectionModelChange={handleSelectionChange}
            apiRef={apiRef}
            rowHeight={isSmallScreen ? 53 : 53}
            headerHeight={isSmallScreen ? 45 : 40}
            autoHeight={false}
            slots={{ toolbar: CustomToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
          />
        )}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={handleCancelDelete}
          title="Deletion Confirmation"
          data={expenseData}
          headerNames={headerNames}
          onApprove={handleConfirmDelete}
          onDecline={handleCancelDelete}
          approveText="Yes, Delete"
          declineText="No, Cancel"
        />
      </Box>
    </ThemeProvider>
  );
};

export default ExpensesTable;
