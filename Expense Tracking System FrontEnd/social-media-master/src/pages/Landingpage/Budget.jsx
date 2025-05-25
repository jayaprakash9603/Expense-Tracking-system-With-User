import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getBudgetData,
  deleteBudgetData,
  getBudgetById,
  getBudgetReportById,
} from "../../Redux/Budget/budget.action";
import { useNavigate } from "react-router-dom";
import {
  getExpensesAction,
  getExpensesByBudgetId,
} from "../../Redux/Expenses/expense.action";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Skeleton,
  Box,
  Divider,
  useMediaQuery,
} from "@mui/material";
import {
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  Description as ReportIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import Modal from "./Modal";
import ToastNotification from "./ToastNotification";

const Budget = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortModel, setSortModel] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuBudgetId, setMenuBudgetId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "" });
  const isSmallScreen = useMediaQuery("(max-width: 768px)");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { budgets, loading, error } = useSelector((state) => state.budgets);

  useEffect(() => {
    dispatch(getBudgetData());
    dispatch(getExpensesAction());
  }, [dispatch]);

  const handleNewBudgetClick = () => {
    navigate("/budget/create");
  };

  const handleMenuClick = (event, budgetId) => {
    setMenuAnchor(event.currentTarget);
    setMenuBudgetId(budgetId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuBudgetId(null);
  };

  const handleEdit = () => {
    dispatch(getBudgetById(menuBudgetId));
    navigate(`/budget/edit/${menuBudgetId}`);
    handleMenuClose();
  };

  const handleReport = async () => {
    await dispatch(getExpensesByBudgetId(menuBudgetId));
    await dispatch(getBudgetReportById(menuBudgetId));
    handleMenuClose();
    navigate(`/budget/report/${menuBudgetId}`);
  };

  const handleDelete = () => {
    const budget = budgets.find((b) => b.id === menuBudgetId);
    if (budget) {
      setBudgetToDelete(budget);
      setIsDeleteModalOpen(true);
    }
    handleMenuClose();
  };

  const handleConfirmDelete = () => {
    if (budgetToDelete) {
      dispatch(deleteBudgetData(budgetToDelete.id))
        .then(() => {
          dispatch(getBudgetData());
          setToast({ open: true, message: "Budget deleted successfully." });
        })
        .catch((error) => {
          console.error("Error deleting budget:", error);
          setToast({
            open: true,
            message: "Error deleting budget. Please try again.",
          });
        })
        .finally(() => {
          setIsDeleteModalOpen(false);
          setBudgetToDelete(null);
        });
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setBudgetToDelete(null);
  };

  const handleToastClose = () => {
    setToast({ open: false, message: "" });
  };

  // Define columns based on screen size.
  // For small screens: only name, start date, end date and remaining (short headers)
  // For larger screens: include description, amount and action button.
  const columns = useMemo(() => {
    if (isSmallScreen) {
      return [
        {
          field: "name",
          headerName: "Name",
          flex: 2,
          minWidth: 120,
          maxWidth: 200,
          sortable: true,
          renderCell: (params) => params.value || "N/A",
        },
        {
          field: "remainingAmount",
          headerName: "Remaining",
          flex: 1,
          minWidth: 100,
          maxWidth: 180,
          sortable: true,
          renderCell: (params) =>
            `$${params.value ? params.value.toFixed(2) : "0.00"}`,
        },
        {
          field: "actions",
          headerName: "",
          width: 40,
          sortable: false,
          renderCell: (params) => (
            <IconButton
              onClick={(e) => handleMenuClick(e, params.row.id)}
              sx={{ color: "#ffffff", "&:hover": { color: "#00dac6" } }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          ),
        },
      ];
    } else {
      return [
        {
          field: "name",
          headerName: "Name",
          flex: 2,
          minWidth: 120,
          maxWidth: 300,
          sortable: true,
          renderCell: (params) => params.value || "N/A",
        },
        {
          field: "description",
          headerName: "Description",
          flex: 3,
          minWidth: 180,
          maxWidth: 450,
          sortable: true,
          renderCell: (params) => params.value || "N/A",
        },
        {
          field: "amount",
          headerName: "Amount",
          flex: 0.8,
          minWidth: 90,
          maxWidth: 150,
          sortable: true,
          renderCell: (params) =>
            `$${params.value ? params.value.toFixed(2) : "0.00"}`,
        },
        {
          field: "startDate",
          headerName: "Start Date",
          flex: 0.8,
          minWidth: 90,
          maxWidth: 150,
          sortable: true,
          renderCell: (params) => params.value || "N/A",
        },
        {
          field: "endDate",
          headerName: "End Date",
          flex: 0.8,
          minWidth: 90,
          maxWidth: 150,
          sortable: true,
          renderCell: (params) => params.value || "N/A",
        },
        {
          field: "remainingAmount",
          headerName: "Remaining",
          flex: 1,
          minWidth: 100,
          maxWidth: 180,
          sortable: true,
          renderCell: (params) =>
            `$${params.value ? params.value.toFixed(2) : "0.00"}`,
        },
        {
          field: "actions",
          headerName: "",
          width: 40,
          sortable: false,
          renderCell: (params) => (
            <IconButton
              onClick={(e) => handleMenuClick(e, params.row.id)}
              sx={{ color: "#ffffff", "&:hover": { color: "#00dac6" } }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          ),
        },
      ];
    }
  }, [isSmallScreen]);

  const rows = useMemo(
    () =>
      budgets?.map((budget) => ({
        id: budget.id,
        name: budget.name,
        description: budget.description,
        amount: budget.amount,
        startDate: budget.startDate,
        endDate: budget.endDate,
        remainingAmount: budget.remainingAmount,
      })) || [],
    [budgets]
  );

  const modalData = budgetToDelete
    ? {
        name: budgetToDelete.name || "N/A",
        amount: budgetToDelete.amount
          ? `$${budgetToDelete.amount.toFixed(2)}`
          : "N/A",
        description: budgetToDelete.description || "N/A",
        startDate: budgetToDelete.startDate || "N/A",
        endDate: budgetToDelete.endDate || "N/A",
        remainingAmount: budgetToDelete.remainingAmount
          ? `$${budgetToDelete.remainingAmount.toFixed(2)}`
          : "N/A",
      }
    : {};

  const tableHeight = 30 + 10 * 45; // headerHeight: 30, rowHeight: 45

  const CustomToolbar = () => (
    <GridToolbarContainer sx={{ display: "flex", gap: 1, p: 1 }}>
      <GridToolbarQuickFilter
        sx={{
          "& .MuiInputBase-root": {
            backgroundColor: "#1b1b1b",
            color: "#ffffff",
            borderRadius: "8px",
            fontSize: "0.75rem",
          },
          "& .MuiInputBase-input::placeholder": { color: "#666666" },
        }}
      />
      <IconButton sx={{ color: "#00dac6" }}>
        <FilterListIcon fontSize="small" />
      </IconButton>
    </GridToolbarContainer>
  );

  return (
    <>
      <div className="w-[calc(100vw-350px)] h-[50px] bg-[#1b1b1b]"></div>
      <Box
        sx={{
          bgcolor: "#0b0b0b",
          width: isSmallScreen ? "100vw" : "calc(100vw - 370px)",
          height: "calc(100vh - 100px)",
          borderRadius: "8px",
          border: "1px solid #000",
          p: 2,
          mr: isSmallScreen ? 0 : "20px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              color: "#ffffff",
              fontWeight: "bold",
              fontSize: "1.25rem",
            }}
          >
            Budgets
          </Typography>
          {isSmallScreen ? (
            <IconButton
              onClick={handleNewBudgetClick}
              sx={{
                color: "#ffffff",
                bgcolor: "#00dac6",
                borderRadius: "50%",
                p: 1,
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          ) : (
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Button
                variant="contained"
                onClick={handleNewBudgetClick}
                sx={{ textTransform: "none" }}
              >
                + New Budget
              </Button>
              <IconButton sx={{ color: "#00dac6", bgcolor: "#1b1b1b" }}>
                <FilterListIcon fontSize="small" />
              </IconButton>
              <IconButton sx={{ color: "#00dac6", bgcolor: "#1b1b1b" }}>
                <FilterListIcon fontSize="small" />
              </IconButton>
              <IconButton sx={{ color: "#00dac6", bgcolor: "#1b1b1b" }}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>
        <Divider sx={{ borderColor: "#28282a", my: 1 }} />
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {loading ? (
            <Box sx={{ height: `${tableHeight}px`, overflow: "hidden" }}>
              {[...Array(10)].map((_, index) => (
                <Skeleton
                  key={index}
                  sx={{
                    height: 45,
                    width: "100%",
                    mb: index < 9 ? "3px" : 0,
                    borderRadius: "4px",
                  }}
                />
              ))}
            </Box>
          ) : error ? (
            <Box
              sx={{
                height: `${tableHeight}px`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography color="error">
                Error: {error.message || "Failed to load budgets."}
              </Typography>
            </Box>
          ) : (
            <DataGrid
              rows={rows}
              columns={columns}
              paginationMode="client"
              sortingMode="client"
              checkboxSelection
              disableRowSelectionOnClick
              initialState={{
                pagination: { paginationModel: { page: 0, pageSize: 10 } },
              }}
              pageSizeOptions={[10, 15, 20]}
              paginationModel={{ page: pageIndex, pageSize }}
              onPaginationModelChange={(model) => {
                setPageIndex(model.page);
                setPageSize(model.pageSize);
                setSelectedRows([]);
              }}
              sortModel={sortModel}
              onSortModelChange={setSortModel}
              rowSelectionModel={selectedRows}
              onRowSelectionModelChange={setSelectedRows}
              rowHeight={isSmallScreen ? 55 : 54}
              headerHeight={isSmallScreen ? 55 : 54}
              slots={{ toolbar: CustomToolbar }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                  quickFilterProps: { debounceMs: 500 },
                },
              }}
              sx={{
                "& .MuiDataGrid-cell": {
                  fontSize: isSmallScreen ? "0.85rem" : "0.875rem",
                  py: 0.5,
                },
                "& .MuiDataGrid-columnHeaders": {
                  fontSize: "0.75rem",
                  py: 0.5,
                },
              }}
            />
          )}
        </Box>
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              bgcolor: "#1b1b1b",
              color: "#ffffff",
              border: "1px solid #28282a",
              borderRadius: "8px",
              minWidth: "120px",
            },
          }}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem
            onClick={handleReport}
            sx={{
              color: "#2196f3",
              "&:hover": { bgcolor: "#2a2a2a" },
              display: "flex",
              gap: 1,
            }}
          >
            <ReportIcon fontSize="small" />
            Report
          </MenuItem>
          <MenuItem
            onClick={handleEdit}
            sx={{
              color: "#4caf50",
              "&:hover": { bgcolor: "#2a2a2a" },
              display: "flex",
              gap: 1,
            }}
          >
            <EditIcon fontSize="small" />
            Edit
          </MenuItem>
          <MenuItem
            onClick={handleDelete}
            sx={{
              color: "#f44336",
              "&:hover": { bgcolor: "#2a2a2a" },
              display: "flex",
              gap: 1,
            }}
          >
            <DeleteIcon fontSize="small" />
            Delete
          </MenuItem>
        </Menu>
        <ToastNotification
          open={toast.open}
          message={toast.message}
          onClose={handleToastClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        />
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={handleCancelDelete}
          title="Deletion Confirmation"
          data={modalData}
          headerNames={{
            name: "Name",
            amount: "Amount",
            description: "Description",
            startDate: "Start Date",
            endDate: "End Date",
            remainingAmount: "Remaining",
          }}
          onApprove={handleConfirmDelete}
          onDecline={handleCancelDelete}
          approveText="Yes, Delete"
          declineText="No, Cancel"
          confirmationText={`Are you sure you want to delete the budget "${budgetToDelete?.name}"?`}
        />
      </Box>
    </>
  );
};

export default Budget;
