import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getBudgetData,
  deleteBudgetData,
  getBudgetById,
  getBudgetReportById,
} from "../../Redux/Budget/budget.action";
import { useNavigate, useParams, useLocation } from "react-router-dom";
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
import useFriendAccess from "../../hooks/useFriendAccess";
import { useTheme } from "../../hooks/useTheme";

const Budget = () => {
  const { colors } = useTheme();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortModel, setSortModel] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuBudgetId, setMenuBudgetId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "" });
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const { friendId } = useParams(); // Assuming you might have a friendId in params for filtering expenses
  const location = useLocation();
  const hideBackButton = location?.state?.fromSidebar === true;
  const isFriendView = Boolean(friendId);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { budgets, loading, error } = useSelector((state) => state.budgets);
  // Centralized friend/permission access
  const { hasWriteAccess } = useFriendAccess(friendId);

  useEffect(() => {
    dispatch(getBudgetData(friendId));
    dispatch(getExpensesAction("desc", friendId));
  }, [dispatch, friendId]);

  const handleNewBudgetClick = () => {
    if (friendId && friendId !== "undefined") {
      navigate(`/budget/create/${friendId}`);
    } else {
      navigate("/budget/create");
    }
  };

  // Navigate to generic reports page (assumption: route exists). Adjust path if project uses different reports routing.
  const handleNavigateReports = () => {
    if (friendId && friendId !== "undefined") {
      navigate(`/reports/friend/${friendId}`);
    } else {
      navigate(`/reports`);
    }
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
    dispatch(getBudgetById(menuBudgetId, friendId || ""));
    if (friendId == "" || friendId == undefined) {
      navigate(`/budget/edit/${menuBudgetId}`);
    } else {
      navigate(`/budget/edit/${menuBudgetId}/friend/${friendId}`);
    }
    handleMenuClose();
  };

  const handleReport = async () => {
    await dispatch(getExpensesByBudgetId(menuBudgetId, friendId || ""));
    await dispatch(getBudgetReportById(menuBudgetId, friendId || ""));
    handleMenuClose();
    if (friendId && friendId !== "undefined") {
      navigate(`/budget/report/${menuBudgetId}/friend/${friendId}`);
    } else {
      navigate(`/budget/report/${menuBudgetId}`);
    }
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
      setIsDeleting(true);
      dispatch(deleteBudgetData(budgetToDelete.id, friendId || ""))
        .then(() => {
          dispatch(getBudgetData(friendId || ""));
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
          setIsDeleting(false);
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
    const baseSmall = [
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
    ];
    const baseLarge = [
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
    ];

    const actionCol = [
      {
        field: "actions",
        headerName: "",
        width: 40,
        sortable: false,
        renderCell: (params) =>
          hasWriteAccess ? (
            <IconButton
              onClick={(e) => handleMenuClick(e, params.row.id)}
              sx={{
                color: colors.primary_accent,
                "&:hover": {
                  color: colors.primary_accent,
                  opacity: 0.8,
                },
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          ) : (
            <IconButton
              onClick={() => {
                // Direct navigation to report for that budget
                if (friendId && friendId !== "undefined") {
                  navigate(
                    `/budget/report/${params.row.id}/friend/${friendId}`
                  );
                } else {
                  navigate(`/budget/report/${params.row.id}`);
                }
              }}
              sx={{
                color: colors.primary_accent,
                "&:hover": {
                  color: colors.primary_accent,
                  opacity: 0.8,
                },
              }}
            >
              <ReportIcon fontSize="small" />
            </IconButton>
          ),
      },
    ];

    return isSmallScreen
      ? [...baseSmall, ...actionCol]
      : [...baseLarge, ...actionCol];
  }, [isSmallScreen, hasWriteAccess, friendId, navigate]);

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
            backgroundColor: colors.tertiary_bg,
            color: colors.primary_text,
            borderRadius: "8px",
            fontSize: "0.75rem",
          },
          "& .MuiInputBase-input::placeholder": { color: colors.icon_muted },
        }}
      />
      <IconButton sx={{ color: colors.primary_accent }}>
        <FilterListIcon fontSize="small" />
      </IconButton>
    </GridToolbarContainer>
  );

  return (
    <>
      {/* <div className="w-[calc(100vw-350px)] h-[50px] bg-[#1b1b1b]"></div> */}
      <Box
        sx={{
          bgcolor: colors.secondary_bg,
          width: isSmallScreen ? "100vw" : "calc(100vw - 370px)",
          height: "calc(100vh - 100px)",
          borderRadius: "8px",
          border: `1px solid ${colors.border_color}`,
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
          {!hideBackButton && (
            <IconButton
              sx={{
                color: colors.primary_accent,
                backgroundColor: colors.tertiary_bg,
                "&:hover": {
                  backgroundColor: colors.hover_bg,
                },
                zIndex: 10,
              }}
              onClick={() =>
                friendId && friendId !== "undefined"
                  ? navigate(`/friends/expenses/${friendId}`)
                  : navigate("/expenses")
              }
              aria-label="Back"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 18L9 12L15 6"
                  stroke={colors.primary_accent}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </IconButton>
          )}
          <Typography
            variant="h3"
            sx={{
              color: colors.primary_text,
              fontWeight: "bold",
              fontSize: "1.25rem",
            }}
          >
            Budgets
          </Typography>
          {isSmallScreen ? (
            hasWriteAccess ? (
              <IconButton
                onClick={handleNewBudgetClick}
                sx={{
                  color: colors.button_text,
                  bgcolor: colors.primary_accent,
                  borderRadius: "50%",
                  p: 1,
                  "&:hover": {
                    bgcolor: colors.button_hover,
                  },
                }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            ) : (
              <Box sx={{ width: 40 }} />
            )
          ) : (
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              {hasWriteAccess ? (
                <>
                  <Button
                    variant="contained"
                    onClick={handleNewBudgetClick}
                    sx={{
                      textTransform: "none",
                      bgcolor: colors.button_bg,
                      color: colors.button_text,
                      "&:hover": {
                        bgcolor: colors.button_hover,
                      },
                    }}
                  >
                    + New Budget
                  </Button>
                  <IconButton
                    sx={{
                      color: colors.primary_accent,
                      bgcolor: colors.tertiary_bg,
                    }}
                  >
                    <FilterListIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    sx={{
                      color: colors.primary_accent,
                      bgcolor: colors.tertiary_bg,
                    }}
                  >
                    <FilterListIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    sx={{
                      color: colors.primary_accent,
                      bgcolor: colors.tertiary_bg,
                    }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </>
              ) : (
                <Box sx={{ width: 40 }} />
              )}
            </Box>
          )}
        </Box>
        <Divider sx={{ borderColor: colors.border_color, my: 1 }} />
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
                    bgcolor: colors.tertiary_bg,
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
                backgroundColor: colors.secondary_bg,
                color: colors.primary_text,
                border: `1px solid ${colors.border_color}`,
                "& .MuiDataGrid-cell": {
                  fontSize: isSmallScreen ? "0.85rem" : "0.875rem",
                  py: 0.5,
                  borderColor: colors.border_color,
                  color: colors.primary_text,
                },
                "& .MuiDataGrid-columnHeaders": {
                  fontSize: "0.75rem",
                  py: 0.5,
                  backgroundColor: colors.tertiary_bg,
                  color: colors.primary_text,
                  borderColor: colors.border_color,
                },
                "& .MuiDataGrid-row": {
                  "&:hover": {
                    backgroundColor: colors.hover_bg,
                  },
                },
                "& .MuiCheckbox-root": {
                  color: `${colors.primary_accent} !important`,
                },
                "& .MuiDataGrid-footerContainer": {
                  backgroundColor: colors.tertiary_bg,
                  borderColor: colors.border_color,
                  color: colors.primary_text,
                },
                "& .MuiTablePagination-root": {
                  color: colors.primary_text,
                },
                "& .MuiDataGrid-toolbarContainer": {
                  color: colors.primary_text,
                },
              }}
            />
          )}
        </Box>
        {hasWriteAccess && (
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                bgcolor: colors.tertiary_bg,
                color: colors.primary_text,
                border: `1px solid ${colors.border_color}`,
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
                "&:hover": { bgcolor: colors.hover_bg },
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
                "&:hover": { bgcolor: colors.hover_bg },
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
                "&:hover": { bgcolor: colors.hover_bg },
                display: "flex",
                gap: 1,
              }}
            >
              <DeleteIcon fontSize="small" />
              Delete
            </MenuItem>
          </Menu>
        )}
        <ToastNotification
          open={toast.open}
          message={toast.message}
          onClose={handleToastClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        />
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={isDeleting ? undefined : handleCancelDelete}
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
          onDecline={isDeleting ? undefined : handleCancelDelete}
          approveText={
            isDeleting ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  className="loader"
                  style={{
                    width: 18,
                    height: 18,
                    border: "2px solid #fff",
                    borderTop: "2px solid #00DAC6",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    display: "inline-block",
                  }}
                ></span>
                Deleting...
              </span>
            ) : (
              "Yes, Delete"
            )
          }
          declineText="No, Cancel"
          confirmationText={`Are you sure you want to delete the budget "${budgetToDelete?.name}"?`}
          approveDisabled={isDeleting}
          declineDisabled={isDeleting}
        />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </Box>
    </>
  );
};

export default Budget;
