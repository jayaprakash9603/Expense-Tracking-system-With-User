import React, { useEffect, useState, useRef } from "react";
import { Box, Skeleton, IconButton } from "@mui/material";
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
import { FilterList as FilterListIcon } from "@mui/icons-material";
import { Menu, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme"; // Import the global theme
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
  const apiRef = useRef(null); // Ref to access DataGrid API

  // Use propExpenses if provided, otherwise fall back to reduxExpenses
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

  // Map expenses to rows, ensuring unique IDs
  const rows = Array.isArray(expenses)
    ? expenses
        .filter((item) => {
          const isValid = item && typeof item === "object" && item.id != null;
          if (!isValid) {
            console.warn("Invalid expense item:", item);
          }
          return isValid;
        })
        .map((item, index) => {
          const row = {
            id: item.id ?? `temp-${index}-${Date.now()}`,
            date: item.date || "",
            ...item.expense,
            expenseId: item.id ?? `temp-${index}-${Date.now()}`,
          };
          return row;
        })
    : [];

  // Handle selection, ensuring only visible rows are selected when "Select All" is clicked
  const handleSelectionChange = (newSelection) => {
    if (!apiRef.current) {
      setSelectedIds(newSelection);
      return;
    }

    // Get all row IDs that are currently visible (after filtering and pagination)
    const visibleRowIds = apiRef.current.getSortedRows().map((row) => row.id);

    // Check if the selection includes all visible rows (i.e., "Select All" was clicked)
    const isSelectAll =
      visibleRowIds.every((id) => newSelection.includes(id)) &&
      newSelection.length >= visibleRowIds.length;

    if (isSelectAll) {
      setSelectedIds(visibleRowIds); // Select only visible rows
    } else {
      setSelectedIds(newSelection); // Update with the new selection
    }
  };
  // Action menu for each row (Edit and Delete buttons)
  const ActionMenu = ({ rowId, expenseId }) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
      event.stopPropagation();
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
    };

    const handleEdit = () => {
      navigate(`/expenses/edit/${expenseId}`);
      dispatch(getExpenseAction(expenseId));
      handleClose();
    };

    const handleDelete = () => {
      const expense = rows.find((row) => row.expenseId === expenseId);
      if (expense) {
        setExpenseData({
          expenseName: expense.expenseName || "",
          amount: expense.amount || "",
          type: expense.type || "",
          paymentMethod: expense.paymentMethod || "",
          netAmount: expense.netAmount || "",
          comments: expense.comments || "",
          creditDue: expense.creditDue || "",
          date: expense.date || "",
        });
        setExpenseToDelete(expenseId);
        setIsDeleteModalOpen(true);
      }
      handleClose();
    };

    return (
      <>
        <IconButton onClick={handleClick}>
          <MoreVertIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
        >
          <MenuItem onClick={handleEdit} sx={{ color: "green" }}>
            <EditIcon sx={{ color: "green", marginRight: 1 }} />
            Edit
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: "red" }}>
            <DeleteIcon sx={{ color: "red", marginRight: 1 }} />
            Delete
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
        .catch((error) => {
          console.error("Error deleting expense:", error);
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

  // Define header names for the modal
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

  // Columns definition for DataGrid
  const columns = [
    { field: "id", headerName: "Sno", flex: 1, minWidth: 80, maxWidth: 180 },
    { field: "date", headerName: "Date", flex: 1, minWidth: 80, maxWidth: 180 },
    {
      field: "expenseName",
      headerName: "Name",
      flex: 1,
      minWidth: 80,
      maxWidth: 180,
    },
    {
      field: "amount",
      headerName: "Amount",
      type: "number",
      flex: 1,
      minWidth: 80,
      maxWidth: 180,
    },
    { field: "type", headerName: "Type", flex: 1, minWidth: 80, maxWidth: 180 },
    {
      field: "paymentMethod",
      headerName: "Payment",
      flex: 1,
      minWidth: 80,
      maxWidth: 180,
    },
    {
      field: "netAmount",
      headerName: "Net Amount",
      type: "number",
      flex: 1,
      minWidth: 80,
      maxWidth: 180,
    },
    {
      field: "comments",
      headerName: "Comments",
      flex: 1,
      minWidth: 120,
      maxWidth: 180,
    },
    {
      field: "creditDue",
      headerName: "Credit Due",
      type: "number",
      flex: 1,
      minWidth: 80,
      maxWidth: 180,
    },
    {
      field: "actions",
      headerName: "",
      width: 50,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <ActionMenu rowId={params.row.id} expenseId={params.row.expenseId} />
      ),
    },
  ];

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
    <ThemeProvider theme={theme}>
      <ToastNotification
        open={toastOpen}
        message={toastMessage}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      />
      <Box sx={{ height: 700, width: "100%" }}>
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
            rowHeight={54}
            headerHeight={40}
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
