import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { Box, Skeleton, IconButton, useMediaQuery } from "@mui/material";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { useDispatch, useSelector } from "react-redux";
import {
  copyExpenseAction,
  deleteExpenseAction,
  deleteMultiExpenses,
  getExpenseAction,
  getExpensesAction,
} from "../../Redux/Expenses/expense.action";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CopyIcon from "@mui/icons-material/FileCopy";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { Menu, MenuItem } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import createAppTheme from "./theme";
import ToastNotification from "./ToastNotification";
import Modal from "./Modal";
import { deleteBill, getBillByExpenseId } from "../../Redux/Bill/bill.action";
import { useTheme } from "../../hooks/useTheme";

const ExpensesTable = ({
  expenses: propExpenses,
  friendId,
  isUploadPreview = false,
  onUploadRowUpdate,
  onUploadRowDelete,
  onUploadRowCopy,
  disableActions = {},
}) => {
  const dispatch = useDispatch();
  const { expenses: reduxExpenses, loading } = useSelector(
    (state) => state.expenses || {}
  );

  // Get theme colors from useTheme hook
  const { colors } = useTheme();

  // Get theme mode from Redux for MUI ThemeProvider
  const themeMode = useSelector((state) => state.theme?.mode || "dark");
  const theme = useMemo(() => createAppTheme(themeMode), [themeMode]);

  const [selectedIds, setSelectedIds] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [expenseData, setExpenseData] = useState({});
  const apiRef = useRef(null);
  const isSmallScreen = useMediaQuery("(max-width:640px)");

  const expenses = propExpenses || reduxExpenses;

  const resolvedDisableActions = useMemo(() => {
    const disableAll = Boolean(disableActions?.all);
    return {
      edit: disableAll || Boolean(disableActions?.edit),
      delete: disableAll || Boolean(disableActions?.delete),
      copy: disableAll || Boolean(disableActions?.copy),
    };
  }, [disableActions]);

  useEffect(() => {
    if (!propExpenses) {
      dispatch(getExpensesAction("desc", friendId));
    }
    // Show toast if redirected from NewExpense
    if (location.state && location.state.toastMessage) {
      setToastMessage(location.state.toastMessage);
      setToastOpen(true);
      // Remove the toastMessage from history state so it doesn't show again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [dispatch, propExpenses, location.state]);

  const handleToastClose = () => {
    setToastOpen(false);
    setToastMessage("");
  };

  const handleProcessRowUpdate = useCallback(
    (newRow, oldRow) => {
      if (isUploadPreview && typeof onUploadRowUpdate === "function") {
        onUploadRowUpdate(newRow.id, newRow);
      }
      return newRow;
    },
    [isUploadPreview, onUploadRowUpdate]
  );

  const handleRowUpdateError = useCallback((error) => {
    console.error("Inline edit failed:", error);
  }, []);

  const triggerInlineEdit = useCallback(
    (rowId) => {
      if (!isUploadPreview || !apiRef.current || !rowId) return;
      const defaultField = !isSmallScreen ? "expenseName" : "amount";
      try {
        apiRef.current.setCellFocus(rowId, defaultField);
        apiRef.current.startCellEditMode({ id: rowId, field: defaultField });
      } catch (err) {
        console.error("Unable to start inline edit:", err);
      }
    },
    [isUploadPreview, isSmallScreen]
  );

  const rows = Array.isArray(expenses)
    ? expenses
        .filter((item) => item && typeof item === "object")
        .map((item, index) => {
          const expensePayload = item.expense || {};
          const derivedId =
            item.id ??
            item.__clientId ??
            expensePayload.id ??
            `temp-${index}-${expensePayload.expenseName || "expense"}`;
          return {
            id: derivedId,
            date: item.date || expensePayload.date || "",
            ...expensePayload,
            expenseId: derivedId,
          };
        })
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
    const isEditDisabled = resolvedDisableActions.edit;
    const isDeleteDisabled = resolvedDisableActions.delete;
    const isCopyDisabled = resolvedDisableActions.copy;
    const isMenuDisabled = isEditDisabled && isDeleteDisabled && isCopyDisabled;

    const handleClick = (event) => {
      event.stopPropagation();
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => setAnchorEl(null);

    const handleEdit = () => {
      if (isEditDisabled) {
        handleClose();
        return;
      }
      if (isUploadPreview) {
        triggerInlineEdit(expenseId);
        handleClose();
        return;
      }
      if (friendId == "") {
        navigate(`/expenses/edit/${expenseId}`);
      } else if (friendId != "") {
        navigate(`/expenses/edit/${expenseId}/friend/${friendId}`);
      }
      dispatch(getExpenseAction(expenseId, friendId));
      handleClose();
    };

    const handleDelete = () => {
      if (isDeleteDisabled) {
        handleClose();
        return;
      }
      if (isUploadPreview) {
        onUploadRowDelete?.(expenseId);
        handleClose();
        return;
      }
      const expense = rows.find((row) => row.expenseId === expenseId);
      if (expense) {
        setExpenseData({ ...expense });
        setExpenseToDelete(expenseId);
        setIsDeleteModalOpen(true);
      }
      handleClose();
    };

    const handleCopy = async () => {
      if (isCopyDisabled) {
        handleClose();
        return;
      }
      if (isUploadPreview) {
        onUploadRowCopy?.(expenseId);
        handleClose();
        return;
      }
      try {
        // Dispatch the copy action
        await dispatch(copyExpenseAction(expenseId, friendId || ""));

        // Show a success toast notification
        setToastMessage("Expense copied successfully.");
        setToastOpen(true);

        // Optionally, refresh the expenses list if needed
        dispatch(getExpensesAction("desc", friendId || ""));
      } catch (error) {
        // Show an error toast notification
        setToastMessage("Error copying expense. Please try again.");
        setToastOpen(true);
      }
    };
    return (
      <>
        <IconButton
          onClick={handleClick}
          size="small"
          disabled={isMenuDisabled}
          aria-disabled={isMenuDisabled}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem
            onClick={handleEdit}
            disabled={isEditDisabled}
            sx={{ color: isEditDisabled ? "text.disabled" : "green" }}
          >
            <EditIcon
              sx={{ color: isEditDisabled ? "text.disabled" : "green", mr: 1 }}
            />
            Edit
          </MenuItem>
          <MenuItem
            onClick={handleDelete}
            disabled={isDeleteDisabled}
            sx={{ color: isDeleteDisabled ? "text.disabled" : "red" }}
          >
            <DeleteIcon
              sx={{ color: isDeleteDisabled ? "text.disabled" : "red", mr: 1 }}
            />
            Delete
          </MenuItem>
          <MenuItem
            onClick={handleCopy}
            disabled={isCopyDisabled}
            sx={{ color: isCopyDisabled ? "text.disabled" : "blue" }}
          >
            <CopyIcon
              sx={{ color: isCopyDisabled ? "text.disabled" : "blue", mr: 1 }}
            />
            Copy
          </MenuItem>
        </Menu>
      </>
    );
  };

  // const handleConfirmDelete = () => {
  //   if (expenseToDelete) {
  //     dispatch(deleteExpenseAction(expenseToDelete, friendId || ""))
  //       .then(() => {
  //         dispatch(getExpensesAction("desc", friendId || ""));
  //         setToastMessage("Expense deleted successfully.");
  //         setToastOpen(true);
  //       })
  //       .catch(() => {
  //         setToastMessage("Error deleting expense. Please try again.");
  //         setToastOpen(true);
  //       })
  //       .finally(() => {
  //         setIsDeleteModalOpen(false);
  //         setExpenseToDelete(null);
  //         setExpenseData({});
  //       });
  //   }
  // };

  const [isDeleting, setIsDeleting] = useState(false);
  const handleConfirmDelete = async () => {
    if (expenseToDelete) {
      setIsDeleting(true);
      if (Array.isArray(expenseToDelete)) {
        try {
          await dispatch(deleteMultiExpenses(expenseToDelete));
          dispatch(getExpensesAction("desc", friendId || ""));
          setToastMessage("Selected expenses deleted successfully.");
          setToastOpen(true);
        } catch (err) {
          setToastMessage(
            "Error deleting selected expenses. Please try again."
          );
          setToastOpen(true);
        } finally {
          setIsDeleting(false);
          setIsDeleteModalOpen(false);
          setExpenseToDelete(null);
          setExpenseData({});
        }
      } else {
        try {
          const expensedata = await dispatch(getExpenseAction(expenseToDelete));
          const bill = expensedata.bill
            ? await dispatch(getBillByExpenseId(expenseToDelete))
            : false;
          await dispatch(
            bill ? deleteBill(bill.id) : deleteExpenseAction(expenseToDelete)
          );
          dispatch(getExpensesAction("desc", friendId || ""));
          setToastMessage(
            bill ? "Bill deleted successfully" : "Expense deleted successfully."
          );
          setToastOpen(true);
        } catch {
          setToastMessage("Error deleting expense. Please try again.");
          setToastOpen(true);
        } finally {
          setIsDeleting(false);
          setIsDeleteModalOpen(false);
          setExpenseToDelete(null);
          setExpenseData({});
        }
      }
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
      editable: isUploadPreview,
    },
    {
      field: "expenseName",
      headerName: "Name",
      flex: 1,
      minWidth: 80,
      editable: isUploadPreview,
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
      editable: isUploadPreview,
    },
    !isSmallScreen && {
      field: "type",
      headerName: "Type",
      flex: 1,
      minWidth: 80,
      editable: isUploadPreview,
    },
    !isSmallScreen && {
      field: "paymentMethod",
      headerName: "Payment",
      flex: 1,
      minWidth: 80,
      editable: isUploadPreview,
    },
    !isSmallScreen && {
      field: "netAmount",
      headerName: "Net Amount",
      type: "number",
      flex: 1,
      minWidth: 80,
      editable: isUploadPreview,
    },
    !isSmallScreen && {
      field: "comments",
      headerName: "Comments",
      flex: 1,
      minWidth: 120,
      editable: isUploadPreview,
    },
    !isSmallScreen && {
      field: "creditDue",
      headerName: "Credit Due",
      type: "number",
      flex: 1,
      minWidth: 80,
      editable: isUploadPreview,
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
            backgroundColor: colors.primary_bg,
            color: colors.primary_text,
            borderRadius: "8px",
          },
          "& .MuiInputBase-input::placeholder": {
            color: colors.secondary_text,
          },
        }}
      />
      <IconButton sx={{ color: colors.primary_accent }}>
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
            processRowUpdate={
              isUploadPreview ? handleProcessRowUpdate : undefined
            }
            onProcessRowUpdateError={
              isUploadPreview ? handleRowUpdateError : undefined
            }
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
